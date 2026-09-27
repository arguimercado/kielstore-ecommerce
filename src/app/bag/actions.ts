"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { addToCart, type CartWriteResult, MAX_LINE_QTY, removeLine, setLineQuantity } from "@/lib/cart";

export type BagResult = CartWriteResult | { ok: false; reason: "signed-out" };

// Server actions are public endpoints: each one reads the session itself,
// validates its untyped arguments and only ever touches the signed-in user's lines.

function validText(value: unknown, max = 200): value is string {
  return typeof value === "string" && value.length <= max;
}

function validLineId(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

/** Adds one of a product in a colour and size ('' for one-size pieces). */
export async function addToBag(slug: unknown, color: unknown, size: unknown): Promise<BagResult> {
  const session = await getSession();
  if (!session) return { ok: false, reason: "signed-out" };
  if (!validText(slug) || slug.length === 0) return { ok: false, reason: "not-found" };
  if (!validText(color) || !validText(size)) return { ok: false, reason: "invalid-option" };
  const result = await addToCart(session.user.id, { slug, color, size });
  if (result.ok) revalidatePath("/bag");
  return result;
}

export async function updateBagQuantity(lineId: unknown, quantity: unknown): Promise<BagResult> {
  const session = await getSession();
  if (!session) return { ok: false, reason: "signed-out" };
  if (!validLineId(lineId)) return { ok: false, reason: "not-found" };
  if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_LINE_QTY) {
    return { ok: false, reason: "invalid-option" };
  }
  const result = await setLineQuantity(session.user.id, lineId, quantity);
  if (result.ok) revalidatePath("/bag");
  return result;
}

export async function removeFromBag(lineId: unknown): Promise<BagResult> {
  const session = await getSession();
  if (!session) return { ok: false, reason: "signed-out" };
  if (!validLineId(lineId)) return { ok: false, reason: "not-found" };
  const result = await removeLine(session.user.id, lineId);
  if (result.ok) revalidatePath("/bag");
  return result;
}
