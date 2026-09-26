# Ecommerce

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Better Auth · Drizzle ORM · Neon Postgres

## Setup

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL and BETTER_AUTH_SECRET
npm run auth:generate        # writes src/db/auth-schema.ts (then re-export it from src/db/schema.ts)
npm run db:push              # or: npm run db:generate && npm run db:migrate
npm run dev
```

## Structure

```
src/
  app/api/auth/[...all]/route.ts  Better Auth route handler
  db/index.ts                     Drizzle client (Neon HTTP driver)
  db/schema.ts                    Schema entry point used by Drizzle Kit and Better Auth
  lib/auth.ts                     Better Auth server instance (Drizzle adapter)
  lib/auth-client.ts              Better Auth React client
drizzle.config.ts                 Drizzle Kit config (migrations output to ./drizzle)
```

## Scripts

| Script | Description |
| --- | --- |
| `dev` / `build` / `start` | Next.js |
| `lint` / `typecheck` | ESLint / `tsc --noEmit` |
| `db:generate` / `db:migrate` / `db:push` / `db:studio` | Drizzle Kit |
| `auth:generate` | Generate Better Auth tables as a Drizzle schema |
