import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderSummary } from "@/components/order-summary";
import { fulfillCheckout } from "@/lib/checkout";
import { getOrderForUser } from "@/lib/orders";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Order confirmation | Kiel Store",
  robots: { index: false },
};

// Stripe returns here after payment. This page only displays the order: it
// asks Stripe for the session's real status (the same idempotent path as the
// webhook), so opening the URL without paying changes nothing.
export default async function CheckoutSuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  const { session_id: sessionId } = await searchParams;
  if (typeof sessionId !== "string" || !sessionId.startsWith("cs_") || sessionId.length > 255) notFound();

  const { user } = await requireUser(`/checkout/success?session_id=${encodeURIComponent(sessionId)}`);
  let order = await getOrderForUser(user.id, { sessionId });
  if (!order) notFound();

  // The webhook may not have arrived yet.
  if (order.status === "pending" || order.status === "processing") {
    try {
      await fulfillCheckout(sessionId);
      order = (await getOrderForUser(user.id, { sessionId })) ?? order;
    } catch (error) {
      console.error("Success page couldn't confirm the session", { sessionId, error });
    }
  }

  const heading =
    order.status === "paid"
      ? "Thank you for your order"
      : order.status === "processing"
        ? "Your payment is processing"
        : order.status === "needs_review"
          ? "We're reviewing your order"
          : order.status === "pending"
            ? "Confirming your payment"
            : "This checkout didn't complete";

  const note =
    order.status === "paid"
      ? `A receipt is on its way to ${user.email}.`
      : order.status === "processing"
        ? "We'll confirm your order as soon as your payment clears. Your pieces are held for you."
        : order.status === "needs_review"
          ? "Your payment was received but needs a quick check on our side. We'll be in touch."
          : order.status === "pending"
            ? "This can take a moment. Refresh this page to see the latest status."
            : "No payment was taken. Your pieces are back in stock for anyone to buy.";

  return (
    <main className="container-content section flex-1">
      <p className="eyebrow text-ink-muted">Order {order.id.slice(0, 8).toUpperCase()}</p>
      <h1 className="mt-3 text-headline">{heading}</h1>
      <p className="mt-4 max-w-reading text-body-lg text-ink-muted">{note}</p>

      <div className="mt-10 max-w-reading">
        <OrderSummary order={order} />
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link href={`/account/orders/${order.id}`} className="btn btn-secondary">
          View order
        </Link>
        <Link href="/new" className="btn btn-ghost">
          Continue shopping
        </Link>
      </div>
    </main>
  );
}
