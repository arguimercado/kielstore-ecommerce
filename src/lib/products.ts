// Server-side catalog queries. Returns the storefront's `Product` shape so
// components don't depend on table layout.

import { and, asc, desc, eq, gte, ilike, inArray, lt, ne, or, type SQL, sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { categories, products, stock, wishlistItems } from "@/db/schema";
import type { Product } from "@/lib/catalog";
import { COLOR_FAMILIES, type Filters, PRICE_BANDS, sortSizes } from "@/lib/filters";

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

const inStockSql = sql`coalesce(${stock.quantity}, 0) > 0`;

/** `(a, b, c)` as bound parameters, for `in` lists inside raw SQL. */
const paramList = (values: string[]) => sql.join(values.map((v) => sql`${v}`), sql`, `);

type ProductQuery = Pick<Filters, "sizes" | "colors" | "prices" | "inStock" | "sort">;

/**
 * The whole catalog, or one category, narrowed by shop filters: any of the
 * chosen values within a group, every group together. A size only matches
 * while it's available; one-size pieces drop out once a size is chosen.
 */
export async function getProducts(categorySlug?: string, filters?: ProductQuery) {
  const conditions: (SQL | undefined)[] = [categorySlug ? eq(categories.slug, categorySlug) : undefined];

  if (filters?.sizes.length) {
    conditions.push(
      sql`exists (select 1 from unnest(${products.sizes}) as s(size) where s.size in (${paramList(filters.sizes)}) and not (s.size = any(${products.unavailableSizes})))`,
    );
  }
  if (filters?.colors.length) {
    conditions.push(
      sql`exists (select 1 from jsonb_array_elements(${products.colors}) as c where c->>'family' in (${paramList(filters.colors)}))`,
    );
  }
  if (filters?.prices.length) {
    const bands = PRICE_BANDS.filter((b) => filters.prices.includes(b.id));
    conditions.push(
      or(
        ...bands.map((b) =>
          "max" in b ? and(gte(products.priceCents, b.min), lt(products.priceCents, b.max)) : gte(products.priceCents, b.min),
        ),
      ),
    );
  }
  if (filters?.inStock) conditions.push(inStockSql);

  const order = {
    featured: [asc(products.id)],
    newest: [desc(products.createdAt), desc(products.id)],
    "price-asc": [asc(products.priceCents), asc(products.id)],
    "price-desc": [desc(products.priceCents), asc(products.id)],
  }[filters?.sort ?? "featured"];

  const rows = await selectProducts()
    .where(and(...conditions))
    .orderBy(...order);
  return rows.map(toProduct);
}

export type FilterFacets = {
  total: number;
  sizes: { size: string; count: number }[];
  colors: ((typeof COLOR_FAMILIES)[number] & { count: number })[];
  prices: ((typeof PRICE_BANDS)[number] & { count: number })[];
  inStock: number;
};

/**
 * The filter options present in the whole catalog or one category, each with
 * how many pieces it matches before other filters. Options matching nothing are left out.
 */
export async function getFilterFacets(categorySlug?: string): Promise<FilterFacets> {
  const rows = await db
    .select({
      sizes: products.sizes,
      unavailableSizes: products.unavailableSizes,
      colors: products.colors,
      priceCents: products.priceCents,
      inStock: sql<boolean>`${inStockSql}`,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(stock, eq(stock.productId, products.id))
    .where(categorySlug ? eq(categories.slug, categorySlug) : undefined);

  const sizeCounts = new Map<string, number>();
  const colorCounts = new Map<string, number>();
  for (const row of rows) {
    const unavailable = new Set(row.unavailableSizes);
    for (const size of row.sizes) {
      if (!unavailable.has(size)) sizeCounts.set(size, (sizeCounts.get(size) ?? 0) + 1);
    }
    for (const family of new Set(row.colors.map((c) => c.family))) {
      colorCounts.set(family, (colorCounts.get(family) ?? 0) + 1);
    }
  }

  return {
    total: rows.length,
    sizes: sortSizes(sizeCounts.keys()).map((size) => ({ size, count: sizeCounts.get(size)! })),
    colors: COLOR_FAMILIES.map((c) => ({ ...c, count: colorCounts.get(c.id) ?? 0 })).filter((c) => c.count > 0),
    prices: PRICE_BANDS.map((b) => ({
      ...b,
      count: rows.filter((r) => r.priceCents >= b.min && (!("max" in b) || r.priceCents < b.max)).length,
    })).filter((b) => b.count > 0),
    inStock: rows.filter((r) => r.inStock).length,
  };
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
