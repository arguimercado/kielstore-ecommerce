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
npm run auth:generate  # Better Auth CLI → writes src/db/auth-schema.ts
```

There is no test framework yet.

Environment: copy `.env.example` to `.env.local`. It needs `DATABASE_URL` (the Neon **pooled** connection string), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL`. `drizzle.config.ts` loads `.env.local`, then `.env`. `src/db/index.ts` throws at import time if `DATABASE_URL` is missing.

## Architecture

Stack: Next.js 16 App Router, React 19 with the React Compiler (`reactCompiler: true` in `next.config.ts`), Tailwind v4 (CSS-first, through `@tailwindcss/postcss`, no `tailwind.config`), Drizzle ORM on Neon's HTTP driver, and Better Auth. `@/*` maps to `src/*`.

**The schema has a single entry point.** `src/db/schema.ts` is the barrel file read by drizzle-kit (`drizzle.config.ts`), the Drizzle client (`src/db/index.ts`) and the Better Auth Drizzle adapter (`src/lib/auth.ts`, `provider: "pg"`). Every table file must be re-exported from there, or migrations, relational queries and auth won't see it:
- Auth tables: run `npm run auth:generate` to generate `src/db/auth-schema.ts`, then add `export * from "./auth-schema"` to `schema.ts`. Regenerate whenever Better Auth plugins or options change.
- App tables (products, orders, ...): put each in its own file under `src/db/` and re-export it from `schema.ts`.

**Auth flow.**
- `src/lib/auth.ts` is the server instance. Use it in server components, route handlers and server actions, for example `auth.api.getSession({ headers: await headers() })`. Auth methods (`emailAndPassword`, `socialProviders`) are configured here. The `nextCookies()` plugin must stay **last** in `plugins`.
- `src/app/api/auth/[...all]/route.ts` mounts every Better Auth endpoint at `/api/auth/*`.
- `src/lib/auth-client.ts` (`authClient`) is for client components only.

**Design system.** All tokens, component classes (`btn`, `link`, `field`) and layout primitives live in `src/app/globals.css`. For any UI work, follow the `design-system` skill (`.claude/skills/design-system/SKILL.md`).

**DB driver caveat.** `drizzle-orm/neon-http` runs each query over stateless HTTP, so interactive transactions (`db.transaction`) aren't supported. Use `db.batch([...])`, or switch to the Neon WebSocket `Pool` driver if a feature needs real transactions.

**Database conventions.**
- Money is stored as integer whole cents (USD) in `*_cents` columns (`price_cents`, `compare_at_cents`). Never use floats or decimal dollars. Props and types carry cents too (`priceCents`), and only `formatPrice(cents)` converts them for display.
- Inventory lives in the separate `stock` table (one row per product), not on `products`. A product with no stock row counts as sold out.
- Pages and components read the catalog through `src/lib/products.ts`, which returns the storefront `Product` type. Don't query the product tables directly from UI code.
