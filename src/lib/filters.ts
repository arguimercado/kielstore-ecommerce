// Shop filters: the URL contract for /products and category pages. Pure, so
// server pages and the client filter form share one parser and one link builder.
//   ?size=M&size=38&color=black&price=1-3k&stock=in&sort=price-asc&view=list

import type { ColorFamily } from "@/lib/catalog";

export const COLOR_FAMILIES: { id: ColorFamily; label: string; hex: string }[] = [
  { id: "black", label: "Black", hex: "#111111" },
  { id: "white", label: "White", hex: "#f7f7f5" },
  { id: "grey", label: "Grey", hex: "#8c8c8c" },
  { id: "beige", label: "Beige", hex: "#d9ccb4" },
  { id: "brown", label: "Brown", hex: "#8a5a36" },
  { id: "blue", label: "Blue", hex: "#1f2a44" },
  { id: "red", label: "Red", hex: "#b3202a" },
  { id: "orange", label: "Orange", hex: "#e2742f" },
  { id: "pink", label: "Pink", hex: "#d9a293" },
  { id: "green", label: "Green", hex: "#5b5a3c" },
  { id: "multi", label: "Multi", hex: "#c9c4b8" },
];

/** Price bands in centavos; `max` is exclusive, absent for the top band. */
export const PRICE_BANDS = [
  { id: "under-1k", label: "Under ₱1,000", min: 0, max: 100_000 },
  { id: "1-3k", label: "₱1,000 – ₱3,000", min: 100_000, max: 300_000 },
  { id: "3-5k", label: "₱3,000 – ₱5,000", min: 300_000, max: 500_000 },
  { id: "5k-plus", label: "₱5,000 and above", min: 500_000 },
] as const satisfies readonly { id: string; label: string; min: number; max?: number }[];

export const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
] as const;

/** Display order for size options; sizes outside these runs sort after them. */
export const SIZE_GROUPS = [
  { label: "Clothing", sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
  { label: "Shoes", sizes: ["38", "39", "40", "41", "42", "43", "44", "45", "46"] },
];

export type PriceBandId = (typeof PRICE_BANDS)[number]["id"];
export type SortId = (typeof SORTS)[number]["id"];
export type View = "grid" | "list";

export type Filters = {
  sizes: string[];
  colors: ColorFamily[];
  prices: PriceBandId[];
  inStock: boolean;
  sort: SortId;
  view: View;
};

type SearchParams = Record<string, string | string[] | undefined>;

const all = (value: string | string[] | undefined) => (value === undefined ? [] : Array.isArray(value) ? value : [value]);
const oneOf = <T extends string>(allowed: readonly T[], value: unknown): value is T =>
  typeof value === "string" && (allowed as readonly string[]).includes(value);
const unique = <T>(values: T[]) => [...new Set(values)];

const colorIds = COLOR_FAMILIES.map((c) => c.id);
const priceIds = PRICE_BANDS.map((b) => b.id);
const sortIds = SORTS.map((s) => s.id);
// Sizes aren't a closed list (new runs can be added), so accept short plain tokens only.
const SIZE_PATTERN = /^[A-Za-z0-9]{1,6}$/;

/** Reads filters from search params. Unknown values are dropped, so nothing unvalidated reaches a query. */
export function parseFilters(params: SearchParams): Filters {
  return {
    sizes: unique(all(params.size).filter((s) => SIZE_PATTERN.test(s))).slice(0, 20),
    colors: unique(all(params.color).filter((c): c is ColorFamily => oneOf(colorIds, c))),
    prices: unique(all(params.price).filter((p): p is PriceBandId => oneOf(priceIds, p))),
    inStock: all(params.stock).includes("in"),
    sort: oneOf(sortIds, all(params.sort)[0]) ? (all(params.sort)[0] as SortId) : "featured",
    view: all(params.view)[0] === "list" ? "list" : "grid",
  };
}

/** Number of narrowing filters applied (sort and view don't count). */
export function activeFilterCount(f: Filters) {
  return f.sizes.length + f.colors.length + f.prices.length + (f.inStock ? 1 : 0);
}

/** Link to `basePath` with `filters` plus any `change`, omitting defaults. */
export function filtersHref(basePath: string, filters: Filters, change: Partial<Filters> = {}) {
  const f = { ...filters, ...change };
  const params = new URLSearchParams();
  for (const size of f.sizes) params.append("size", size);
  for (const color of f.colors) params.append("color", color);
  for (const price of f.prices) params.append("price", price);
  if (f.inStock) params.set("stock", "in");
  if (f.sort !== "featured") params.set("sort", f.sort);
  if (f.view !== "grid") params.set("view", f.view);
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

/** Filters with every narrowing option cleared, keeping sort and view. */
export function clearedFilters(f: Filters): Filters {
  return { ...f, sizes: [], colors: [], prices: [], inStock: false };
}

/** Sorts sizes into run order (clothing, then shoes), unknown sizes last. */
export function sortSizes(sizes: Iterable<string>) {
  const order = SIZE_GROUPS.flatMap((g) => g.sizes);
  const rank = (s: string) => (order.includes(s) ? order.indexOf(s) : order.length);
  return [...sizes].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}
