# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Project: WanderWay - Travel Booking Platform

A comprehensive travel booking website with:
- **Flight booking** — search by origin/destination/date/class, detailed flight pages, booking form
- **Bus booking** — search by origin/destination/date, bus type filters, amenities info
- **Hotel booking** — search by location/dates/guests, star rating filter, room types
- **Holiday packages** — beach, adventure, cultural, luxury, family, honeymoon categories
- **My Bookings** — view all bookings, booking details, cancel bookings

## Artifacts

- `artifacts/travel-booking` — React + Vite frontend (WanderWay travel booking site)
- `artifacts/api-server` — Express 5 API server

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Schema

Tables:
- `flights` — airline flight data
- `buses` — bus route data
- `hotels` — hotel listings
- `packages` — holiday packages
- `bookings` — customer bookings
- `destinations` — popular travel destinations

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
