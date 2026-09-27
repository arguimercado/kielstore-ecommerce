# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Next.js 16 docs for this exact version live in `node_modules/next/dist/docs/` (`01-app/` covers the App Router). Check them before using Next.js APIs. For example, the root layout's `LayoutProps<"/">` is a generated global type that isn't imported.

## Commands

```bash
npm run dev          # dev server (also regenerates AGENTS.md)
npm run build
npm run lint         # ESLint 9 flat config (eslint-config-next core-web-vitals + typescript)
npm run typecheck    # tsc --noEmit
npm run db:generate  # drizzle-kit: SQL migrations from schema → ./drizzle
npm run db:migrate   # apply migrations
npm run db:push      # sync schema directly (no migration files)
npm run db:studio
npm run db:seed      # upsert the sample catalog (src/db/seed-data.ts); safe to re-run
npm run auth:generate  # Better Auth CLI → writes src/db/auth-schema.ts (don't hand-edit)
npm run auth:make-admin -- <email>  # grant the admin role to an existing user
```

There is no test framework yet.

Environment: copy `.env.example` to `.env.local`. It needs `DATABASE_URL` (the Neon **pooled** connection string), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL`. `drizzle.config.ts` loads `.env.local`, then `.env`. `src/db/index.ts` throws at import time if `DATABASE_URL` is missing.

## Architecture

Stack: Next.js 16 App Router, React 19 with the React Compiler (`reactCompiler: true` in `next.config.ts`), Tailwind v4 (CSS-first, through `@tailwindcss/postcss`, no `tailwind.config`), Drizzle ORM on Neon's HTTP driver, and Better Auth. `@/*` maps to `src/*`.

**The schema has a single entry point.** `src/db/schema.ts` is the barrel file read by drizzle-kit (`drizzle.config.ts`), the Drizzle client (`src/db/index.ts`) and the Better Auth Drizzle adapter (`src/lib/auth.ts`, `provider: "pg"`). Every table file must be re-exported from there, or migrations, relational queries and auth won't see it:
- Auth tables (`user`, `session`, `account`, `verification`) are generated into `src/db/auth-schema.ts` by `npm run auth:generate`. Regenerate it, then run `db:generate`, whenever Better Auth plugins or options change.
- App tables (products, orders, ...): put each in its own file under `src/db/` and re-export it from `schema.ts`.

**Auth flow.**
- `src/lib/auth.ts` is the server instance: email and password only, DB-backed 30-day sessions with no cookie cache, and the `admin()` plugin, which adds `user.role` (`"user"` by default, `"admin"` for admins; it can't be set at sign-up). The `nextCookies()` plugin must stay **last** in `plugins`.
- `src/lib/session.ts` is the only place pages and actions read the session: `getSession()` (cached per request), `requireUser()` (redirects to `/sign-in?callbackURL=…`), `requireAdmin()` (sign-in, or `notFound()` for non-admins) and `safeCallbackURL()`. **Every protected page, server action and route handler calls `requireUser()` or `requireAdmin()` itself.** `src/proxy.ts` is only an optimistic cookie-presence redirect for `/account` and `/admin`, and layouts don't re-run on client navigation.
- Sign-up, sign-in and sign-out are server actions in `src/app/(auth)/actions.ts` calling `auth.api.*`. The form is `src/components/auth-form.tsx`.
- Don't read the session in `SiteHeader` or the root layout: it would make every ISR catalog page dynamic.
- `src/app/api/auth/[...all]/route.ts` mounts every Better Auth endpoint at `/api/auth/*`.
- `src/lib/auth-client.ts` (`authClient`) is for client components only.

**Design system.** All tokens, component classes (`btn`, `link`, `field`) and layout primitives live in `src/app/globals.css`. For any UI work, follow the `design-system` skill (`.claude/skills/design-system/SKILL.md`).

**DB driver caveat.** `drizzle-orm/neon-http` runs each query over stateless HTTP, so interactive transactions (`db.transaction`) aren't supported. Use `db.batch([...])`, or switch to the Neon WebSocket `Pool` driver if a feature needs real transactions.

**Database conventions.**
- Money is Philippine pesos (PHP), stored as integer centavos (the minor unit, 1/100 peso) in `*_cents` columns (`price_cents`, `compare_at_cents`); the `cents` names mean minor units. Never use floats or decimal pesos. Props and types carry centavos too (`priceCents`), and only `formatPrice(cents)` converts them for display.
- Each product colour (`colors` jsonb) has a display `name`, a `hex` and a `family` (`ColorFamily` in `src/lib/catalog.ts`). Shop filters match on `family`, so give every new colour one. The filter URL contract (`size`, `color`, `price`, `stock`, `sort`, `view`) lives in `src/lib/filters.ts`.
- Inventory lives in the separate `stock` table (one row per product), not on `products`. A product with no stock row counts as sold out.
- The bag (`cart_items`, signed-in users only) stores no prices. `src/lib/cart.ts` reads the current `price_cents` and holds every stock rule. Stock is per product, so all of one product's lines (any colour or size) share its `stock.quantity`.
- Pages and components read the catalog through `src/lib/products.ts`, which returns the storefront `Product` type. Don't query the product tables directly from UI code.

**Checkout and orders (Stripe).**
- Stripe Checkout is hosted, and sessions use inline `price_data` built from the order snapshot. No Stripe Products or Prices exist. `src/lib/stripe.ts` is the server-only client, pinned to API version `2026-08-26.dahlia`. It needs `STRIPE_SECRET_KEY` (a restricted `rk_` key), and the webhook needs `STRIPE_WEBHOOK_SECRET`.
- `orders`, `order_items` and `stripe_events` live in `src/db/orders.ts`. An order copies its lines and prices from the bag when checkout starts and never re-reads the catalog.
- Stock is **reserved when checkout starts**. `createPendingOrder` inserts the order and its lines and calls the `reserve_order_stock()` SQL function (custom migration `drizzle/0005_reserve_order_stock.sql`), all in one `db.batch`. A shortfall raises `23514` and rolls the whole batch back. `releaseReservation` returns the stock at most once, guarded by `status` and `stock_released_at`.
- Payment state comes only from Stripe. `src/lib/checkout.ts` has `handleStripeEvent` for the webhook at `src/app/api/stripe/webhook/route.ts`, and `fulfillCheckout(sessionId)` for the success page. Both re-read the session from Stripe, and an order becomes `paid` only if `amount_total` and `currency` match the order. Otherwise it becomes `needs_review`.
- Every status change is a conditional `UPDATE … WHERE status IN (…)`, so replayed or concurrent events apply once. `stripe_events` records handled event ids. At most one `pending` order exists per user, enforced by a partial unique index.
