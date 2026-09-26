"use client";

/**
 * Mechanical keyboard sounds via Web Audio. Samples: kbsim (MIT), see public/sounds/LICENSE.txt.
 * Everything is lazy: nothing loads or plays until the player types with sound on.
 *
 * Safari needs babysitting: its MP3 decoder rejects valid files (so the samples are WAV), its context gets
 * "interrupted" or silently stuck when the window loses focus, and only a real gesture may resume it.
 */

export const SWITCHES = {
  cream: "creams",
  mxbrown: "browns",
  holypanda: "pandas",
} as const;
export type Switch = keyof typeof SWITCHES;
export type KeyKind = "key" | "space" | "backspace" | "enter";

const FILES: Record<KeyKind, string[]> = {
  key: ["GENERIC_R0", "GENERIC_R1", "GENERIC_R2", "GENERIC_R3", "GENERIC_R4"],
  space: ["SPACE"],
  backspace: ["BACKSPACE"],
  enter: ["ENTER"],
};

const STORAGE = "ct-sound";
export interface SoundPrefs {
  on: boolean;
  sw: Switch;
}
const DEFAULT_PREFS: SoundPrefs = { on: true, sw: "cream" };

export function readPrefs(): SoundPrefs {
  try {
    const raw = localStorage.getItem(STORAGE);
    if (!raw) return DEFAULT_PREFS;
    const p = JSON.parse(raw) as Partial<SoundPrefs>;
    return { on: p.on ?? DEFAULT_PREFS.on, sw: p.sw && p.sw in SWITCHES ? p.sw : DEFAULT_PREFS.sw };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function writePrefs(p: SoundPrefs) {
  try {
    localStorage.setItem(STORAGE, JSON.stringify(p));
  } catch {}
}

// --- audio context lifecycle ------------------------------------------------

let ctx: AudioContext | null = null;
let keepAliveNode: AudioBufferSourceNode | null = null;
const raw = new Map<string, Promise<ArrayBuffer | null>>(); // fetched bytes, context-independent
const decoded = new Map<string, AudioBuffer>(); // per current context; cleared when the context is rebuilt

function newContext(): AudioContext {
  const ac = new AudioContext();
  decoded.clear();
  keepAliveNode = null;
  ac.addEventListener("statechange", () => {
    if (ac.state !== "running") void ac.resume();
  });
  return ac;
}

function context(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = newContext();
  if (ctx.state !== "running") void ctx.resume();
  return ctx;
}

/** Silent loop: keeps the output stream open so Bluetooth headphones don't doze off and Safari doesn't idle-suspend. */
function keepAlive(ac: AudioContext) {
  if (keepAliveNode) return;
  const buf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
  const src = ac.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const gain = ac.createGain();
  gain.gain.value = 0;
  src.connect(gain).connect(ac.destination);
  src.start();
  keepAliveNode = src;
}

/**
 * Safari sometimes reports "running" while its clock has stopped (and "interrupted" can't be resumed at all).
 * Poll the clock; if it stalls, suspend+resume; if that doesn't help, build a fresh context.
 */
let watchdog = 0;
let lastTime = -1;
let stalledTicks = 0;
function startWatchdog() {
  if (watchdog) return;
  watchdog = window.setInterval(() => {
    const ac = ctx;
    if (!ac) return;
    if (ac.state !== "running") {
      void ac.resume();
      return;
    }
    if (ac.currentTime === lastTime) {
      stalledTicks++;
      if (stalledTicks === 3) void ac.suspend().then(() => ac.resume());
      if (stalledTicks >= 8) {
        // give up on this one
        void ac.close().catch(() => {});
        ctx = newContext();
        keepAlive(ctx);
        stalledTicks = 0;
      }
    } else stalledTicks = 0;
    lastTime = ac.currentTime;
  }, 500);
}

let gestureHooked = false;
function hookGestures() {
  if (gestureHooked || typeof window === "undefined") return;
  gestureHooked = true;
  const wake = () => {
    const ac = context();
    if (ac) keepAlive(ac);
  };
  // Safari only resumes from a "real" gesture and doesn't always count keydown as one
  window.addEventListener("pointerdown", wake, { passive: true });
  window.addEventListener("keydown", wake, { passive: true });
  // and it parks the context whenever the window goes to the background
  document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && wake());
  window.addEventListener("focus", wake);
  window.addEventListener("pageshow", wake);
}

// --- samples -----------------------------------------------------------------

function fetchBytes(sw: Switch, file: string): Promise<ArrayBuffer | null> {
  const url = `/sounds/${sw}/${file}.wav`;
  let p = raw.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => (r.ok ? r.arrayBuffer() : null))
      .catch(() => null);
    raw.set(url, p);
    // a failed fetch shouldn't poison the cache forever
    void p.then((b) => b === null && raw.delete(url));
  }
  return p;
}

/** Promise form first; Safari occasionally rejects there but succeeds with the old callback signature. */
function decode(ac: AudioContext, bytes: ArrayBuffer): Promise<AudioBuffer | null> {
  return new Promise((resolve) => {
    const copy = bytes.slice(0); // decodeAudioData detaches the buffer it's given
    ac.decodeAudioData(copy).then(resolve, () => {
      try {
        ac.decodeAudioData(
          bytes.slice(0),
          (b) => resolve(b),
          () => resolve(null),
        );
      } catch {
        resolve(null);
      }
    });
  });
}

async function load(ac: AudioContext, sw: Switch, file: string): Promise<AudioBuffer | null> {
  const key = `${sw}/${file}`;
  const hit = decoded.get(key);
  if (hit) return hit;
  const bytes = await fetchBytes(sw, file);
  if (!bytes) return null;
  const buf = await decode(ac, bytes);
  if (buf && ctx === ac) decoded.set(key, buf);
  return buf;
}

/** Warm the caches so the first keystroke isn't late. */
export function preload(sw: Switch) {
  hookGestures();
  const ac = context();
  if (!ac) return;
  startWatchdog();
  for (const files of Object.values(FILES)) for (const f of files) void load(ac, sw, f);
}

export function play(sw: Switch, kind: KeyKind, volume = 0.5) {
  const ac = context();
  if (!ac) return;
  keepAlive(ac);
  startWatchdog();
  const files = FILES[kind];
  const pick = files[Math.floor(Math.random() * files.length)];
  void load(ac, sw, pick).then(async (buf) => {
    // if this one file won't decode, any sibling sample beats silence
    if (!buf) for (const alt of files) if ((buf = await load(ac, sw, alt))) break;
    if (!buf || ctx !== ac) return;
    const src = ac.createBufferSource();
    src.buffer = buf;
    // a little pitch jitter so a fast run doesn't sound like a machine gun
    src.playbackRate.value = 0.94 + Math.random() * 0.12;
    const gain = ac.createGain();
    gain.gain.value = volume;
    src.connect(gain).connect(ac.destination);
    src.start();
  });
}
