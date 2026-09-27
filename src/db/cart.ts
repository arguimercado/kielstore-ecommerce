import { sql } from "drizzle-orm";
import { check, integer, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { products } from "./products";

// A signed-in user's bag. One line per product, colour and size; adding the
// same combination again raises its quantity. Lines hold no prices: the bag
// always reads the current `products.price_cents`.
export const cartItems = pgTable(
  "cart_items",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    /** Colour display name, one of `products.colors[].name`. */
    color: text().notNull(),
    /** One of `products.sizes`, or '' for one-size pieces (so the unique key holds). */
    size: text().notNull().default(""),
    quantity: integer().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    // Leads with user_id, so it also serves "this user's bag" lookups.
    unique("cart_items_line_unique").on(t.userId, t.productId, t.color, t.size),
    check("cart_items_quantity_positive", sql`${t.quantity} > 0`),
  ],
);
