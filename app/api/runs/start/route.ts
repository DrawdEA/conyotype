import { z } from "zod";
import { getEnv } from "@/db/client";
import { ensureSecretHash } from "@/features/identity/player";
import type { RunToken } from "@/features/game/runToken";
import { signToken } from "@/lib/hmac";
import { PHRASE_SET_VERSION } from "@/lib/scenarios";

const Body = z.object({ seed: z.number().int().min(0).max(0xffffffff) });

export async function POST(request: Request) {
  const body = Body.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: "bad request" }, { status: 400 });

  const env = getEnv();
  const sh = await ensureSecretHash();
  const limited = await env.RUNS_LIMITER?.limit({ key: sh });
  if (limited && !limited.success) return Response.json({ error: "slow down, bro" }, { status: 429 });

  const payload: RunToken = { runId: crypto.randomUUID(), sh, seed: body.data.seed, startedAt: Date.now(), v: PHRASE_SET_VERSION };
  return Response.json({ runId: payload.runId, token: await signToken(payload, env.HMAC_KEY) });
}
