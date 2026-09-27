// Editorial storefront content and shared catalog types. Product data lives in
// Postgres (src/db/) and is read through src/lib/products.ts.

export type Colorway = { name: string; hex: string };

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
  eyebrow: "Autumn / Winter 2026",
  title: "The quiet season",
  copy: "Tailoring in soft wool, heavy knits and leather built to last. A wardrobe that asks for nothing and gives everything.",
  image: unsplash("1483985988355-763728e1935b", 2400),
};

// Homepage "Shop by category" tiles. These are editorial departments, not the
// product categories stored in the database.
export const categories: Category[] = [
  { slug: "women", name: "Women", image: unsplash("1515886657613-9f3515b0c78f", 1000) },
  { slug: "men", name: "Men", image: unsplash("1617137968427-85924c800a22", 1000) },
  { slug: "bags", name: "Bags", image: unsplash("1584917865442-de89df76afd3", 1000) },
  { slug: "shoes", name: "Shoes", image: unsplash("1535043934128-cf0b28d52f95", 1000) },
];

// Curated homepage merchandising, resolved against the database by slug.
export const newArrivalSlugs = [
  "wool-overcoat",
  "chiffon-gown",
  "cashmere-crew",
  "woven-top-handle",
  "biker-jacket",
  "heavy-tee",
  "leather-pump",
  "acetate-sunglasses",
];

export const mostWantedSlugs = [
  "leather-sneaker",
  "silk-trouser",
  "steel-watch",
  "loopback-sweatshirt",
  "runner",
  "denim-shirt-dress",
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
    slug: "tailoring",
    eyebrow: "Collection",
    title: "New tailoring",
    image: unsplash("1507679799987-c73779587ccf", 1600),
  },
  {
    slug: "city",
    eyebrow: "Collection",
    title: "City layers",
    image: unsplash("1539109136881-3be0616acf4b", 1600),
  },
];

export const featuredStory = {
  eyebrow: "The edit",
  title: "Pieces made to be kept",
  copy: "Our atelier works with a handful of mills in Italy and Portugal. Every garment is cut in small runs, finished by hand and backed by free repairs for life.",
  image: unsplash("1490481651871-ab68de25d43d", 1600),
  detailImage: unsplash("1558769132-cb1aea458c5e", 1000),
};

// Quick links in the search panel and on an empty or unmatched search.
export const popularSearches = ["Coat", "Cashmere", "Leather", "Sneaker", "Silk", "Black"];

export const services = [
  { title: "Complimentary shipping", copy: "On all orders over ₱15,000, delivered in 2 to 4 days." },
  { title: "Free returns", copy: "Return or exchange within 30 days, no questions asked." },
  { title: "Repairs for life", copy: "Send any piece back to our atelier for mending." },
  { title: "Secure payment", copy: "Every transaction is encrypted end to end." },
];
