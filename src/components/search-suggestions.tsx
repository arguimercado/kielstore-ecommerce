import Link from "next/link";
import { popularSearches } from "@/lib/catalog";

/** "Popular searches" quick links, each a ready-made /search query. */
export function SearchSuggestions({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
  return (
    <div className={className}>
      <p className="eyebrow text-ink-muted">Popular searches</p>
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
        {popularSearches.map((term) => (
          <li key={term}>
            <Link href={`/search?q=${encodeURIComponent(term)}`} onClick={onNavigate} className="eyebrow link-reveal">
              {term}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
