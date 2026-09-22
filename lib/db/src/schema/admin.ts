import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const accountsTable = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  brandIds: integer("brand_ids").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const brandsTable = pgTable("brands", {
  id: integer("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  countries: text("countries").array().notNull().default([]),
});

export const pagesTable = pgTable("app_pages", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
});

export const packagesTable = pgTable("permission_packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull().default(""),
  pageIds: integer("page_ids").array().notNull().default([]),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type StoredBrandAccess = {
  brandId: number;
  brandName: string;
  countryScope: "ALL" | string[];
  expiresAt: string | null;
};

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id").unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("brand"),
  status: text("status").notNull().default("invited"),
  accountId: integer("account_id").references(() => accountsTable.id),
  authType: text("auth_type").notNull().default("hybrid"),
  brandAccesses: jsonb("brand_accesses").$type<StoredBrandAccess[]>().notNull().default([]),
  packageIds: integer("package_ids").array().notNull().default([]),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const auditLogTable = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  actorName: text("actor_name").notNull(),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetName: text("target_name").notNull(),
  summary: text("summary").notNull(),
  before: jsonb("before"),
  after: jsonb("after"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAccountSchema = createInsertSchema(accountsTable).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPageSchema = createInsertSchema(pagesTable).omit({ id: true });
export const insertPackageSchema = createInsertSchema(packagesTable).omit({ id: true, createdAt: true });

export type AccountRecord = typeof accountsTable.$inferSelect;
export type UserRecord = typeof usersTable.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;