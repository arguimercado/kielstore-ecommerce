"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { addToBag, type BagResult } from "@/app/bag/actions";
import type { CartState } from "@/app/api/cart/route";
import { BagIcon } from "@/components/icons";

type Cart = {
  /** Items in the bag (0 while loading or signed out). */
  count: number;
  /** Adds one; sends signed-out visitors to sign in. Resolves to null when nothing was sent. */
  add: (slug: string, color: string, size: string) => Promise<BagResult | null>;
  /** Takes the count a bag action returned, so the header stays in step. */
  setCount: (count: number) => void;
};

const CartContext = createContext<Cart | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

// Signing in, signing up and signing out all happen on these routes, so
// leaving one means the session may have changed.
const AUTH_ROUTES = /^\/(sign-in|sign-up|account)(\/|$)/;

/**
 * The signed-in user's bag count for the header. Pages are prerendered and
 * shared, so it loads per visitor from /api/cart.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [count, setCount] = useState(0);
  const [loadCount, setLoadCount] = useState(0);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (AUTH_ROUTES.test(prevPathname)) setLoadCount((n) => n + 1);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cart", { cache: "no-store" })
      .then((res) => (res.ok ? (res.json() as Promise<CartState>) : null))
      .then((state) => {
        if (cancelled || !state) return;
        setSignedIn(state.signedIn);
        setCount(state.count);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [loadCount]);

  function goToSignIn() {
    router.push(`/sign-in?callbackURL=${encodeURIComponent(location.pathname + location.search)}`);
  }

  async function add(slug: string, color: string, size: string) {
    if (signedIn === false) {
      goToSignIn();
      return null;
    }
    const result = await addToBag(slug, color, size);
    if (result.ok) {
      setSignedIn(true);
      setCount(result.count);
    } else if (result.reason === "signed-out") {
      setSignedIn(false);
      goToSignIn();
    }
    return result;
  }

  return <CartContext value={{ count, add, setCount }}>{children}</CartContext>;
}

/** Header link to the bag, with the item count once anything is in it. */
export function BagHeaderLink({ className }: { className: string }) {
  const { count } = useCart();
  return (
    <Link
      href="/bag"
      aria-label={count > 0 ? `Bag, ${count} ${count === 1 ? "item" : "items"}` : "Bag"}
      className={`${className} relative`}
    >
      <BagIcon />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-1.5 right-1 min-w-4 bg-ink px-1 text-center text-caption leading-4 text-canvas"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
