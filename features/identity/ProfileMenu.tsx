"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

interface Props {
  username: string;
  school: string | null;
}

/** The "@name" in the header: click to rename or change school. */
export function ProfileMenu({ username, school }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(username);
  const [sch, setSch] = useState(school ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // click outside closes it (Escape is handled on the form itself, so the game's Esc-to-restart never sees it)
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/players/me", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: name, school: sch }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) return setError(data.error ?? "Something went wrong");
      setOpen(false);
      router.refresh();
    } catch {
      setError("You're offline");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="profile" ref={box}>
      <button type="button" className="profile-name" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        @{username}
      </button>
      {open && (
        <form
          className="profile-menu rise"
          onSubmit={save}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <label>
            <span>Username</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={16} autoComplete="off" autoCapitalize="off" spellCheck={false} autoFocus />
          </label>
          <label>
            <span>School</span>
            <input value={sch} onChange={(e) => setSch(e.target.value)} placeholder="admu, dlsu, up…" maxLength={20} autoComplete="off" spellCheck={false} />
          </label>
          {error && <p className="claim-bar-error">{error}</p>}
          <div className="profile-actions">
            <button type="button" className="restart" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={busy || name.trim().length < 3 || sch.trim().length < 2}>
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
