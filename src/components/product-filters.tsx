"use client";

import Form from "next/form";
import Link from "next/link";
import {
  type ChangeEvent,
  createContext,
  type CSSProperties,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { CloseIcon, FilterIcon } from "@/components/icons";
import { type Filters, SIZE_GROUPS, SORTS } from "@/lib/filters";
import type { FilterFacets } from "@/lib/products";

// The sort select lives in the toolbar but submits with this form (form="…").
const FORM_ID = "product-filters";

const DrawerContext = createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(null);

function useDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("Filter components must be inside <FilterDrawerProvider>");
  return ctx;
}

/** Shares the drawer's open state between the toolbar button and the panel. */
export function FilterDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <DrawerContext value={{ open, setOpen }}>{children}</DrawerContext>;
}

/** Opens the filter drawer below `lg`, where the sidebar is hidden. */
export function FilterDrawerButton({ count }: { count: number }) {
  const { open, setOpen } = useDrawer();
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls="filter-panel"
      onClick={() => setOpen(true)}
      className="btn btn-secondary btn-sm lg:hidden"
    >
      <FilterIcon />
      Filters{count > 0 && ` (${count})`}
    </button>
  );
}

export function SortSelect({ sort }: { sort: Filters["sort"] }) {
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="sort" className="eyebrow text-ink-muted max-sm:sr-only">
        Sort
      </label>
      <select
        key={sort}
        id="sort"
        name="sort"
        form={FORM_ID}
        defaultValue={sort}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="field min-h-10 w-auto py-2"
      >
        {SORTS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}

type Selection = { size: string[]; color: string[]; price: string[]; stock: string[] };

const selectionFrom = (f: Filters): Selection => ({
  size: f.sizes,
  color: f.colors,
  price: f.prices,
  stock: f.inStock ? ["in"] : [],
});

function Group({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="border-t border-line pt-5">
      <legend className="eyebrow float-left text-ink-muted">{legend}</legend>
      <div className="clear-both pt-4">{children}</div>
    </fieldset>
  );
}

/**
 * Filter form: a sidebar from `lg`, a full-screen drawer below it. Every change
 * applies at once by submitting the form to the current URL; without JS the
 * Apply button in <noscript> submits it instead.
 */
export function FilterPanel({ facets, filters, clearHref }: { facets: FilterFacets; filters: Filters; clearHref: string }) {
  const { open, setOpen } = useDrawer();
  // Mirrors the URL, but flips instantly on click; resets whenever the URL's filters change.
  const [selected, setSelected] = useState(() => selectionFrom(filters));
  const [prevFilters, setPrevFilters] = useState(filters);
  if (filters !== prevFilters) {
    setPrevFilters(filters);
    setSelected(selectionFrom(filters));
  }

  useEffect(() => {
    if (!open) return;
    const desktop = window.matchMedia("(width >= 64rem)");
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", close);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", close);
    };
  }, [open, setOpen]);

  function onToggle(e: ChangeEvent<HTMLInputElement>) {
    const { name, value, checked, form } = e.currentTarget;
    const key = name as keyof Selection;
    setSelected((s) => ({ ...s, [key]: checked ? [...s[key], value] : s[key].filter((v) => v !== value) }));
    form?.requestSubmit();
  }

  const isOn = (key: keyof Selection, value: string) => selected[key].includes(value);
  const known = new Set(SIZE_GROUPS.flatMap((g) => g.sizes));
  const sizeGroups = [
    ...SIZE_GROUPS.map((g) => ({ label: g.label, sizes: facets.sizes.filter((s) => g.sizes.includes(s.size)) })),
    { label: "Other", sizes: facets.sizes.filter((s) => !known.has(s.size)) },
  ].filter((g) => g.sizes.length > 0);

  return (
    <div
      id="filter-panel"
      role={open ? "dialog" : undefined}
      aria-modal={open || undefined}
      aria-label="Filters"
      className={`max-lg:fixed max-lg:inset-0 max-lg:z-50 max-lg:flex max-lg:flex-col max-lg:bg-canvas max-lg:transition-[opacity,visibility] max-lg:duration-300 max-lg:ease-luxe ${
        open ? "" : "max-lg:invisible max-lg:opacity-0"
      }`}
    >
      <div className="container-page flex h-header shrink-0 items-center justify-between border-b border-line lg:hidden">
        <p className="eyebrow">Filters</p>
        <button type="button" aria-label="Close filters" onClick={() => setOpen(false)} className="btn btn-ghost btn-icon -mr-3">
          <CloseIcon />
        </button>
      </div>

      <Form
        id={FORM_ID}
        action=""
        replace
        scroll={false}
        className="space-y-7 max-lg:container-page max-lg:flex-1 max-lg:overflow-y-auto max-lg:py-6 lg:pt-8"
      >
        {filters.view === "list" && <input type="hidden" name="view" value="list" />}

        {sizeGroups.length > 0 && (
          <Group legend="Size">
            <div className="space-y-4">
              {sizeGroups.map((g) => (
                <div key={g.label}>
                  {sizeGroups.length > 1 && <p className="mb-2 text-caption text-ink-muted">{g.label}</p>}
                  <div className="flex flex-wrap gap-2">
                    {g.sizes.map(({ size, count }) => (
                      <label key={size} className="chip" title={`${size}, ${count} ${count === 1 ? "piece" : "pieces"}`}>
                        <input type="checkbox" name="size" value={size} checked={isOn("size", size)} onChange={onToggle} />
                        {size}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Group>
        )}

        {facets.colors.length > 0 && (
          <Group legend="Colour">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {facets.colors.map((c) => (
                <label key={c.id} className="flex cursor-pointer items-center gap-2 text-body">
                  <span
                    className={`swatch ${c.id === "multi" ? "swatch-multi" : ""}`}
                    style={{ "--swatch": c.hex } as CSSProperties}
                  >
                    <input type="checkbox" name="color" value={c.id} checked={isOn("color", c.id)} onChange={onToggle} />
                  </span>
                  <span className="min-w-0 flex-1">{c.label}</span>
                  <span className="text-caption text-ink-muted">{c.count}</span>
                </label>
              ))}
            </div>
          </Group>
        )}

        {facets.prices.length > 0 && (
          <Group legend="Price">
            <div className="flex flex-col gap-2">
              {facets.prices.map((b) => (
                <label key={b.id} className="chip w-full justify-between gap-3">
                  <input type="checkbox" name="price" value={b.id} checked={isOn("price", b.id)} onChange={onToggle} />
                  <span>{b.label}</span>
                  <span className="text-caption">{b.count}</span>
                </label>
              ))}
            </div>
          </Group>
        )}

        <Group legend="Availability">
          <label className="chip w-full justify-between gap-3">
            <input type="checkbox" name="stock" value="in" checked={isOn("stock", "in")} onChange={onToggle} />
            <span>In stock only</span>
            <span className="text-caption">{facets.inStock}</span>
          </label>
        </Group>

        <noscript>
          <button type="submit" className="btn btn-secondary btn-block">
            Apply filters
          </button>
        </noscript>
      </Form>

      <div className="container-page flex shrink-0 gap-3 border-t border-line py-4 lg:hidden">
        <Link href={clearHref} scroll={false} onClick={() => setOpen(false)} className="btn btn-secondary flex-1">
          Clear all
        </Link>
        <button type="button" onClick={() => setOpen(false)} className="btn btn-primary flex-1">
          Show results
        </button>
      </div>
    </div>
  );
}
