# Blissim Analytics

Plateforme de reporting Blissim avec administration des comptes partenaires, utilisateurs, marques, pays et droits d’accès.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — API server (port managed by its workflow)
- `pnpm --filter @workspace/blissim-analytics run dev` — web app (port managed by its workflow)
- `pnpm run typecheck` — full workspace typecheck
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push development schema changes

## Stack

- React + Vite + Tailwind CSS
- Express 5 API with OpenAPI-generated client and validation
- PostgreSQL + Drizzle ORM
- Replit-managed Clerk authentication

## Where things live

- `artifacts/blissim-analytics/` — frontend application
- `artifacts/api-server/src/routes/admin.ts` — administration endpoints
- `lib/api-spec/openapi.yaml` — API contract and source of generated types
- `lib/db/src/schema/admin.ts` — accounts, brands, users, packages, pages, and audit schema

## Architecture decisions

- Administration endpoints require an authenticated Clerk user with an `@blissim.fr` primary email.
- Partner users belong to one account and receive explicit brand/country scopes plus reusable page packages.
- Blissim admins are globally privileged; partner reporting screens are a later product surface.
- Brand-country mappings are represented in the app schema and are intended to be synchronized from BigQuery separately.

## Product

- Overview of accounts, users, canonical brands, expiring access, and recent changes
- User invitations with brand, country, package, and expiration controls
- Account, package, and reporting-page registry management
- Immutable access-change audit history