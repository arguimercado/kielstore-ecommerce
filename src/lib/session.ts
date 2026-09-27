import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";

// Server-side session access (the data access layer). Every protected page,
// server action and route handler calls requireUser() or requireAdmin() itself:
// src/proxy.ts only checks that a session cookie exists, and layouts don't
// re-run on client navigation.

/** The current session, or null. Deduplicated per request. */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

/** Returns the session, or redirects to sign-in and back to `returnTo` afterwards. */
export async function requireUser(returnTo = "/account") {
  const session = await getSession();
  if (!session) redirect(`/sign-in?callbackURL=${encodeURIComponent(returnTo)}`);
  return session;
}

/** Returns an admin's session. Signed-out users go to sign-in; everyone else gets a 404. */
export async function requireAdmin() {
  const session = await requireUser("/admin");
  if (session.user.role !== "admin") notFound();
  return session;
}

/** A same-origin path to return to after auth, so callbackURL can't redirect off-site. */
export function safeCallbackURL(value: unknown, fallback = "/account") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  return value;
}
