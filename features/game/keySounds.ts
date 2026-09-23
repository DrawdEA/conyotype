"use client";

/**
 * Mechanical keyboard sounds via Web Audio. Samples: kbsim (MIT), see public/sounds/LICENSE.txt.
 * Everything is lazy: nothing loads or plays until the player types with sound on.
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

let ctx: AudioContext | null = null;
let keptAlive = false;
const buffers = new Map<string, Promise<AudioBuffer | null>>();

function context(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/**
 * Bluetooth headphones and some speakers close the output stream after a moment of silence and take up to a second
 * to reopen, swallowing the first clicks after every pause. A silent looping source keeps the stream open.
 */
function keepAlive(ac: AudioContext) {
  if (keptAlive) return;
  keptAlive = true;
  const buf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); // one second of zeros
  const src = ac.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const gain = ac.createGain();
  gain.gain.value = 0; // silent: the open stream is what keeps the device awake, not the samples
  src.connect(gain).connect(ac.destination);
  src.start();
}

function load(sw: Switch, file: string): Promise<AudioBuffer | null> {
  const url = `/sounds/${sw}/${file}.mp3`;
  let p = buffers.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => r.arrayBuffer())
      .then((b) => context()?.decodeAudioData(b) ?? null)
      .catch(() => null);
    buffers.set(url, p);
  }
  return p;
}

let gestureHooked = false;

/** Warm the cache so the first keystroke isn't late. */
export function preload(sw: Switch) {
  for (const files of Object.values(FILES)) for (const f of files) void load(sw, f);
  // Safari only resumes a suspended context from a "real" gesture and doesn't always count keydown as one,
  // so the first click/tap anywhere (you click the box before typing) wakes it up
  if (!gestureHooked && typeof window !== "undefined") {
    gestureHooked = true;
    const wake = () => {
      const ac = context();
      if (ac) {
        void ac.resume();
        keepAlive(ac);
      }
    };
    window.addEventListener("pointerdown", wake, { passive: true });
    window.addEventListener("keydown", wake, { passive: true });
  }
}

export function play(sw: Switch, kind: KeyKind, volume = 0.5) {
  const ac = context();
  if (!ac) return;
  keepAlive(ac);
  const files = FILES[kind];
  const file = files[Math.floor(Math.random() * files.length)];
  void load(sw, file).then((buf) => {
    if (!buf) return;
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
