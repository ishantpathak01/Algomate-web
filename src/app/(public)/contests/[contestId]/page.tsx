"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PlatformApiError } from "@/lib/api/client";
import { platformApi } from "@/lib/api/endpoints";
import type { ContestApiRecord } from "@/types/api";
import type { LeaderboardEntry } from "@/types/contest";

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "full", timeStyle: "short" }).format(new Date(value));
}

export default function ContestDetailPage() {
  const { contestId } = useParams<{ contestId: string }>();
  const [contest, setContest] = useState<ContestApiRecord | null>(null);
  const [results, setResults] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void platformApi.contests.get(contestId).then((value) => {
      if (active) setContest(value);
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "Could not load this contest.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [contestId]);

  useEffect(() => {
    if (contest?.status !== "completed") return;
    let active = true;
    void platformApi.contests.leaderboard(contestId).then((value) => {
      if (active) setResults(value);
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof PlatformApiError ? reason.message : "Sign in to view the final leaderboard.");
    });
    return () => { active = false; };
  }, [contest?.status, contestId]);

  if (loading) return <main className="grid min-h-screen place-items-center bg-background text-sm text-muted">Loading contest…</main>;
  if (!contest) return <main className="mx-auto max-w-3xl px-5 py-20 text-center"><h1 className="text-xl font-semibold text-white">Contest unavailable</h1><p role="alert" className="mt-3 text-sm text-rose-300">{error || "This contest could not be found."}</p><Link href="/contests" className="mt-5 inline-flex rounded-xl border border-line px-4 py-2 text-sm text-white">Browse contests</Link></main>;

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/contests" className="text-sm text-brand-soft hover:text-white">← All contests</Link>
        <section className="mt-5 overflow-hidden rounded-3xl border border-line bg-card">
          {contest.bannerImageUrl && (
            // Contest banner hosts are supplied by mentors and are not configured as Next image domains.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={contest.bannerImageUrl} alt="" className="max-h-80 w-full object-cover" />
          )}
          <div className="p-6 sm:p-9">
            <div className="flex flex-wrap items-center justify-between gap-3"><span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-soft">{contest.status}</span><span className="text-xs text-muted">Organized by {contest.createdBy.name ?? "AlgoMate mentor"}</span></div>
            <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{contest.title}</h1>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted">{contest.description}</p>
            <dl className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Starts", dateLabel(contest.startsAt)],
                ["Ends", dateLabel(contest.endsAt)],
                ["Duration", `${contest.durationMinutes} minutes`],
                ["Participants", `${contest.participants} / ${contest.maxParticipants}`],
              ].map(([label, value]) => <div key={label} className="rounded-xl border border-line p-4"><dt className="text-xs text-muted">{label}</dt><dd className="mt-2 text-sm font-medium">{value}</dd></div>)}
            </dl>
            {contest.rules && <div className="mt-6 rounded-xl border border-line p-5"><h2 className="font-semibold">Contest rules</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">{contest.rules}</p></div>}
            <div className="mt-6 rounded-xl border border-line p-5"><h2 className="font-semibold">Prizes</h2>{contest.prizes.length ? <ul className="mt-3 space-y-2 text-sm text-muted">{contest.prizes.map((prize) => <li key={prize.place}><span className="font-semibold text-white">#{prize.place}</span> · {prize.description} · {prize.coins} coins</li>)}</ul> : <p className="mt-2 text-sm text-muted">No coin prizes have been configured.</p>}</div>
            <div className="mt-7 flex flex-wrap gap-3">
              {contest.status === "upcoming" || contest.status === "ongoing" ? <Link href={`/participate/${contest.id}`} className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-[#8b6cff]">Register / participate</Link> : <span className="rounded-xl border border-line px-5 py-3 text-sm text-muted">Contest completed</span>}
              <span className="self-center text-xs text-muted">{contest.questionIds.length} questions · {contest.prizeCoins} coins in prizes</span>
            </div>
          </div>
        </section>
        {contest.status === "completed" && <section className="mt-7 rounded-2xl border border-line bg-card p-5 sm:p-7"><h2 className="text-xl font-semibold">Final leaderboard</h2>{error && <p role="status" className="mt-3 text-sm text-amber-200">{error}</p>}{results.length ? <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead className="border-b border-line text-xs text-muted"><tr><th className="py-3">Rank</th><th>Participant</th><th>Score</th><th>Coins</th></tr></thead><tbody>{results.map((result) => <tr key={result.userId} className="border-b border-line/60"><td className="py-3">#{result.rank}</td><td>{result.username}</td><td>{result.score}</td><td>{result.coinsAwarded}</td></tr>)}</tbody></table></div> : !error && <p className="mt-3 text-sm text-muted">No final results are available yet.</p>}</section>}
      </div>
    </main>
  );
}
