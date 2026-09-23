"use client";

import { useEffect, useState } from "react";
import { preload, readPrefs, SWITCHES, writePrefs, type SoundPrefs, type Switch } from "./keySounds";

/** Sound on/off plus which switch to hear. Persists per browser. */
export function SoundToggle({ onChange }: { onChange: (p: SoundPrefs) => void }) {
  const [prefs, setPrefs] = useState<SoundPrefs>({ on: true, sw: "cream" });

  useEffect(() => {
    const p = readPrefs();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- prefs live in localStorage, which only exists on the client
    setPrefs(p);
    onChange(p);
    if (p.on) preload(p.sw);
  }, [onChange]);

  function update(next: SoundPrefs) {
    setPrefs(next);
    writePrefs(next);
    onChange(next);
    if (next.on) preload(next.sw);
  }

  const pick = (sw: Switch) => update({ on: true, sw });

  return (
    <div className="sound" role="group" aria-label="Keyboard sound">
      <span className="sound-label">Sound</span>
      <button type="button" aria-pressed={!prefs.on} onClick={() => update({ ...prefs, on: false })}>
        off
      </button>
      {(Object.keys(SWITCHES) as Switch[]).map((k) => (
        <button key={k} type="button" aria-pressed={prefs.on && prefs.sw === k} onClick={() => pick(k)}>
          {SWITCHES[k]}
        </button>
      ))}
    </div>
  );
}
