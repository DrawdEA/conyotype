import type { Metadata } from "next";
import Link from "next/link";
import { currentPlayer } from "@/features/identity/player";
import { getBoard, PAGE_SIZE } from "@/features/leaderboard/queries";

export const metadata: Metadata = { title: "Leaderboard" };

const manila = new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", month: "short", day: "numeric" });

export default async function LeaderboardPage({ searchParams }: PageProps<"/leaderboard">) {
  const raw = Number((await searchParams).page);
  const page = Number.isInteger(raw) && raw > 0 ? raw : 1;
  const [{ rows, total }, me] = await Promise.all([getBoard(page), currentPlayer()]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="page">
      <h1>Leaderboard</h1>
      {rows.length === 0 ? (
        <p className="empty">
          {page > 1 ? "Nothing on this page." : "No one here yet."} <Link href={page > 1 ? "/leaderboard" : "/"}>{page > 1 ? "Back to the top." : "Be the first, dude."}</Link>
        </p>
      ) : (
        <div className="table-wrap">
          <table className="board">
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th className="num">WPM</th>
                <th className="num">Acc</th>
                <th className="when">When</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className={`row-in${r.username === me?.username ? " me" : ""}`} style={{ animationDelay: `${Math.min(i, 12) * 45}ms` }}>
                  <td className="pos">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td>
                    @{r.username}
                    {r.school && <span className="school">{r.school}</span>}
                  </td>
                  <td className="num wpm">{r.wpm}</td>
                  <td className="num">{r.accuracy}%</td>
                  <td className="when">{manila.format(r.at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pages > 1 && (
        <nav className="pager" aria-label="Pages">
          {page > 1 ? <Link href={`/leaderboard?page=${page - 1}`}>← Prev</Link> : <span />}
          <span>
            Page {page} of {pages}
          </span>
          {page < pages ? <Link href={`/leaderboard?page=${page + 1}`}>Next →</Link> : <span />}
        </nav>
      )}
    </main>
  );
}
