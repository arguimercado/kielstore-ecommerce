import { relations, sql } from "drizzle-orm";
import { check, index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { products } from "./products";

/**
 * pending → processing → paid, or pending/processing → expired | payment_failed | canceled.
 * Every transition is a conditional UPDATE on the current status (src/lib/orders.ts),
 * so replayed webhooks and concurrent confirmations apply at most once.
 */
export const orderStatus = pgEnum("order_status", [
  /** Stock reserved; the Checkout Session is open. */
  "pending",
  /** Session completed with an async payment method that hasn't settled yet. Stock stays reserved. */
  "processing",
  "paid",
  /** Session expired unpaid. Stock released. */
  "expired",
  /** Async payment failed. Stock released. */
  "payment_failed",
  /** Session couldn't be created, or a newer checkout replaced it. Stock released. */
  "canceled",
  /** Stripe's paid amount didn't match the order, or payment arrived for a released order. Never auto-fulfilled. */
  "needs_review",
]);

export type OrderStatus = (typeof orderStatus.enumValues)[number];

// An order is a snapshot: totals and lines are copied from the catalog when
// checkout starts and never re-read, so later price edits don't change it.
export const orders = pgTable(
  "orders",
  {
    /** crypto.randomUUID(), made in the app so one batch can insert the order and its lines. */
    id: text().primaryKey(),
    // Restrict: deleting a user must not silently delete financial records.
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    status: orderStatus().notNull().default("pending"),
    currency: text().notNull().default("php"),
    subtotalCents: integer("subtotal_cents").notNull(),
    /** What Stripe must charge. Equal to the subtotal while there's no shipping or tax. */
    totalCents: integer("total_cents").notNull(),
    stripeCheckoutSessionId: text("stripe_checkout_session_id").unique(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    /** Set once the reservation has gone back to `stock`; guards against a double release. */
    stockReleasedAt: timestamp("stock_released_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("orders_user_id_created_at_idx").on(t.userId, t.createdAt),
    // One open checkout per user, so a double submit can't reserve stock twice.
    uniqueIndex("orders_one_pending_per_user").on(t.userId).where(sql`${t.status} = 'pending'`),
    check("orders_subtotal_non_negative", sql`${t.subtotalCents} >= 0`),
    check("orders_total_non_negative", sql`${t.totalCents} >= 0`),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    /** Null once the product is deleted; the snapshot below keeps the history readable. */
    productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
    slug: text().notNull(),
    name: text().notNull(),
    image: text(),
    color: text().notNull(),
    /** '' for one-size pieces, as in cart_items. */
    size: text().notNull().default(""),
    unitPriceCents: integer("unit_price_cents").notNull(),
    quantity: integer().notNull(),
  },
  (t) => [
    index("order_items_order_id_idx").on(t.orderId),
    check("order_items_quantity_positive", sql`${t.quantity} > 0`),
    check("order_items_price_non_negative", sql`${t.unitPriceCents} >= 0`),
  ],
);

// Stripe webhook events already handled. Written after an event is processed,
// so a failed attempt is retried; the status guards make a replay harmless anyway.
export const stripeEvents = pgTable("stripe_events", {
  /** Stripe event id (evt_…). */
  id: text().primaryKey(),
  type: text().notNull(),
  orderId: text("order_id").references(() => orders.id, { onDelete: "set null" }),
  processedAt: timestamp("processed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}));
