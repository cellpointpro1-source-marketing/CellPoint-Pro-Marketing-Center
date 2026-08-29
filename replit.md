# CellPoint Pro Marketing Center

A branded marketing workspace for cellphone stores to plan, create, schedule, and measure social content.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/cellpoint-pro-marketing-center/src/App.tsx` — Demo Mode routes, local state, and product flows
- `artifacts/cellpoint-pro-marketing-center/src/index.css` — centralized CellPoint Pro theme tokens and responsive UI styles
- `artifacts/cellpoint-pro-marketing-center/public/brand/cellpoint-pro-logo.png` — supplied official logo asset
- `artifacts/api-server` — reserved shared API service for future live integrations
- `lib/api-spec/openapi.yaml` — shared API contract source of truth when backend features are introduced

## Architecture decisions

- Phase 1 is intentionally Demo Mode with local in-browser state so the full workflow can be explored without implying live social connections or fabricated analytics.
- Customer/store branding is kept conceptually separate from CellPoint Pro software branding; the supplied logo is used only for the product shell.
- The frontend is its own deployable Vite artifact, while the existing API service remains separately deployable for future auth, tenant isolation, and provider integrations.
- Social providers should be added behind official OAuth/API service interfaces rather than scraping or collecting social passwords.

## Product

Store owners can browse a dashboard, manage simulated channel connections, create and preview posts, generate approval-first CellPoint AI content, schedule content, browse a calendar, manage media, use industry templates, create promotions, review demo analytics, and configure store settings.

## User preferences

The uploaded CellPoint Pro logo and its navy/orange identity are the source of truth for the product UI.

## Gotchas

- Demo content is clearly labeled and must not be presented as live social publishing or real analytics.
- Keep the official logo legible: it uses navy wordmark elements that need a light surface when placed inside the dark product navigation.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
