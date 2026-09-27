import Image from "next/image";
import Link from "next/link";
import { Price } from "@/components/price";
import { StockStatus } from "@/components/stock-status";
import { WishlistButton } from "@/components/wishlist-button";
import { getStockState, type Product } from "@/lib/catalog";

/** List-view row: image, details and actions side by side, divided by hairlines. */
export function ProductListItem({ product, loading }: { product: Product; loading?: "eager" | "lazy" }) {
  const href = `/products/${product.slug}`;
  const soldOut = getStockState(product.stock) === "sold-out";
  const badge = soldOut ? "Sold out" : product.badge;
  const unavailable = new Set(product.unavailableSizes);
  const available = product.sizes.filter((s) => !unavailable.has(s));
  const sizes =
    product.sizes.length === 0 ? "One size" : available.length > 0 ? `Sizes ${available.join(" · ")}` : "No sizes available";

  return (
    <article className="group grid grid-cols-[7rem_minmax(0,1fr)] gap-x-4 gap-y-4 border-b border-line py-6 md:grid-cols-[11rem_minmax(0,1fr)_auto] md:gap-x-8">
      {/* The name link below carries the accessible name; the image link is a mouse shortcut. */}
      <Link href={href} tabIndex={-1} aria-hidden="true" className="block md:row-span-1">
        <div className="media-frame aspect-product">
          <Image
            src={product.gallery[0]}
            alt=""
            fill
            sizes="(min-width: 48rem) 11rem, 7rem"
            loading={loading}
            className="transition-opacity duration-500 group-hover:opacity-90"
          />
          {badge && <span className="eyebrow absolute top-2 left-2 bg-canvas px-1.5 py-0.5">{badge}</span>}
        </div>
      </Link>

      <div className="min-w-0">
        <p className="text-caption text-ink-muted">{product.category}</p>
        <h3 className="mt-1 text-body md:text-title">
          <Link href={href} className="link-reveal">
            {product.name}
          </Link>
        </h3>
        <Price priceCents={product.priceCents} compareAtCents={product.compareAtCents} className="mt-2 text-body" />
        <ul aria-label="Colours" className="mt-3 flex flex-wrap gap-1.5">
          {product.colors.map((c) => (
            <li key={c.name} title={c.name}>
              <span aria-hidden="true" className="block size-3.5 border border-line" style={{ backgroundColor: c.hex }} />
              <span className="sr-only">{c.name}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-caption text-ink-muted">{sizes}</p>
        <StockStatus stock={product.stock} className="mt-2" />
        <p className="mt-3 line-clamp-2 hidden max-w-reading text-body text-ink-muted md:block">{product.description}</p>
      </div>

      <div className="col-start-2 flex items-center gap-5 md:col-start-auto md:flex-col md:items-end md:justify-between">
        <WishlistButton slug={product.slug} name={product.name} className="btn btn-secondary btn-icon" iconSize={18} />
        <Link href={href} className="eyebrow link-reveal" aria-label={`View details, ${product.name}`}>
          View details
        </Link>
      </div>
    </article>
  );
}
