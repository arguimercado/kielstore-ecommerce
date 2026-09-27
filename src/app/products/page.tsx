import type { Metadata } from "next";
import { ProductListing } from "@/components/product-listing";
import { getCategories, getProducts } from "@/lib/products";

// Re-read prices and stock from the database at most once a minute.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop all | Maison",
  description: "The full Maison collection: tailoring, knitwear, leather goods and shoes, made in small runs.",
};

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return <ProductListing products={products} categories={categories} />;
}
