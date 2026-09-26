import { relations, sql } from "drizzle-orm";
import { check, integer, pgTable, timestamp } from "drizzle-orm/pg-core";
import { products } from "./products";

// One row per product. Kept apart from `products` so inventory updates stay
// independent of catalog edits, and so it can be re-keyed per variant later.
export const stock = pgTable(
  "stock",
  {
    productId: integer("product_id")
      .primaryKey()
      .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer().notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [check("stock_quantity_non_negative", sql`${t.quantity} >= 0`)],
);

export const stockRelations = relations(stock, ({ one }) => ({
  product: one(products, { fields: [stock.productId], references: [products.id] }),
}));
