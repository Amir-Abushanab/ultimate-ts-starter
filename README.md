# Ultimate TS Starter

A production-ready TypeScript monorepo starter with web, mobile, server, TUI, and browser extension apps — sharing auth, API, design tokens, i18n, logging, analytics, notifications, and more across all platforms.

## Trim to Fit

This starter includes every app type (web, server, native, TUI, browser extension). You probably don't need all of them. After forking, ask your AI agent:

> Remove the `extension` and `tui` apps — I only need web, server, and native.

It will delete the app directories, clean up workspace references, scripts, and dev commands for you.

## Quick Start

```bash
pnpm install
cp .env.example .env   # fill in your values (see Configuration below)
pnpm bootstrap         # migrate DB, seed dev data, start everything
```

- Web: [http://localhost:3001](http://localhost:3001)
- Server/API: [http://localhost:3000](http://localhost:3000)
- API Docs: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- Native: open with Expo Go

## Configuration

Copy `.env.example` and fill in the required values. Minimum to get running locally:

| Variable             | Required | Where to get it                                    |
| -------------------- | -------- | -------------------------------------------------- |
| `DATABASE_URL`       | Yes      | Your PostgreSQL connection string                  |
| `BETTER_AUTH_SECRET` | Yes      | Any random string (`openssl rand -hex 32`)         |
| `BETTER_AUTH_URL`    | Yes      | `http://localhost:3000` for dev                    |
| `CORS_ORIGIN`        | Yes      | `http://localhost:3001` for dev                    |
| `RESEND_API_KEY`     | Yes      | [resend.com/api-keys](https://resend.com/api-keys) |
| `RESEND_FROM_EMAIL`  | Yes      | Your verified sender email                         |
| `POLAR_ACCESS_TOKEN` | Yes      | [polar.sh/settings](https://polar.sh/settings)     |
| `POLAR_PRODUCT_ID`   | Yes      | From your Polar product dashboard                  |
| `POLAR_SUCCESS_URL`  | Yes      | `http://localhost:3001/success` for dev            |

Optional (everything works without these):

| Variable                                       | What it enables                                                 |
| ---------------------------------------------- | --------------------------------------------------------------- |
| `VITE_POSTHOG_KEY` / `EXPO_PUBLIC_POSTHOG_KEY` | Analytics, session replay, error tracking, remote feature flags |
| `POSTHOG_API_KEY` (server)                     | Server-side events + error tracking in PostHog                  |
| R2 bucket binding                              | File uploads (configure in `wrangler.jsonc`)                    |
| KV namespace binding                           | Server-side caching (configure in `wrangler.jsonc`)             |
| Cron trigger                                   | Scheduled jobs (configure in `wrangler.jsonc`)                  |

## Project Structure

```
ultimate-ts-starter/
├── apps/
│   ├── web/            # TanStack Start + React 19 (port 3001)
│   ├── server/         # Hono on Cloudflare Workers (port 3000)
│   ├── native/         # Expo + React Native + HeroUI Native
│   ├── tui/            # Terminal UI (OpenTUI)
│   └── extension/      # Browser extension (WXT)
├── packages/
│   ├── analytics/      # PostHog wrapper (optional, graceful no-op)
│   ├── api/            # oRPC router, procedures, GDPR endpoints
│   ├── auth/           # Better Auth (OTP, 2FA, SSO, admin, org, Polar)
│   ├── config/         # Shared tsconfig
│   ├── db/             # Drizzle ORM + PostgreSQL + seed
│   ├── email/          # Resend transactional email
│   ├── env/            # Validated env vars (Zod on all platforms)
│   ├── flags/          # Feature flags (PostHog remote + local fallback)
│   ├── i18n/           # Paraglide i18n (EN + AR, RTL)
│   ├── logging/        # Wide event observability (console + JSON + PostHog)
│   ├── notifications/  # Multi-channel dispatch + user preferences
│   ├── query/          # Shared oRPC client + QueryClient + SSE hook
│   ├── theme/          # Cross-platform design tokens (OKLCH)
│   ├── ui/             # shadcn components + animated wrappers (RTL-safe)
│   └── validation/     # Shared Zod schemas (auth, notifications)
├── scripts/
│   └── check-deps.mjs  # Dependency updater with 7-day supply chain filter
└── .claude/rules/       # AI coding rules (animation, design, testing, UI)
```

## Features

### Auth

Email OTP (passwordless), 2FA (TOTP), SSO (SAML + OIDC), bearer tokens, admin (ban/impersonate/manage), organizations (members, invitations, RBAC), Polar payments (checkout, portal, subscriptions), Expo mobile auth.

### API

oRPC with full TypeScript inference, OpenAPI spec generation, Scalar API docs UI, shared query client across web + native, GDPR data export + account deletion endpoints.

### UI & Styling

Shared design tokens across web (shadcn) and native (HeroUI Native). Light/dark mode with animated theme toggler (Magic UI, View Transitions API). Tailwind v4 with RTL-safe logical properties. Animated wrapper components (press, hover, page transitions, staggered lists).

### i18n

Paraglide (compile-time, tree-shakable). English + Arabic with full RTL support. Messages auto-compile on install. Locale switcher in the header.

### Observability

Wide event logging (one structured event per request). Console exporter (dev), JSON exporter (prod), PostHog exporter (when configured). Error tracking flows to both console and PostHog.

### Notifications

Multi-channel system (in-app, email, push). 8 notification types across 6 categories. Per-type per-channel user preferences with settings UI. Server-side dispatch respects preferences.

### Analytics (optional)

PostHog integration across web, native, and server. Session replay, error tracking, remote feature flags. Everything degrades gracefully when not configured — just a single warning log.

### Real-time

SSE endpoint (`/api/events`) with auth, heartbeat, and auto-reconnect. `useEventStream()` hook for client consumption.

### Infrastructure

Cloudflare Workers deployment, R2 file uploads (auth-protected), KV caching, cron jobs, rate limiting (per-IP sliding window), security headers (CSP, HSTS, etc.), health check (`/health` with DB connectivity), webhooks (`/api/webhooks/:provider`).

### Dev Tooling

Vite+ (build, dev, lint, format, test), oxlint + oxfmt, knip (dead code), dependency-cruiser (architecture rules), npm-check-updates with 7-day supply chain safety filter, react-scan, bundle analysis, vitest + MSW + Playwright, changesets, GitHub Actions CI/CD.

## Credits

Scaffolded with [Better-T-Stack](https://www.better-t-stack.dev/).

## Scripts

### Development

| Command           | What                            |
| ----------------- | ------------------------------- |
| `pnpm bootstrap`  | Migrate + seed + start all apps |
| `pnpm dev`        | Start all apps                  |
| `pnpm dev:web`    | Web only (port 3001)            |
| `pnpm dev:server` | Server only (port 3000)         |
| `pnpm dev:native` | Expo                            |
| `pnpm dev:tui`    | Terminal UI                     |
| `pnpm serve`      | Preview built web app           |

### Database

| Command            | What                                       |
| ------------------ | ------------------------------------------ |
| `pnpm db:generate` | Regenerate auth schema + Drizzle migration |
| `pnpm db:migrate`  | Run migrations                             |
| `pnpm db:seed`     | Seed development data                      |
| `pnpm db:push`     | Push schema directly (no migration)        |
| `pnpm db:studio`   | Drizzle Studio GUI                         |

### Testing

| Command              | What                 |
| -------------------- | -------------------- |
| `pnpm test`          | Unit + package tests |
| `pnpm test:watch`    | Watch mode           |
| `pnpm test:coverage` | With coverage report |
| `pnpm test:e2e`      | Playwright E2E       |
| `pnpm test:e2e:ui`   | Playwright UI mode   |

### Code Quality (via Vite+)

All `vp` commands work from the repo root across the entire monorepo. `pnpm check` / `pnpm fix` are convenience aliases.

| Command                    | What                                             |
| -------------------------- | ------------------------------------------------ |
| `pnpm check`               | Format + lint + typecheck (alias for `vp check`) |
| `pnpm fix`                 | Auto-fix all issues (alias for `vp check --fix`) |
| `pnpm check-types`         | TypeScript check across all apps                 |
| `vp lint`                  | Lint only (oxlint)                               |
| `vp fmt`                   | Format only (oxfmt)                              |
| `pnpm lint:unused`         | Find dead code (knip)                            |
| `pnpm lint:deps`           | Validate dependency architecture                 |
| `vp dev --root apps/web`   | Start a specific app via vp directly             |
| `vp build --root apps/web` | Build a specific app via vp directly             |

### Dependencies

| Command            | What                                         |
| ------------------ | -------------------------------------------- |
| `pnpm deps:check`  | Show available updates (7-day safety filter) |
| `pnpm deps:update` | Apply safe updates                           |

### Build & Deploy

| Command              | What                                |
| -------------------- | ----------------------------------- |
| `pnpm build`         | Build all apps                      |
| `pnpm build:analyze` | Bundle size treemap (web)           |
| `pnpm deploy`        | Deploy server to Cloudflare Workers |

### Native

| Command                         | What                     |
| ------------------------------- | ------------------------ |
| `pnpm --filter native ios`      | Run on iOS simulator     |
| `pnpm --filter native android`  | Run on Android emulator  |
| `pnpm --filter native prebuild` | Generate native projects |

### Desktop (Tauri)

| Command                             | What                   |
| ----------------------------------- | ---------------------- |
| `cd apps/web && pnpm desktop:dev`   | Tauri dev mode         |
| `cd apps/web && pnpm desktop:build` | Tauri production build |

### Versioning

| Command          | What                          |
| ---------------- | ----------------------------- |
| `pnpm changeset` | Create a changeset            |
| `pnpm version`   | Bump versions from changesets |
| `pnpm release`   | Version + update lockfile     |

## UI Components

Shared components live in `packages/ui`. Add more via shadcn:

```bash
pnpm --filter @ultimate-ts-starter/ui dlx shadcn@latest add dialog sheet table
```

Import in any web app:

```tsx
import { Button } from "@ultimate-ts-starter/ui/components/button";
import {
  AnimatedButton,
  AnimatedPage,
} from "@ultimate-ts-starter/ui/components/animated";
```

Animated wrappers add iOS-like micro-interactions (press feedback, hover lift, page transitions, staggered lists) on top of the base components. They respect `prefers-reduced-motion`.

## Deployment

### Server (Cloudflare Workers)

```bash
pnpm deploy
```

Set secrets via wrangler:

```bash
cd apps/server
wrangler secret put DATABASE_URL
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put POLAR_ACCESS_TOKEN
wrangler secret put RESEND_API_KEY
```

Enable optional bindings in `apps/server/wrangler.jsonc` (R2, KV, cron triggers).

### Web

Built with TanStack Start. Deploy to any Node.js-compatible host or configure for static export.

### Native

Uses Expo with EAS Build for iOS/Android. See [Expo deployment docs](https://docs.expo.dev/deploy/build-project/).

### Desktop

The web app supports Tauri for native desktop builds:

```bash
cd apps/web && pnpm desktop:dev
```
