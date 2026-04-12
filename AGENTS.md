# PennyPal - Developer Guide

## Stack
- Svelte 5 + SvelteKit 2 + Vite
- PostgreSQL via Drizzle ORM
- Tailwind CSS 4 + bits-ui components
- Argon2 password hashing

## Dev Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm check        # Type-check + Svelte check
pnpm lint         # ESLint + Prettier check
pnpm format       # Auto-format with Prettier

# Database (requires Docker running)
docker compose up -d
pnpm db:generate  # Generate migrations from schema changes
pnpm db:migrate   # Apply migrations
pnpm db:push      # Push schema to DB (dev only)
pnpm db:studio    # Drizzle Studio GUI
```

## Prerequisites
- **Docker** must be running for database operations
- **DATABASE_URL** env var required (see `.env.example`)

## Key Paths
- Schema: `src/lib/server/db/schema.ts`
- DB client: `src/lib/server/db/index.ts`
- Auth logic: `src/lib/server/auth.ts`
- Routes: `src/routes/`
- Remote functions: `src/lib/remote/`

## Style
- Prettier: tabs, no semicolons, single quotes, 120 print width
- ESLint + Prettier config in `eslint.config.js` and `.prettierrc`
- Svelte components use runes syntax (Svelte 5)
- Drizzle: schema tables use singular names (e.g., `payment`, not `payments`)

## Config
- `svelte.config.js`: SvelteKit config, enables `experimental.async` and `experimental.remoteFunctions`
- `vite.config.ts`: Tailwind v4 via `@tailwindcss/vite` plugin
- `drizzle.config.ts`: Requires `DATABASE_URL` env var

## Type Checking
Run `pnpm check` before committing. ESLint config ignores `no-undef` (handled by TypeScript).

## Svelte Development

When working with Svelte components (.svelte files):
- Use the **svelte-file-editor** agent for creating/editing .svelte files
- Fetch relevant Svelte docs via MCP tools when needed
- Run **svelte-autofixer** to validate code before presenting to user

Available skills:
- **svelte-code-writer**: For creating/editing Svelte components
- **svelte-core-bestpractices**: For analyzing Svelte code patterns
