"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type StartCheckoutResult, startCheckout } from "@/lib/checkout";
import { getSession } from "@/lib/session";

export type CheckoutFailure = Extract<StartCheckoutResult, { ok: false }> | { ok: false; reason: "signed-out" };

/**
 * Starts Stripe Checkout for the signed-in user's bag and redirects to it.
 * Takes no input: what's charged comes from the bag and the catalog on the server.
 */
export async function checkout(): Promise<CheckoutFailure> {
  const session = await getSession();
  if (!session) return { ok: false, reason: "signed-out" };

  let result: StartCheckoutResult;
  try {
    result = await startCheckout({ id: session.user.id, email: session.user.email });
  } catch (error) {
    console.error("Checkout failed to start", error);
    result = { ok: false, reason: "payment-unavailable" };
  }
  if (result.ok) redirect(result.url);

  revalidatePath("/bag");
  return result;
}
