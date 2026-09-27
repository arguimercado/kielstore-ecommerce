import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { WishlistRemoveButton } from "@/components/wishlist-button";
import { getWishlistProducts } from "@/lib/products";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Wishlist | Kiel Store",
  robots: { index: false },
};

// Cards in the first row at the widest grid (4 columns) load eagerly; one of them is the LCP.
const EAGER_COUNT = 4;

export default async function WishlistPage() {
  const { user } = await requireUser("/account/wishlist");
  const products = await getWishlistProducts(user.id);

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
            <li>
              <Link href="/account" className="link-reveal">
                Account
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">
              Wishlist
            </li>
          </ol>
        </nav>

        <header className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6 md:pt-6">
          <div>
            <p className="eyebrow text-ink-muted">Account</p>
            <h1 className="mt-3 text-headline">Wishlist</h1>
          </div>
          {products.length > 0 && (
            <p className="text-caption text-ink-muted sm:shrink-0 sm:pb-1">
              {products.length} {products.length === 1 ? "piece" : "pieces"}
            </p>
          )}
        </header>
      </div>

      <section aria-label="Saved pieces" className="section pt-8 md:pt-10">
        <div className="container-page">
          {products.length > 0 ? (
            <ul className="grid-products">
              {products.map((product, i) => (
                <li key={product.slug}>
                  <ProductCard product={product} loading={i < EAGER_COUNT ? "eager" : undefined} />
                  <div className="mt-3 px-1">
                    <WishlistRemoveButton slug={product.slug} name={product.name} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="border-t border-line py-section text-center">
              <p className="text-body-lg text-ink-muted">
                Your wishlist is empty. Tap the heart on any piece to save it here.
              </p>
              <Link href="/new" className="btn btn-secondary mt-8">
                Shop new arrivals
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
