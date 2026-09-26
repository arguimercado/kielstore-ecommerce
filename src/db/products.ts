import { relations, sql } from "drizzle-orm";
import { check, index, integer, jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { Colorway } from "../lib/catalog";
import { categories } from "./categories";
import { stock } from "./stock";

export const productBadge = pgEnum("product_badge", ["New", "Limited"]);

export const products = pgTable(
  "products",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    slug: text().notNull().unique(),
    name: text().notNull(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    /** Prices are whole cents (USD). */
    priceCents: integer("price_cents").notNull(),
    compareAtCents: integer("compare_at_cents"),
    badge: productBadge(),
    /** Ordered gallery: the first image is the listing image, the rest are detail shots. */
    images: text().array().notNull().default(sql`'{}'`),
    colors: jsonb().$type<Colorway[]>().notNull().default([]),
    /** Display-only size run; empty for one-size items. Not variants. */
    sizes: text().array().notNull().default(sql`'{}'`),
    unavailableSizes: text("unavailable_sizes").array().notNull().default(sql`'{}'`),
    description: text().notNull(),
    details: text().array().notNull().default(sql`'{}'`),
    composition: text().notNull(),
    care: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("products_category_id_idx").on(t.categoryId),
    check("products_price_non_negative", sql`${t.priceCents} >= 0`),
    check(
      "products_compare_at_gt_price",
      sql`${t.compareAtCents} IS NULL OR ${t.compareAtCents} > ${t.priceCents}`,
    ),
  ],
);

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  stock: one(stock),
}));
