import { protectedProcedure } from "@ultimate-ts-starter/api";
import { createDb } from "@ultimate-ts-starter/db";
import * as schema from "@ultimate-ts-starter/db/schema/auth";
import { eq } from "drizzle-orm";

/**
 * GDPR-compliant account management procedures.
 * - Data export: returns all user data as structured JSON
 * - Account deletion: permanently removes all user data
 */
export const accountRouter = {
  /** Permanently delete the user account and all associated data (GDPR Article 17 — Right to Erasure) */
  deleteAccount: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;
    const db = createDb();

    // Delete in order to respect foreign key constraints
    // (sessions/accounts/verifications cascade from user, but explicit is safer)
    await db.delete(schema.session).where(eq(schema.session.userId, userId));

    await db.delete(schema.account).where(eq(schema.account.userId, userId));

    await db.delete(schema.user).where(eq(schema.user.id, userId));

    return { deleted: true };
  }),

  /** Export all user data as JSON (GDPR Article 20 — Right to Data Portability) */
  exportData: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;
    const db = createDb();

    const [userData] = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, userId));

    const sessions = await db
      .select({
        createdAt: schema.session.createdAt,
        expiresAt: schema.session.expiresAt,
        ipAddress: schema.session.ipAddress,
        userAgent: schema.session.userAgent,
      })
      .from(schema.session)
      .where(eq(schema.session.userId, userId));

    const accounts = await db
      .select({
        accountId: schema.account.accountId,
        createdAt: schema.account.createdAt,
        providerId: schema.account.providerId,
        scope: schema.account.scope,
      })
      .from(schema.account)
      .where(eq(schema.account.userId, userId));

    return {
      exportedAt: new Date().toISOString(),
      linkedAccounts: accounts,
      sessions,
      user: userData
        ? {
            createdAt: userData.createdAt,
            email: userData.email,
            emailVerified: userData.emailVerified,
            id: userData.id,
            image: userData.image,
            name: userData.name,
            updatedAt: userData.updatedAt,
          }
        : null,
    };
  }),
};
