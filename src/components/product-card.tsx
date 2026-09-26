import Image from "next/image";
import Link from "next/link";
import { HeartIcon } from "@/components/icons";
import { Price } from "@/components/price";
import { getStockState, type Product } from "@/lib/catalog";

const gridSizes = "(min-width: 80rem) 25vw, (min-width: 48rem) 33vw, 50vw";

export function ProductCard({ product, sizes = gridSizes }: { product: Product; sizes?: string }) {
  const [image, hoverImage] = product.gallery;
  const soldOut = getStockState(product.stock) === "sold-out";
  const badge = soldOut ? "Sold out" : product.badge;

  return (
    <article className="group relative">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="media-frame aspect-product">
          <Image src={image} alt={product.name} fill sizes={sizes} />
          {/* Detail shot fades in on hover, like flipping to the close-up. */}
          {hoverImage && (
            <Image
              src={hoverImage}
              alt=""
              fill
              sizes={sizes}
              className="opacity-0 transition-opacity duration-700 ease-luxe group-hover:opacity-100"
            />
          )}
          {badge && <span className="eyebrow absolute top-3 left-3 bg-canvas px-2 py-1">{badge}</span>}
        </div>
        <div className="mt-3 space-y-1 px-1">
          <p className="text-caption text-ink-muted">{product.category}</p>
          <h3 className="text-body">{product.name}</h3>
          <Price priceCents={product.priceCents} compareAtCents={product.compareAtCents} className="text-body" />
          <p className="text-caption text-ink-muted">
            {product.colors.length} {product.colors.length === 1 ? "colour" : "colours"}
          </p>
        </div>
      </Link>
      <button
        type="button"
        aria-label={`Save ${product.name}`}
        className="btn btn-ghost btn-icon absolute top-1 right-1 hover:bg-transparent"
      >
        <HeartIcon width={18} height={18} />
      </button>
    </article>
  );
}
