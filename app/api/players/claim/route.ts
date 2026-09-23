import { z } from "zod";
import { getDb } from "@/db/client";
import { players } from "@/db/schema";
import { ensureSecretHash, playerBySecretHash } from "@/features/identity/player";
import { normalizeSchool, normalizeUsername, schoolError, usernameError } from "@/lib/username";

const Body = z.object({ username: z.string().max(40), school: z.string().max(40) });

const fail = (error: string, status = 400) => Response.json({ error }, { status });

export async function POST(request: Request) {
  const body = Body.safeParse(await request.json().catch(() => null));
  if (!body.success) return fail("bad request");

  const username = normalizeUsername(body.data.username);
  const invalid = usernameError(username);
  if (invalid) return fail(invalid);
  const school = normalizeSchool(body.data.school);
  const badSchool = schoolError(school);
  if (badSchool) return fail(badSchool);

  const secretHash = await ensureSecretHash();
  const existing = await playerBySecretHash(secretHash);
  if (existing) return fail(`You're already ${existing.username}`, 409);

  const inserted = await getDb()
    .insert(players)
    .values({ id: crypto.randomUUID(), username, school, secretHash, createdAt: Date.now() })
    .onConflictDoNothing()
    .returning({ username: players.username });
  if (!inserted.length) return fail("Someone already took that name", 409);

  return Response.json({ username, school });
}
