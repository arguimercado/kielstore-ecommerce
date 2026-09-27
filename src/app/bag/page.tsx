import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BagLineControls } from "@/components/bag-line-controls";
import { CheckoutButton } from "@/components/checkout-button";
import { Price } from "@/components/price";
import { formatPrice } from "@/lib/catalog";
import { getCart } from "@/lib/cart";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Bag | Kiel Store",
  robots: { index: false },
};

export default async function BagPage({ searchParams }: PageProps<"/bag">) {
  const { user } = await requireUser("/bag");
  const [{ lines, count, subtotalCents }, { checkout }] = await Promise.all([getCart(user.id), searchParams]);
  const canceled = checkout === "canceled";
  const overStock = lines.some((l) => l.exceedsStock);

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
              Bag
            </li>
          </ol>
        </nav>

        <header className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6 md:pt-6">
          <h1 className="text-headline">Bag</h1>
          {count > 0 && (
            <p className="text-caption text-ink-muted sm:shrink-0 sm:pb-1">
              {count} {count === 1 ? "item" : "items"}
            </p>
          )}
        </header>
      </div>

      <section aria-label="Items in your bag" className="section pt-8 md:pt-10">
        <div className="container-page">
          {lines.length > 0 ? (
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
              <ul className="border-t border-line">
                {lines.map((line) => {
                  const href = `/products/${line.slug}`;
                  return (
                    <li
                      key={line.id}
                      className="grid grid-cols-[6rem_minmax(0,1fr)] gap-x-4 border-b border-line py-6 md:grid-cols-[8rem_minmax(0,1fr)_auto] md:gap-x-8"
                    >
                      <Link href={href} tabIndex={-1} aria-hidden="true" className="block">
                        <div className="media-frame aspect-product">
                          {line.image && <Image src={line.image} alt="" fill sizes="(min-width: 48rem) 8rem, 6rem" />}
                        </div>
                      </Link>

                      <div className="min-w-0">
                        <h2 className="text-body">
                          <Link href={href} className="link-reveal">
                            {line.name}
                          </Link>
                        </h2>
                        <Price
                          priceCents={line.unitPriceCents}
                          compareAtCents={line.compareAtCents}
                          className="mt-1 text-body"
                        />
                        <p className="mt-2 text-caption text-ink-muted">
                          {line.color}
                          {line.size && ` · Size ${line.size}`}
                        </p>
                        {line.exceedsStock && (
                          <p className="mt-2 text-caption text-danger">
                            {line.maxQuantity > 0
                              ? `Only ${line.maxQuantity} available. Please lower the quantity.`
                              : "Now sold out. Please remove it from your bag."}
                          </p>
                        )}
                        <div className="mt-4">
                          <BagLineControls
                            lineId={line.id}
                            name={line.name}
                            quantity={line.quantity}
                            maxQuantity={line.maxQuantity}
                          />
                        </div>
                      </div>

                      <p className="col-start-2 mt-4 text-body md:col-start-auto md:mt-0 md:text-right">
                        <span className="sr-only">Line total </span>
                        {formatPrice(line.lineTotalCents)}
                      </p>
                    </li>
                  );
                })}
              </ul>

              <aside aria-labelledby="summary-heading" className="self-start bg-surface p-6">
                <h2 id="summary-heading" className="eyebrow">
                  Summary
                </h2>
                <dl className="mt-6 flex items-baseline justify-between border-b border-line pb-4">
                  <dt className="text-body">Subtotal</dt>
                  <dd className="text-title">{formatPrice(subtotalCents)}</dd>
                </dl>
                <p className="mt-4 text-caption text-ink-muted">You&apos;ll pay securely with Stripe.</p>
                {overStock && (
                  <p className="mt-4 text-caption text-danger">
                    Some pieces have less stock than your bag holds. Adjust them before checking out.
                  </p>
                )}
                {canceled && !overStock && (
                  <p role="status" className="mt-4 text-caption text-ink-muted">
                    Checkout was canceled. Your bag is just as you left it.
                  </p>
                )}
                <CheckoutButton disabled={overStock} />
              </aside>
            </div>
          ) : (
            <div className="border-t border-line py-section text-center">
              <p className="text-body-lg text-ink-muted">Your bag is empty.</p>
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
