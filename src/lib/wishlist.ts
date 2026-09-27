// Server-side wishlist writes and lookups. Callers pass a user id they got
// from the session; nothing here trusts a client-supplied id.

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, wishlistItems } from "@/db/schema";

/** Slugs of every product the user has saved. */
export async function getWishlistSlugs(userId: string) {
  const rows = await db
    .select({ slug: products.slug })
    .from(wishlistItems)
    .innerJoin(products, eq(products.id, wishlistItems.productId))
    .where(eq(wishlistItems.userId, userId));
  return rows.map((r) => r.slug);
}

async function findProductId(slug: string) {
  const [row] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
  return row?.id;
}

/** Saves a product; saving twice is a no-op. False when the slug is unknown. */
export async function addToWishlist(userId: string, slug: string) {
  const productId = await findProductId(slug);
  if (productId === undefined) return false;
  await db.insert(wishlistItems).values({ userId, productId }).onConflictDoNothing();
  return true;
}

/** Removes a product; removing one that isn't saved is a no-op. */
export async function removeFromWishlist(userId: string, slug: string) {
  const productId = await findProductId(slug);
  if (productId === undefined) return false;
  await db.delete(wishlistItems).where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, productId)));
  return true;
}
