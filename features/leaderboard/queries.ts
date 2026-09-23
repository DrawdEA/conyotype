import { count, desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { bests, players } from "@/db/schema";

export interface BoardRow {
  id: string;
  username: string;
  school: string | null;
  wpm: number;
  accuracy: number;
  at: number;
}

export const PAGE_SIZE = 25;

/** All-time board: one row per player, their best qualifying run. */
export async function getBoard(page: number): Promise<{ rows: BoardRow[]; total: number }> {
  const db = getDb();
  const [rows, [{ total }]] = await Promise.all([
    db
      .select({ id: bests.runId, username: players.username, school: players.school, wpm: bests.wpm, accuracy: bests.accuracy, at: bests.achievedAt })
      .from(bests)
      .innerJoin(players, eq(players.id, bests.playerId))
      .orderBy(desc(bests.wpm), bests.achievedAt)
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(bests),
  ]);
  return { rows, total };
}
