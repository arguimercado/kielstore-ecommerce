import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Disclosure } from "@/components/disclosure";
import { Price } from "@/components/price";
import { ProductCard } from "@/components/product-card";
import { PurchasePanel } from "@/components/purchase-panel";
import { SectionHeading } from "@/components/section-heading";
import { StockStatus } from "@/components/stock-status";
import { getStockState, services } from "@/lib/catalog";
import { getAllProductSlugs, getProduct, getRelated } from "@/lib/products";

// Prerender every product at build, re-read prices and stock at most once a
// minute, and render products added later on first request. Unknown slugs 404.
export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProduct(slug);
  if (!product) return {};

  return {
    title: `${product.name} | Kiel Store`,
    description: product.description,
    openGraph: { images: [product.gallery[0]] },
  };
}

export default async function ProductPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await getRelated(product);
  const categoryHref = `/${product.categorySlug}`;
  const [shipping, returns] = services;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.gallery,
    category: product.category,
    brand: { "@type": "Brand", name: "Kiel Store" },
    offers: {
      "@type": "Offer",
      price: (product.priceCents / 100).toFixed(2),
      priceCurrency: "PHP",
      availability:
        getStockState(product.stock) === "sold-out" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
  };

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="container-page">
        <nav aria-label="Breadcrumb" className="py-4 md:py-6">
          <ol className="eyebrow flex flex-wrap items-center gap-2 text-ink-muted">
            <li>
              <Link href="/" className="link-reveal">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={categoryHref} className="link-reveal">
                {product.category}
              </Link>
            </li>
            <li aria-hidden="true" className="max-sm:hidden">
              /
            </li>
            <li aria-current="page" className="text-ink max-sm:hidden">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid gap-y-8 md:grid-cols-2 md:gap-x-10 lg:grid-cols-12 lg:gap-x-16">
          {/* Gallery: swipe rail on mobile, stacked large images from md */}
          <ul className="gallery -mx-gutter md:mx-0 lg:col-span-7" aria-label={`${product.name} images`}>
            {product.gallery.map((src, i) => (
              <li key={src} className="media-frame aspect-product">
                <Image
                  src={src}
                  alt={i === 0 ? product.name : `${product.name}, detail ${i}`}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 64rem) 58vw, (min-width: 48rem) 50vw, 88vw"
                />
              </li>
            ))}
          </ul>

          {/* Product information, pinned beside the gallery from md */}
          <div className="md:sticky md:top-header md:self-start md:pt-2 lg:col-span-5 lg:max-w-lg">
            <div className="flex items-center gap-3">
              <Link href={categoryHref} className="eyebrow link-reveal text-ink-muted">
                {product.category}
              </Link>
              {product.badge && <span className="eyebrow border border-line px-2 py-0.5">{product.badge}</span>}
            </div>
            <h1 className="mt-3 text-title md:text-headline">{product.name}</h1>
            <Price priceCents={product.priceCents} compareAtCents={product.compareAtCents} className="mt-3 text-body-lg" />
            <StockStatus stock={product.stock} className="mt-4" />

            <hr className="divider my-7" />

            <PurchasePanel product={product} />

            <ul className="mt-7 grid grid-cols-2 gap-4 text-caption">
              {[shipping, returns].map((s) => (
                <li key={s.title}>
                  <p>{s.title}</p>
                  <p className="mt-0.5 text-ink-muted">{s.copy}</p>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-line">
              <Disclosure title="Description" defaultOpen>
                <p className="text-body-lg text-ink">{product.description}</p>
              </Disclosure>
              <Disclosure title="Details">
                <ul className="list-inside list-disc space-y-1 marker:text-ink-subtle">
                  {product.details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </Disclosure>
              <Disclosure title="Composition and care">
                <p>{product.composition}</p>
                <p className="mt-2">{product.care}</p>
              </Disclosure>
              {product.sizes.length > 0 && (
                <Disclosure title="Size and fit" id="size-and-fit">
                  <p>
                    Available in {product.sizes[0]} to {product.sizes.at(-1)}. If you are between sizes, we recommend
                    taking the larger size. Our client advisors are happy to help with fit.
                  </p>
                </Disclosure>
              )}
              <Disclosure title="Shipping and returns">
                <p>
                  {shipping.copy} {returns.copy} Every order arrives in our signature packaging.
                </p>
              </Disclosure>
            </div>
          </div>
        </div>
      </div>

      <section className="section mt-section border-t border-line">
        <div className="container-page">
          <SectionHeading
            eyebrow="You may also like"
            title="Complete the look"
            action={{ href: categoryHref, label: `More ${product.category.toLowerCase()}` }}
          />
        </div>
        <ul className="rail mt-8 px-gutter md:mt-10 lg:container-page">
          {related.map((p) => (
            <li key={p.slug}>
              <ProductCard product={p} sizes="(min-width: 64rem) 25vw, (min-width: 48rem) 40vw, 70vw" />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
