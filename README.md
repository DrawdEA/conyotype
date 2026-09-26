# ConyoType

30-second conyo typing test with one all-time leaderboard. Next.js (App Router) on Cloudflare Workers via OpenNext, D1 + Drizzle.

## Dev

```bash
cp .dev.vars.example .dev.vars   # set HMAC_KEY to anything
pnpm db:migrate:local
pnpm dev
```

`pnpm test` (vitest), `pnpm lint`, `pnpm preview` (runs the real Worker build locally).

## Deploy

```bash
pnpm wrangler login
pnpm wrangler d1 create conyotype        # paste database_id into wrangler.jsonc
pnpm db:migrate:remote
pnpm wrangler secret put HMAC_KEY        # long random string
pnpm run deploy
```

Optional Turnstile on username claim: `wrangler secret put TURNSTILE_SECRET` and set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` at build time.

## How scores are trusted

`/api/runs/start` signs `{runId, browser, seed, startedAt}`. The client sends its raw keystroke log to `/api/runs/finish`; the server rejects early/expired/reused tokens and recomputes the score with `lib/replay.ts` (same code the UI uses). Impossible speed or robotic rhythm gets stored but flagged and hidden from boards.

Schema change: edit `db/schema.ts` → `pnpm db:generate` → migrate. Phrase change: bump `PHRASE_SET_VERSION` in `lib/phrases.ts`.

Keyboard sounds are per-key WAVs (transcoded from the MP3s of) [kbsim](https://github.com/tplai/kbsim) (MIT) under `public/sounds/`, played through Web Audio in `features/game/keySounds.ts`.
