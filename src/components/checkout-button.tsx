"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { type CheckoutFailure, checkout } from "@/app/checkout/actions";

const MESSAGES: Record<Exclude<CheckoutFailure["reason"], "signed-out">, string> = {
  empty: "Your bag is empty.",
  "insufficient-stock": "Some pieces sold out while you were shopping. Please review your bag.",
  "below-minimum": "Your order total is below the minimum we can charge.",
  "checkout-in-progress": "A checkout is already starting. Please wait a moment and try again.",
  "payment-unavailable": "We couldn't start checkout. Please try again.",
};

/**
 * Sends the shopper to Stripe Checkout. It posts no bag data: the server reads
 * the bag and prices itself, and redirects on success.
 */
export function CheckoutButton({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [failure, action, pending] = useActionState<CheckoutFailure | null>(() => checkout(), null);

  useEffect(() => {
    if (failure?.reason === "signed-out") router.push("/sign-in?callbackURL=%2Fbag");
  }, [failure, router]);

  const message = failure && failure.reason !== "signed-out" ? MESSAGES[failure.reason] : null;

  return (
    <form action={action} className="mt-6">
      <button
        type="submit"
        disabled={disabled || pending}
        aria-describedby={message ? "checkout-error" : undefined}
        className="btn btn-primary btn-block"
      >
        {pending ? "Redirecting…" : "Checkout"}
      </button>
      {message && (
        <p id="checkout-error" role="alert" className="mt-4 text-caption text-danger">
          {message}
        </p>
      )}
    </form>
  );
}
