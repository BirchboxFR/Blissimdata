import { clerkClient, getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const auth = getAuth(req);
  const userId = auth.sessionClaims?.sub ?? auth.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const user = await clerkClient.users.getUser(userId);
  const primaryEmail = user.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId,
  )?.emailAddress;
  if (!primaryEmail?.toLowerCase().endsWith("@blissim.fr")) {
    res.status(403).json({ error: "Blissim administrator access required" });
    return;
  }
  res.locals.clerkUserId = userId;
  res.locals.userEmail = primaryEmail;
  next();
}