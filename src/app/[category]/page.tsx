import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/product-listing";
import { getCategories, getCategory, getProducts } from "@/lib/products";

// Prerender every category at build, re-read prices and stock at most once a
// minute, and render categories added later on first request. Unknown slugs 404.
export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata(props: PageProps<"/[category]">): Promise<Metadata> {
  const { category: slug } = await props.params;
  const category = await getCategory(slug);
  if (!category) return {};

  return {
    title: `${category.name} | Kiel Store`,
    description: `Shop ${category.name.toLowerCase()} at Kiel Store, made in small runs and built to last.`,
  };
}

export default async function CategoryPage(props: PageProps<"/[category]">) {
  const { category: slug } = await props.params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const [products, categories] = await Promise.all([getProducts(category.slug), getCategories()]);

  return <ProductListing products={products} categories={categories} category={category} />;
}
