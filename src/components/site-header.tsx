import Link from "next/link";
import { BagHeaderLink } from "@/components/cart-provider";
import { UserIcon } from "@/components/icons";
import { MobileNav } from "@/components/mobile-nav";
import { NavigationProgress } from "@/components/navigation-progress";
import { SearchDialog } from "@/components/search-dialog";
import { WishlistHeaderLink } from "@/components/wishlist-button";

const nav = [
  { href: "/new", label: "New in" },
  { href: "/women", label: "Women" },
  { href: "/men", label: "Men" },
  { href: "/bags", label: "Bags" },
  { href: "/shoes", label: "Shoes" },
  { href: "/journal", label: "Journal" },
];

export function SiteHeader() {
  return (
    <>
      <div className="theme-inverse">
        <p className="container-page py-2 text-center text-caption">
          Complimentary shipping and returns on orders over ₱15,000
        </p>
      </div>
      <header className="sticky top-0 z-40 h-header border-b border-line bg-canvas">
        <div className="container-page grid h-full grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex items-center">
            <MobileNav items={nav} />
            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex gap-7">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="eyebrow link-reveal">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <Link href="/" className="text-title tracking-wide-label uppercase">
            Kiel Store
          </Link>

          <div className="-mr-3 flex items-center justify-end">
            <SearchDialog />
            <Link href="/account" aria-label="Account" className="btn btn-ghost btn-icon hidden sm:inline-flex">
              <UserIcon />
            </Link>
            <WishlistHeaderLink className="btn btn-ghost btn-icon hidden sm:inline-flex" />
            <BagHeaderLink className="btn btn-ghost btn-icon" />
          </div>
        </div>
        <NavigationProgress />
      </header>
    </>
  );
}
