// Server-side order reads and writes. All stock movement for checkout lives
// here: stock is reserved when an order is created and returned at most once
// when it's abandoned. Status changes are conditional UPDATEs on the current
// status, so replayed webhooks, success-page reloads and concurrent calls
// change an order at most once.
//
// neon-http has no interactive transactions, so each multi-step write is either
// one db.batch (run as a single transaction) or one statement with data-modifying CTEs.

import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { type OrderStatus, orderItems, orders, stripeEvents } from "@/db/schema";
import type { Cart } from "@/lib/cart";

export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type OrderWithItems = Order & { items: OrderItem[] };

/** Shopper-facing status names. */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Awaiting payment",
  processing: "Payment processing",
  paid: "Paid",
  expired: "Checkout expired",
  payment_failed: "Payment failed",
  canceled: "Canceled",
  needs_review: "Under review",
};

export type CreateOrderResult =
  | { ok: true; order: Order; items: OrderItem[] }
  | { ok: false; reason: "insufficient-stock" | "checkout-in-progress" };

/** Postgres SQLSTATE of a failed query, looking through Drizzle's wrapper. */
function pgErrorCode(error: unknown): string | undefined {
  for (let e = error; e && typeof e === "object"; e = (e as { cause?: unknown }).cause) {
    const code = (e as { code?: unknown }).code;
    if (typeof code === "string" && /^[0-9A-Z]{5}$/.test(code)) return code;
  }
  return undefined;
}

/**
 * Creates a pending order from the user's bag and reserves its stock, all or
 * nothing. Prices come from `cart` (read from the DB by getCart), never from
 * the client. Fails when any product is short, including when two shoppers
 * race for the last piece: only one batch can take stock below zero's check.
 */
export async function createPendingOrder(userId: string, cart: Cart): Promise<CreateOrderResult> {
  const id = crypto.randomUUID();
  try {
    const [[order], items] = await db.batch([
      db
        .insert(orders)
        .values({ id, userId, subtotalCents: cart.subtotalCents, totalCents: cart.subtotalCents })
        .returning(),
      db
        .insert(orderItems)
        .values(
          cart.lines.map((l) => ({
            orderId: id,
            productId: l.productId,
            slug: l.slug,
            name: l.name,
            image: l.image ?? null,
            color: l.color,
            size: l.size,
            unitPriceCents: l.unitPriceCents,
            quantity: l.quantity,
          })),
        )
        .returning(),
      // Raises check_violation when a product is short (see drizzle/0005_reserve_order_stock.sql).
      db.execute(sql`select reserve_order_stock(${id})`),
    ]);
    return { ok: true, order: order!, items };
  } catch (error) {
    const code = pgErrorCode(error);
    if (code === "23514") return { ok: false, reason: "insufficient-stock" };
    // orders_one_pending_per_user: another checkout for this user started at the same time.
    if (code === "23505") return { ok: false, reason: "checkout-in-progress" };
    throw error;
  }
}

/** Links the Checkout Session to a still-pending order. False if the order was released meanwhile. */
export async function attachCheckoutSession(orderId: string, sessionId: string) {
  const rows = await db
    .update(orders)
    .set({ stripeCheckoutSessionId: sessionId })
    .where(and(eq(orders.id, orderId), eq(orders.status, "pending")))
    .returning({ id: orders.id });
  return rows.length > 0;
}

/**
 * Moves a pending or processing order to a released status and returns its
 * stock, in one statement. Returns the released products' slugs (for cache
 * revalidation); empty when there was nothing to release, e.g. a replayed event.
 */
export async function releaseReservation(
  orderId: string,
  to: Extract<OrderStatus, "expired" | "payment_failed" | "canceled">,
): Promise<string[]> {
  const result = await db.execute<{ slug: string }>(sql`
    with o as (
      update orders set status = ${to}::order_status, stock_released_at = now(), updated_at = now()
      where id = ${orderId} and status in ('pending', 'processing') and stock_released_at is null
      returning id
    ), r as (
      select product_id, sum(quantity)::int as qty from order_items
      where order_id in (select id from o) and product_id is not null
      group by product_id
    ), s as (
      update stock set quantity = stock.quantity + r.qty, updated_at = now()
      from r where stock.product_id = r.product_id
      returning stock.product_id
    )
    select i.slug from order_items i join o on o.id = i.order_id
  `);
  return [...new Set(result.rows.map((r) => r.slug))];
}

/**
 * Marks a pending or processing order paid and, only if that transition
 * happened, removes the bag lines it bought (lines added since are kept).
 * Returns whether this call made the transition.
 */
export async function markOrderPaid(orderId: string, paymentIntentId: string | null) {
  const result = await db.execute<{ id: string }>(sql`
    with o as (
      update orders
      set status = 'paid', paid_at = now(), updated_at = now(), stripe_payment_intent_id = ${paymentIntentId}
      where id = ${orderId} and status in ('pending', 'processing')
      returning id, user_id
    ), d as (
      delete from cart_items c using o, order_items i
      where i.order_id = o.id and c.user_id = o.user_id
        and c.product_id = i.product_id and c.color = i.color and c.size = i.size
      returning c.id
    )
    select id from o
  `);
  return result.rows.length > 0;
}

/** pending → processing: the session completed but an async payment method is still settling. */
export async function markOrderProcessing(orderId: string, paymentIntentId: string | null) {
  await db
    .update(orders)
    .set({ status: "processing", stripePaymentIntentId: paymentIntentId })
    .where(and(eq(orders.id, orderId), eq(orders.status, "pending")));
}

/** Flags an order Stripe says is paid but which can't be fulfilled automatically. Never overrides `paid`. */
export async function markOrderNeedsReview(orderId: string, paymentIntentId: string | null) {
  await db
    .update(orders)
    .set({ status: "needs_review", stripePaymentIntentId: paymentIntentId })
    .where(
      and(
        eq(orders.id, orderId),
        inArray(orders.status, ["pending", "processing", "expired", "payment_failed", "canceled"]),
      ),
    );
}

export async function getOrder(orderId: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return order;
}

/** The user's open checkout, if any (at most one, by orders_one_pending_per_user). */
export async function getPendingOrder(userId: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.userId, userId), eq(orders.status, "pending")))
    .limit(1);
  return order;
}

/** One of the user's orders with its lines, by order id or Checkout Session id. */
export async function getOrderForUser(
  userId: string,
  by: { id: string } | { sessionId: string },
): Promise<OrderWithItems | undefined> {
  return db.query.orders.findFirst({
    where: and(
      eq(orders.userId, userId),
      "id" in by ? eq(orders.id, by.id) : eq(orders.stripeCheckoutSessionId, by.sessionId),
    ),
    with: { items: { orderBy: asc(orderItems.id) } },
  });
}

/** The user's orders, newest first. Checkouts that never completed are left out. */
export async function listOrdersForUser(userId: string): Promise<OrderWithItems[]> {
  return db.query.orders.findMany({
    where: and(eq(orders.userId, userId), inArray(orders.status, ["processing", "paid", "needs_review"])),
    orderBy: desc(orders.createdAt),
    with: { items: { orderBy: asc(orderItems.id) } },
  });
}

export async function isStripeEventProcessed(eventId: string) {
  const [row] = await db
    .select({ id: stripeEvents.id })
    .from(stripeEvents)
    .where(eq(stripeEvents.id, eventId))
    .limit(1);
  return Boolean(row);
}

export async function recordStripeEvent(eventId: string, type: string, orderId: string | null) {
  await db.insert(stripeEvents).values({ id: eventId, type, orderId }).onConflictDoNothing();
}
