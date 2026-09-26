"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/icons";

type NavItem = { href: string; label: string };

export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen(true)}
        className="btn btn-ghost btn-icon -ml-3"
      >
        <MenuIcon />
      </button>

      <div
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
        className={`fixed inset-0 z-50 flex flex-col bg-canvas transition-opacity duration-300 ease-luxe ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="container-page flex h-header shrink-0 items-center border-b border-line">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="btn btn-ghost btn-icon -ml-3"
          >
            <CloseIcon />
          </button>
        </div>
        <nav aria-label="Mobile" className="container-page flex-1 overflow-y-auto py-8">
          <ul className="space-y-5">
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setOpen(false)} className="text-headline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <hr className="divider my-8" />
          <ul className="space-y-4">
            {["Account", "Wishlist", "Stores", "Client services"].map((label) => (
              <li key={label}>
                <Link href="#" onClick={() => setOpen(false)} className="eyebrow link-reveal">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
