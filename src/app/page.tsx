import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import {
  categories,
  editorialPair,
  featuredStory,
  hero,
  mostWantedSlugs,
  newArrivalSlugs,
  services,
} from "@/lib/catalog";
import { getProductsBySlugs } from "@/lib/products";

// Re-read prices and stock from the database at most once a minute.
export const revalidate = 60;

export default async function Home() {
  const [newArrivals, mostWanted] = await Promise.all([
    getProductsBySlugs(newArrivalSlugs),
    getProductsBySlugs(mostWantedSlugs),
  ]);

  return (
    <main className="flex-1">
      {/* Campaign hero */}
      <section className="theme-inverse relative">
        <div className="media-frame w-full aspect-campaign-tall md:aspect-campaign lg:max-h-[calc(100svh-var(--header-h))]">
          <Image
            src={hero.image}
            alt="Container ship berthed beneath gantry cranes at a port"
            fill
            priority
            sizes="100vw"
            className="object-[70%_30%]"
          />
          {/* Scrims keep the copy legible over bright frames: bottom on mobile, left from md. */}
          <div className="absolute inset-0 bg-linear-to-t from-canvas/80 via-canvas/20 to-transparent md:via-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-canvas/60 via-canvas/10 to-transparent to-60% max-md:hidden" />
        </div>
        <div className="absolute inset-x-0 bottom-0">
          <div className="container-page pb-10 md:pb-14 lg:pb-20">
            <p className="eyebrow tracking-wide-label">{hero.eyebrow}</p>
            <h1 className="mt-4 max-w-[12ch] text-display">{hero.title}</h1>
            <p className="mt-5 max-w-md text-body-lg text-ink-muted max-md:hidden">{hero.copy}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/new" className="btn btn-primary">
                Shop the range
              </Link>
              <Link href="/journal/the-quiet-season" className="btn btn-secondary max-sm:hidden">
                Outfit your crew
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by category */}
      <section className="section">
        <div className="container-page">
          <SectionHeading eyebrow="Shop by category" title="Kit for every role" />
          <ul className="mt-8 grid grid-cols-2 gap-x-grid gap-y-8 md:mt-10 lg:grid-cols-4">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link href={`/${cat.slug}`} className="group block">
                  <div className="media-frame aspect-portrait">
                    <Image
                      src={cat.image}
                      alt=""
                      fill
                      sizes="(min-width: 64rem) 25vw, 50vw"
                      className="transition-transform duration-1000 ease-luxe group-hover:scale-[1.03]"
                    />
                  </div>
                  <p className="mt-3 flex items-center justify-between px-1">
                    <span className="eyebrow link-reveal">{cat.name}</span>
                    <ArrowIcon className="transition-transform duration-500 ease-luxe group-hover:translate-x-1" />
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* New arrivals */}
      <section className="section pt-0">
        <div className="container-page">
          <SectionHeading
            eyebrow="Just landed"
            title="New arrivals"
            action={{ href: "/new", label: "View all" }}
          />
          <div className="mt-8 grid-products md:mt-10">
            {newArrivals.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Editorial pair: two full-height collection panels */}
      <section className="grid-split">
        {editorialPair.map((c) => (
          <Link key={c.slug} href={`/collections/${c.slug}`} className="theme-inverse group relative block">
            <div className="media-frame aspect-portrait">
              <Image
                src={c.image}
                alt=""
                fill
                sizes="(min-width: 48rem) 50vw, 100vw"
                className="transition-transform duration-1000 ease-luxe group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-linear-to-t from-canvas/60 to-transparent to-50%" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-gutter pb-8 md:pb-10">
              <p className="eyebrow text-ink-muted">{c.eyebrow}</p>
              <h2 className="mt-2 text-headline">{c.title}</h2>
              <span className="eyebrow link-reveal mt-4 inline-block group-hover:bg-size-[100%_1px]">
                Discover
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* Featured story */}
      <section className="section">
        <div className="container-page grid items-center gap-10 md:grid-cols-2 lg:gap-20">
          <div className="media-frame aspect-product">
            <Image
              src={featuredStory.image}
              alt="Container ship under way at sea"
              fill
              sizes="(min-width: 48rem) 50vw, 100vw"
            />
          </div>
          <div className="md:max-w-md lg:max-w-lg">
            <p className="eyebrow text-ink-muted">{featuredStory.eyebrow}</p>
            <h2 className="mt-3 text-headline">{featuredStory.title}</h2>
            <p className="mt-5 text-body-lg text-ink-muted">{featuredStory.copy}</p>
            <div className="mt-8 flex items-end gap-6">
              <div className="media-frame aspect-portrait w-32 shrink-0 lg:w-40">
                <Image src={featuredStory.detailImage} alt="" fill sizes="10rem" />
              </div>
              <Link href="/journal/atelier" className="eyebrow link-reveal">
                How we outfit a fleet
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Most wanted rail */}
      <section className="section border-t border-line">
        <div className="container-page">
          <SectionHeading
            eyebrow="Most wanted"
            title="What crews reorder most"
            action={{ href: "/bestsellers", label: "Shop bestsellers" }}
          />
        </div>
        <ul className="rail mt-8 px-gutter md:mt-10 lg:container-page">
          {mostWanted.map((product) => (
            <li key={product.slug}>
              <ProductCard product={product} sizes="(min-width: 64rem) 25vw, (min-width: 48rem) 40vw, 70vw" />
            </li>
          ))}
        </ul>
      </section>

      {/* Services */}
      <section className="border-t border-line">
        <ul className="container-page grid grid-cols-1 gap-y-8 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-10">
          {services.map((s) => (
            <li key={s.title}>
              <h3 className="eyebrow">{s.title}</h3>
              <p className="mt-2 text-body text-ink-muted">{s.copy}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
