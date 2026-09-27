import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderSummary } from "@/components/order-summary";
import { getOrderForUser, ORDER_STATUS_LABEL } from "@/lib/orders";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Order | Kiel Store",
  robots: { index: false },
};

const dateFormat = new Intl.DateTimeFormat("en-PH", { dateStyle: "long", timeStyle: "short" });

export default async function OrderPage({ params }: PageProps<"/account/orders/[id]">) {
  const { id } = await params;
  const { user } = await requireUser(`/account/orders/${encodeURIComponent(id)}`);
  // Scoped to the user: another shopper's order id is a 404.
  const order = await getOrderForUser(user.id, { id });
  if (!order) notFound();
  const reference = order.id.slice(0, 8).toUpperCase();

  return (
    <main className="flex-1">
      <div className="container-content">
        <nav aria-label="Breadcrumb" className="py-4 md:py-6">
          <ol className="eyebrow flex flex-wrap items-center gap-2 text-ink-muted">
            <li>
              <Link href="/account" className="link-reveal">
                Account
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/account/orders" className="link-reveal">
                Orders
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">
              {reference}
            </li>
          </ol>
        </nav>

        <header className="pt-4 md:pt-6">
          <p className="eyebrow text-ink-muted">{ORDER_STATUS_LABEL[order.status]}</p>
          <h1 className="mt-3 text-headline">Order {reference}</h1>
          <p className="mt-3 text-caption text-ink-muted">Placed {dateFormat.format(order.createdAt)}</p>
        </header>

        <section aria-label="Order items" className="section max-w-reading pt-8 md:pt-10">
          <OrderSummary order={order} />
        </section>
      </div>
    </main>
  );
}
