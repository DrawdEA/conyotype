// Paginates a Facebook page feed by replaying one captured GraphQL request with a moving cursor.
// Usage: node tools/freedomwall/fetch.mjs --page archerfreedomwall [--max 500] [--min-date 2024-01-01] [--delay 2000]
// Reads  .tmp/freedomwall/<page>.curl   (you create this: DevTools → Copy as cURL, see README)
// Writes .tmp/freedomwall/<page>.jsonl  (one post per line, resumable via <page>.state.json)

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { parseCurl } from "./curl.mjs";

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .map((a, i, all) => (a.startsWith("--") ? [a.slice(2), all[i + 1] && !all[i + 1].startsWith("--") ? all[i + 1] : "true"] : null))
    .filter(Boolean),
);
const page = args.page;
if (!page) die("usage: --page <name> [--max N] [--min-date YYYY-MM-DD] [--delay ms]");
const max = Number(args.max ?? 500);
const minDate = args["min-date"] ? Date.parse(args["min-date"]) / 1000 : 0;
const baseDelay = Number(args.delay ?? 2000);

const dir = ".tmp/freedomwall";
mkdirSync(dir, { recursive: true });
const curlPath = `${dir}/${page}.curl`;
const outPath = `${dir}/${page}.jsonl`;
const statePath = `${dir}/${page}.state.json`;
if (!existsSync(curlPath)) die(`missing ${curlPath} — capture it first (tools/freedomwall/README.md)`);

const req = parseCurl(readFileSync(curlPath, "utf8"));
const variables = JSON.parse(req.form.get("variables"));
const state = existsSync(statePath) ? JSON.parse(readFileSync(statePath, "utf8")) : { cursor: variables.cursor ?? null, done: false };
const seen = new Set(existsSync(outPath) ? readFileSync(outPath, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l).post_id) : []);

if (state.done) die(`${page}: already reached the end of the feed (delete ${statePath} to start over)`, 0);
console.log(`${page}: ${seen.size} posts on disk, resuming from ${state.cursor ? "saved cursor" : "the captured request"}`);

let fetched = 0;
let stop = false;
while (!stop && fetched < max) {
  const feed = await fetchPage(state.cursor);
  const edges = feed.edges ?? [];
  let added = 0;
  for (const edge of edges) {
    const post = extractPost(edge.node);
    if (!post || seen.has(post.post_id)) continue;
    if (minDate && post.creation_time && post.creation_time < minDate) {
      stop = true;
      break;
    }
    appendFileSync(outPath, JSON.stringify(post) + "\n");
    seen.add(post.post_id);
    added++;
    fetched++;
    if (fetched >= max) break;
  }
  state.cursor = feed.page_info?.end_cursor ?? state.cursor;
  state.done = feed.page_info?.has_next_page === false;
  writeFileSync(statePath, JSON.stringify(state, null, 2));
  console.log(`  +${added} (total ${seen.size})${state.done ? " — end of feed" : ""}`);
  if (state.done || edges.length === 0) break;
  await sleep(baseDelay * (1.5 + Math.random() * 1.5));
}
console.log(`${page}: done, ${seen.size} posts in ${outPath}`);

// ---------------------------------------------------------------------------

async function fetchPage(cursor) {
  const form = new URLSearchParams(req.form);
  form.set("variables", JSON.stringify({ ...variables, cursor }));
  for (let attempt = 1; ; attempt++) {
    let res;
    try {
      res = await fetch(req.url, { method: "POST", headers: req.headers, body: form.toString() });
    } catch (e) {
      if (attempt >= 3) die(`network error: ${e.message}`);
      await sleep(3000 * attempt);
      continue;
    }
    const text = await res.text();
    if (res.status === 429 || res.status >= 500) {
      if (attempt >= 3) die(`HTTP ${res.status} after 3 tries — wait a while, then re-capture ${curlPath}`);
      await sleep(10000 * attempt);
      continue;
    }
    if (res.status !== 200) die(`HTTP ${res.status} — session rejected, re-capture ${curlPath}`);
    if (text.startsWith("<")) die(`got HTML instead of JSON (login/checkpoint page) — re-capture ${curlPath}`);
    const feed = parseFeed(text);
    if (!feed) die(`no feed in response (doc_id probably rotated) — re-capture ${curlPath}`);
    return feed;
  }
}

/** FB streams several JSON lines; the first carries the feed, later ones are deferred fragments. */
function parseFeed(text) {
  for (const line of text.replace(/^for \(;;\);/, "").split("\n")) {
    if (!line.trim()) continue;
    let obj;
    try {
      obj = JSON.parse(line);
    } catch {
      continue;
    }
    if (obj.errors?.length) {
      const msg = obj.errors.map((e) => e.message ?? e.description ?? "").join("; ");
      if (/dtsg|login|1357004|session/i.test(msg)) die(`facebook error: ${msg} — re-capture ${curlPath}`);
      console.warn(`  warning: ${msg}`);
    }
    const feed = findFeed(obj);
    if (feed) return feed;
  }
  return null;
}

function findFeed(obj, depth = 0) {
  if (!obj || typeof obj !== "object" || depth > 8) return null;
  for (const [k, v] of Object.entries(obj)) {
    if (/feed_units|timeline/i.test(k) && v && Array.isArray(v.edges) && v.page_info) return v;
    const hit = findFeed(v, depth + 1);
    if (hit) return hit;
  }
  return null;
}

function extractPost(node) {
  if (!node) return null;
  const post_id = node.post_id ?? findKey(node, "post_id") ?? node.id;
  const text = findMessage(node);
  if (!post_id || !text) return null;
  return {
    post_id: String(post_id),
    creation_time: findKey(node, "creation_time") ?? null,
    url: node.wwwURL ?? node.url ?? findKey(node, "wwwURL") ?? null,
    text,
    reactions: findKey(node, "reaction_count")?.count ?? null,
    comments: findKey(node, "total_comment_count") ?? findKey(node, "comments")?.total_count ?? null,
  };
}

/** The post body lives at comet_sections.content.story.message.text, with a few nesting variants. */
function findMessage(node, depth = 0) {
  if (!node || typeof node !== "object" || depth > 10) return null;
  if (node.message && typeof node.message.text === "string" && node.message.text.trim()) return node.message.text;
  for (const v of Object.values(node)) {
    const hit = findMessage(v, depth + 1);
    if (hit) return hit;
  }
  return null;
}

function findKey(obj, key, depth = 0) {
  if (!obj || typeof obj !== "object" || depth > 10) return undefined;
  if (key in obj && obj[key] != null) return obj[key];
  for (const v of Object.values(obj)) {
    const hit = findKey(v, key, depth + 1);
    if (hit !== undefined) return hit;
  }
  return undefined;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function die(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}
