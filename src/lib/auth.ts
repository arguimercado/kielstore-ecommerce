import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  appName: "Kiel Store",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  // No email verification or password reset yet: there's no mail provider.
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh the expiry at most once a day
    // No cookieCache: every session read hits the DB, so sign-out, revoked
    // sessions and role changes take effect on the next request.
  },
  plugins: [
    // Adds user.role (not settable at sign-up; defaults to "user"). "admin" is the admin role.
    admin(),
    nextCookies(), // keep last
  ],
});

export type Session = typeof auth.$Infer.Session;
