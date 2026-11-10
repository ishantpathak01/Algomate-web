import Link from "next/link";
import type { DashboardContest } from "@/features/users/types/dashboard";
import DashboardIcon from "./DashboardIcon";

const difficultyStyle = {
  Beginner: "bg-emerald-400/10 text-emerald-300",
  Intermediate: "bg-amber-400/10 text-amber-300",
  Advanced: "bg-rose-400/10 text-rose-300",
};

function formatStart(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function UpcomingContests({ contests }: { contests: DashboardContest[] }) {
  return (
    <section className="rounded-2xl border border-line bg-card p-5 shadow-sm shadow-black/20 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white">Upcoming contests</h2>
          <p className="mt-1 text-xs text-muted">Your next opportunities to compete and earn.</p>
        </div>
        <Link href="/student/contests" className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-brand-soft hover:text-white">
          View all <DashboardIcon name="arrow" className="size-3.5" />
        </Link>
      </div>
      {contests.length === 0 ? (
        <p className="mt-6 rounded-xl bg-white/[0.03] p-5 text-center text-sm text-muted">
          No upcoming contests are available right now.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {contests.map((contest) => (
            <article key={contest.id} className="rounded-xl border border-line p-4 transition hover:border-brand/40 hover:bg-brand/[0.04]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{contest.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${difficultyStyle[contest.difficulty]}`}>
                      {contest.difficulty}
                    </span>
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                    <DashboardIcon name="clock" className="size-3.5" />
                    {formatStart(contest.startsAt)} <span className="text-white/20">·</span> {contest.durationMinutes} min
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-300">
                    <DashboardIcon name="coin" className="size-3.5" />
                    Up to {contest.coinReward.toLocaleString()} coins
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                  contest.registrationStatus === "registered"
                    ? "bg-blue-400/10 text-blue-300"
                    : "bg-white/[0.06] text-muted"
                }`}>
                  {contest.registrationStatus === "registered" ? "Registered" : "Registration open"}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/contests/${encodeURIComponent(contest.id)}`} className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-muted transition hover:border-brand/50 hover:text-white">
                  View details
                </Link>
                <Link
                  href={contest.registrationStatus === "registered"
                    ? `/participate/${encodeURIComponent(contest.id)}`
                    : `/contests/${encodeURIComponent(contest.id)}`}
                  className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#8b6cff]"
                >
                  {contest.registrationStatus === "registered" ? "Participate" : "Register"}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
