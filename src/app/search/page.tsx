import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/product-grid-skeleton";
import { SearchForm } from "@/components/search-form";
import { SearchSuggestions } from "@/components/search-suggestions";
import { searchProducts } from "@/lib/products";

// Cards in the first row at the widest grid (4 columns) load eagerly; one of them is the LCP.
const EAGER_COUNT = 4;

/** The `q` search param, trimmed, single-spaced and capped; "" when there is nothing to search. */
function readQuery(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, 100);
}

export async function generateMetadata(props: PageProps<"/search">): Promise<Metadata> {
  const q = readQuery((await props.searchParams).q);
  return {
    title: q ? `Search results for “${q}” | Kiel Store` : "Search | Kiel Store",
    // Result pages are endless query permutations; keep them out of the index.
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage(props: PageProps<"/search">) {
  const q = readQuery((await props.searchParams).q);

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
              Search
            </li>
          </ol>
        </nav>

        <header className="pt-4 md:pt-6">
          <p className="eyebrow text-ink-muted">Search</p>
          <h1 className="mt-3 text-headline break-words">{q ? `Results for “${q}”` : "Search the collection"}</h1>
          {/* Keyed so the box shows the new query after navigating between searches. */}
          <SearchForm key={q} defaultValue={q} className="mt-8 max-w-reading md:mt-10" />
        </header>
      </div>

      <section aria-label="Search results" className="section pt-8 md:pt-10">
        <div className="container-page">
          {q ? (
            <Suspense key={q} fallback={<ProductGridSkeleton />}>
              <SearchResults q={q} />
            </Suspense>
          ) : (
            <SearchSuggestions />
          )}
        </div>
      </section>
    </main>
  );
}

async function SearchResults({ q }: { q: string }) {
  const results = await searchProducts(q);

  if (results.length === 0) {
    return (
      <div className="max-w-reading">
        <p className="text-body-lg">No pieces match “{q}”.</p>
        <p className="mt-2 text-body text-ink-muted">
          Check the spelling, or try a broader word such as a category, material or colour.
        </p>
        <SearchSuggestions className="mt-8" />
        <Link href="/products" className="btn btn-secondary mt-10">
          Shop all
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="mb-8 text-caption text-ink-muted md:mb-10">
        {results.length} {results.length === 1 ? "piece" : "pieces"}
      </p>
      <div className="grid-products">
        {results.map((product, i) => (
          <ProductCard key={product.slug} product={product} loading={i < EAGER_COUNT ? "eager" : undefined} />
        ))}
      </div>
    </>
  );
}
