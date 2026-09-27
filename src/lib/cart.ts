// Server-side bag reads and writes. Callers pass a user id they got from the
// session; nothing here trusts a client-supplied user id, and every line
// lookup is scoped to that user.
//
// Stock is per product (sizes and colours aren't variants), so every line of
// one product draws from the same `stock.quantity`. The bag doesn't reserve
// stock; checkout does (createPendingOrder in src/lib/orders.ts).

import { and, asc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { cartItems, products, stock } from "@/db/schema";

/** Most of one line a shopper can add, whatever the stock. */
export const MAX_LINE_QTY = 10;

export type CartLine = {
  id: number;
  productId: number;
  slug: string;
  name: string;
  image: string | undefined;
  color: string;
  /** '' for one-size pieces. */
  size: string;
  quantity: number;
  /** Current catalog price, in centavos. */
  unitPriceCents: number;
  compareAtCents: number | undefined;
  lineTotalCents: number;
  /** Most this line can hold: stock left after the product's other lines, capped at MAX_LINE_QTY. */
  maxQuantity: number;
  /** Stock fell below what's in the bag since it was added. */
  exceedsStock: boolean;
};

export type Cart = { lines: CartLine[]; count: number; subtotalCents: number };

export type CartWriteResult =
  | { ok: true; count: number }
  | { ok: false; reason: "not-found" | "invalid-option" }
  | { ok: false; reason: "insufficient-stock"; available: number };

const stockQty = sql<number>`coalesce(${stock.quantity}, 0)`.mapWith(Number);

/** Items in the bag (sum of quantities), for the header. */
export async function getCartCount(userId: string) {
  const [row] = await countQuery(userId);
  return row?.count ?? 0;
}

function countQuery(userId: string) {
  return db
    .select({ count: sql<number>`coalesce(sum(${cartItems.quantity}), 0)`.mapWith(Number) })
    .from(cartItems)
    .where(eq(cartItems.userId, userId));
}

/** The user's bag at current prices, oldest line first. Totals are integer centavos. */
export async function getCart(userId: string): Promise<Cart> {
  const rows = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      slug: products.slug,
      name: products.name,
      images: products.images,
      color: cartItems.color,
      size: cartItems.size,
      quantity: cartItems.quantity,
      priceCents: products.priceCents,
      compareAtCents: products.compareAtCents,
      stock: stockQty,
    })
    .from(cartItems)
    .innerJoin(products, eq(products.id, cartItems.productId))
    .leftJoin(stock, eq(stock.productId, cartItems.productId))
    .where(eq(cartItems.userId, userId))
    .orderBy(asc(cartItems.createdAt), asc(cartItems.id));

  const inBagByProduct = new Map<number, number>();
  for (const r of rows) inBagByProduct.set(r.productId, (inBagByProduct.get(r.productId) ?? 0) + r.quantity);

  const lines = rows.map((r): CartLine => {
    const otherLines = inBagByProduct.get(r.productId)! - r.quantity;
    const available = Math.max(0, r.stock - otherLines);
    return {
      id: r.id,
      productId: r.productId,
      slug: r.slug,
      name: r.name,
      image: r.images[0],
      color: r.color,
      size: r.size,
      quantity: r.quantity,
      unitPriceCents: r.priceCents,
      compareAtCents: r.compareAtCents ?? undefined,
      lineTotalCents: r.priceCents * r.quantity,
      maxQuantity: Math.min(available, MAX_LINE_QTY),
      exceedsStock: r.quantity > available,
    };
  });

  return {
    lines,
    count: lines.reduce((n, l) => n + l.quantity, 0),
    subtotalCents: lines.reduce((sum, l) => sum + l.lineTotalCents, 0),
  };
}

/** Quantity of the user's lines for a product, optionally leaving one line out. */
async function quantityInBag(userId: string, productId: number, exceptLineId?: number) {
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${cartItems.quantity}), 0)`.mapWith(Number) })
    .from(cartItems)
    .where(
      and(
        eq(cartItems.userId, userId),
        eq(cartItems.productId, productId),
        exceptLineId === undefined ? undefined : ne(cartItems.id, exceptLineId),
      ),
    );
  return row?.total ?? 0;
}

/**
 * Adds one of a product in a colour and size, or raises that line by one.
 * `size` is '' for one-size pieces. Refused past the product's stock (across
 * all its lines) or MAX_LINE_QTY.
 */
export async function addToCart(
  userId: string,
  { slug, color, size }: { slug: string; color: string; size: string },
): Promise<CartWriteResult> {
  const [product] = await db
    .select({
      id: products.id,
      colors: products.colors,
      sizes: products.sizes,
      unavailableSizes: products.unavailableSizes,
      stock: stockQty,
    })
    .from(products)
    .leftJoin(stock, eq(stock.productId, products.id))
    .where(eq(products.slug, slug))
    .limit(1);
  if (!product) return { ok: false, reason: "not-found" };

  const validColor = product.colors.some((c) => c.name === color);
  const validSize =
    product.sizes.length === 0 ? size === "" : product.sizes.includes(size) && !product.unavailableSizes.includes(size);
  if (!validColor || !validSize) return { ok: false, reason: "invalid-option" };

  const [inBag, [line]] = await Promise.all([
    quantityInBag(userId, product.id),
    db
      .select({ quantity: cartItems.quantity })
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, product.id),
          eq(cartItems.color, color),
          eq(cartItems.size, size),
        ),
      )
      .limit(1),
  ]);
  const lineQty = line?.quantity ?? 0;
  if (inBag + 1 > product.stock || lineQty + 1 > MAX_LINE_QTY) {
    const available = Math.max(0, Math.min(product.stock - (inBag - lineQty), MAX_LINE_QTY));
    return { ok: false, reason: "insufficient-stock", available };
  }

  const [, [row]] = await db.batch([
    db
      .insert(cartItems)
      .values({ userId, productId: product.id, color, size, quantity: 1 })
      .onConflictDoUpdate({
        target: [cartItems.userId, cartItems.productId, cartItems.color, cartItems.size],
        set: { quantity: sql`${cartItems.quantity} + 1`, updatedAt: new Date() },
      }),
    countQuery(userId),
  ]);
  return { ok: true, count: row?.count ?? 0 };
}

/** Sets one of the user's lines to `quantity` (1..MAX_LINE_QTY), within the product's stock. */
export async function setLineQuantity(userId: string, lineId: number, quantity: number): Promise<CartWriteResult> {
  const [line] = await db
    .select({ productId: cartItems.productId, stock: stockQty })
    .from(cartItems)
    .leftJoin(stock, eq(stock.productId, cartItems.productId))
    .where(and(eq(cartItems.id, lineId), eq(cartItems.userId, userId)))
    .limit(1);
  if (!line) return { ok: false, reason: "not-found" };

  const available = Math.max(0, Math.min(line.stock - (await quantityInBag(userId, line.productId, lineId)), MAX_LINE_QTY));
  if (quantity > available) return { ok: false, reason: "insufficient-stock", available };

  const [, [row]] = await db.batch([
    db
      .update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.id, lineId), eq(cartItems.userId, userId))),
    countQuery(userId),
  ]);
  return { ok: true, count: row?.count ?? 0 };
}

/** Removes one of the user's lines. */
export async function removeLine(userId: string, lineId: number): Promise<CartWriteResult> {
  const [deleted, [row]] = await db.batch([
    db
      .delete(cartItems)
      .where(and(eq(cartItems.id, lineId), eq(cartItems.userId, userId)))
      .returning({ id: cartItems.id }),
    countQuery(userId),
  ]);
  if (deleted.length === 0) return { ok: false, reason: "not-found" };
  return { ok: true, count: row?.count ?? 0 };
}
