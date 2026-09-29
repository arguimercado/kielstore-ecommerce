import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/product-listing";
import { parseFilters } from "@/lib/filters";
import { getCategories, getCategory, getFilterFacets } from "@/lib/products";

// Rendered per request: filters, sort and view come from the search params.
// Unknown category slugs 404.

export async function generateMetadata(props: PageProps<"/[category]">): Promise<Metadata> {
  const [{ category: slug }, searchParams] = await Promise.all([props.params, props.searchParams]);
  const category = await getCategory(slug);
  if (!category) return {};

  return {
    title: `${category.name} | Kiel Store`,
    description: `Shop ${category.name.toLowerCase()} at Kiel Store, crew and workwear made to safety standard.`,
    // Filtered and sorted variations are near-duplicates of the plain page.
    ...(Object.keys(searchParams).length > 0 && { robots: { index: false, follow: true } }),
  };
}

export default async function CategoryPage(props: PageProps<"/[category]">) {
  const [{ category: slug }, searchParams] = await Promise.all([props.params, props.searchParams]);
  const category = await getCategory(slug);
  if (!category) notFound();

  const filters = parseFilters(searchParams);
  const [facets, categories] = await Promise.all([getFilterFacets(category.slug), getCategories()]);

  return <ProductListing categories={categories} category={category} facets={facets} filters={filters} />;
}
