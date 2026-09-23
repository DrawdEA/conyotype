import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db/client";
import { players } from "@/db/schema";
import { currentPlayer } from "@/features/identity/player";
import { normalizeSchool, normalizeUsername, schoolError, usernameError } from "@/lib/username";

const Body = z.object({ username: z.string().max(40), school: z.string().max(40) });

const fail = (error: string, status = 400) => Response.json({ error }, { status });

/** Rename / change school for the player this browser owns. */
export async function PATCH(request: Request) {
  const body = Body.safeParse(await request.json().catch(() => null));
  if (!body.success) return fail("bad request");

  const me = await currentPlayer();
  if (!me) return fail("You haven't claimed a name yet", 401);

  const username = normalizeUsername(body.data.username);
  const invalid = usernameError(username);
  if (invalid) return fail(invalid);
  const school = normalizeSchool(body.data.school);
  const badSchool = schoolError(school);
  if (badSchool) return fail(badSchool);

  try {
    await getDb().update(players).set({ username, school }).where(eq(players.id, me.id));
  } catch (e) {
    if (String(e).includes("UNIQUE")) return fail("Someone already took that name", 409);
    throw e;
  }
  return Response.json({ username, school });
}
