import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/catalog";
import type { OrderWithItems } from "@/lib/orders";

/** An order's lines and total, from its checkout snapshot (not current catalog prices). */
export function OrderSummary({ order }: { order: OrderWithItems }) {
  return (
    <div>
      <ul className="border-t border-line">
        {order.items.map((item) => (
          <li key={item.id} className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] gap-x-4 border-b border-line py-5">
            <div className="media-frame aspect-product">
              {item.image && <Image src={item.image} alt="" fill sizes="4.5rem" />}
            </div>
            <div className="min-w-0">
              <p className="text-body">
                {item.productId ? (
                  <Link href={`/products/${item.slug}`} className="link-reveal">
                    {item.name}
                  </Link>
                ) : (
                  item.name
                )}
              </p>
              <p className="mt-1 text-caption text-ink-muted">
                {item.color}
                {item.size && ` · Size ${item.size}`} · Qty {item.quantity}
              </p>
              <p className="mt-1 text-caption text-ink-muted">{formatPrice(item.unitPriceCents)} each</p>
            </div>
            <p className="text-body">{formatPrice(item.unitPriceCents * item.quantity)}</p>
          </li>
        ))}
      </ul>
      <dl className="flex items-baseline justify-between py-5">
        <dt className="text-body">Total</dt>
        <dd className="text-title">{formatPrice(order.totalCents)}</dd>
      </dl>
    </div>
  );
}
