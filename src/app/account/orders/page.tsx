import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { formatPrice } from "@/lib/catalog";
import { listOrdersForUser, ORDER_STATUS_LABEL } from "@/lib/orders";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Orders | Kiel Store",
  robots: { index: false },
};

const dateFormat = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" });

export default async function OrdersPage() {
  const { user } = await requireUser("/account/orders");
  const orders = await listOrdersForUser(user.id);

  return (
    <main className="flex-1">
      <div className="container-content">
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
              Orders
            </li>
          </ol>
        </nav>

        <header className="pt-4 md:pt-6">
          <p className="eyebrow text-ink-muted">Account</p>
          <h1 className="mt-3 text-headline">Orders</h1>
        </header>
      </div>

      <section aria-label="Your orders" className="section pt-8 md:pt-10">
        <div className="container-content">
          {orders.length > 0 ? (
            <ul className="max-w-reading border-t border-line">
              {orders.map((order) => {
                const count = order.items.reduce((n, i) => n + i.quantity, 0);
                return (
                  <li key={order.id} className="border-b border-line">
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="group flex items-center justify-between gap-6 py-5"
                    >
                      <div className="min-w-0">
                        <p className="eyebrow">Order {order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="mt-1 text-caption text-ink-muted">
                          {dateFormat.format(order.createdAt)} · {count} {count === 1 ? "item" : "items"} ·{" "}
                          {ORDER_STATUS_LABEL[order.status]}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-4">
                        <span className="text-body">{formatPrice(order.totalCents)}</span>
                        <ArrowIcon className="transition-transform duration-500 ease-luxe group-hover:translate-x-1" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="border-t border-line py-section text-center">
              <p className="text-body-lg text-ink-muted">You haven&apos;t placed any orders yet.</p>
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
