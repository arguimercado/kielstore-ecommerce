// Loads the sample catalog. Idempotent: rows are upserted by slug, so running
// it again resets the sample products and stock to their seed values.
//   npm run db:seed

import { config } from "dotenv";
import { sql } from "drizzle-orm";
import { categories, products, stock } from "./schema";
import { seedCategories, seedProducts } from "./seed-data";

// Same env lookup as drizzle.config.ts.
config({ path: [".env.local", ".env"], quiet: true });

const excluded = (column: string) => sql.raw(`excluded."${column}"`);

async function main() {
  // Imported after the env is loaded: src/db/index.ts reads DATABASE_URL at import time.
  const { db } = await import("./index");

  const categoryRows = await db
    .insert(categories)
    .values(seedCategories)
    .onConflictDoUpdate({ target: categories.slug, set: { name: excluded("name") } })
    .returning({ id: categories.id, slug: categories.slug });
  const categoryId = new Map(categoryRows.map((c) => [c.slug, c.id]));

  const productRows = await db
    .insert(products)
    .values(
      seedProducts.map((p) => {
        const id = categoryId.get(p.categorySlug);
        if (id === undefined) throw new Error(`Unknown category "${p.categorySlug}" for ${p.slug}`);
        return {
          slug: p.slug,
          name: p.name,
          categoryId: id,
          priceCents: p.priceCents,
          compareAtCents: p.compareAtCents ?? null,
          badge: p.badge ?? null,
          images: p.images,
          colors: p.colors,
          sizes: p.sizes,
          unavailableSizes: p.unavailableSizes ?? [],
          description: p.description,
          details: p.details,
          composition: p.composition,
          care: p.care,
        };
      }),
    )
    .onConflictDoUpdate({
      target: products.slug,
      set: {
        name: excluded("name"),
        categoryId: excluded("category_id"),
        priceCents: excluded("price_cents"),
        compareAtCents: excluded("compare_at_cents"),
        badge: excluded("badge"),
        images: excluded("images"),
        colors: excluded("colors"),
        sizes: excluded("sizes"),
        unavailableSizes: excluded("unavailable_sizes"),
        description: excluded("description"),
        details: excluded("details"),
        composition: excluded("composition"),
        care: excluded("care"),
        updatedAt: sql`now()`,
      },
    })
    .returning({ id: products.id, slug: products.slug });
  const productId = new Map(productRows.map((p) => [p.slug, p.id]));

  await db
    .insert(stock)
    .values(seedProducts.map((p) => ({ productId: productId.get(p.slug)!, quantity: p.stock })))
    .onConflictDoUpdate({
      target: stock.productId,
      set: { quantity: excluded("quantity"), updatedAt: sql`now()` },
    });

  console.log(`Seeded ${categoryRows.length} categories, ${productRows.length} products and their stock.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
