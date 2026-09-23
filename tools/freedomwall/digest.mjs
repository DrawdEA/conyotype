// Turns scraped posts into a slang/topic digest I can write scenarios from.
// Usage: node tools/freedomwall/digest.mjs --page archerfreedomwall
// Reads .tmp/freedomwall/<page>.jsonl (scraped) or <page>.txt (pasted, blank-line separated); writes <page>.digest.md

import { existsSync, readFileSync, writeFileSync } from "node:fs";

const page = process.argv[process.argv.indexOf("--page") + 1];
if (!page || page.startsWith("--")) {
  console.error("usage: --page <name>");
  process.exit(1);
}
const dir = ".tmp/freedomwall";
// either scraped JSONL, or a hand-pasted <page>.txt with posts separated by blank lines (or a line of ---)
const posts = existsSync(`${dir}/${page}.jsonl`)
  ? readFileSync(`${dir}/${page}.jsonl`, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l))
  : readFileSync(`${dir}/${page}.txt`, "utf8")
      .split(/\n\s*\n|\n-{3,}\n/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((text, i) => ({ post_id: String(i), text }));

// --- cleaning ---------------------------------------------------------------

const CRISIS = /\b(suicid|kill myself|self.?harm|rape|molest|abus|overdose|magpakamatay)\w*/i;

function clean(text) {
  return text
    .replace(/#\w+/g, " ") // page tags + serials (#AFW1234, #ArcherFreedomWall)
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\S+@\S+\.\S+/g, " ")
    .replace(/\+?\d[\d\s-]{7,}\d/g, " ")
    .replace(/@\w+/g, " ")
    .replace(/\b(to|kay|si|ni|para kay|for)\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)?/g, "$1 [name]")
    .replace(/\s+/g, " ")
    .trim();
}

const cleaned = posts
  .map((p) => ({ ...p, text: clean(p.text), flagged: CRISIS.test(p.text) }))
  .filter((p) => p.text.length >= 15);
const usable = cleaned.filter((p) => !p.flagged);

// --- vocabulary --------------------------------------------------------------

const STOP = new Set(
  `the a an and or but if so to of in on at for with from by as is are was were be been being am i you he she it we they me him her us them my your his its our their this that these those there here what which who whom when where why how not no yes do does did done have has had having will would can could should may might must just very really too also than then now only even still all any some more most much many few one two about into over out up down off again ever never always like get got go going went come came make made take took know knew think thought say said see saw want need feel felt time day people thing things someone something everyone anyone lol haha hahaha omg pls please na pa lang ba ka ko mo ang ng sa si ni ay yung yun para kasi kaya pero hindi di wala may meron ako ikaw siya kami tayo sila ito iyan iyon dito diyan doon din rin naman talaga sobra ganun ganyan ganito`.split(/\s+/),
);
const ENGLISH_COMMON = new Set(
  `because before after while during until since though although through around between under again further once both each other such own same rest`.split(/\s+/),
);

function tokens(t) {
  return t.toLowerCase().match(/[a-z][a-z']+/g) ?? [];
}
const freq = new Map();
for (const p of usable) for (const w of new Set(tokens(p.text))) if (!STOP.has(w) && !ENGLISH_COMMON.has(w) && w.length > 2) freq.set(w, (freq.get(w) ?? 0) + 1);
const topWords = [...freq].sort((a, b) => b[1] - a[1]).slice(0, 120);

// --- pattern mining ----------------------------------------------------------

const patterns = {
  "make <verb>": /\bmake (\w+)/gi,
  "so <adj>": /\bso (\w+)/gi,
  "sobrang <x>": /\bsobrang (\w+)/gi,
  "like, …": /\blike,/gi,
  literally: /\bliterally\b/gi,
  "na / pa / lang / naman": /\b(na|pa|lang|naman)\b/gi,
  "grabe": /\bgrabe\b/gi,
  "charot / char": /\bchar(ot)?\b/gi,
  "sana all": /\bsana all\b/gi,
  "hays / huhu": /\b(hays|huhu+)\b/gi,
};
const patternHits = {};
for (const [name, re] of Object.entries(patterns)) {
  const counts = new Map();
  let n = 0;
  for (const p of usable) for (const m of p.text.matchAll(re)) {
    n++;
    if (m[1]) counts.set(m[1].toLowerCase(), (counts.get(m[1].toLowerCase()) ?? 0) + 1);
  }
  patternHits[name] = { n, top: [...counts].sort((a, b) => b[1] - a[1]).slice(0, 15) };
}

// --- topics ------------------------------------------------------------------

const TOPICS = {
  enlistment: /enlist|enrol|slot|animo\.?sys|aisis|sched|section|units?\b/i,
  "thesis / groupwork": /thesis|groupmate|group ?work|deadline|requirement|paper|plate/i,
  profs: /\bprof\b|professor|terror|grade|qpi|gpa|flunk|fail|exam|quiz|finals|midterm/i,
  orgs: /\borg\b|orgs|apps?\b|committee|exec|batch|block ?mates?/i,
  "food / coffee": /food|eat|lunch|dinner|milk ?tea|coffee|latte|samgyup|jollibee|agno|caf|canteen|gutom/i,
  "love / situationship": /crush|jowa|situationship|date|ex\b|ghost|kilig|landi|boyfriend|girlfriend|bf\b|gf\b|manliligaw|ligaw/i,
  "family / tita": /tita|tito|mom|dad|mama|papa|parents|yaya|driver|lola|lolo/i,
  money: /pera|money|allowance|libre|broke|tuition|gastos|mahal|bill|split/i,
  "commute / flood": /commute|traffic|lrt|mrt|jeep|grab|angkas|flood|baha|rain|ulan|edsa|taft|katip/i,
  "uaap / sports": /uaap|game|volleyball|basketball|archers|eagles|animo|one big fight|halalan/i,
  "mental health / stress": /stress|burnout|anxious|anxiety|tired|pagod|cry|iyak|overwhelm|sad|depress/i,
  "condo / dorm": /condo|dorm|roommate|landlord|rent|apartment/i,
  friends: /friend|barkada|tropa|bff|besh|bes\b|beshie/i,
};
const topicRows = Object.entries(TOPICS).map(([name, re]) => {
  const hits = usable.filter((p) => re.test(p.text));
  const samples = hits
    .sort((a, b) => (b.reactions ?? 0) - (a.reactions ?? 0))
    .slice(0, 3)
    .map((p) => `- "${p.text.slice(0, 120)}${p.text.length > 120 ? "…" : ""}"`);
  return { name, n: hits.length, samples };
});

// --- lengths -----------------------------------------------------------------

const lens = usable.map((p) => p.text.length).sort((a, b) => a - b);
const pct = (q) => lens[Math.floor(lens.length * q)] ?? 0;
const dates = usable.map((p) => p.creation_time).filter(Boolean);
const fmt = (s) => new Date(s * 1000).toISOString().slice(0, 10);

// --- report ------------------------------------------------------------------

const md = `# ${page} digest

${posts.length} posts scraped · ${usable.length} usable · ${cleaned.length - usable.length} flagged (skipped) · ${posts.length - cleaned.length} too short
${dates.length ? `Dates: ${fmt(Math.min(...dates))} → ${fmt(Math.max(...dates))}` : ""}
Length: median ${pct(0.5)} chars, p25 ${pct(0.25)}, p75 ${pct(0.75)}

## Top words (stoplist removed)
${topWords.map(([w, n]) => `${w} (${n})`).join(" · ")}

## Patterns
${Object.entries(patternHits)
  .map(([name, { n, top }]) => `- **${name}** — ${n} hits${top.length ? `: ${top.map(([w, c]) => `${w} ${c}`).join(", ")}` : ""}`)
  .join("\n")}

## Topics
${topicRows
  .sort((a, b) => b.n - a.n)
  .map((t) => `### ${t.name} (${t.n})\n${t.samples.join("\n") || "- (none)"}`)
  .join("\n\n")}
`;
writeFileSync(`${dir}/${page}.digest.md`, md);
console.log(`wrote ${dir}/${page}.digest.md (${usable.length} usable posts)`);
