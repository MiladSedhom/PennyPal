# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`AGENTS.md` is the primary developer guide and stays authoritative for stack, style, and key paths. This file documents architecture details that span multiple files and aren't obvious from reading any one of them.

## Commands

```bash
pnpm dev              # Vite dev server
pnpm build            # Production build
pnpm check            # svelte-kit sync + svelte-check (run before committing)
pnpm lint             # prettier --check . && eslint .
pnpm format           # prettier --write .

docker compose up -d  # Postgres on :5432 (required for any db: command)
pnpm db:push          # Push schema directly (dev)
pnpm db:generate      # Generate migration from schema.ts
pnpm db:migrate       # Apply migrations
pnpm db:studio        # Drizzle Studio
```

There is no test runner configured. `pnpm check` is the only static verification.

`DATABASE_URL` must be set (see `.env.example`) for both runtime and `drizzle-kit` commands.

## Architecture

### SvelteKit experimental features (load-bearing)

`svelte.config.js` enables two experimental flags that the codebase depends on:

- `kit.experimental.remoteFunctions` — enables the `$app/server` `query`/`command`/`form` API used in `src/lib/remote/*.remote.ts`. All server-side data flow goes through these, not `+page.server.ts` load functions or `+server.ts` endpoints (one exception: `src/routes/(auth)/login/+page.server.ts`).
- `compilerOptions.experimental.async` — lets `.svelte` templates `await` directly (e.g. `{#each await getTags() as tag}` and `const user = $derived(await getLoggedInUser())` in `src/routes/+page.svelte`).

If you remove either flag, large parts of the app break silently at the type level.

### Auth flow

Session-based auth, hand-rolled (no Lucia). The pieces:

1. `src/lib/server/auth.ts` — token gen, session create/validate/invalidate, cookie helpers. Sessions are 30-day rolling: tokens are SHA-256'd before storage, and `validateSessionToken` auto-renews when within 15 days of expiry.
2. `src/hooks.server.ts` — single `handleAuth` hook reads the `auth-session` cookie, validates it, and writes `event.locals.user` / `event.locals.session` (typed in `src/app.d.ts`).
3. `src/lib/remote/auth.remote.ts` — `getLoggedInUser()` is the gate: it reads `locals.user` via `getRequestEvent()` and `redirect(302, '/login')` if missing. **All other remote functions call `getLoggedInUser()` first** to get the user id and enforce auth in one step. Don't add new protected endpoints without this call.
4. `loginOrRegister` is a single `form()` remote with an `action: 'login' | 'register'` discriminator (see `src/lib/schemas/index.ts`). Argon2 params are duplicated in both branches — keep them in sync.

### Drizzle schema conventions

`src/lib/server/db/schema.ts`:

- Table **JS identifiers are singular** (`payment`, `tag`, `user`) but the actual Postgres table names are `PascalCase` (`Payment`, `Tag`, `User`). The join table is `_PaymentToTag` with columns `A`/`B` — this is a Prisma-style holdover; preserve it when modifying.
- Every user-owned table has a `userId` FK and a matching relation. New domain tables should follow the same pattern and be added to `usersRelations`.
- The shared `timestamps` object provides `createdAt`/`updatedAt` with `$onUpdate`. Spread it into new tables rather than redefining.

### Remote functions pattern

In `src/lib/remote/*.remote.ts`:

- `query(async () => …)` for reads — call from components with `await getX()`. Mutations in the same file should call `getX().refresh()` to invalidate (see `createTag` in `tags.remote.ts`).
- `command(schema, async (input) => …)` for typed mutations called imperatively from components.
- `form(schema, async (input) => …)` for `<form {...action}>` submissions; spread `action.fields.foo.as('text')` into inputs.
- Validation uses `valibot` (not zod). Schemas live in `src/lib/schemas/` when shared, inline otherwise.

### UI

shadcn-svelte components live in `src/lib/components/ui/` (configured in `components.json`, base color `neutral`, CSS at `src/routes/layout.css`). Tailwind v4 is wired via the `@tailwindcss/vite` plugin in `vite.config.ts` — there is no `tailwind.config.js`. `bits-ui` provides headless primitives underneath.
