"use client";

import { verdictFor } from "@/lib/verdict";
import type { RunResult } from "@/lib/replay";
import type { Submission } from "./useTypingGame";

interface Props {
  localResult: RunResult;
  submission: Submission;
}

export function Results({ localResult, submission }: Props) {
  // once the server has replayed the log, its numbers are the real ones
  const result = submission.status === "saved" || submission.status === "needsClaim" ? submission.result : localResult;

  return (
    <div className="result">
      <h2>{verdictFor(result.wpm)}</h2>
      <dl className="result-stats">
        {(
          [
            [result.wpm, "wpm"],
            [`${result.accuracy}%`, "accuracy"],
            [result.sent, "sent"],
            [result.errors, "typos"],
          ] as const
        ).map(([value, label]) => (
          <div key={label}>
            <dd>{value}</dd>
            <dt>{label}</dt>
          </div>
        ))}
      </dl>
      {submission.status === "error" && <p className="status bad">{submission.message}</p>}
    </div>
  );
}
