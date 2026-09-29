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
  { slug: "uniforms", name: "Uniforms" },
  { slug: "shoes", name: "Shoes" },
  { slug: "t-shirts", name: "T-shirts" },
  { slug: "bags", name: "Bags" },
];

type ProductInput = Omit<SeedProduct, "images"> & { photo: string; focus?: [Focus, Focus] };

// Focal-point crops of the product photo stand in for detail shots until
// real multi-angle photography exists.
const defaultFocus: [Focus, Focus] = [
  { x: 0.5, y: 0.35, zoom: 2 },
  { x: 0.5, y: 0.7, zoom: 2.5 },
];

// Footwear sits low in the frame: zoom toward the upper, then the sole.
const shoeFocus: [Focus, Focus] = [
  { x: 0.5, y: 0.45, zoom: 2 },
  { x: 0.5, y: 0.8, zoom: 2.5 },
];

function product({ photo, focus = defaultFocus, ...rest }: ProductInput): SeedProduct {
  return {
    ...rest,
    images: [unsplash(photo, 1600), ...focus.map((f) => unsplashDetail(photo, f))],
  };
}

const apparelSizes = ["XS", "S", "M", "L", "XL", "XXL"];
const shoeSizes = ["38", "39", "40", "41", "42", "43", "44", "45", "46"];

// Shared colourways. Hi-vis lime has no yellow family, so it filters as green.
const navy: Colorway = { name: "Navy", hex: "#1b2a41", family: "blue" };
const black: Colorway = { name: "Black", hex: "#121417", family: "black" };
const white: Colorway = { name: "White", hex: "#f7f7f5", family: "white" };
const charcoal: Colorway = { name: "Charcoal", hex: "#3a3f45", family: "grey" };
const hiVisOrange: Colorway = { name: "Hi-vis orange", hex: "#f26a1b", family: "orange" };
const hiVisLime: Colorway = { name: "Hi-vis lime", hex: "#c9e62f", family: "green" };

export const seedProducts: SeedProduct[] = [
  // Uniforms
  product({
    slug: "engine-room-boiler-suit",
    name: "Engine room boiler suit",
    categorySlug: "uniforms",
    priceCents: 289_000,
    photo: "1783323260513-fb1857ac515c",
    badge: "New",
    colors: [{ name: "Workwear blue", hex: "#3d5f8f", family: "blue" }, navy, charcoal],
    sizes: apparelSizes,
    unavailableSizes: ["XS"],
    stock: 40,
    description:
      "A one-piece boiler suit for marine engineers and motormen. Flame-retardant twill, a two-way front zip under a stud-fastened storm flap, and knee-pad pockets built for long watches on the plates.",
    details: [
      "Flame retardant to EN ISO 11612",
      "Two-way front zip with storm flap",
      "Knee-pad pockets and triple-stitched seams",
      "Pen, rule and radio pockets",
    ],
    composition: "88% cotton, 12% nylon FR twill, 330 gsm",
    care: "Industrial wash up to 75°C. Do not use fabric softener or bleach.",
  }),
  product({
    slug: "deck-crew-hi-vis-coverall",
    name: "Deck crew hi-vis rain coverall",
    categorySlug: "uniforms",
    priceCents: 369_000,
    compareAtCents: 429_000,
    photo: "1612787114413-a5e60ede7db8",
    colors: [hiVisLime, hiVisOrange],
    sizes: apparelSizes,
    stock: 18,
    description:
      "A waterproof coverall for mooring, cargo and deck work in heavy weather. Taped seams, a high storm collar and two bands of retro-reflective tape keep deck crew dry and visible from the bridge.",
    details: [
      "High visibility to EN ISO 20471 class 3",
      "Waterproof, fully taped seams",
      "Stowaway hood in the collar",
      "Adjustable cuffs and ankles",
    ],
    composition: "100% polyester with PU coating",
    care: "Wash at 40°C. Hang to dry. Do not tumble dry or iron.",
  }),
  product({
    slug: "captains-dress-whites",
    name: "Captain's dress whites",
    categorySlug: "uniforms",
    priceCents: 749_000,
    photo: "1786543816814-8e6c5ba51dde",
    focus: [
      { x: 0.5, y: 0.3, zoom: 2 },
      { x: 0.5, y: 0.55, zoom: 2.5 },
    ],
    badge: "Limited",
    colors: [white, navy],
    sizes: apparelSizes,
    unavailableSizes: ["XXL"],
    stock: 6,
    description:
      "A tailored full-dress uniform for masters and senior officers. Crisp tropical-weight white with a stand collar, shoulder boards for rank epaulettes and gilt anchor buttons.",
    details: [
      "Tailored fit, stand collar",
      "Shoulder boards take rank epaulettes",
      "Gilt anchor buttons",
      "Matching straight-leg trousers included",
    ],
    composition: "65% polyester, 35% cotton gabardine",
    care: "Dry clean or wash at 40°C. Press with a warm iron.",
  }),
  product({
    slug: "security-patrol-uniform",
    name: "Security patrol uniform set",
    categorySlug: "uniforms",
    priceCents: 329_000,
    photo: "1652739758426-56a564265f9e",
    colors: [black, navy],
    sizes: apparelSizes,
    stock: 4,
    description:
      "A complete patrol set for port and site security: a ripstop shirt and cargo trousers with a printed hi-vis security vest. Radio loops, epaulettes and ID badge tabs come standard.",
    details: [
      "Shirt, cargo trousers and printed hi-vis vest",
      "Radio loops and ID badge tab",
      "Reinforced belt loops",
      "Stain-resistant finish",
    ],
    composition: "65% polyester, 35% cotton ripstop; vest 100% polyester",
    care: "Wash at 40°C inside out. Line dry.",
  }),
  product({
    slug: "construction-hi-vis-jacket",
    name: "Construction hi-vis work jacket",
    categorySlug: "uniforms",
    priceCents: 219_000,
    photo: "1589939705384-5185137a7f0f",
    colors: [hiVisOrange, hiVisLime],
    sizes: apparelSizes,
    stock: 26,
    description:
      "A tough hi-vis jacket for builders, riggers and yard crew. Two-tone with a dark lower body that hides dirt, reinforced elbows and a tool-ready pocket layout.",
    details: [
      "High visibility to EN ISO 20471 class 2",
      "Reinforced elbows and cuffs",
      "Chest pockets with hard-hat clip loops",
      "Retro-reflective tape front and back",
    ],
    composition: "100% polyester oxford, PU coated",
    care: "Wash at 40°C. Do not tumble dry.",
  }),

  // Shoes
  product({
    slug: "s3-steel-toe-boot",
    name: "S3 steel-toe safety boot",
    categorySlug: "shoes",
    priceCents: 459_000,
    photo: "1774569036555-c3d233425a13",
    focus: shoeFocus,
    badge: "New",
    colors: [black],
    sizes: shoeSizes,
    unavailableSizes: ["38"],
    stock: 32,
    description:
      "Our workhorse safety boot for deck, yard and site. A 200-joule steel toe cap, steel midsole and a heat- and oil-resistant rubber sole keep feet safe on any shift.",
    details: [
      "EN ISO 20345 S3 SRC",
      "200 J steel toe cap and anti-penetration midsole",
      "Oil and heat-resistant rubber outsole (300°C)",
      "Water-resistant full-grain leather",
    ],
    composition: "Upper full-grain leather; lining mesh; outsole nitrile rubber",
    care: "Brush off dirt and wipe clean. Treat the leather with wax regularly.",
  }),
  product({
    slug: "composite-toe-work-boot",
    name: "Composite-toe work boot",
    categorySlug: "shoes",
    priceCents: 389_000,
    compareAtCents: 449_000,
    photo: "1509099074304-74309ab2af3d",
    focus: shoeFocus,
    colors: [{ name: "Tan", hex: "#8a6a45", family: "brown" }, black],
    sizes: shoeSizes,
    stock: 15,
    description:
      "A lighter, metal-free work boot for engineers who pass through scanners or work around live electrics. A composite toe and textile midsole cut weight without cutting protection.",
    details: [
      "EN ISO 20345 S1P SRC",
      "Metal-free composite toe and midsole",
      "Electrical hazard rated",
      "Padded collar and tongue",
    ],
    composition: "Upper nubuck leather; outsole PU/TPU",
    care: "Brush clean. Use a nubuck protector spray.",
  }),
  product({
    slug: "slip-resistant-deck-boot",
    name: "Slip-resistant deck boot",
    categorySlug: "shoes",
    priceCents: 279_000,
    photo: "1620216532950-ed4a4bda6ef1",
    focus: shoeFocus,
    colors: [black],
    sizes: shoeSizes,
    unavailableSizes: ["45", "46"],
    stock: 3,
    description:
      "A tall, fully waterproof rubber boot for wet decks, fish holds and wash-downs. A siped, non-marking sole grips on wet steel, and the steel toe protects against dropped gear.",
    details: ["EN ISO 20345 S5 SRC", "Steel toe cap and midsole", "Non-marking, siped outsole", "Kick-off heel spur"],
    composition: "Natural rubber; lining polyester",
    care: "Rinse with fresh water after use. Dry away from direct heat.",
  }),
  product({
    slug: "oil-resistant-crew-boot",
    name: "Oil-resistant crew boot",
    categorySlug: "shoes",
    priceCents: 419_000,
    photo: "1613325267798-05214c4d65f1",
    focus: [
      { x: 0.55, y: 0.4, zoom: 2 },
      { x: 0.5, y: 0.75, zoom: 2.5 },
    ],
    colors: [black],
    sizes: shoeSizes,
    stock: 0,
    description:
      "A lace-up leather boot for engine rooms and workshops. The oil- and fuel-resistant sole stays grippy on slick plates, and a padded collar keeps it comfortable across twelve-hour watches.",
    details: ["EN ISO 20345 S3 SRC", "Fuel- and oil-resistant outsole", "Steel toe cap", "Anti-static"],
    composition: "Upper full-grain leather; outsole rubber",
    care: "Wipe clean and wax the leather regularly.",
  }),

  // T-shirts
  product({
    slug: "crew-cotton-tee",
    name: "Crew cotton T-shirt",
    categorySlug: "t-shirts",
    priceCents: 69_000,
    photo: "1618354691373-d851c5c3a990",
    colors: [black, navy, white],
    sizes: apparelSizes,
    stock: 120,
    description:
      "A heavyweight crew T-shirt that survives ship laundry. A taped neck seam and twin-needle hems hold their shape, wash after wash.",
    details: ["Regular fit", "Heavyweight 220 gsm jersey", "Taped neck seam", "Twin-needle hems"],
    composition: "100% combed cotton",
    care: "Machine wash at 40°C. Tumble dry low.",
  }),
  product({
    slug: "hi-vis-reflective-tee",
    name: "Hi-vis reflective T-shirt",
    categorySlug: "t-shirts",
    priceCents: 89_000,
    compareAtCents: 110_000,
    photo: "1630683924997-fe27050a0416",
    colors: [hiVisLime, hiVisOrange],
    sizes: apparelSizes,
    stock: 48,
    description:
      "A breathable hi-vis T-shirt for hot days on site and on deck. Fluorescent birdseye mesh with segmented reflective tape that stays flexible when you move.",
    details: [
      "High visibility to EN ISO 20471 class 2",
      "Segmented reflective tape",
      "Quick-dry birdseye mesh",
      "UPF 40+",
    ],
    composition: "100% polyester birdseye mesh",
    care: "Wash at 40°C. Do not iron the reflective tape.",
  }),
  product({
    slug: "engineer-long-sleeve-tee",
    name: "Engineer long-sleeve T-shirt",
    categorySlug: "t-shirts",
    priceCents: 99_000,
    photo: "1618354691551-44de113f0164",
    badge: "New",
    colors: [black, charcoal],
    sizes: apparelSizes,
    unavailableSizes: ["XS"],
    stock: 5,
    description:
      "A moisture-wicking long-sleeve base layer for hot engine rooms and cold decks. Flatlock seams sit comfortably under a boiler suit.",
    details: ["Slim fit", "Moisture-wicking", "Flatlock seams", "Thumb loops"],
    composition: "60% cotton, 40% polyester",
    care: "Machine wash at 40°C. Line dry.",
  }),

  // Bags
  product({
    slug: "crew-sea-duffel",
    name: "Crew sea duffel",
    categorySlug: "bags",
    priceCents: 249_000,
    photo: "1631844321851-a1a5a7594a92",
    colors: [black, navy],
    sizes: [],
    stock: 22,
    description:
      "A roomy duffel for joining and signing off a vessel. Water-resistant canvas, a wide opening that packs flat into a cabin locker, and leather grab handles.",
    details: ["70 litres", "Water-resistant waxed canvas", "Padded shoulder strap", "Shoe compartment"],
    composition: "Waxed cotton canvas; leather handles; lining nylon",
    care: "Spot clean with a damp cloth. Re-wax the canvas as needed.",
  }),
  product({
    slug: "captains-document-bag",
    name: "Captain's document bag",
    categorySlug: "bags",
    priceCents: 689_000,
    photo: "1787675315614-dbec146cbb9a",
    focus: [
      { x: 0.55, y: 0.5, zoom: 2 },
      { x: 0.6, y: 0.75, zoom: 2.5 },
    ],
    badge: "Limited",
    colors: [{ name: "Cognac", hex: "#8a4b24", family: "brown" }],
    sizes: [],
    stock: 7,
    description:
      "A structured leather bag for the ship's papers, logbooks and a laptop. Two gussets keep certificates flat, and a lockable clasp keeps them where they belong.",
    details: ["W 40 × H 30 × D 12 cm", "Padded 15-inch laptop sleeve", "Lockable clasp", "Detachable shoulder strap"],
    composition: "Full-grain leather; lining cotton",
    care: "Wipe with a dry cloth and condition the leather twice a year.",
  }),
  product({
    slug: "security-utility-backpack",
    name: "Security utility backpack",
    categorySlug: "bags",
    priceCents: 229_000,
    photo: "1505308144658-03c69861061a",
    colors: [black, { name: "Graphite", hex: "#4a4f55", family: "grey" }],
    sizes: [],
    stock: 16,
    description:
      "A patrol backpack for security officers on long rounds. Quick-access front pockets for a torch and radio, MOLLE webbing and a hidden document sleeve against the back.",
    details: ["28 litres", "MOLLE webbing", "Radio and torch pockets", "Hidden back document sleeve"],
    composition: "1000D nylon; acetal buckles",
    care: "Hand wash in cold water. Air dry.",
  }),
  product({
    slug: "engineer-tool-bag",
    name: "Engineer tool bag",
    categorySlug: "bags",
    priceCents: 189_000,
    photo: "1785484267229-6d038bfcaf96",
    colors: [black],
    sizes: [],
    stock: 11,
    description:
      "A wide-mouth tool bag that stands open on the job. A moulded waterproof base, 24 inside and outside pockets, and a steel-frame opening for quick access in tight engine spaces.",
    details: ["W 45 × H 30 × D 25 cm", "Waterproof moulded base", "24 pockets", "Steel-frame wide mouth"],
    composition: "1680D ballistic polyester; polypropylene base",
    care: "Wipe clean with a damp cloth.",
  }),
];
