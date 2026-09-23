import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, getEnv } from "@/db/client";
import { bests, runs } from "@/db/schema";
import { currentSecretHash, playerBySecretHash } from "@/features/identity/player";
import { EARLY_FINISH_TOLERANCE_MS, TOKEN_TTL_MS, type RunToken } from "@/features/game/runToken";
import { verifyToken } from "@/lib/hmac";
import { DURATION_S, PHRASE_SET_VERSION } from "@/lib/scenarios";
import { MAX_LOG_EVENTS, MIN_LEADERBOARD_ACCURACY, replay } from "@/lib/replay";

const Body = z.object({
  token: z.string().max(2000),
  log: z.array(z.tuple([z.number(), z.string().max(1)])).max(MAX_LOG_EVENTS),
});

const fail = (error: string, status = 400) => Response.json({ error }, { status });

export async function POST(request: Request) {
  const body = Body.safeParse(await request.json().catch(() => null));
  if (!body.success) return fail("bad request");

  const run = await verifyToken<RunToken>(body.data.token, getEnv().HMAC_KEY);
  if (!run || run.v !== PHRASE_SET_VERSION) return fail("invalid run token");
  if (run.sh !== (await currentSecretHash())) return fail("run belongs to another browser", 403);

  const age = Date.now() - run.startedAt;
  if (age < DURATION_S * 1000 - EARLY_FINISH_TOLERANCE_MS) return fail("finished too early");
  if (age > TOKEN_TTL_MS) return fail("run expired");

  const outcome = replay(run.seed, body.data.log);
  if (!outcome.ok) return fail(outcome.error);
  const { result, flags } = outcome;
  const flagged = flags.length > 0;

  const player = await playerBySecretHash(run.sh);
  if (!player) return Response.json({ result, flagged, saved: false, needsClaim: true });

  const db = getDb();
  const now = Date.now();
  const inserted = await db
    .insert(runs)
    .values({ id: run.runId, playerId: player.id, ...result, flagged, createdAt: now })
    .onConflictDoNothing()
    .returning({ id: runs.id });
  if (!inserted.length) return fail("run already submitted", 409);

  let isBest = false;
  if (!flagged && result.accuracy >= MIN_LEADERBOARD_ACCURACY) {
    const [prev] = await db.select({ wpm: bests.wpm }).from(bests).where(eq(bests.playerId, player.id)).limit(1);
    if (!prev || result.wpm > prev.wpm) {
      isBest = true;
      const best = { wpm: result.wpm, accuracy: result.accuracy, runId: run.runId, achievedAt: now };
      await db.insert(bests).values({ playerId: player.id, ...best }).onConflictDoUpdate({ target: bests.playerId, set: best });
    }
  }

  return Response.json({ result, flagged, saved: true, needsClaim: false, isBest, username: player.username });
}
