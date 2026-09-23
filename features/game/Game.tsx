"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { DURATION_S } from "@/lib/scenarios";
import { play, type KeyKind, type SoundPrefs } from "./keySounds";
import { ClaimBar } from "./ClaimBar";
import { HOME_EVENT } from "./HomeLink";
import { Prompt } from "./Prompt";
import { SoundToggle } from "./SoundToggle";
import { Results } from "./Results";
import { useTypingGame } from "./useTypingGame";

export function Game() {
  const game = useTypingGame();
  const { view, phase, reset } = game;
  const typer = useRef<HTMLInputElement>(null);
  const draft = useRef<HTMLDivElement>(null);
  const caret = useRef<HTMLElement>(null);
  const restartBtn = useRef<HTMLButtonElement>(null);

  // mechanical keyboard sounds: one per keystroke, a heavier one when a line sends
  const sound = useRef<SoundPrefs>({ on: false, sw: "cream" });
  const onSoundChange = useCallback((p: SoundPrefs) => {
    sound.current = p;
  }, []);
  const click = (kind: KeyKind) => sound.current.on && play(sound.current.sw, kind);
  const lastSent = useRef(0);
  useEffect(() => {
    const sent = view?.sent ?? 0;
    if (sent > lastSent.current) click("enter");
    lastSent.current = sent;
  }, [view?.sent]);

  const over = phase === "over";
  // until the first key: the headline sits in the timer slot and the bottom controls stay hidden
  const [engaged, setEngaged] = useState(false);
  // while going home the panel content fades out, resets, and fades back in
  const [swapping, setSwapping] = useState(false);
  const focusTyper = () => typer.current?.focus({ preventScroll: true });

  const needsClaim = over && game.submission.status === "needsClaim";

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // esc restarts; enter on the results screen starts the next test
      if (e.key === "Escape" || (e.key === "Enter" && over)) {
        e.preventDefault();
        reset();
        focusTyper();
      } else if (e.key === "Tab" && !e.shiftKey && !(document.activeElement instanceof HTMLInputElement && document.activeElement !== typer.current)) {
        // monkeytype's tab + enter: tab lands on Restart, enter presses it; any letter goes straight back to typing
        e.preventDefault();
        restartBtn.current?.focus();
      } else if (
        !over &&
        !(document.activeElement instanceof HTMLInputElement) &&
        e.key.length === 1 &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        focusTyper();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [over, reset]);

  // one caret that glides to the current character instead of a per-character marker that teleports
  const caretKey = over ? game.nextTarget : `${view?.target}|${view?.value}`;
  useLayoutEffect(() => {
    const c = caret.current;
    const cur = draft.current?.querySelector<HTMLElement>(".ch.cur");
    if (!c || !cur) return;
    c.style.transform = `translate(${cur.offsetLeft}px, ${cur.offsetTop}px)`;
    c.style.height = `${cur.offsetHeight}px`;
    // restart the blink so the caret is solid while you're typing
    c.classList.remove("blink");
    void c.offsetWidth;
    c.classList.add("blink");
  }, [caretKey]);

  // back to the landing look with a fresh run: the wordmark / Play link, or erasing everything you typed
  const goHome = useCallback(() => {
    setEngaged(false);
    setSwapping(true);
    // let the clock fade and the headline start growing back before the conversation changes underneath
    setTimeout(() => {
      reset();
      setSwapping(false);
    }, 380);
  }, [reset]);

  // erased everything before sending a line: back to the headline, but the same conversation stays put
  const { restartSame } = game;
  const backOff = useCallback(() => {
    setEngaged(false);
    restartSame();
  }, [restartSame]);

  useEffect(() => {
    window.addEventListener(HOME_EVENT, goHome);
    return () => window.removeEventListener(HOME_EVENT, goHome);
  }, [goHome]);

  // a finished run drops focus so a stray key can't instantly start the next one; click the box (or press Enter) to go again
  useEffect(() => {
    if (over) typer.current?.blur();
  }, [over]);

  useEffect(() => {
    if (phase === "idle") focusTyper();
  }, [phase, view?.target]);

  function shake() {
    const el = draft.current;
    if (!el) return;
    el.classList.remove("shake");
    void el.offsetWidth;
    el.classList.add("shake");
  }

  return (
    <>
      {needsClaim && game.localResult && <ClaimBar wpm={game.submission.status === "needsClaim" ? game.submission.result.wpm : game.localResult.wpm} onClaim={game.claim} />}
      {/* the headline and the timer share one slot: the first key crossfades the headline into the clock */}
      <div className={`top-slot${engaged ? " engaged" : ""}${needsClaim ? " gone" : ""}`}>
        <div className="hero-wrap">
          <h1 className="hero-title rise" aria-hidden={engaged}>
            Okayyy but like,{" "}
            <br className="hero-br" />
            can you make <em>chika</em> fast?
          </h1>
        </div>
        <div className="stats-wrap">
      <div className={`stats${phase === "running" ? "" : " hidden-stats"}`} aria-hidden={phase !== "running"}>
        <div className={`stat time${phase === "running" && (view?.timeLeft ?? 99) <= 10 ? " low" : ""}`}>
          <b>
            {(view?.timeLeft ?? DURATION_S).toFixed(2)}
            <small>s</small>
          </b>
        </div>
      </div>
        </div>
      </div>

      <section className={`chat${swapping ? " swapping" : ""}`} onClick={() => focusTyper()}>
        {over && game.localResult ? (
          <Results localResult={game.localResult} submission={game.submission} />
        ) : (
          <div className="thread">
            {game.thread.map((m) => (
              <div key={m.id} className={`msg ${m.kind}`}>
                {m.who && <b>{m.who}</b>}
                {m.text}
              </div>
            ))}
          </div>
        )}
        <div className="compose">
              <div className="draft" ref={draft}>
                {/* keyed per line so each new sentence slides in instead of swapping in place */}
                <span key={over ? "next" : `${view?.sent ?? 0}:${view?.target ?? ""}`} className="line-in">
                  <Prompt target={over ? game.nextTarget : (view?.target ?? "")} value={over ? "" : (view?.value ?? "")} />
                  <i ref={caret} className="caret2" aria-hidden="true" />
                </span>
                <input
                  id="typer"
                  ref={typer}
                  type="text"
                  value={over ? "" : (view?.value ?? "")}
                  onChange={(e) => {
                    if (!engaged) setEngaged(true);
                    if (over ? game.startNext(e.target.value) : game.onInput(e.target.value)) shake();
                    // backspaced all the way to nothing before sending a line: forget the run, back to the headline
                    if (!over && e.target.value === "" && (view?.sent ?? 0) === 0) backOff();
                  }}
                  onPaste={(e) => e.preventDefault()}
                  onKeyDown={(e) => {
                    if (e.key === " ") click("space");
                    else if (e.key === "Backspace") click("backspace");
                    else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) click("key");
                  }}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-label="Type the message shown"
                />
              </div>
        </div>
      </section>
      <div className={`actions${engaged ? " on" : ""}`} aria-hidden={!engaged}>
        <SoundToggle onChange={onSoundChange} />
        <button
          ref={restartBtn}
          type="button"
          className="restart"
          onClick={() => {
            reset();
            focusTyper();
          }}
        >
          Restart<kbd>esc</kbd>
          <kbd>tab + enter</kbd>
        </button>
      </div>
    </>
  );
}
