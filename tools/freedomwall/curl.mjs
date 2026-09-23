// Parses a Chrome "Copy as cURL" command into { url, method, headers, form }.
// Only the bits Facebook's GraphQL endpoint needs; nothing here is printed by callers.

/** Shell-style tokenizer: single quotes, double quotes, backslash escapes, line continuations, $'…' strings. */
function tokenize(text) {
  const tokens = [];
  let cur = "";
  let inTok = false;
  let i = 0;
  const push = () => {
    if (inTok) tokens.push(cur);
    cur = "";
    inTok = false;
  };
  while (i < text.length) {
    const c = text[i];
    if (c === "\\" && text[i + 1] === "\n") {
      i += 2;
      continue;
    }
    if (c === "'" || (c === "$" && text[i + 1] === "'")) {
      const ansi = c === "$";
      i += ansi ? 2 : 1;
      inTok = true;
      while (i < text.length && text[i] !== "'") {
        if (ansi && text[i] === "\\") {
          const n = text[i + 1];
          cur += n === "n" ? "\n" : n === "t" ? "\t" : n === "'" ? "'" : n === "\\" ? "\\" : n;
          i += 2;
        } else cur += text[i++];
      }
      i++;
      continue;
    }
    if (c === '"') {
      i++;
      inTok = true;
      while (i < text.length && text[i] !== '"') {
        if (text[i] === "\\" && i + 1 < text.length) {
          cur += text[i + 1];
          i += 2;
        } else cur += text[i++];
      }
      i++;
      continue;
    }
    if (/\s/.test(c)) {
      push();
      i++;
      continue;
    }
    if (c === "\\" && i + 1 < text.length) {
      cur += text[i + 1];
      inTok = true;
      i += 2;
      continue;
    }
    cur += c;
    inTok = true;
    i++;
  }
  push();
  return tokens;
}

export function parseCurl(text) {
  const t = tokenize(text.trim());
  if (t[0] !== "curl") throw new Error("file does not start with `curl` — use Chrome DevTools → Copy as cURL");
  const req = { url: "", method: "GET", headers: {}, body: null };
  for (let i = 1; i < t.length; i++) {
    const a = t[i];
    if (a === "-H" || a === "--header") {
      const [k, ...v] = t[++i].split(":");
      req.headers[k.trim().toLowerCase()] = v.join(":").trim();
    } else if (a === "-b" || a === "--cookie") {
      req.headers.cookie = t[++i];
    } else if (a === "-X" || a === "--request") {
      req.method = t[++i];
    } else if (a === "--data-raw" || a === "--data" || a === "-d" || a === "--data-binary") {
      req.body = t[++i];
      req.method = "POST";
    } else if (a === "--compressed" || a === "-L" || a === "--location") {
      // no-op
    } else if (a.startsWith("-")) {
      // unknown flag: skip its value if it doesn't look like a URL
      if (t[i + 1] && !t[i + 1].startsWith("-") && !t[i + 1].startsWith("http")) i++;
    } else if (!req.url) {
      req.url = a;
    }
  }
  if (!req.url) throw new Error("no URL found in cURL");
  if (!req.body) throw new Error("no request body found — copy the POST to /api/graphql/, not the page load");
  const form = new URLSearchParams(req.body);
  if (!form.get("doc_id") && !form.get("variables")) throw new Error("body has no doc_id/variables — wrong request copied");
  // fetch() sets these itself; a stale value from the capture would break the request
  for (const h of ["content-length", "host", "accept-encoding"]) delete req.headers[h];
  return { url: req.url, method: req.method, headers: req.headers, form };
}
