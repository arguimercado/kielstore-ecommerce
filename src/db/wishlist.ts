import { integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { products } from "./products";

// A user's saved products. One row per user and product (the composite key
// makes saving idempotent); rows go when either side is deleted.
export const wishlistItems = pgTable(
  "wishlist_items",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.productId] })],
);
