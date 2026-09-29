// Editorial storefront content and shared catalog types. Product data lives in
// Postgres (src/db/) and is read through src/lib/products.ts.

export type ColorFamily =
  | "black"
  | "white"
  | "grey"
  | "beige"
  | "brown"
  | "blue"
  | "red"
  | "orange"
  | "pink"
  | "green"
  | "multi";

/** A product colour. `name` is shown on the PDP; `family` groups it for filtering. */
export type Colorway = { name: string; hex: string; family: ColorFamily };

export type Product = {
  slug: string;
  name: string;
  /** Category display name, plus its slug for links. */
  category: string;
  categorySlug: string;
  /** Minor units: whole centavos (PHP). */
  priceCents: number;
  compareAtCents?: number;
  /** First image is the listing image; the rest are detail shots. */
  gallery: string[];
  badge?: "New" | "Limited";
  colors: Colorway[];
  /** Empty for one-size items such as bags and accessories. */
  sizes: string[];
  unavailableSizes?: string[];
  stock: number;
  description: string;
  details: string[];
  composition: string;
  care: string;
};

export type Collection = {
  slug: string;
  eyebrow: string;
  title: string;
  image: string;
};

export type Category = {
  slug: string;
  name: string;
  image: string;
};

/** Unsplash photo URL, cropped server-side; next/image handles responsive sizes. */
export function unsplash(id: string, w = 1600) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
}

/** Formats whole centavos as Philippine pesos, dropping the decimals for round-peso amounts. */
export function formatPrice(cents: number) {
  const digits = cents % 100 === 0 ? 0 : 2;
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(cents / 100);
}

export const hero = {
  eyebrow: "Crew & workwear outfitters",
  title: "Built for every shift",
  copy: "Uniforms, safety shoes and crew bags made to standard for the deck, the engine room and the site.",
  image: unsplash("1578575437130-527eed3abbec", 2400),
};

// Homepage "Shop by category" tiles, one per product category in the database.
export const categories: Category[] = [
  { slug: "uniforms", name: "Uniforms", image: unsplash("1559841066-615e601351cb", 1000) },
  { slug: "shoes", name: "Shoes", image: unsplash("1520639888713-7851133b1ed0", 1000) },
  { slug: "t-shirts", name: "T-shirts", image: unsplash("1562157873-818bc0726f68", 1000) },
  { slug: "bags", name: "Bags", image: unsplash("1473188588951-666fce8e7c68", 1000) },
];

// Curated homepage merchandising, resolved against the database by slug.
export const newArrivalSlugs = [
  "engine-room-boiler-suit",
  "s3-steel-toe-boot",
  "captains-dress-whites",
  "crew-sea-duffel",
  "deck-crew-hi-vis-coverall",
  "engineer-long-sleeve-tee",
  "composite-toe-work-boot",
  "captains-document-bag",
];

export const mostWantedSlugs = [
  "slip-resistant-deck-boot",
  "crew-cotton-tee",
  "security-patrol-uniform",
  "engineer-tool-bag",
  "construction-hi-vis-jacket",
  "security-utility-backpack",
];

export type StockState = "in-stock" | "low-stock" | "sold-out";

export const LOW_STOCK_THRESHOLD = 5;

export function getStockState(stock: number): StockState {
  if (stock <= 0) return "sold-out";
  if (stock <= LOW_STOCK_THRESHOLD) return "low-stock";
  return "in-stock";
}

export const editorialPair: Collection[] = [
  {
    slug: "deck-and-engine",
    eyebrow: "Collection",
    title: "Deck & engine crew",
    image: unsplash("1660543228631-3f2341090afe", 1600),
  },
  {
    slug: "site-and-security",
    eyebrow: "Collection",
    title: "Site & security",
    image: unsplash("1694521787193-9293daeddbaa", 1600),
  },
];

export const featuredStory = {
  eyebrow: "Fleet outfitting",
  title: "Kit for the whole crew",
  copy: "From the master's whites to the motorman's boiler suit, we outfit entire vessels and job sites. Every piece is tested to its safety standard and sized for the crew who wear it.",
  image: unsplash("1605745341112-85968b19335b", 1600),
  detailImage: unsplash("1662309376159-b95fb193d96b", 1000),
};

// Quick links in the search panel and on an empty or unmatched search.
export const popularSearches = ["Safety boot", "Coverall", "Hi-vis", "Captain", "Duffel", "Navy"];

// The PDP reads the first two (shipping, returns) by position.
export const services = [
  { title: "Complimentary shipping", copy: "On all orders over ₱5,000, delivered in 2 to 4 days." },
  { title: "Free returns", copy: "Return or exchange within 30 days, no questions asked." },
  { title: "Certified protection", copy: "Safety footwear and hi-vis tested to EN ISO standards." },
  { title: "Secure payment", copy: "Every transaction is encrypted end to end." },
];
