import { DURATION_S, entryAt } from "./scenarios";

/** One keystroke: ms since the first key, and a single char or "\b" for backspace. */
export type KeyEvent = [t: number, k: string];

export const BACKSPACE = "\b";
export const MAX_LOG_EVENTS = 6000;
export const MAX_WPM = 250;
export const MIN_LEADERBOARD_ACCURACY = 85;

export interface RunState {
  index: number;
  value: string;
  doneChars: number;
  correct: number;
  errors: number;
  sent: number;
}

export interface RunResult {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errors: number;
  sent: number;
}

export const initialRun = (): RunState => ({ index: 0, value: "", doneChars: 0, correct: 0, errors: 0, sent: 0 });

/**
 * Applies one key in place. Returns the message text if this key completed (sent) it.
 * A line sends as soon as it is full: typos are counted, not blocking.
 */
export function applyKey(s: RunState, k: string, target: string): string | null {
  if (k === BACKSPACE) {
    s.value = s.value.slice(0, -1);
    return null;
  }
  if (s.value.length >= target.length) return null;
  if (k === target[s.value.length]) s.correct++;
  else s.errors++;
  s.value += k;
  if (s.value.length < target.length) return null;
  s.doneChars += target.length + 1;
  s.sent++;
  s.index++;
  s.value = "";
  return target;
}

export function correctPrefix(value: string, target: string): number {
  let n = 0;
  while (n < value.length && value[n] === target[n]) n++;
  return n;
}

export function wpmOf(s: RunState, target: string, elapsedMs: number): number {
  if (elapsedMs < 1000) return 0;
  return Math.round((s.doneChars + correctPrefix(s.value, target)) / 5 / (elapsedMs / 60000));
}

export function accuracyOf(s: RunState): number {
  const n = s.correct + s.errors;
  return n ? Math.round((s.correct / n) * 100) : 100;
}

/** Turns an <input> value change into key events (handles word-delete, IME bursts, etc.). */
export function diffToKeys(prev: string, next: string): string[] {
  let p = 0;
  while (p < prev.length && p < next.length && prev[p] === next[p]) p++;
  return [...Array<string>(prev.length - p).fill(BACKSPACE), ...next.slice(p)];
}

export type ReplayOutcome =
  | { ok: true; result: RunResult; flags: string[] }
  | { ok: false; error: string };

/** Server-side source of truth: recompute the score from the raw keystroke log. */
export function replay(seed: number, log: KeyEvent[]): ReplayOutcome {
  if (log.length > MAX_LOG_EVENTS) return { ok: false, error: "log too long" };
  const limit = DURATION_S * 1000;
  const s = initialRun();
  const gaps: number[] = [];
  let last = 0;
  let typed = 0;
  for (const [t, k] of log) {
    if (!Number.isFinite(t) || t < last) return { ok: false, error: "timestamps not monotonic" };
    if (k !== BACKSPACE && (k.length !== 1 || k < " " || k > "~")) return { ok: false, error: "bad key" };
    if (t > limit) break;
    if (typed > 0) gaps.push(t - last);
    last = t;
    if (k !== BACKSPACE) typed++;
    applyKey(s, k, entryAt(seed, s.index)[0]);
  }
  const target = entryAt(seed, s.index)[0];
  const result: RunResult = {
    wpm: wpmOf(s, target, limit),
    rawWpm: Math.round(typed / 5 / (limit / 60000)),
    accuracy: accuracyOf(s),
    errors: s.errors,
    sent: s.sent,
  };
  const flags: string[] = [];
  if (result.wpm > MAX_WPM) flags.push("wpm over cap");
  if (gaps.length > 30) {
    const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const sd = Math.sqrt(gaps.reduce((a, g) => a + (g - mean) ** 2, 0) / gaps.length);
    if (sd < 8) flags.push("robotic rhythm");
  }
  return { ok: true, result, flags };
}
