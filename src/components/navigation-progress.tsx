"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Keep the bar up long enough to read as feedback, even when a prefetched
// route renders instantly.
const MIN_VISIBLE_MS = 350;
// Give up if a navigation never lands (cancelled, or failed).
const MAX_LOADING_MS = 10_000;
// Matches the fade in .nav-progress[data-state="complete"].
const FADE_MS = 700;

type Progress = {
  phase: "idle" | "loading" | "complete";
  /** Pathname the navigation started from; a new pathname means it landed. */
  from: string;
  startedAt: number;
};

/** Hairline progress bar along the header's bottom edge, shown on every route change. */
export function NavigationProgress() {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const [progress, setProgress] = useState<Progress>({ phase: "idle", from: pathname, startedAt: 0 });
  const { phase, from, startedAt } = progress;
  const arrived = phase === "loading" && pathname !== from;

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // The App Router has no navigation events, so start on internal link clicks
  // (capture phase, before <Link> handles them) and on back/forward.
  useEffect(() => {
    const start = () => setProgress({ phase: "loading", from: pathnameRef.current, startedAt: Date.now() });

    function onClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!(e.target instanceof Element)) return;
      const link = e.target.closest("a");
      if (!link?.href || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
      const url = new URL(link.href);
      // Same-page links (anchors, "#") don't change the route, so there is nothing to wait for.
      if (url.origin !== location.origin || url.pathname === pathnameRef.current) return;
      start();
    }

    function onPopState() {
      if (location.pathname !== pathnameRef.current) start();
    }

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  // loading → complete once the new route renders (or on timeout), then complete → idle after the fade.
  useEffect(() => {
    if (phase === "idle") return;
    let delay = FADE_MS;
    if (phase === "loading") delay = arrived ? Math.max(0, startedAt + MIN_VISIBLE_MS - Date.now()) : MAX_LOADING_MS;
    const next = phase === "loading" ? "complete" : "idle";
    const timer = setTimeout(() => setProgress((p) => ({ ...p, phase: next })), delay);
    return () => clearTimeout(timer);
  }, [phase, arrived, startedAt]);

  if (phase === "idle") return null;
  // Keyed by start time so a new navigation redraws the bar from zero.
  return <span key={startedAt} aria-hidden="true" data-state={phase} className="nav-progress" />;
}
