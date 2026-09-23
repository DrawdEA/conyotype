// Turns a raw copy-paste of a Freedom Wall page (the messy "Facebook Facebook … [#Tag123](…) post text" dump)
// into clean posts appended to .tmp/freedomwall/<page>.txt, one per block, blank-line separated.
// Usage: node tools/freedomwall/paste.mjs --page archerfreedomwall < raw.txt
// Comments (and their authors) are dropped; a few name patterns are masked. Still eyeball the result.

import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";

const page = process.argv[process.argv.indexOf("--page") + 1];
if (!page || page.startsWith("--")) {
  console.error("usage: --page <name> < raw.txt");
  process.exit(1);
}
const dir = ".tmp/freedomwall";
mkdirSync(dir, { recursive: true });
const out = `${dir}/${page}.txt`;
const raw = readFileSync(0, "utf8");

// each post starts at its serial hashtag link and ends at the next chrome line
const START = /^\[#\w+\]\(https?:\/\/[^)]*\)\s*$/;
const COMMENT = /^\[[^\]]+\]\(https?:\/\/www\.facebook\.com\/[^)]*comment_id[^)]*\)/; // "[Author](…comment_id…)"
const NOISE = /^(Facebook|\*\s*|See (less|more)|Reply|·|\s*)$/;

const posts = [];
let cur = null;
for (const line of raw.split("\n")) {
  const l = line.trim();
  if (START.test(l)) {
    if (cur) posts.push(cur);
    cur = [];
    continue;
  }
  if (!cur) continue;
  if (COMMENT.test(l) || /^\[(\d+|an?) (days?|hours?|weeks?|minutes?) ago\]/.test(l)) {
    // a comment or the next post header — close this post
    posts.push(cur);
    cur = null;
    continue;
  }
  if (NOISE.test(l) || /^\[.*\]\(https?:\/\/www\.facebook\.com/.test(l)) continue;
  cur.push(l);
}
if (cur) posts.push(cur);

const existing = existsSync(out) ? readFileSync(out, "utf8") : "";
let added = 0;
for (const lines of posts) {
  let text = lines
    .join("\n")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/@\w+/g, "[handle]")
    .replace(/\b(hi|hello|hey|dear|to|kay|si|para kay|for|this)\s+[A-Z][a-z]+(\s+[A-Z]\.?)?(\s+[A-Z][a-z]+)?/gi, "$1 [name]")
    .replace(/\b(hi|hello|hey)\s+[A-Z]\b!?/gi, "$1 [name]")
    .replace(/\(\s*(\d(st|nd|rd|th) yr|[A-Z]{2,5}\s*-?\s*[A-Z]{2,5})[^)]*\)/g, "") // "(4th yr BS IE)" course/year tags
    .replace(/^\s*-\s*[A-Z][a-z]+\s*(\(.*\))?\s*$/m, "") // "- Signoff (iykyk)"
    .replace(/[ \t]+\n/g, "\n")
    .trim();
  if (text.length < 15 || existing.includes(text)) continue;
  appendFileSync(out, (existing || added ? "\n\n" : "") + text);
  added++;
}
console.log(`${page}: +${added} posts → ${out}`);
