import Link from "next/link";
import { Suspense } from "react";
import { CloseIcon, GridIcon, ListIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { FilterDrawerButton, FilterDrawerProvider, FilterPanel, SortSelect } from "@/components/product-filters";
import { ProductGridSkeleton, ProductListSkeleton } from "@/components/product-grid-skeleton";
import { ProductListItem } from "@/components/product-list-item";
import {
  activeFilterCount,
  clearedFilters,
  COLOR_FAMILIES,
  type Filters,
  filtersHref,
  PRICE_BANDS,
  type View,
} from "@/lib/filters";
import { type FilterFacets, getProducts } from "@/lib/products";

type CategoryLink = { slug: string; name: string };

// Cards in the first row at the widest grid (4 columns) load eagerly; one of them is the LCP.
const EAGER_COUNT = 4;

/**
 * Product listing: breadcrumb, heading, category nav, then filters (sidebar
 * from `lg`, drawer below), sort, grid/list view and the results.
 * Omit `category` for the whole catalog.
 */
export function ProductListing({
  categories,
  category,
  facets,
  filters,
}: {
  categories: CategoryLink[];
  category?: CategoryLink;
  facets: FilterFacets;
  filters: Filters;
}) {
  const title = category?.name ?? "All products";
  const basePath = category ? `/${category.slug}` : "/products";
  const clearHref = filtersHref(basePath, clearedFilters(filters));
  // Switching category keeps the view and sort but starts filters fresh.
  const navItems = [{ href: filtersHref("/products", clearedFilters(filters)), name: "All", current: !category }].concat(
    categories.map((c) => ({
      href: filtersHref(`/${c.slug}`, clearedFilters(filters)),
      name: c.name,
      current: c.slug === category?.slug,
    })),
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

        <header className="pt-4 md:pt-6">
          <p className="eyebrow text-ink-muted">Shop</p>
          <h1 className="mt-3 text-headline">{title}</h1>
        </header>

        <nav aria-label="Categories" className="mt-8 border-b border-line pb-4 md:mt-10">
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {navItems.map((item) => (
              <li key={item.name}>
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

        <FilterDrawerProvider>
          <div className="flex items-center justify-between gap-4 border-b border-line py-3">
            <FilterDrawerButton count={activeFilterCount(filters)} />
            <p className="eyebrow hidden lg:block">Filters</p>
            <div className="flex items-center gap-2 sm:gap-4">
              <SortSelect sort={filters.sort} />
              <ViewToggle basePath={basePath} filters={filters} />
            </div>
          </div>

          <ActiveFilters basePath={basePath} filters={filters} clearHref={clearHref} />

          <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-x-12">
            <FilterPanel facets={facets} filters={filters} clearHref={clearHref} />
            <section aria-label={title} className="pt-8 pb-section">
              {/* Keyed by the full query so each filter change shows the skeleton, not stale results. */}
              <Suspense
                key={filtersHref(basePath, filters)}
                fallback={filters.view === "list" ? <ProductListSkeleton /> : <ProductGridSkeleton />}
              >
                <ListingResults categorySlug={category?.slug} filters={filters} total={facets.total} clearHref={clearHref} />
              </Suspense>
            </section>
          </div>
        </FilterDrawerProvider>
      </div>
    </main>
  );
}

function ViewToggle({ basePath, filters }: { basePath: string; filters: Filters }) {
  const views: { view: View; label: string; Icon: typeof GridIcon }[] = [
    { view: "grid", label: "Grid view", Icon: GridIcon },
    { view: "list", label: "List view", Icon: ListIcon },
  ];
  return (
    <div role="group" aria-label="View" className="-mr-3 flex">
      {views.map(({ view, label, Icon }) => {
        const current = filters.view === view;
        return (
          <Link
            key={view}
            href={filtersHref(basePath, filters, { view })}
            scroll={false}
            aria-label={label}
            aria-current={current ? "true" : undefined}
            className={`btn btn-ghost btn-icon ${current ? "text-ink" : "text-ink-subtle hover:text-ink"}`}
          >
            <Icon />
          </Link>
        );
      })}
    </div>
  );
}

/** One removable chip per applied filter value, plus "Clear all". */
function ActiveFilters({ basePath, filters, clearHref }: { basePath: string; filters: Filters; clearHref: string }) {
  const chips = [
    ...filters.sizes.map((size) => ({
      label: `Size ${size}`,
      href: filtersHref(basePath, filters, { sizes: filters.sizes.filter((s) => s !== size) }),
    })),
    ...filters.colors.map((color) => ({
      label: COLOR_FAMILIES.find((c) => c.id === color)!.label,
      href: filtersHref(basePath, filters, { colors: filters.colors.filter((c) => c !== color) }),
    })),
    ...filters.prices.map((price) => ({
      label: PRICE_BANDS.find((b) => b.id === price)!.label,
      href: filtersHref(basePath, filters, { prices: filters.prices.filter((p) => p !== price) }),
    })),
    ...(filters.inStock ? [{ label: "In stock only", href: filtersHref(basePath, filters, { inStock: false }) }] : []),
  ];
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-line py-3">
      <p className="sr-only">Active filters</p>
      {chips.map((chip) => (
        <Link
          key={chip.label}
          href={chip.href}
          scroll={false}
          aria-label={`Remove filter: ${chip.label}`}
          className="chip min-h-9 gap-2 text-caption"
        >
          {chip.label}
          <CloseIcon width={12} height={12} />
        </Link>
      ))}
      <Link href={clearHref} scroll={false} className="eyebrow link-reveal ml-2">
        Clear all
      </Link>
    </div>
  );
}

async function ListingResults({
  categorySlug,
  filters,
  total,
  clearHref,
}: {
  categorySlug?: string;
  filters: Filters;
  total: number;
  clearHref: string;
}) {
  const products = await getProducts(categorySlug, filters);
  const filtered = activeFilterCount(filters) > 0;

  if (products.length === 0) {
    return (
      <div className="py-section text-center">
        <p className="text-body-lg text-ink-muted">
          {filtered ? "No pieces match these filters." : "Nothing here just yet. New pieces are on their way."}
        </p>
        <Link href={filtered ? clearHref : "/products"} scroll={false} className="btn btn-secondary mt-8">
          {filtered ? "Clear all" : "Shop all"}
        </Link>
      </div>
    );
  }

  const count = filtered ? `${products.length} of ${total} pieces` : `${products.length} ${products.length === 1 ? "piece" : "pieces"}`;

  return (
    <>
      <p role="status" className="mb-6 text-caption text-ink-muted">
        {count}
      </p>
      {filters.view === "list" ? (
        <ul className="border-t border-line">
          {products.map((product, i) => (
            <li key={product.slug}>
              <ProductListItem product={product} loading={i < EAGER_COUNT ? "eager" : undefined} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid-products">
          {products.map((product, i) => (
            <ProductCard
              key={product.slug}
              product={product}
              loading={i < EAGER_COUNT ? "eager" : undefined}
              sizes="(min-width: 80rem) 20vw, (min-width: 48rem) 33vw, 50vw"
            />
          ))}
        </div>
      )}
    </>
  );
}
