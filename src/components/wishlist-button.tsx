"use client";

import Link from "next/link";
import { HeartIcon } from "@/components/icons";
import { useWishlist } from "@/components/wishlist-provider";

/** Heart toggle: saves the product to the signed-in user's wishlist, or sends them to sign in. */
export function WishlistButton({
  slug,
  name,
  className,
  iconSize = 20,
}: {
  slug: string;
  name: string;
  className: string;
  iconSize?: number;
}) {
  const { isSaved, save, remove } = useWishlist();
  const saved = isSaved(slug);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      onClick={() => (saved ? remove(slug, name) : save(slug, name))}
      className={className}
    >
      <HeartIcon width={iconSize} height={iconSize} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}

/** Text "Remove" action for lists of saved products. */
export function WishlistRemoveButton({ slug, name }: { slug: string; name: string }) {
  const { remove } = useWishlist();
  return (
    <button
      type="button"
      aria-label={`Remove ${name} from wishlist`}
      onClick={() => remove(slug, name)}
      className="eyebrow link-reveal text-ink-muted hover:text-ink"
    >
      Remove
    </button>
  );
}

/** Header link to the wishlist; the heart fills once anything is saved. */
export function WishlistHeaderLink({ className }: { className: string }) {
  const { count } = useWishlist();
  return (
    <Link
      href="/account/wishlist"
      aria-label={count > 0 ? `Wishlist, ${count} ${count === 1 ? "item" : "items"}` : "Wishlist"}
      className={className}
    >
      <HeartIcon fill={count > 0 ? "currentColor" : "none"} />
    </Link>
  );
}
