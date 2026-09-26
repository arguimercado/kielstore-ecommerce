// Sample storefront data for the homepage. Replace with Drizzle queries
// once product tables exist in src/db/.

export type Product = {
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  image: string;
  hoverImage?: string;
  badge?: "New" | "Limited";
  colors: number;
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

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const hero = {
  eyebrow: "Autumn / Winter 2026",
  title: "The quiet season",
  copy: "Tailoring in soft wool, heavy knits and leather built to last. A wardrobe that asks for nothing and gives everything.",
  image: unsplash("1483985988355-763728e1935b", 2400),
};

export const categories: Category[] = [
  { slug: "women", name: "Women", image: unsplash("1515886657613-9f3515b0c78f", 1000) },
  { slug: "men", name: "Men", image: unsplash("1617137968427-85924c800a22", 1000) },
  { slug: "bags", name: "Bags", image: unsplash("1584917865442-de89df76afd3", 1000) },
  { slug: "shoes", name: "Shoes", image: unsplash("1535043934128-cf0b28d52f95", 1000) },
];

export const newArrivals: Product[] = [
  {
    slug: "wool-overcoat",
    name: "Checked wool overcoat",
    category: "Outerwear",
    price: 890,
    image: unsplash("1485968579580-b6d095142e6e", 1000),
    badge: "New",
    colors: 2,
  },
  {
    slug: "chiffon-gown",
    name: "Pleated chiffon gown",
    category: "Dresses",
    price: 540,
    image: unsplash("1595777457583-95e059d581b8", 1000),
    badge: "New",
    colors: 3,
  },
  {
    slug: "cashmere-crew",
    name: "Cashmere crewneck sweater",
    category: "Knitwear",
    price: 420,
    image: unsplash("1434389677669-e08b4cac3105", 1000),
    colors: 4,
  },
  {
    slug: "woven-top-handle",
    name: "Woven leather top-handle bag",
    category: "Bags",
    price: 1150,
    image: unsplash("1590874103328-eac38a683ce7", 1000),
    badge: "Limited",
    colors: 2,
  },
  {
    slug: "biker-jacket",
    name: "Lambskin biker jacket",
    category: "Outerwear",
    price: 1290,
    image: unsplash("1551028719-00167b16eac5", 1000),
    colors: 2,
  },
  {
    slug: "heavy-tee",
    name: "Heavyweight cotton T-shirt",
    category: "Essentials",
    price: 95,
    image: unsplash("1521572163474-6864f9cf17ab", 1000),
    colors: 5,
  },
  {
    slug: "leather-pump",
    name: "Pointed leather pump",
    category: "Shoes",
    price: 640,
    compareAt: 780,
    image: unsplash("1543163521-1bf539c55dd2", 1000),
    colors: 2,
  },
  {
    slug: "acetate-sunglasses",
    name: "Oversized acetate sunglasses",
    category: "Accessories",
    price: 310,
    image: unsplash("1511499767150-a48a237f0083", 1000),
    colors: 3,
  },
];

export const mostWanted: Product[] = [
  {
    slug: "leather-sneaker",
    name: "Low-top leather sneaker",
    category: "Shoes",
    price: 450,
    image: unsplash("1549298916-b41d501d3772", 1000),
    colors: 3,
  },
  {
    slug: "silk-trouser",
    name: "Tapered silk trouser",
    category: "Trousers",
    price: 480,
    image: unsplash("1594633312681-425c7b97ccd1", 1000),
    colors: 2,
  },
  {
    slug: "steel-watch",
    name: "Steel automatic watch",
    category: "Accessories",
    price: 2400,
    image: unsplash("1523170335258-f5ed11844a49", 1000),
    colors: 1,
  },
  {
    slug: "loopback-sweatshirt",
    name: "Loopback cotton sweatshirt",
    category: "Essentials",
    price: 360,
    compareAt: 450,
    image: unsplash("1620799140408-edc6dcb6d633", 1000),
    colors: 3,
  },
  {
    slug: "runner",
    name: "Suede panel runner",
    category: "Shoes",
    price: 390,
    image: unsplash("1560769629-975ec94e6a86", 1000),
    colors: 2,
  },
  {
    slug: "denim-shirt-dress",
    name: "Washed denim shirt dress",
    category: "Dresses",
    price: 390,
    image: unsplash("1591369822096-ffd140ec948f", 1000),
    badge: "Limited",
    colors: 2,
  },
];

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

export const services = [
  { title: "Complimentary shipping", copy: "On all orders over $250, delivered in 2 to 4 days." },
  { title: "Free returns", copy: "Return or exchange within 30 days, no questions asked." },
  { title: "Repairs for life", copy: "Send any piece back to our atelier for mending." },
  { title: "Secure payment", copy: "Every transaction is encrypted end to end." },
];
