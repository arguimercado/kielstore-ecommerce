// Drizzle schema entry point.
//
// Better Auth tables: run `npm run auth:generate` to generate them into
// `src/db/auth-schema.ts`, then re-export them here:
//   export * from "./auth-schema";
//
// Application tables live in their own files and are re-exported here.
export * from "./categories";
export * from "./products";
export * from "./stock";
