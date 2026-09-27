import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

// Optimistic check only: redirects visitors with no session cookie to sign-in
// without a DB call. It is not the security boundary; a forged or expired cookie
// passes here and is rejected by requireUser()/requireAdmin() in src/lib/session.ts.
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const { pathname, search } = request.nextUrl;
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("callbackURL", pathname + search);
    return NextResponse.redirect(signIn);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
