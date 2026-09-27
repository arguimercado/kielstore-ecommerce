import { getSession } from "@/lib/session";
import { getWishlistSlugs } from "@/lib/wishlist";

export type WishlistState = { signedIn: boolean; slugs: string[] };

// The signed-in user's saved slugs, so hearts on prerendered pages can show
// their state. Per-user, so never cached.
export async function GET() {
  const session = await getSession();
  const body: WishlistState = session
    ? { signedIn: true, slugs: await getWishlistSlugs(session.user.id) }
    : { signedIn: false, slugs: [] };
  return Response.json(body, { headers: { "Cache-Control": "private, no-store" } });
}
