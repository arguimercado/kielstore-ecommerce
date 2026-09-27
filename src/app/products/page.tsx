import type { Metadata } from "next";
import { ProductListing } from "@/components/product-listing";
import { parseFilters } from "@/lib/filters";
import { getCategories, getFilterFacets } from "@/lib/products";

// Rendered per request: filters, sort and view come from the search params.

export async function generateMetadata(props: PageProps<"/products">): Promise<Metadata> {
  const searchParams = await props.searchParams;
  return {
    title: "Shop all | Kiel Store",
    description: "The full Kiel Store collection: tailoring, knitwear, leather goods and shoes, made in small runs.",
    // Filtered and sorted variations are near-duplicates of the plain page.
    ...(Object.keys(searchParams).length > 0 && { robots: { index: false, follow: true } }),
  };
}

export default async function ProductsPage(props: PageProps<"/products">) {
  const filters = parseFilters(await props.searchParams);
  const [facets, categories] = await Promise.all([getFilterFacets(), getCategories()]);

  return <ProductListing categories={categories} facets={facets} filters={filters} />;
}
