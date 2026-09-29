---
name: build-ui
description: Build or update customer-facing storefront UI (pages, sections, components) using the existing design system, components, product patterns and responsive conventions. Use when creating or significantly changing customer-facing pages, sections or components.
---

Build or update the following UI:

$ARGUMENTS

Follow this process:
1. Load the `design-system` skill and read `src/app/globals.css` before writing any markup.
2. Inspect the current implementation and related components in `src/components/` and `src/app/` first.
3. Search for reusable components before creating new ones.
4. Build only from design-system tokens, component classes and layout primitives. Add new tokens or patterns to `globals.css`, not as long class strings.
5. Keep the change focused on the requested feature.
6. Design mobile-first, and keep responsive behavior consistent with the rest of the storefront.
7. Follow the product and database patterns in CLAUDE.md: read the catalog through `src/lib/products.ts`, handle money as centavos with `formatPrice`, and don't read the session in `SiteHeader` or the root layout.
8. Run the app (`npm run dev`) and visually verify the change at mobile and desktop widths.
9. Run `npm run lint` and `npm run typecheck`.
10. Fix reproducible issues without expanding scope.
11. Summarize what changed.
