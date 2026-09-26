import { formatPrice } from "@/lib/catalog";

/** Current price, with the original struck through when the item is reduced. Amounts are cents. */
export function Price({
  priceCents,
  compareAtCents,
  className,
}: {
  priceCents: number;
  compareAtCents?: number;
  className?: string;
}) {
  const onSale = compareAtCents !== undefined && compareAtCents > priceCents;

  if (!onSale) return <p className={className}>{formatPrice(priceCents)}</p>;

  return (
    <p className={className}>
      <span className="sr-only">Sale price </span>
      <span className="text-danger">{formatPrice(priceCents)}</span>{" "}
      <span className="sr-only">, original price </span>
      <s className="text-ink-muted">{formatPrice(compareAtCents)}</s>
    </p>
  );
}
