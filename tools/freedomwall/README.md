# Freedom Wall reference scrape

Pulls public posts from a Facebook page's feed (Archer Freedom Wall, ADMU Freedom Wall) into `.tmp/freedomwall/` as **local reference only** for writing ConyoType scenarios. Nothing here ships in the app and `.tmp/` is gitignored.

It works by replaying one GraphQL pagination request you copy from your own browser, moving the cursor each time. That means: it runs as your account, it is against Facebook's terms, `doc_id`s rotate every few weeks (you'll re-capture), and hammering it can trip a checkpoint. Keep `--max` modest and the delay on.

## Capture (per page, ~2 min)

1. Chrome, logged in, open the page (e.g. `facebook.com/archerfreedomwall`).
2. DevTools → **Network** → filter `graphql` → scroll the page until more posts load.
3. Click the new request whose request header `x-fb-friendly-name` is `CometModernPageFeedPaginationQuery` (profiles: `ProfileCometTimelineFeedRefetchQuery`).
4. Right-click → Copy → **Copy as cURL**.
5. Save it as `.tmp/freedomwall/<page>.curl`, e.g. `.tmp/freedomwall/archerfreedomwall.curl`.

The file holds your session cookies and `fb_dtsg`. It stays in `.tmp/` and is never printed.

## Run

```bash
node tools/freedomwall/fetch.mjs --page archerfreedomwall --max 300
node tools/freedomwall/fetch.mjs --page admufreedomwall --max 300 --min-date 2024-01-01
node tools/freedomwall/digest.mjs --page archerfreedomwall
```

`fetch` is resumable (`<page>.state.json` keeps the cursor; re-run to continue). `--delay` (ms, default 2000) is randomised ×1.5–3 between pages.

When it prints **re-capture**, the session or `doc_id` went stale: redo the capture steps and run again.

## Pasting instead of scraping

Skip the capture entirely: paste posts into `.tmp/freedomwall/<page>.txt`, one post per block separated by a blank line (or `---`). Leave out names and anything controversial. Then `node tools/freedomwall/digest.mjs --page <page>` works the same.

## Output

- `<page>.jsonl` — `{post_id, creation_time, url, text, reactions, comments}` per line
- `<page>.digest.md` — top Taglish words, `make <verb>` / `so <adj>` mining, topic buckets with samples, length stats

## Fallback

No login route: the Casper `research:apify-scrapers` skill wraps `apify/facebook-posts-scraper` (`scripts/scrape_facebook.py posts <url> --max-posts N`, ~$0.005/post, needs `APIFY_TOKEN`). Map its output to the JSONL shape above and `digest.mjs` works unchanged.
