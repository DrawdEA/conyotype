"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { normalizeSchool, normalizeUsername, schoolError, usernameError } from "@/lib/username";

interface Props {
  wpm: number;
  onClaim: (username: string, school: string) => Promise<string | null>;
}

/** Sits above the chat panel after a first run: a name, a school, one button. Keys inside it never reach the game. */
export function ClaimBar({ wpm, onClaim }: Props) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [school, setSchool] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const name = normalizeUsername(username);
    const tag = normalizeSchool(school);
    const err = usernameError(name) ?? schoolError(tag);
    if (err) return setError(err);
    setBusy(true);
    const serverErr = await onClaim(name, tag);
    setBusy(false);
    if (serverErr) return setError(serverErr);
    router.refresh(); // header shows the new name
  }

  return (
    <form className="claim-bar rise" onSubmit={submit} onKeyDown={(e) => e.stopPropagation()}>
      <span className="claim-bar-label">
        Post your <b>{wpm} wpm</b> to the board
      </span>
      <input
        id="claim-username"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          setError(null);
        }}
        placeholder="username"
        maxLength={16}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Username"
      />
      <input
        id="claim-school"
        value={school}
        onChange={(e) => {
          setSchool(e.target.value);
          setError(null);
        }}
        placeholder="school, like admu or dlsu"
        maxLength={20}
        autoComplete="off"
        spellCheck={false}
        aria-label="School"
      />
      <button type="submit" disabled={busy || username.length < 3 || school.length < 2}>
        {busy ? "Posting…" : "Post"}
      </button>
      {error && <p className="claim-bar-error">{error}</p>}
    </form>
  );
}
