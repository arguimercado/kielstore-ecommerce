// Stripe Checkout. Our DB owns prices, stock and orders; Stripe owns the
// payment page and payment state. Nothing here trusts the client: the amount
// charged is built from the order snapshot, and payment status is only ever
// read from Stripe (a signed webhook event or a sessions.retrieve call).

import "server-only";
import { revalidatePath } from "next/cache";
import type Stripe from "stripe";
import { getCart } from "@/lib/cart";
import {
  attachCheckoutSession,
  createPendingOrder,
  getOrder,
  getPendingOrder,
  markOrderNeedsReview,
  markOrderPaid,
  markOrderProcessing,
  type Order,
  type OrderItem,
  releaseReservation,
} from "@/lib/orders";
import { stripe } from "@/lib/stripe";

/** Stripe's minimum charge for PHP (₱0.50), in centavos. */
const MIN_CHARGE_CENTS = 50;

/** How long a checkout holds stock. Stripe's minimum is 30 minutes; the extra minute absorbs clock skew. */
const SESSION_TTL_SECONDS = 31 * 60;

/** A newer checkout won't cancel an order younger than this that has no session yet: it may still be creating one. */
const SESSION_CREATE_GRACE_MS = 60_000;

/** Labels these sessions in the Stripe Dashboard. */
const INTEGRATION_IDENTIFIER = "kiel-checkout-qhzmtrwa";

export type StartCheckoutResult =
  | { ok: true; url: string }
  | {
      ok: false;
      reason: "empty" | "insufficient-stock" | "below-minimum" | "checkout-in-progress" | "payment-unavailable";
    };

function appUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL;
  if (!base) throw new Error("NEXT_PUBLIC_APP_URL is not set");
  return new URL(path, base).toString();
}

/** Refreshes the ISR product pages whose stock changed. */
function revalidateProducts(slugs: Iterable<string>) {
  for (const slug of new Set(slugs)) revalidatePath(`/products/${slug}`);
}

function paymentIntentId(session: Stripe.Checkout.Session) {
  const pi = session.payment_intent;
  return typeof pi === "string" ? pi : (pi?.id ?? null);
}

function lineItem(item: OrderItem): Stripe.Checkout.SessionCreateParams.LineItem {
  const image = item.image?.startsWith("https://") ? item.image : undefined;
  return {
    quantity: item.quantity,
    price_data: {
      currency: "php",
      unit_amount: item.unitPriceCents,
      product_data: {
        name: item.name,
        description: item.size ? `${item.color} · Size ${item.size}` : item.color,
        images: image ? [image] : undefined,
        metadata: { slug: item.slug },
      },
    },
  };
}

/**
 * Starts a checkout for the signed-in user's bag: creates a pending order at
 * current DB prices, reserves its stock and opens a Stripe Checkout Session
 * for exactly that order. Returns the Stripe-hosted URL to redirect to.
 */
export async function startCheckout(user: { id: string; email: string }): Promise<StartCheckoutResult> {
  // A previous checkout still holding stock is closed first, so its stock
  // counts toward this one. If it turned out to be paid, its lines leave the bag.
  const previous = await getPendingOrder(user.id);
  if (previous && !(await settleOpenCheckout(previous))) return { ok: false, reason: "checkout-in-progress" };

  const cart = await getCart(user.id);
  if (cart.lines.length === 0) return { ok: false, reason: "empty" };
  if (cart.lines.some((l) => l.exceedsStock)) return { ok: false, reason: "insufficient-stock" };
  if (cart.subtotalCents < MIN_CHARGE_CENTS) return { ok: false, reason: "below-minimum" };

  const created = await createPendingOrder(user.id, cart);
  if (!created.ok) return created;
  const { order, items } = created;
  revalidateProducts(items.map((i) => i.slug));

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        line_items: items.map(lineItem),
        client_reference_id: order.id,
        metadata: { order_id: order.id },
        payment_intent_data: { metadata: { order_id: order.id } },
        customer_email: user.email,
        expires_at: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
        success_url: `${appUrl("/checkout/success")}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: appUrl("/bag?checkout=canceled"),
        integration_identifier: INTEGRATION_IDENTIFIER,
      },
      { idempotencyKey: `checkout-session-${order.id}` },
    );
  } catch (error) {
    console.error("Stripe Checkout Session create failed", { orderId: order.id, error });
    revalidateProducts(await releaseReservation(order.id, "canceled"));
    return { ok: false, reason: "payment-unavailable" };
  }

  // A concurrent checkout may have replaced this order while Stripe responded.
  if (!session.url || !(await attachCheckoutSession(order.id, session.id))) {
    await stripe.checkout.sessions.expire(session.id).catch(() => {});
    revalidateProducts(await releaseReservation(order.id, "canceled"));
    return { ok: false, reason: "checkout-in-progress" };
  }
  return { ok: true, url: session.url };
}

/**
 * Closes a pending order before a new checkout: expires its open session and
 * returns its stock, or records its payment if the shopper already paid.
 * False when the order is too new to touch (another request is still opening it).
 */
async function settleOpenCheckout(order: Order): Promise<boolean> {
  if (!order.stripeCheckoutSessionId) {
    if (Date.now() - order.createdAt.getTime() < SESSION_CREATE_GRACE_MS) return false;
    revalidateProducts(await releaseReservation(order.id, "canceled"));
    return true;
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.expire(order.stripeCheckoutSessionId);
  } catch {
    // Only open sessions can be expired; it has completed or expired already.
    session = await stripe.checkout.sessions.retrieve(order.stripeCheckoutSessionId);
  }

  if (session.status === "expired") {
    revalidateProducts(await releaseReservation(order.id, "canceled"));
    return true;
  }
  if (session.status === "complete") {
    await applySession(session);
    return true;
  }
  throw new Error(`Checkout Session ${session.id} is still open after expire`);
}

/**
 * Records what Stripe says about a Checkout Session. Safe to call any number
 * of times and concurrently (webhook + success page). The order only becomes
 * `paid` when Stripe reports it paid for exactly the order's amount and currency.
 */
async function applySession(session: Stripe.Checkout.Session): Promise<Order | undefined> {
  const orderId = session.metadata?.order_id ?? session.client_reference_id;
  const order = orderId ? await getOrder(orderId) : undefined;
  if (!order || order.stripeCheckoutSessionId !== session.id) return undefined;
  if (session.status !== "complete") return order;

  const pi = paymentIntentId(session);
  if (session.payment_status === "unpaid") {
    // Async payment method: completed, but the money hasn't arrived yet.
    await markOrderProcessing(order.id, pi);
  } else if (
    session.payment_status !== "paid" ||
    session.amount_total !== order.totalCents ||
    session.currency !== order.currency
  ) {
    console.error("Checkout Session doesn't match its order", {
      orderId: order.id,
      sessionId: session.id,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      currency: session.currency,
    });
    await markOrderNeedsReview(order.id, pi);
  } else if (order.status === "pending" || order.status === "processing") {
    await markOrderPaid(order.id, pi);
  } else if (order.status !== "paid" && order.status !== "needs_review") {
    // Paid for an order whose stock was already released.
    console.error("Payment received for a released order", { orderId: order.id, status: order.status });
    await markOrderNeedsReview(order.id, pi);
  }
  return getOrder(order.id);
}

/** Confirms a session by asking Stripe directly, never trusting the caller's claim that it was paid. */
export async function fulfillCheckout(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return applySession(session);
}

/** Releases the stock of the order behind an expired or failed session. */
async function releaseForSession(
  session: Stripe.Checkout.Session,
  to: "expired" | "payment_failed",
): Promise<Order | undefined> {
  const orderId = session.metadata?.order_id ?? session.client_reference_id;
  const order = orderId ? await getOrder(orderId) : undefined;
  if (!order || order.stripeCheckoutSessionId !== session.id) return undefined;
  revalidateProducts(await releaseReservation(order.id, to));
  return order;
}

/**
 * Applies a verified webhook event. Returns the order it concerned, if any.
 * Throws on failure so the webhook answers 500 and Stripe retries.
 */
export async function handleStripeEvent(event: Stripe.Event): Promise<Order | undefined> {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      // Re-read the session rather than trusting a possibly stale event payload.
      return fulfillCheckout(event.data.object.id);
    case "checkout.session.async_payment_failed":
      return releaseForSession(event.data.object, "payment_failed");
    case "checkout.session.expired":
      return releaseForSession(event.data.object, "expired");
    default:
      return undefined;
  }
}
