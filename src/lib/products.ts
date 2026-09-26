// Server-side catalog queries. Returns the storefront's `Product` shape so
// components don't depend on table layout.

import { asc, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { categories, products, stock } from "@/db/schema";
import type { Product } from "@/lib/catalog";

function selectProducts() {
  return db
    .select({
      slug: products.slug,
      name: products.name,
      category: categories.name,
      categorySlug: categories.slug,
      priceCents: products.priceCents,
      compareAtCents: products.compareAtCents,
      images: products.images,
      badge: products.badge,
      colors: products.colors,
      sizes: products.sizes,
      unavailableSizes: products.unavailableSizes,
      // A product with no stock row counts as sold out.
      stock: sql<number>`coalesce(${stock.quantity}, 0)`.mapWith(Number),
      description: products.description,
      details: products.details,
      composition: products.composition,
      care: products.care,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(stock, eq(stock.productId, products.id))
    .$dynamic();
}

type Row = Awaited<ReturnType<typeof selectProducts>>[number];

function toProduct({ images, compareAtCents, badge, ...row }: Row): Product {
  return {
    ...row,
    gallery: images,
    compareAtCents: compareAtCents ?? undefined,
    badge: badge ?? undefined,
  };
}

/** Deduplicated per request, so metadata and the page share one query. */
export const getProduct = cache(async (slug: string) => {
  const [row] = await selectProducts().where(eq(products.slug, slug)).limit(1);
  return row ? toProduct(row) : undefined;
});

/** Products in the order the slugs are given; unknown slugs are skipped. */
export async function getProductsBySlugs(slugs: string[]) {
  if (slugs.length === 0) return [];
  const rows = await selectProducts().where(inArray(products.slug, slugs));
  const bySlug = new Map(rows.map((r) => [r.slug, toProduct(r)]));
  return slugs.flatMap((slug) => bySlug.get(slug) ?? []);
}

/** Same-category pieces first, then the rest of the catalog. */
export async function getRelated(product: Product, count = 6) {
  const rows = await selectProducts()
    .where(ne(products.slug, product.slug))
    .orderBy(desc(sql`${categories.slug} = ${product.categorySlug}`), asc(products.id))
    .limit(count);
  return rows.map(toProduct);
}

export async function getAllProductSlugs() {
  const rows = await db.select({ slug: products.slug }).from(products);
  return rows.map((r) => r.slug);
}
