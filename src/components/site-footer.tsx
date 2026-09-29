import Link from "next/link";

const columns = [
  { title: "Shop", links: ["New in", "Uniforms", "Shoes", "T-shirts", "Bags", "Fleet orders"] },
  { title: "Client services", links: ["Contact us", "Shipping", "Returns", "Size guide", "Repairs"] },
  { title: "Kiel Store", links: ["Our story", "Safety standards", "Sustainability", "Journal", "Careers"] },
];

export function SiteFooter() {
  return (
    <footer className="theme-inverse">
      <div className="container-page section">
        <div className="grid gap-12 lg:grid-cols-[2fr_3fr]">
          <form className="max-w-md" action="#">
            <p className="eyebrow text-ink-muted">Newsletter</p>
            <h2 className="mt-3 text-headline">Stay on watch</h2>
            <p className="mt-4 text-body text-ink-muted">
              New kit, fleet offers and updates on safety standards. No more than twice a month.
            </p>
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <div className="mt-6 flex items-end gap-4">
              <input
                id="newsletter-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="Email address"
                className="field"
              />
              <button type="submit" className="btn btn-secondary shrink-0">
                Subscribe
              </button>
            </div>
          </form>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="eyebrow">{col.title}</h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((label) => (
                    <li key={label}>
                      <Link href="#" className="text-body text-ink-muted transition-colors hover:text-ink">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <hr className="divider mt-16" />
        <div className="mt-6 flex flex-col gap-4 text-caption text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Kiel Store. All rights reserved.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {["Privacy", "Terms", "Cookies", "Accessibility"].map((label) => (
              <li key={label}>
                <Link href="#" className="transition-colors hover:text-ink">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
