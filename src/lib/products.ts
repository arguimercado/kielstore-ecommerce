// Server-side catalog queries. Returns the storefront's `Product` shape so
// components don't depend on table layout.

import { and, asc, desc, eq, ilike, inArray, ne, or, sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { categories, products, stock, wishlistItems } from "@/db/schema";
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

/** The whole catalog, or one category, in catalog order. */
export async function getProducts(categorySlug?: string) {
  const rows = await selectProducts()
    .where(categorySlug ? eq(categories.slug, categorySlug) : undefined)
    .orderBy(asc(products.id));
  return rows.map(toProduct);
}

/** Product categories in catalog order. Deduplicated per request. */
export const getCategories = cache(async () => {
  return db.select({ slug: categories.slug, name: categories.name }).from(categories).orderBy(asc(categories.id));
});

export async function getCategory(slug: string) {
  const all = await getCategories();
  return all.find((c) => c.slug === slug);
}

/** Most recently added first; newer ids break ties from bulk inserts. */
export async function getNewArrivals(limit = 24) {
  const rows = await selectProducts().orderBy(desc(products.createdAt), desc(products.id)).limit(limit);
  return rows.map(toProduct);
}

const MAX_SEARCH_TERMS = 8;

/** ILIKE pattern that matches `text` anywhere, with LIKE wildcards in the text escaped. */
function containsPattern(text: string) {
  return `%${text.replace(/[\\%_]/g, "\\$&")}%`;
}

/**
 * Products where every word of `query` appears in the name, category,
 * description or a colour name. Pieces whose name holds the whole query
 * come first, then catalog order.
 */
export async function searchProducts(query: string, limit = 48) {
  const terms = query.split(/\s+/).filter(Boolean).slice(0, MAX_SEARCH_TERMS);
  if (terms.length === 0) return [];

  const everyTerm = terms.map((term) => {
    const pattern = containsPattern(term);
    return or(
      ilike(products.name, pattern),
      ilike(categories.name, pattern),
      ilike(products.description, pattern),
      sql`exists (select 1 from jsonb_array_elements(${products.colors}) as c where c->>'name' ilike ${pattern})`,
    );
  });

  const rows = await selectProducts()
    .where(and(...everyTerm))
    .orderBy(desc(ilike(products.name, containsPattern(query))), asc(products.id))
    .limit(limit);
  return rows.map(toProduct);
}

/** A user's saved products, most recently saved first. */
export async function getWishlistProducts(userId: string) {
  const rows = await selectProducts()
    .innerJoin(wishlistItems, and(eq(wishlistItems.productId, products.id), eq(wishlistItems.userId, userId)))
    .orderBy(desc(wishlistItems.createdAt));
  return rows.map(toProduct);
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
