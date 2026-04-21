/**
 * Database seed script.
 * Populates dev data for local development.
 * Includes enough data to test pagination, charts, org features, etc.
 *
 * Usage: pnpm db:seed
 */
import { resolve } from "node:path";

import { config } from "dotenv";

const root = resolve(import.meta.filename, "../../../..");

config({ path: resolve(root, "apps/server/.env") });
config({ path: resolve(root, ".env") });

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema/auth";

const seed = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle({ client: pool, schema });

  console.log("Seeding database...");

  // ── Users (10 users for pagination/list testing) ──
  const users = [
    {
      email: "amir@example.com",
      id: "seed-user-001",
      name: "Amir Abushanab",
      role: "admin",
    },
    {
      email: "sarah@example.com",
      id: "seed-user-002",
      name: "Sarah Chen",
      role: "user",
    },
    {
      email: "marcus@example.com",
      id: "seed-user-003",
      name: "Marcus Johnson",
      role: "user",
    },
    {
      email: "yuki@example.com",
      id: "seed-user-004",
      name: "Yuki Tanaka",
      role: "user",
    },
    {
      email: "priya@example.com",
      id: "seed-user-005",
      name: "Priya Sharma",
      role: "user",
    },
    {
      email: "omar@example.com",
      id: "seed-user-006",
      name: "Omar Farouk",
      role: "user",
    },
    {
      email: "elena@example.com",
      id: "seed-user-007",
      name: "Elena Volkov",
      role: "user",
    },
    {
      email: "carlos@example.com",
      id: "seed-user-008",
      name: "Carlos Rivera",
      role: "user",
    },
    {
      email: "fatima@example.com",
      id: "seed-user-009",
      name: "Fatima Al-Rashid",
      role: "user",
    },
    {
      email: "james@example.com",
      id: "seed-user-010",
      name: "James O'Brien",
      role: "user",
    },
  ];

  for (const u of users) {
    await db
      .insert(schema.user)
      .values({
        email: u.email,
        emailVerified: true,
        id: u.id,
        name: u.name,
        role: u.role,
      })
      .onConflictDoNothing();
  }
  console.log(`Seeded ${users.length} users`);

  // ── Organizations (2 orgs for team testing) ──
  const orgs = [
    { id: "seed-org-001", name: "Acme Corp", slug: "acme" },
    { id: "seed-org-002", name: "Startup Inc", slug: "startup" },
  ];

  for (const org of orgs) {
    await db
      .insert(schema.organization)
      .values({
        id: org.id,
        name: org.name,
        slug: org.slug,
      })
      .onConflictDoNothing();
  }
  console.log(`Seeded ${orgs.length} organizations`);

  // ── Members (assign users to orgs) ──
  const members = [
    {
      id: "seed-member-001",
      organizationId: "seed-org-001",
      role: "owner",
      userId: "seed-user-001",
    },
    {
      id: "seed-member-002",
      organizationId: "seed-org-001",
      role: "admin",
      userId: "seed-user-002",
    },
    {
      id: "seed-member-003",
      organizationId: "seed-org-001",
      role: "member",
      userId: "seed-user-003",
    },
    {
      id: "seed-member-004",
      organizationId: "seed-org-001",
      role: "member",
      userId: "seed-user-004",
    },
    {
      id: "seed-member-005",
      organizationId: "seed-org-001",
      role: "member",
      userId: "seed-user-005",
    },
    {
      id: "seed-member-006",
      organizationId: "seed-org-002",
      role: "owner",
      userId: "seed-user-001",
    },
    {
      id: "seed-member-007",
      organizationId: "seed-org-002",
      role: "admin",
      userId: "seed-user-006",
    },
    {
      id: "seed-member-008",
      organizationId: "seed-org-002",
      role: "member",
      userId: "seed-user-007",
    },
  ];

  for (const m of members) {
    await db.insert(schema.member).values(m).onConflictDoNothing();
  }
  console.log(`Seeded ${members.length} org members`);

  // ── Invitations (pending invites) ──
  const invitations = [
    {
      email: "elena@example.com",
      expiresAt: new Date(Date.now() + 7 * 86_400_000),
      id: "seed-invite-001",
      inviterId: "seed-user-001",
      organizationId: "seed-org-001",
      role: "member",
      status: "pending",
    },
    {
      email: "carlos@example.com",
      expiresAt: new Date(Date.now() + 7 * 86_400_000),
      id: "seed-invite-002",
      inviterId: "seed-user-001",
      organizationId: "seed-org-002",
      role: "member",
      status: "pending",
    },
  ];

  for (const inv of invitations) {
    await db.insert(schema.invitation).values(inv).onConflictDoNothing();
  }
  console.log(`Seeded ${invitations.length} invitations`);

  // ── Sessions (login history for chart data) ──
  const sessions = [];
  for (let i = 0; i < 50; i += 1) {
    const userIdx = i % users.length;
    const daysAgo = Math.floor(i / 2);
    sessions.push({
      createdAt: new Date(Date.now() - daysAgo * 86_400_000),
      expiresAt: new Date(Date.now() + 30 * 86_400_000),
      id: `seed-session-${String(i + 1).padStart(3, "0")}`,
      ipAddress: `192.168.1.${(i % 254) + 1}`,
      token: `token-${crypto.randomUUID()}`,
      updatedAt: new Date(Date.now() - daysAgo * 86_400_000),
      userAgent:
        i % 2 === 0
          ? "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
          : "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      userId: users[userIdx]?.id ?? "",
    });
  }

  for (const s of sessions) {
    await db.insert(schema.session).values(s).onConflictDoNothing();
  }
  console.log(`Seeded ${sessions.length} sessions (login history for charts)`);

  await pool.end();
  console.log("Done.");
};

try {
  await seed();
} catch (error) {
  console.error("Seed failed:", error);
  process.exit(1);
}
