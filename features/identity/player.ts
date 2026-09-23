import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "@/db/client";
import { players } from "@/db/schema";
import { sha256Hex } from "@/lib/hmac";

const COOKIE = "ct_secret";
const YEAR_S = 60 * 60 * 24 * 365;

/** Hash of this browser's secret, or null if it has never started a run. */
export async function currentSecretHash(): Promise<string | null> {
  const secret = (await cookies()).get(COOKIE)?.value;
  return secret ? sha256Hex(secret) : null;
}

/** Same, but mints the secret cookie when missing. Route handlers only (sets a cookie). */
export async function ensureSecretHash(): Promise<string> {
  const jar = await cookies();
  let secret = jar.get(COOKIE)?.value;
  if (!secret) {
    secret = crypto.randomUUID() + crypto.randomUUID();
    // `secure` cookies are dropped over plain http by Safari/Firefox (even on localhost), which makes every run look like
    // it came from another browser in dev
    jar.set(COOKIE, secret, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: YEAR_S });
  }
  return sha256Hex(secret);
}

export async function playerBySecretHash(secretHash: string) {
  const [row] = await getDb().select().from(players).where(eq(players.secretHash, secretHash)).limit(1);
  return row ?? null;
}

/** Never throws: the header shows a name when it can, and the page must still render when the DB is unreachable. */
export async function currentPlayer() {
  try {
    const hash = await currentSecretHash();
    return hash ? await playerBySecretHash(hash) : null;
  } catch (e) {
    console.error("currentPlayer failed", e);
    return null;
  }
}
