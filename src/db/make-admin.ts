// Grants the admin role to an existing user, for bootstrapping the first admin.
// After that, admins can change roles through Better Auth (auth.api.setRole).
//   npm run auth:make-admin -- someone@example.com

import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { user } from "./schema";

// Same env lookup as drizzle.config.ts.
config({ path: [".env.local", ".env"], quiet: true });

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) throw new Error("Usage: npm run auth:make-admin -- <email>");

  // Imported after the env is loaded: src/db/index.ts reads DATABASE_URL at import time.
  const { db } = await import("./index");

  const [updated] = await db
    .update(user)
    .set({ role: "admin" })
    .where(eq(user.email, email))
    .returning({ id: user.id, email: user.email });
  if (!updated) throw new Error(`No user with email ${email}. Sign up first.`);

  console.log(`${updated.email} is now an admin.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
