const RESERVED = new Set([
  "admin", "administrator", "mod", "moderator", "conyotype", "official", "support", "staff",
  "system", "root", "api", "leaderboard", "anonymous", "guest", "null", "undefined", "me",
]);

// substring match, so keep these unambiguous
const BLOCKED = [
  "fuck", "shit", "bitch", "cunt", "nigg", "fagg", "rape", "nazi", "hitler",
  "putangina", "tangina", "puta", "gago", "tarantado", "kantot", "bobo", "pakyu", "ulol", "burat", "pekpek",
];

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Returns an error message, or null when the (already normalized) name is fine. */
export function usernameError(name: string): string | null {
  if (!/^[a-z0-9_]{3,16}$/.test(name)) return "Use 3–16 characters: a–z, 0–9 or _";
  if (RESERVED.has(name)) return "That name is reserved, pick another";
  const squashed = name.replace(/_/g, "").replace(/0/g, "o").replace(/1/g, "i").replace(/3/g, "e").replace(/4/g, "a");
  if (BLOCKED.some((w) => squashed.includes(w))) return "Not that one, bro. Pick another";
  return null;
}

/** Known schools and the ways people type them. Anything else is kept as typed (uppercased, 2–12 chars). */
const SCHOOLS: [tag: string, aliases: string[]][] = [
  ["ADMU", ["admu", "ateneo", "ateneo de manila"]],
  ["ADU", ["adu", "adamson"]],
  ["DLSU", ["dlsu", "la salle", "lasalle", "de la salle", "taft"]],
  ["UP", ["up", "upd", "up diliman", "diliman", "uplb", "upm"]],
  ["UST", ["ust", "santo tomas", "sto tomas", "usto", "uste"]],
  ["UA&P", ["uap", "ua&p", "asia and the pacific"]],
  ["MAPUA", ["mapua"]],
  ["FEU", ["feu", "far eastern"]],
  ["SBU", ["sbu", "san beda", "beda"]],
  ["CSB", ["csb", "benilde"]],
  ["UE", ["ue", "university of the east"]],
  ["PUP", ["pup"]],
  ["ENDERUN", ["enderun"]],
  ["MIRIAM", ["miriam", "mc"]],
  ["XAVIER", ["xavier", "xs"]],
];
export function normalizeSchool(raw: string): string {
  const key = raw.trim().toLowerCase().replace(/[.\s]+/g, " ");
  for (const [tag, aliases] of SCHOOLS) if (aliases.includes(key)) return tag;
  return raw.trim().toUpperCase();
}

export function schoolError(school: string): string | null {
  if (!/^[A-Z0-9&' ]{2,12}$/.test(school)) return "School: 2–12 letters, like ADMU or DLSU";
  return null;
}
