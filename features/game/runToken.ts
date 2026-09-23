export interface RunToken {
  runId: string;
  sh: string; // secret hash of the browser that started the run
  seed: number;
  startedAt: number;
  v: number; // PHRASE_SET_VERSION
}

export const TOKEN_TTL_MS = 60 * 60 * 1000;
// a run can't be submitted before its duration has passed on the server clock
export const EARLY_FINISH_TOLERANCE_MS = 1500;
