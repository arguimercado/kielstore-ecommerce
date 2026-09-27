import { getCartCount } from "@/lib/cart";
import { getSession } from "@/lib/session";

export type CartState = { signedIn: boolean; count: number };

// The signed-in user's bag count, so the header on prerendered pages can show
// it. Per-user, so never cached.
export async function GET() {
  const session = await getSession();
  const body: CartState = session
    ? { signedIn: true, count: await getCartCount(session.user.id) }
    : { signedIn: false, count: 0 };
  return Response.json(body, { headers: { "Cache-Control": "private, no-store" } });
}
