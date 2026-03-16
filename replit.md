# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains a mobile app (Rivo Partners) and a shared backend API server.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Mobile**: Expo React Native (Expo Router, file-based routing)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server (health check only; Rivo uses external API)
│   └── mobile/             # Expo React Native app — Rivo Partners
│       ├── app/            # Expo Router screens
│       │   ├── _layout.tsx        # Root layout (providers, Stack navigator)
│       │   ├── index.tsx          # Landing screen (referral badge, sign-in, WA picker)
│       │   ├── whatsapp-listening.tsx  # WhatsApp OTP polling + auto-open
│       │   ├── submit-lead.tsx    # Lead submission (config rates, self-referral check)
│       │   ├── referral-success.tsx  # Success animation screen
│       │   ├── referral-bonus.tsx # Post-first-login bonus timeline screen
│       │   ├── referral-info.tsx  # Referral program explainer screen
│       │   └── (tabs)/           # Bottom tab navigator
│       │       ├── _layout.tsx    # Tab bar config
│       │       ├── index.tsx      # Home tab (earnings, commission badge, banners)
│       │       ├── clients.tsx    # Clients tab (search + list)
│       │       ├── network.tsx    # Network tab (referral code, config share, referral-info link)
│       │       └── profile.tsx    # Profile tab (edit mode, RERA, agent_type_other)
│       ├── context/        # AuthContext, ConfigContext
│       ├── lib/            # API client, WhatsApp utilities
│       ├── components/     # WhatsAppPickerSheet, ErrorBoundary, KeyboardAwareScrollViewCompat
│       └── constants/      # Colors (dark theme), API config, country codes
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Rivo Partners Mobile App

Mortgage referral platform for Dubai real estate agents. Frontend-only Expo app calling external backend API.

### External API
- Base URL: `https://rivo-partners-backend-331738587654.asia-southeast1.run.app/api/v1`
- Auth: WhatsApp OTP flow → Bearer token stored in AsyncStorage
- Endpoints: `/agents/init-whatsapp/`, `/agents/check-verification/{code}/`, `/agents/me/`, `/agents/network/`, `/agents/profile/`, `/agents/logout/`, `/agents/delete/`, `/agents/referral/{code}/`, `/clients/`, `/clients/ingest/`, `/config/`

### Design System
- Background: #000000 (pure black)
- Cards/surfaces: #18181b (zinc-900)
- Borders: #27272a (zinc-800)
- Primary accent: #00D084 (green)
- Text: white (#FFFFFF) primary, #a1a1aa secondary
- Font: Inter (400, 500, 600, 700)

### Context Providers
- **AuthContext** — AsyncStorage token management, login/signOut/isAuthenticated
- **ConfigContext** — Fetches `/config/` on mount, provides commission rates, referral bonuses, WhatsApp URLs, share messages, home banners with fallback defaults

### WhatsApp Utilities (`lib/whatsapp.ts`)
- WhatsApp type preference (personal/business) persisted in AsyncStorage
- Deep link builders for personal WhatsApp, WhatsApp Business (iOS/Android)
- Verify code and referral code storage helpers

### Navigation
- Root: Stack navigator (Landing → WhatsApp Listening → Tabs, Submit Lead, Referral Success, Referral Bonus, Referral Info)
- Tabs: Home, Clients, Network, Profile
- Post-login routing: if `!has_completed_first_action` → Referral Bonus screen, else → Tabs

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Health check endpoint only for this project.

### `artifacts/mobile` (`@workspace/mobile`)

Expo React Native mobile app — Rivo Partners. Uses Expo Router for file-based routing with bottom tabs. Calls external backend API directly (no local backend needed for app functionality).

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI spec and Orval codegen config.

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec.
