import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const players = sqliteTable("players", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(), // always lowercase, see lib/username.ts
  school: text("school"), // short canonical tag like "ADMU", see lib/username.ts
  secretHash: text("secret_hash").notNull().unique(),
  createdAt: integer("created_at").notNull(),
});

export const runs = sqliteTable(
  "runs",
  {
    id: text("id").primaryKey(), // runId from the signed start token; PK blocks replays
    playerId: text("player_id").notNull().references(() => players.id),
    wpm: integer("wpm").notNull(),
    rawWpm: integer("raw_wpm").notNull(),
    accuracy: integer("accuracy").notNull(),
    errors: integer("errors").notNull(),
    sent: integer("sent").notNull(),
    flagged: integer("flagged", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [index("runs_player_idx").on(t.playerId, t.createdAt), index("runs_board_idx").on(t.flagged, t.accuracy, t.wpm)],
);

/** One row per player: their best unflagged run. Powers the leaderboard. */
export const bests = sqliteTable(
  "bests",
  {
    playerId: text("player_id").primaryKey().references(() => players.id),
    wpm: integer("wpm").notNull(),
    accuracy: integer("accuracy").notNull(),
    runId: text("run_id").notNull().references(() => runs.id),
    achievedAt: integer("achieved_at").notNull(),
  },
  (t) => [index("bests_wpm_idx").on(t.wpm)],
);
