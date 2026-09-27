"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { saveToWishlist, unsaveFromWishlist } from "@/app/account/wishlist/actions";
import type { WishlistState } from "@/app/api/wishlist/route";

type Wishlist = {
  isSaved: (slug: string) => boolean;
  save: (slug: string, name: string) => void;
  remove: (slug: string, name: string) => void;
};

const WishlistContext = createContext<Wishlist | null>(null);

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}

// Signing in, signing up and signing out all happen on these routes, so
// leaving one means the session may have changed.
const AUTH_ROUTES = /^\/(sign-in|sign-up|account)(\/|$)/;

/**
 * The signed-in user's saved products, for every heart on the page. Pages are
 * prerendered and shared, so the state loads per visitor from /api/wishlist.
 */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [saved, setSaved] = useState<ReadonlySet<string>>(new Set());
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set());
  const [announcement, setAnnouncement] = useState("");
  const [loadCount, setLoadCount] = useState(0);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (AUTH_ROUTES.test(prevPathname)) setLoadCount((n) => n + 1);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/wishlist", { cache: "no-store" })
      .then((res) => (res.ok ? (res.json() as Promise<WishlistState>) : null))
      .then((state) => {
        if (cancelled || !state) return;
        setSignedIn(state.signedIn);
        setSaved(new Set(state.slugs));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [loadCount]);

  function goToSignIn() {
    router.push(`/sign-in?callbackURL=${encodeURIComponent(location.pathname + location.search)}`);
  }

  // Optimistic: flip the heart now, put it back if the server refuses.
  async function update(slug: string, name: string, next: boolean) {
    if (signedIn === false) return goToSignIn();
    if (pending.has(slug)) return;

    const setHas = (on: boolean) =>
      setSaved((s) => {
        const copy = new Set(s);
        if (on) copy.add(slug);
        else copy.delete(slug);
        return copy;
      });
    setHas(next);
    setPending((p) => new Set(p).add(slug));

    try {
      const result = await (next ? saveToWishlist(slug) : unsaveFromWishlist(slug));
      if (result.ok) {
        setAnnouncement(next ? `${name} saved to your wishlist.` : `${name} removed from your wishlist.`);
      } else {
        setHas(!next);
        if (result.reason === "signed-out") {
          setSignedIn(false);
          goToSignIn();
        } else {
          setAnnouncement(`${name} is no longer available.`);
        }
      }
    } catch {
      setHas(!next);
      setAnnouncement("We couldn't update your wishlist. Please try again.");
    } finally {
      setPending((p) => {
        const copy = new Set(p);
        copy.delete(slug);
        return copy;
      });
    }
  }

  const value: Wishlist = {
    isSaved: (slug) => saved.has(slug),
    save: (slug, name) => update(slug, name, true),
    remove: (slug, name) => update(slug, name, false),
  };

  return (
    <WishlistContext value={value}>
      {children}
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </WishlistContext>
  );
}
