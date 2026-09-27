// Sample catalog loaded by `npm run db:seed`. Prices are whole centavos (PHP).

import type { Colorway } from "../lib/catalog";
import { unsplash } from "../lib/catalog";

type Focus = { x: number; y: number; zoom: number };

/** Zoomed 4:5 crop of an Unsplash photo around a focal point (0–1 coordinates). */
function unsplashDetail(id: string, { x, y, zoom }: Focus, w = 1600) {
  return `${unsplash(id, w)}&h=${Math.round(w * 1.25)}&crop=focalpoint&fp-x=${x}&fp-y=${y}&fp-z=${zoom}`;
}

export type SeedCategory = { slug: string; name: string };

export type SeedProduct = {
  slug: string;
  name: string;
  categorySlug: string;
  priceCents: number;
  compareAtCents?: number;
  images: string[];
  badge?: "New" | "Limited";
  colors: Colorway[];
  sizes: string[];
  unavailableSizes?: string[];
  stock: number;
  description: string;
  details: string[];
  composition: string;
  care: string;
};

export const seedCategories: SeedCategory[] = [
  { slug: "outerwear", name: "Outerwear" },
  { slug: "dresses", name: "Dresses" },
  { slug: "knitwear", name: "Knitwear" },
  { slug: "bags", name: "Bags" },
  { slug: "shoes", name: "Shoes" },
  { slug: "essentials", name: "Essentials" },
  { slug: "trousers", name: "Trousers" },
  { slug: "accessories", name: "Accessories" },
];

type ProductInput = Omit<SeedProduct, "images"> & { photo: string; focus?: [Focus, Focus] };

// Focal-point crops of the product photo stand in for detail shots until
// real multi-angle photography exists.
const defaultFocus: [Focus, Focus] = [
  { x: 0.5, y: 0.35, zoom: 2 },
  { x: 0.5, y: 0.7, zoom: 2.5 },
];

function product({ photo, focus = defaultFocus, ...rest }: ProductInput): SeedProduct {
  return {
    ...rest,
    images: [unsplash(photo, 1600), ...focus.map((f) => unsplashDetail(photo, f))],
  };
}

const apparelSizes = ["XS", "S", "M", "L", "XL"];
const shoeSizes = ["36", "37", "38", "39", "40", "41"];

export const seedProducts: SeedProduct[] = [
  product({
    slug: "wool-overcoat",
    name: "Checked wool overcoat",
    categorySlug: "outerwear",
    priceCents: 5_159_000,
    photo: "1485968579580-b6d095142e6e",
    badge: "New",
    colors: [
      { name: "Navy check", hex: "#1c2a3a" },
      { name: "Camel", hex: "#b08a5f" },
    ],
    sizes: apparelSizes,
    stock: 14,
    description:
      "A relaxed, dropped-shoulder overcoat cut from a double-faced Italian wool with a tonal windowpane check. Unlined for a soft drape, it closes with horn buttons and falls just below the knee.",
    details: ["Relaxed fit, falls below the knee", "Horn buttons", "Two welt pockets", "Made in Portugal"],
    composition: "90% virgin wool, 10% cashmere",
    care: "Dry clean only. Brush after wear and hang on a shaped hanger.",
  }),
  product({
    slug: "chiffon-gown",
    name: "Pleated chiffon gown",
    categorySlug: "dresses",
    priceCents: 3_129_000,
    photo: "1595777457583-95e059d581b8",
    badge: "New",
    colors: [
      { name: "Scarlet", hex: "#b3202a" },
      { name: "Black", hex: "#111111" },
      { name: "Ivory", hex: "#efe9dd" },
    ],
    sizes: apparelSizes,
    unavailableSizes: ["XS"],
    stock: 9,
    description:
      "A floor-length gown in fine sunray-pleated chiffon that moves with every step. The fitted bodice ties at the neck and the skirt opens into a full, weightless sweep.",
    details: ["Regular fit through the bodice", "Self-tie halter neck", "Concealed side zip", "Made in Italy"],
    composition: "100% polyester chiffon; lining 100% viscose",
    care: "Dry clean only. Store hanging to keep the pleats crisp.",
  }),
  product({
    slug: "cashmere-crew",
    name: "Cashmere crewneck sweater",
    categorySlug: "knitwear",
    priceCents: 2_429_000,
    photo: "1434389677669-e08b4cac3105",
    focus: [
      { x: 0.5, y: 0.3, zoom: 2 },
      { x: 0.55, y: 0.75, zoom: 3 },
    ],
    colors: [
      { name: "Oatmeal", hex: "#d9ccb4" },
      { name: "Charcoal", hex: "#3a3a3a" },
      { name: "Navy", hex: "#1f2a44" },
      { name: "Ecru", hex: "#efe8da" },
    ],
    sizes: apparelSizes,
    stock: 22,
    description:
      "Knitted in Scotland from two-ply Mongolian cashmere, this crewneck has a softly relaxed body and a fringed, open-weave hem. Light enough to layer, warm enough to wear alone.",
    details: ["Relaxed fit", "Open-weave fringed hem", "Ribbed cuffs", "Made in Scotland"],
    composition: "100% cashmere",
    care: "Hand wash cold and dry flat, or dry clean.",
  }),
  product({
    slug: "woven-top-handle",
    name: "Woven leather top-handle bag",
    categorySlug: "bags",
    priceCents: 6_669_000,
    photo: "1590874103328-eac38a683ce7",
    focus: [
      { x: 0.5, y: 0.15, zoom: 2.2 },
      { x: 0.35, y: 0.85, zoom: 3 },
    ],
    badge: "Limited",
    colors: [{ name: "Tangerine", hex: "#e2742f" }],
    sizes: [],
    stock: 0,
    description:
      "A structured top-handle bag with a hand-woven body and a smooth calfskin flap. Made in a numbered run of 200 in our Florence workshop.",
    details: ["W 24 × H 20 × D 12 cm", "Detachable shoulder strap", "Turn-lock closure", "Made in Italy"],
    composition: "Calfskin leather, woven rattan; lining 100% cotton",
    care: "Wipe with a soft dry cloth. Keep away from direct sunlight and moisture.",
  }),
  product({
    slug: "biker-jacket",
    name: "Lambskin biker jacket",
    categorySlug: "outerwear",
    priceCents: 7_479_000,
    photo: "1551028719-00167b16eac5",
    colors: [{ name: "Black", hex: "#0e0e0e" }],
    sizes: apparelSizes,
    unavailableSizes: ["M", "XL"],
    stock: 2,
    description:
      "Our classic biker in butter-soft lambskin, with an asymmetric zip, notched lapels and a belted hem. It softens and moulds to you with every wear.",
    details: ["Slim fit", "Asymmetric front zip", "Zipped cuffs and pockets", "Made in Portugal"],
    composition: "100% lambskin leather; lining 100% cupro",
    care: "Specialist leather clean only.",
  }),
  product({
    slug: "heavy-tee",
    name: "Heavyweight cotton T-shirt",
    categorySlug: "essentials",
    priceCents: 549_000,
    photo: "1521572163474-6864f9cf17ab",
    colors: [
      { name: "White", hex: "#f7f7f5" },
      { name: "Black", hex: "#111111" },
      { name: "Grey marl", hex: "#9a9a98" },
      { name: "Navy", hex: "#1f2a44" },
      { name: "Olive", hex: "#5b5a3c" },
    ],
    sizes: apparelSizes,
    stock: 48,
    description:
      "A boxy T-shirt in a dense 280gsm organic cotton jersey that holds its shape wash after wash. Finished with a close-fitting ribbed neck.",
    details: ["Boxy fit", "Ribbed crew neck", "Dropped shoulder", "Made in Portugal"],
    composition: "100% organic cotton",
    care: "Machine wash at 30°C. Do not tumble dry.",
  }),
  product({
    slug: "leather-pump",
    name: "Pointed leather pump",
    categorySlug: "shoes",
    priceCents: 3_709_000,
    compareAtCents: 4_519_000,
    photo: "1543163521-1bf539c55dd2",
    colors: [
      { name: "Floral print", hex: "#2f6fb0" },
      { name: "Black", hex: "#111111" },
    ],
    sizes: shoeSizes,
    unavailableSizes: ["36", "41"],
    stock: 6,
    description:
      "A sharply pointed pump on a slender 100mm heel, cut from printed calfskin. Cushioned leather insoles make it wearable from day to night.",
    details: ["100mm stiletto heel", "Leather sole", "Padded insole", "Made in Italy"],
    composition: "Upper 100% calfskin; sole 100% leather",
    care: "Wipe clean. Store in the dust bag provided.",
  }),
  product({
    slug: "acetate-sunglasses",
    name: "Oversized acetate sunglasses",
    categorySlug: "accessories",
    priceCents: 1_789_000,
    photo: "1511499767150-a48a237f0083",
    focus: [
      { x: 0.3, y: 0.45, zoom: 2.5 },
      { x: 0.7, y: 0.45, zoom: 2.5 },
    ],
    colors: [
      { name: "Gold / green", hex: "#6d7a5a" },
      { name: "Tortoise", hex: "#6b4226" },
      { name: "Black", hex: "#111111" },
    ],
    sizes: [],
    stock: 17,
    description:
      "Round, lightweight frames with gold-tone temples and bottle-green lenses that offer full UV protection.",
    details: ["Category 3 lenses, 100% UVA/UVB", "Lens width 52mm", "Protective case included", "Made in Japan"],
    composition: "Frame: metal and acetate; lenses: nylon",
    care: "Clean with the microfibre cloth provided.",
  }),
  product({
    slug: "leather-sneaker",
    name: "Low-top leather sneaker",
    categorySlug: "shoes",
    priceCents: 2_609_000,
    photo: "1549298916-b41d501d3772",
    colors: [
      { name: "Tan", hex: "#b77a45" },
      { name: "White", hex: "#f2f2f0" },
      { name: "Black", hex: "#111111" },
    ],
    sizes: shoeSizes,
    stock: 20,
    description:
      "A low-top sneaker in waxed nubuck with a padded collar and a stitched cupsole. Built to be resoled.",
    details: ["Stitched rubber cupsole", "Padded collar", "Leather lining", "Made in Portugal"],
    composition: "Upper 100% nubuck leather; sole 100% rubber",
    care: "Brush off dirt and treat with a nubuck protector.",
  }),
  product({
    slug: "silk-trouser",
    name: "Tapered silk trouser",
    categorySlug: "trousers",
    priceCents: 2_779_000,
    photo: "1594633312681-425c7b97ccd1",
    colors: [
      { name: "Blush", hex: "#d9a293" },
      { name: "Black", hex: "#111111" },
    ],
    sizes: apparelSizes,
    stock: 11,
    description:
      "Fluid, high-rise trousers in washed silk twill with patch pockets and elasticated cuffs that sit neatly at the ankle.",
    details: ["High rise, tapered leg", "Elasticated waist and cuffs", "Patch pockets", "Made in Italy"],
    composition: "100% silk",
    care: "Hand wash cold or dry clean.",
  }),
  product({
    slug: "steel-watch",
    name: "Steel automatic watch",
    categorySlug: "accessories",
    priceCents: 13_919_000,
    photo: "1523170335258-f5ed11844a49",
    colors: [{ name: "Steel / blue", hex: "#2b3f73" }],
    sizes: [],
    stock: 4,
    description:
      "A 41mm dive-inspired watch with a Swiss automatic movement, a sunray blue dial and a unidirectional ceramic bezel.",
    details: ["41mm brushed steel case", "Swiss automatic movement", "Water resistant to 200m", "2-year guarantee"],
    composition: "Stainless steel case and bracelet; sapphire crystal",
    care: "Service every 5 years at an authorised watchmaker.",
  }),
  product({
    slug: "loopback-sweatshirt",
    name: "Loopback cotton sweatshirt",
    categorySlug: "essentials",
    priceCents: 2_079_000,
    compareAtCents: 2_609_000,
    photo: "1620799140408-edc6dcb6d633",
    colors: [
      { name: "White", hex: "#f7f7f5" },
      { name: "Grey marl", hex: "#9a9a98" },
      { name: "Black", hex: "#111111" },
    ],
    sizes: apparelSizes,
    unavailableSizes: ["XS", "S"],
    stock: 5,
    description:
      "A clean crewneck in heavy Japanese loopback cotton, garment-dyed for a soft hand and a lived-in feel from day one.",
    details: ["Relaxed fit", "Ribbed neck, cuffs and hem", "Flatlock seams", "Made in Japan"],
    composition: "100% cotton",
    care: "Machine wash at 30°C inside out. Dry flat.",
  }),
  product({
    slug: "runner",
    name: "Suede panel runner",
    categorySlug: "shoes",
    priceCents: 2_259_000,
    photo: "1560769629-975ec94e6a86",
    colors: [
      { name: "Multi", hex: "#c9c4b8" },
      { name: "Grey", hex: "#8c8c8c" },
    ],
    sizes: shoeSizes,
    stock: 13,
    description:
      "A retro running silhouette in layered suede and technical mesh, set on a cushioned, lightweight sole.",
    details: ["Cushioned EVA midsole", "Suede and mesh upper", "Removable insole", "Made in Portugal"],
    composition: "Upper suede and polyester mesh; sole rubber and EVA",
    care: "Spot clean with a suede brush.",
  }),
  product({
    slug: "denim-shirt-dress",
    name: "Washed denim shirt dress",
    categorySlug: "dresses",
    priceCents: 2_259_000,
    photo: "1591369822096-ffd140ec948f",
    badge: "Limited",
    colors: [
      { name: "Mid wash", hex: "#6f8fb3" },
      { name: "Indigo", hex: "#2c3e63" },
    ],
    sizes: apparelSizes,
    unavailableSizes: ["L"],
    stock: 3,
    description:
      "A short-sleeve shirt dress in soft, lightweight Japanese denim with a gathered waist and a full, knee-length skirt.",
    details: ["Regular fit", "Full button placket", "Gathered waist", "Made in Portugal"],
    composition: "100% cotton denim",
    care: "Machine wash at 30°C inside out.",
  }),
];
