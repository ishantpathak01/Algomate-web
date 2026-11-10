import Link from "next/link";
import type { DashboardContestResult } from "@/features/users/types/dashboard";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export default function RecentContests({ contests }: { contests: DashboardContestResult[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm shadow-black/20">
      <div className="flex items-center justify-between gap-3 p-5 sm:px-6">
        <div>
          <h2 className="text-base font-bold text-white">Recent contest activity</h2>
          <p className="mt-1 text-xs text-muted">Your latest scores and results.</p>
        </div>
        <Link href="/student/history" className="whitespace-nowrap text-xs font-semibold text-brand-soft hover:text-white">Full history →</Link>
      </div>
      {contests.length === 0 ? (
        <p className="mx-5 mb-5 rounded-xl bg-white/[0.03] p-5 text-center text-sm text-muted">Your contest results will show here.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-xs">
            <thead className="border-y border-line bg-white/[0.02] text-[10px] uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-6 py-3 font-semibold">Contest</th>
                <th scope="col" className="px-4 py-3 font-semibold">Date</th>
                <th scope="col" className="px-4 py-3 font-semibold">Score</th>
                <th scope="col" className="px-4 py-3 font-semibold">Rank</th>
                <th scope="col" className="px-4 py-3 font-semibold">Coins</th>
                <th scope="col" className="px-6 py-3 font-semibold">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {contests.map((contest) => (
                <tr key={contest.id} className="transition hover:bg-white/[0.03]">
                  <td className="px-6 py-4 font-semibold text-white">{contest.title}</td>
                  <td className="px-4 py-4 text-muted">{formatDate(contest.date)}</td>
                  <td className="px-4 py-4 font-semibold text-white/80">{contest.score}%</td>
                  <td className="px-4 py-4 text-muted">#{contest.rank}</td>
                  <td className="px-4 py-4 font-semibold text-amber-300">+{contest.coinsEarned}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      contest.status === "Won" ? "bg-emerald-400/10 text-emerald-300" : "bg-white/[0.06] text-muted"
                    }`}>{contest.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
