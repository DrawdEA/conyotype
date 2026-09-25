"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DURATION_S, entryAt, replyAfter, scenarioFor } from "@/lib/scenarios";
import { accuracyOf, applyKey, diffToKeys, initialRun, wpmOf, type KeyEvent, type RunResult, type RunState } from "@/lib/replay";

const randomSeed = () => crypto.getRandomValues(new Uint32Array(1))[0];

export type Phase = "idle" | "running" | "over";

export interface ChatMsg {
  id: number;
  kind: "in" | "out";
  text: string;
  who?: string;
  /** english gloss, shown when translation is on; plain-english bubbles have none */
  gloss?: string;
}

export interface GameView {
  target: string;
  gloss: string;
  value: string;
  timeLeft: number;
  wpm: number;
  accuracy: number;
  sent: number;
}

export type Submission =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "saved"; result: RunResult; username: string; isBest: boolean; flagged: boolean }
  | { status: "needsClaim"; result: RunResult }
  | { status: "error"; message: string };

const THREAD_SIZE = 8;

const normalize = (raw: string) => raw.replace(/[’‘]/g, "'").toLowerCase();

async function postJson<T>(url: string, body: unknown): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = (await res.json()) as T & { error?: string };
    return res.ok ? { ok: true, data } : { ok: false, error: data.error ?? "Something went wrong" };
  } catch {
    return { ok: false, error: "You're offline, so this run wasn't ranked" };
  }
}

export function useTypingGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [view, setView] = useState<GameView | null>(null);
  const [thread, setThread] = useState<ChatMsg[]>([]);
  const [localResult, setLocalResult] = useState<RunResult | null>(null);
  const [submission, setSubmission] = useState<Submission>({ status: "idle" });
  // the run that starts the moment the player types into the draft on the results screen
  const [next, setNext] = useState({ target: "", gloss: "" });
  const nextSeed = useRef(0);

  const run = useRef<RunState>(initialRun());
  const log = useRef<KeyEvent[]>([]);
  const seed = useRef(0);
  const startedAt = useRef(0);
  const token = useRef<Promise<string | null>>(Promise.resolve(null));
  const phaseRef = useRef<Phase>("idle");
  const msgId = useRef(0);

  const pushMsg = useCallback((msg: Omit<ChatMsg, "id">) => {
    setThread((t) => [...t, { ...msg, id: ++msgId.current }].slice(-THREAD_SIZE));
  }, []);

  const snapshot = useCallback((elapsedMs: number): GameView => {
    const [target, gloss] = entryAt(seed.current, run.current.index);
    return {
      target,
      gloss,
      value: run.current.value,
      timeLeft: Math.max(0, DURATION_S - elapsedMs / 1000),
      wpm: wpmOf(run.current, target, elapsedMs),
      accuracy: accuracyOf(run.current),
      sent: run.current.sent,
    };
  }, []);

  const submit = useCallback(async () => {
    setSubmission({ status: "submitting" });
    const t = await token.current;
    if (!t) return setSubmission({ status: "error", message: "Couldn't reach the server, so this run wasn't ranked" });
    type Finish = { result: RunResult; flagged: boolean; saved: boolean; isBest?: boolean; username?: string };
    const res = await postJson<Finish>("/api/runs/finish", { token: t, log: log.current });
    if (!res.ok) return setSubmission({ status: "error", message: res.error });
    const d = res.data;
    if (d.saved && d.username) {
      setSubmission({ status: "saved", result: d.result, username: d.username, isBest: !!d.isBest, flagged: d.flagged });
    } else setSubmission({ status: "needsClaim", result: d.result });
  }, []);

  const reset = useCallback((seedOverride?: number) => {
      // same seed = same conversation: keep the bubbles as they are instead of re-popping identical ones
      const sameConvo = seedOverride !== undefined && seedOverride === seed.current && run.current.sent === 0;
      seed.current = seedOverride ?? randomSeed();
      run.current = initialRun();
      log.current = [];
      phaseRef.current = "idle";
      // the server clock for this run starts now; finish is rejected if it arrives before `duration` has passed
      // starts are chained: the first one mints the browser's secret cookie, and a second request racing it would
      // get a different secret and later fail with "run belongs to another browser"
      const mySeed = seed.current;
      token.current = token.current.catch(() => null).then(() =>
        postJson<{ token: string }>("/api/runs/start", { seed: mySeed }).then((r) => (r.ok ? r.data.token : null)),
      );
      setPhase("idle");
      setLocalResult(null);
      setSubmission({ status: "idle" });
      if (!sameConvo) setThread(scenarioFor(seed.current).opener.map(([who, text, gloss]) => ({ id: ++msgId.current, kind: "in", who, text, gloss })));
      setView(snapshot(0));
  }, [snapshot]);

  /** Back to the start of the current conversation: stops the clock, keeps the same line and bubbles. */
  const restartSame = useCallback(() => reset(seed.current), [reset]);

  useEffect(() => {
    if (phase !== "running") return;
    const limit = DURATION_S * 1000;
    // the clock repaints on animation frames, but the run ends on a timer: frames stop in a background tab, timers don't
    let raf = 0;
    const tick = () => {
      // a frame can land between a reset and this effect's cleanup; don't overwrite the fresh view with a stale clock
      if (phaseRef.current !== "running") return;
      const elapsed = performance.now() - startedAt.current;
      if (elapsed >= limit) return;
      setView(snapshot(elapsed));
      raf = requestAnimationFrame(tick);
    };
    const finish = () => {
      if (phaseRef.current !== "running") return;
      phaseRef.current = "over";
      nextSeed.current = randomSeed();
      const [target, gloss] = entryAt(nextSeed.current, 0);
      setNext({ target, gloss });
      const final = snapshot(limit);
      setView(final);
      setLocalResult({ wpm: final.wpm, rawWpm: 0, accuracy: final.accuracy, errors: run.current.errors, sent: final.sent });
      setPhase("over");
      void submit();
    };
    raf = requestAnimationFrame(tick);
    const end = setTimeout(finish, Math.max(0, limit - (performance.now() - startedAt.current)));
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(end);
    };
  }, [phase, snapshot, submit]);

  /** Returns true when the change contained a typo (so the UI can shake). */
  const onInput = useCallback(
    (raw: string): boolean => {
      if (phaseRef.current === "over") return false;
      const keys = diffToKeys(run.current.value, normalize(raw));
      if (!keys.length) return false;
      if (phaseRef.current === "idle") {
        phaseRef.current = "running";
        startedAt.current = performance.now();
        setPhase("running");
      }
      const t = Math.round(performance.now() - startedAt.current);
      const errorsBefore = run.current.errors;
      for (const k of keys) {
        log.current.push([t, k]);
        const [lineText, lineGloss] = entryAt(seed.current, run.current.index);
        const sentText = applyKey(run.current, k, lineText);
        if (!sentText) continue;
        pushMsg({ kind: "out", text: sentText, gloss: lineGloss });
        const reply = replyAfter(seed.current, run.current.sent - 1);
        if (reply) setTimeout(() => phaseRef.current === "running" && pushMsg({ kind: "in", who: reply[0], text: reply[1], gloss: reply[2] }), 350);
      }
      setView(snapshot(t));
      return run.current.errors > errorsBefore;
    },
    [pushMsg, snapshot],
  );

  // the seed is random, so the first run can only be created on the client;
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial run needs a client-side random seed
    reset();
  }, [reset]);

  /** From the results screen: the first key typed into the draft begins the pre-rolled next run. */
  const startNext = useCallback(
    (raw: string): boolean => {
      reset(nextSeed.current);
      return onInput(raw);
    },
    [reset, onInput],
  );

  const claim = useCallback(
    async (username: string, school: string): Promise<string | null> => {
      const res = await postJson<{ username: string }>("/api/players/claim", { username, school });
      if (!res.ok) return res.error;
      await submit();
      return null;
    },
    [submit],
  );

  return { phase, view, thread, localResult, submission, nextTarget: next.target, nextGloss: next.gloss, onInput, startNext, reset, restartSame, claim };
}
