import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/catalog";

type CategoryLink = { slug: string; name: string };

// Cards in the first row at the widest grid (4 columns) load eagerly; one of them is the LCP.
const EAGER_COUNT = 4;

/** Product listing: breadcrumb, heading, category nav and grid. Omit `category` for the whole catalog. */
export function ProductListing({
  products,
  categories,
  category,
}: {
  products: Product[];
  categories: CategoryLink[];
  category?: CategoryLink;
}) {
  const title = category?.name ?? "All products";
  const navItems = [{ href: "/products", name: "All", current: !category }].concat(
    categories.map((c) => ({ href: `/${c.slug}`, name: c.name, current: c.slug === category?.slug })),
  );

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
            {category ? (
              <>
                <li>
                  <Link href="/products" className="link-reveal">
                    Shop
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-ink">
                  {category.name}
                </li>
              </>
            ) : (
              <li aria-current="page" className="text-ink">
                Shop
              </li>
            )}
          </ol>
        </nav>

        <header className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6 md:pt-6">
          <div>
            <p className="eyebrow text-ink-muted">Shop</p>
            <h1 className="mt-3 text-headline">{title}</h1>
          </div>
          <p className="text-caption text-ink-muted sm:shrink-0 sm:pb-1">
            {products.length} {products.length === 1 ? "piece" : "pieces"}
          </p>
        </header>

        <nav aria-label="Categories" className="mt-8 border-b border-line pb-4 md:mt-10">
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={item.current ? "page" : undefined}
                  className={`eyebrow link-reveal ${item.current ? "text-ink" : "text-ink-muted hover:text-ink"}`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <section aria-label={title} className="section pt-8 md:pt-10">
        <div className="container-page">
          {products.length > 0 ? (
            <div className="grid-products">
              {products.map((product, i) => (
                <ProductCard key={product.slug} product={product} loading={i < EAGER_COUNT ? "eager" : undefined} />
              ))}
            </div>
          ) : (
            <div className="py-section text-center">
              <p className="text-body-lg text-ink-muted">Nothing here just yet. New pieces are on their way.</p>
              <Link href="/products" className="btn btn-secondary mt-8">
                Shop all
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
