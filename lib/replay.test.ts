import { describe, expect, it } from "vitest";
import { entryAt, SCENARIOS } from "./scenarios";
import { BACKSPACE, diffToKeys, replay, type KeyEvent } from "./replay";
import { usernameError } from "./username";

/** Types the run's prompts perfectly at a human-ish, jittered pace. */
function perfectLog(seed: number, msPerKey: number, untilMs: number): KeyEvent[] {
  const log: KeyEvent[] = [];
  let t = 0;
  for (let i = 0; t < untilMs; i++) {
    for (const ch of entryAt(seed, i)[0]) {
      log.push([Math.round(t), ch]);
      t += msPerKey + ((log.length * 37) % 41) - 20;
      if (t >= untilMs) break;
    }
  }
  return log;
}

describe("scenarios", () => {
  it("only ask for keys the replay validator accepts", () => {
    for (const sc of SCENARIOS) for (const t of sc.turns) expect(t.you).toMatch(/^[a-z0-9 ,.?!']+$/);
  });
  it("loop when a run outpaces its scenario", () => {
    const n = SCENARIOS[0].turns.length;
    expect(entryAt(0, n)).toEqual(entryAt(0, 0));
    expect(entryAt(1, 0)).not.toEqual(entryAt(0, 0));
  });
});

describe("replay", () => {
  it("scores a clean run", () => {
    const out = replay(42, perfectLog(42, 150, 30_000));
    if (!out.ok) throw new Error(out.error);
    expect(out.result.accuracy).toBe(100);
    expect(out.result.wpm).toBeGreaterThan(70);
    expect(out.result.wpm).toBeLessThan(90);
    expect(out.flags).toEqual([]);
  });

  it("counts typos and honours backspace", () => {
    const target = entryAt(1, 0)[0];
    const log: KeyEvent[] = [[0, "#"], [120, BACKSPACE], ...[...target].map((c, i): KeyEvent => [300 + i * 130 + (i % 3) * 17, c])];
    const out = replay(1, log);
    if (!out.ok) throw new Error(out.error);
    expect(out.result.errors).toBe(1);
    expect(out.result.sent).toBe(1);
  });

  it("sends a full line even with typos in it", () => {
    const target = entryAt(2, 0)[0];
    const log: KeyEvent[] = [...target].map((c, i): KeyEvent => [i * 130 + (i % 3) * 17, i === 2 ? "#" : c]);
    const out = replay(2, log);
    if (!out.ok) throw new Error(out.error);
    expect(out.result.sent).toBe(1);
    expect(out.result.errors).toBe(1);
  });

  it("ignores keys after the time limit", () => {
    const out = replay(42, perfectLog(42, 150, 60_000));
    const capped = replay(42, perfectLog(42, 150, 30_000));
    if (!out.ok || !capped.ok) throw new Error("replay failed");
    expect(out.result.wpm).toBe(capped.result.wpm);
  });

  it("flags impossible speed and robotic rhythm", () => {
    const fast = replay(3, perfectLog(3, 30, 30_000));
    expect(fast.ok && fast.flags).toContain("wpm over cap");
    const target = entryAt(3, 0)[0];
    const robot = replay(3, [...target].map((c, i): KeyEvent => [i * 100, c]));
    expect(robot.ok && robot.flags).toContain("robotic rhythm");
  });

  it("rejects malformed logs", () => {
    expect(replay(1, [[500, "a"], [100, "b"]]).ok).toBe(false);
    expect(replay(1, [[0, "ab"]]).ok).toBe(false);
  });
});

describe("diffToKeys", () => {
  it("handles appends, deletes and replacements", () => {
    expect(diffToKeys("ma", "mak")).toEqual(["k"]);
    expect(diffToKeys("make tu", "make ")).toEqual([BACKSPACE, BACKSPACE]);
    expect(diffToKeys("mat", "mak")).toEqual([BACKSPACE, "k"]);
  });
});

describe("usernameError", () => {
  it("accepts good names and rejects bad ones", () => {
    expect(usernameError("katip_kid")).toBeNull();
    expect(usernameError("ab")).not.toBeNull();
    expect(usernameError("Has Space")).not.toBeNull();
    expect(usernameError("admin")).not.toBeNull();
    expect(usernameError("g4go_boy")).not.toBeNull();
  });
});
