"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon, SearchIcon } from "@/components/icons";
import { SearchForm } from "@/components/search-form";
import { SearchSuggestions } from "@/components/search-suggestions";

/** Header search: an icon button that drops a search panel over the top of the page. */
export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Search"
        aria-expanded={open}
        aria-controls="search-dialog"
        onClick={() => setOpen(true)}
        className="btn btn-ghost btn-icon"
      >
        <SearchIcon />
      </button>

      <div
        id="search-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        inert={!open}
        className={`fixed inset-0 z-50 transition-opacity duration-300 ease-luxe ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {/* Scrim: clicking outside the panel closes it. */}
        <div aria-hidden="true" onClick={close} className="absolute inset-0 bg-ink/30" />

        <div className="relative border-b border-line bg-canvas">
          <div className="container-page flex h-header items-center gap-4">
            <SearchForm inputRef={inputRef} onSubmit={close} className="flex-1" />
            <button type="button" aria-label="Close search" onClick={close} className="btn btn-ghost btn-icon -mr-3">
              <CloseIcon />
            </button>
          </div>
          <SearchSuggestions onNavigate={close} className="container-page pt-2 pb-8" />
        </div>
      </div>
    </>
  );
}
