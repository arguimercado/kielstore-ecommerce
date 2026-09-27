import type Stripe from "stripe";
import { handleStripeEvent } from "@/lib/checkout";
import { isStripeEventProcessed, recordStripeEvent } from "@/lib/orders";
import { stripe } from "@/lib/stripe";

// Stripe webhook endpoint. Subscribe it to checkout.session.completed,
// checkout.session.async_payment_succeeded, checkout.session.async_payment_failed
// and checkout.session.expired. No session cookie here: the signature is the auth.
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return new Response("Webhook not configured", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    // The signature covers the raw body, so read it as text, not JSON.
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  // Redeliveries short-circuit here; the status guards in src/lib/orders.ts
  // cover concurrent deliveries that both get past this check.
  if (await isStripeEventProcessed(event.id)) return new Response(null, { status: 200 });

  try {
    const order = await handleStripeEvent(event);
    await recordStripeEvent(event.id, event.type, order?.id ?? null);
  } catch (error) {
    console.error("Stripe webhook failed", { eventId: event.id, type: event.type, error });
    // 500 makes Stripe retry with backoff.
    return new Response("Webhook handler failed", { status: 500 });
  }
  return new Response(null, { status: 200 });
}
