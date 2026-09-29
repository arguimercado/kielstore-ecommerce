import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { CartProvider } from "@/components/cart-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WishlistProvider } from "@/components/wishlist-provider";
import "./globals.css";

// Signage-style industrial grotesk for UI and body; globals.css maps it to --font-sans.
const sans = Barlow({
  variable: "--font-sans-family",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Condensed cut for display and section headlines; globals.css maps it to --font-display.
const display = Barlow_Condensed({
  variable: "--font-display-family",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "Kiel Store | Crew & workwear outfitters",
  description:
    "Uniforms, safety shoes, crew T-shirts and bags for deck and engine crews, captains, engineers, construction and security.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <WishlistProvider>
          <CartProvider>
            <SiteHeader />
            {children}
            <SiteFooter />
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
