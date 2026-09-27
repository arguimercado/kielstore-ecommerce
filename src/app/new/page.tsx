import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { getNewArrivals } from "@/lib/products";

// Re-read the latest products, prices and stock at most once a minute.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "New arrivals | Kiel Store",
  description: "The latest pieces from the atelier: tailoring, knitwear, leather goods and shoes, added as they land.",
};

// Cards in the first row at the widest grid (4 columns) load eagerly; one of them is the LCP.
const EAGER_COUNT = 4;

export default async function NewArrivalsPage() {
  const products = await getNewArrivals();

  return (
    <main className="flex-1">
      <div className="container-page">
        <nav aria-label="Breadcrumb" className="py-4 md:py-6">
          <ol className="eyebrow flex flex-wrap items-center gap-2 text-ink-muted">
            <li>
              <Link href="/" className="link-reveal">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">
              New arrivals
            </li>
          </ol>
        </nav>

        <header className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6 md:pt-6">
          <div>
            <p className="eyebrow text-ink-muted">Just landed</p>
            <h1 className="mt-3 text-headline">New arrivals</h1>
            <p className="mt-4 max-w-reading text-body-lg text-ink-muted">
              The latest pieces from the atelier, added as they arrive. Cut in small runs, so the newest sizes go
              first.
            </p>
          </div>
          {products.length > 0 && (
            <p className="text-caption text-ink-muted sm:shrink-0 sm:pb-1">
              {products.length} {products.length === 1 ? "piece" : "pieces"}
            </p>
          )}
        </header>
      </div>

      <section aria-label="Products" className="section pt-8 md:pt-10">
        <div className="container-page">
          {products.length > 0 ? (
            <div className="grid-products">
              {products.map((product, i) => (
                <ProductCard key={product.slug} product={product} loading={i < EAGER_COUNT ? "eager" : undefined} />
              ))}
            </div>
          ) : (
            <div className="border-t border-line py-section text-center">
              <p className="text-body-lg text-ink-muted">Nothing new just yet. The next pieces are on their way.</p>
              <Link href="/" className="btn btn-secondary mt-8">
                Back to the shop
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
