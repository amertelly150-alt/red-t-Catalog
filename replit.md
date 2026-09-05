# red-t Product Catalog

كتالوج عربي RTL لمنتجات red-t مع طلب مباشر عبر واتساب ولوحة إدارة خاصة.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod, `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/red-t-catalog/src/App.tsx` — public RTL storefront and `/admin` route
- `artifacts/red-t-catalog/src/pages/admin.tsx` — authenticated product/site/category dashboard
- `artifacts/api-server/src/routes/admin.ts` — protected admin API endpoints
- `artifacts/api-server/src/lib/catalog-store.ts` — PostgreSQL catalog reads, seed, and writes
- `lib/db/src/schema/catalog.ts` — Drizzle catalog tables
- `lib/api-spec/openapi.yaml` — source of truth for generated API clients and Zod schemas
- `lib/catalog-data/src/index.ts` — shared initial products, categories, and site defaults

## Architecture decisions

- Public storefront and `/admin` remain one web artifact; there is no customer-facing admin link.
- Catalog data is stored in PostgreSQL and seeded once from the shared demo data on first access.
- Admin sessions use an HMAC-signed, HttpOnly cookie with the existing `SESSION_SECRET`; credentials are environment secrets.
- Uploaded images are compressed in the browser and stored as data URLs in PostgreSQL to remain deploy-safe without filesystem persistence.
- The public storefront reads products and categories from the live PostgreSQL-backed API only; it shows a loading/empty state instead of masking API failures with stale product data. The catalog query disables browser caching and refreshes on focus/reconnect and every five seconds while open.

## Product

- Visitors browse products in Arabic RTL with two-level filtering and separate trending/best-seller sections.
- Visitors order through WhatsApp; there is no account, cart, checkout, or payment flow.
- The owner can manage products, images, categories, hero content, and the WhatsApp number at `/admin`.

## User preferences

- Preserve the customer-facing red-t visual design while changing content and data behavior.

## Gotchas

- Configure `ADMIN_USERNAME` and `ADMIN_PASSWORD` in Replit Secrets before using `/admin`; the app intentionally has no insecure default credentials.
- Run API codegen after changing `lib/api-spec/openapi.yaml`.
- Production database schema changes are applied through Replit Publish; local development schema uses `pnpm --filter @workspace/db run push`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
