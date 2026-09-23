import { Router, type IRouter } from "express";
import { clerkClient } from "@clerk/express";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import {
  CreatePackageBody,
  CreatePackageResponse,
  CreatePageBody,
  CreatePageResponse,
  GetDashboardResponse,
  GetUserParams,
  GetUserResponse,
  InviteUserBody,
  InviteUserResponse,
  ListBrandsResponse,
  ListAuditLogQueryParams,
  ListAuditLogResponse,
  ListPackagesResponse,
  ListPagesResponse,
  ListUsersQueryParams,
  ListUsersResponse,
  UpdatePackageBody,
  UpdatePackageParams,
  UpdatePackageResponse,
  UpdateUserBody,
  UpdateUserParams,
  UpdateUserResponse,
} from "@workspace/api-zod";
import {
  auditLogTable,
  brandsTable,
  db,
  packagesTable,
  pagesTable,
  usersTable,
  type UserRecord,
} from "@workspace/db";
import { requireAuth } from "../middlewares/require-auth";

const router: IRouter = Router();
router.use(requireAuth);

const iso = (value: Date | null) => value?.toISOString() ?? null;

async function serializeUser(user: UserRecord) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    authType: user.authType,
    brandAccesses: user.brandAccesses,
    packageIds: user.packageIds,
    lastActiveAt: iso(user.lastActiveAt),
    createdAt: user.createdAt.toISOString(),
  };
}

async function recordAudit(action: string, targetType: string, targetName: string, summary: string, before?: unknown, after?: unknown) {
  await db.insert(auditLogTable).values({
    actorName: "Admin Blissim",
    action,
    targetType,
    targetName,
    summary,
    before,
    after,
  });
}

router.get("/dashboard", async (_req, res): Promise<void> => {
  const [[userCount], [activeCount], [brandCount], [expiringCount], recent] = await Promise.all([
    db.select({ value: sql<number>`count(*)::int` }).from(usersTable),
    db.select({ value: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.status, "active")),
    db.select({ value: sql<number>`count(*)::int` }).from(brandsTable),
    db.select({ value: sql<number>`count(*)::int` }).from(usersTable).where(sql`
      EXISTS (
        SELECT 1 FROM jsonb_array_elements(${usersTable.brandAccesses}) item
        WHERE item->>'expiresAt' IS NOT NULL
          AND (item->>'expiresAt')::timestamptz BETWEEN now() AND now() + interval '30 days'
      )
    `),
    db.select().from(auditLogTable).orderBy(desc(auditLogTable.createdAt)).limit(6),
  ]);
  res.json(GetDashboardResponse.parse({
    users: userCount?.value ?? 0,
    activeUsers: activeCount?.value ?? 0,
    expiringAccesses: expiringCount?.value ?? 0,
    brands: brandCount?.value ?? 0,
    recentActivity: recent.map((event) => ({ ...event, createdAt: event.createdAt.toISOString() })),
  }));
});

router.get("/brands", async (_req, res): Promise<void> => {
  const brands = await db.select().from(brandsTable).orderBy(brandsTable.name);
  res.json(ListBrandsResponse.parse(brands));
});

router.get("/users", async (req, res): Promise<void> => {
  const parsed = ListUsersQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const filters = [];
  if (parsed.data.search) filters.push(or(ilike(usersTable.name, `%${parsed.data.search}%`), ilike(usersTable.email, `%${parsed.data.search}%`)));
  if (parsed.data.status) filters.push(eq(usersTable.status, parsed.data.status));
  const rows = await db.select().from(usersTable).where(filters.length ? and(...filters) : undefined).orderBy(usersTable.name);
  res.json(ListUsersResponse.parse(await Promise.all(rows.map(serializeUser))));
});

router.post("/users", async (req, res): Promise<void> => {
  const parsed = InviteUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [existing] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, parsed.data.email)).limit(1);
  if (existing) { res.status(409).json({ error: "A user with this email already exists" }); return; }
  if (parsed.data.role === "brand") {
    await clerkClient.invitations.createInvitation({
      emailAddress: parsed.data.email,
      ignoreExisting: false,
    });
  }
  const brandIds = parsed.data.brandAccesses.map((access) => access.brandId);
  const brands = await db.select().from(brandsTable).where(sql`${brandsTable.id} = ANY(${brandIds})`);
  const brandMap = new Map(brands.map((brand) => [brand.id, brand.name]));
  const brandAccesses = parsed.data.brandAccesses.map((access) => ({
    ...access,
    brandName: brandMap.get(access.brandId) ?? `Marque ${access.brandId}`,
    expiresAt: access.expiresAt?.toISOString() ?? null,
  }));
  const [user] = await db.insert(usersTable).values({
    email: parsed.data.email,
    name: parsed.data.name,
    role: parsed.data.role,
    status: parsed.data.role === "admin" ? "active" : "invited",
    authType: parsed.data.role === "admin" ? "google" : "hybrid",
    brandAccesses,
    packageIds: parsed.data.packageIds,
  }).returning();
  const response = await serializeUser(user);
  await recordAudit("invited", "user", user.name, `Invitation envoyée à ${user.email}`, null, response);
  res.status(201).json(InviteUserResponse.parse(response));
});

router.get("/users/:id", async (req, res): Promise<void> => {
  const params = GetUserParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(GetUserResponse.parse(await serializeUser(user)));
});

router.patch("/users/:id", async (req, res): Promise<void> => {
  const params = UpdateUserParams.safeParse(req.params);
  const parsed = UpdateUserBody.safeParse(req.body);
  if (!params.success || !parsed.success) { res.status(400).json({ error: "Invalid user update" }); return; }
  const [before] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id)).limit(1);
  if (!before) { res.status(404).json({ error: "User not found" }); return; }
  let brandAccesses = before.brandAccesses;
  if (parsed.data.brandAccesses) {
    const ids = parsed.data.brandAccesses.map((access) => access.brandId);
    const brands = await db.select().from(brandsTable).where(sql`${brandsTable.id} = ANY(${ids})`);
    const brandMap = new Map(brands.map((brand) => [brand.id, brand.name]));
    brandAccesses = parsed.data.brandAccesses.map((access) => ({
      ...access,
      brandName: brandMap.get(access.brandId) ?? `Marque ${access.brandId}`,
      expiresAt: access.expiresAt?.toISOString() ?? null,
    }));
  }
  const [updated] = await db.update(usersTable).set({ ...parsed.data, brandAccesses }).where(eq(usersTable.id, params.data.id)).returning();
  const response = await serializeUser(updated);
  await recordAudit("updated", "user", updated.name, `Droits de ${updated.name} mis à jour`, before, response);
  res.json(UpdateUserResponse.parse(response));
});

router.get("/packages", async (_req, res): Promise<void> => {
  const [packages, users] = await Promise.all([db.select().from(packagesTable).orderBy(packagesTable.name), db.select({ packageIds: usersTable.packageIds }).from(usersTable)]);
  res.json(ListPackagesResponse.parse(packages.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    pageIds: item.pageIds,
    pageCount: item.pageIds.length,
    userCount: users.filter((user) => user.packageIds.includes(item.id)).length,
    isDefault: item.isDefault,
  }))));
});

router.post("/packages", async (req, res): Promise<void> => {
  const parsed = CreatePackageBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [item] = await db.insert(packagesTable).values(parsed.data).returning();
  const response = { ...item, pageCount: item.pageIds.length, userCount: 0 };
  await recordAudit("created", "package", item.name, `Package ${item.name} créé`, null, response);
  res.status(201).json(CreatePackageResponse.parse(response));
});

router.patch("/packages/:id", async (req, res): Promise<void> => {
  const params = UpdatePackageParams.safeParse(req.params);
  const parsed = UpdatePackageBody.safeParse(req.body);
  if (!params.success || !parsed.success) { res.status(400).json({ error: "Invalid package update" }); return; }
  const [item] = await db.update(packagesTable).set(parsed.data).where(eq(packagesTable.id, params.data.id)).returning();
  if (!item) { res.status(404).json({ error: "Package not found" }); return; }
  const [{ value: userCount }] = await db.select({ value: sql<number>`count(*)::int` }).from(usersTable).where(sql`${params.data.id} = ANY(${usersTable.packageIds})`);
  const response = { ...item, pageCount: item.pageIds.length, userCount: userCount ?? 0 };
  await recordAudit("updated", "package", item.name, `Contenu du package ${item.name} modifié`, null, response);
  res.json(UpdatePackageResponse.parse(response));
});

router.get("/pages", async (_req, res): Promise<void> => {
  res.json(ListPagesResponse.parse(await db.select().from(pagesTable).orderBy(pagesTable.name)));
});

router.post("/pages", async (req, res): Promise<void> => {
  const parsed = CreatePageBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [page] = await db.insert(pagesTable).values(parsed.data).returning();
  await recordAudit("created", "page", page.name, `Page ${page.name} ajoutée au registre`, null, page);
  res.status(201).json(CreatePageResponse.parse(page));
});

router.get("/audit-log", async (req, res): Promise<void> => {
  const parsed = ListAuditLogQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const rows = await db.select().from(auditLogTable).orderBy(desc(auditLogTable.createdAt)).limit(parsed.data.limit ?? 30);
  res.json(ListAuditLogResponse.parse(rows.map((event) => ({ ...event, createdAt: event.createdAt.toISOString() }))));
});

export default router;