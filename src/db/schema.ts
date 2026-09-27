// Drizzle schema entry point.
//
// Better Auth tables are generated into `src/db/auth-schema.ts` by
// `npm run auth:generate`. Regenerate it whenever Better Auth plugins or
// options change; don't edit it by hand.
//
// Application tables live in their own files and are re-exported here.
export * from "./auth-schema";
export * from "./categories";
export * from "./products";
export * from "./stock";
export * from "./wishlist";
export * from "./cart";
export * from "./orders";
