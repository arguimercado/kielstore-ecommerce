"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { addToWishlist, removeFromWishlist } from "@/lib/wishlist";

export type WishlistResult = { ok: true } | { ok: false; reason: "signed-out" | "not-found" };

// Server actions are public endpoints: each one reads the session itself and
// only ever touches the signed-in user's rows.

function validSlug(slug: unknown): slug is string {
  return typeof slug === "string" && slug.length > 0 && slug.length <= 200;
}

export async function saveToWishlist(slug: unknown): Promise<WishlistResult> {
  const session = await getSession();
  if (!session) return { ok: false, reason: "signed-out" };
  if (!validSlug(slug) || !(await addToWishlist(session.user.id, slug))) return { ok: false, reason: "not-found" };
  revalidatePath("/account/wishlist");
  return { ok: true };
}

export async function unsaveFromWishlist(slug: unknown): Promise<WishlistResult> {
  const session = await getSession();
  if (!session) return { ok: false, reason: "signed-out" };
  if (!validSlug(slug) || !(await removeFromWishlist(session.user.id, slug))) return { ok: false, reason: "not-found" };
  revalidatePath("/account/wishlist");
  return { ok: true };
}
