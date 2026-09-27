"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { safeCallbackURL } from "@/lib/session";

export type AuthFormState = { error?: string; email?: string; name?: string };

const field = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

// nextCookies() (last plugin in src/lib/auth.ts) writes the session cookies set
// by these auth.api calls. redirect() stays outside the try blocks because it throws.

export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const name = field(formData, "name");
  const email = field(formData, "email").toLowerCase();
  const password = formData.get("password");
  const echo = { name, email };

  if (!name || !email || typeof password !== "string" || !password) {
    return { ...echo, error: "Enter your name, email and a password." };
  }
  if (password.length < 8) {
    return { ...echo, error: "Use a password of at least 8 characters." };
  }

  try {
    await auth.api.signUpEmail({ body: { name, email, password }, headers: await headers() });
  } catch (error) {
    if (error instanceof APIError) {
      const code = error.body?.code;
      if (code === "USER_ALREADY_EXISTS" || code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
        return { ...echo, error: "An account with this email already exists. Sign in instead." };
      }
      if (code === "INVALID_EMAIL") return { ...echo, error: "Enter a valid email address." };
      if (code === "PASSWORD_TOO_LONG") return { ...echo, error: "Use a password of at most 128 characters." };
      if (error.status === "TOO_MANY_REQUESTS") return { ...echo, error: "Too many attempts. Try again shortly." };
    }
    console.error("sign-up failed", error);
    return { ...echo, error: "We couldn't create your account. Please try again." };
  }

  redirect(safeCallbackURL(formData.get("callbackURL")));
}

export async function signIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = field(formData, "email").toLowerCase();
  const password = formData.get("password");

  if (!email || typeof password !== "string" || !password) {
    return { email, error: "Enter your email and password." };
  }

  try {
    await auth.api.signInEmail({
      body: { email, password, rememberMe: true },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError && error.status === "TOO_MANY_REQUESTS") {
      return { email, error: "Too many attempts. Try again shortly." };
    }
    if (!(error instanceof APIError)) console.error("sign-in failed", error);
    // One message for unknown email and wrong password, so accounts can't be enumerated.
    return { email, error: "Invalid email or password." };
  }

  redirect(safeCallbackURL(formData.get("callbackURL")));
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
