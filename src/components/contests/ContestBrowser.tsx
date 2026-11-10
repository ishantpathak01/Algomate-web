"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PlatformApiError } from "@/lib/api/client";
import { platformApi } from "@/lib/api/endpoints";
import type { ContestApiRecord } from "@/types/api";
import type { ContestStatus } from "@/types/contest";

const filters: Array<{ label: string; value: ContestStatus }> = [
  { label: "Upcoming", value: "upcoming" },
  { label: "Ongoing", value: "ongoing" },
  { label: "Past", value: "completed" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function ContestBrowser() {
  const [filter, setFilter] = useState<ContestStatus>("upcoming");
  const [search, setSearch] = useState("");
  const [contests, setContests] = useState<ContestApiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void platformApi.contests.list(filter, search.trim()).then((items) => {
      if (active) {
        setContests(items);
        setError("");
      }
    }).catch((reason: unknown) => {
      if (!active) return;
      setError(reason instanceof PlatformApiError ? reason.message : reason instanceof Error ? reason.message : "Could not load contests.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [filter, search]);

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div><p className="text-xs font-semibold uppercase tracking-widest text-brand-soft">AlgoMate contests</p><h1 className="mt-2 text-3xl font-semibold">Compete, learn, earn</h1><p className="mt-2 max-w-2xl text-sm text-muted">Explore upcoming challenges, join live contests, and review final results.</p></div>
          <label className="w-full sm:w-72"><span className="sr-only">Search contests</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search contests…" className="w-full rounded-xl border border-line bg-card px-4 py-3 text-sm text-white outline-none focus:border-brand/50" /></label>
        </div>
        <div className="mt-7 flex flex-wrap gap-2" role="tablist" aria-label="Contest status">
          {filters.map((item) => <button key={item.value} role="tab" aria-selected={filter === item.value} onClick={() => setFilter(item.value)} className={`rounded-full border px-4 py-2 text-sm ${filter === item.value ? "border-brand bg-brand/10 text-white" : "border-line text-muted hover:text-white"}`}>{item.label}</button>)}
        </div>
        {error && <p role="alert" className="mt-6 rounded-xl border border-rose-400/20 bg-rose-400/[0.06] p-4 text-sm text-rose-200">{error}</p>}
        {loading ? <p role="status" className="mt-10 text-sm text-muted">Loading contests…</p> : contests.length === 0 ? <p className="mt-10 rounded-2xl border border-line bg-card p-8 text-center text-sm text-muted">No contests match this view yet.</p> : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {contests.map((contest) => <article key={contest.id} className="overflow-hidden rounded-2xl border border-line bg-card transition hover:border-brand/40">
              {contest.bannerImageUrl && (
                // Contest banner hosts are supplied by mentors and are not configured as Next image domains.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={contest.bannerImageUrl} alt="" className="h-36 w-full object-cover" />
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3"><span className="rounded-full bg-brand/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-soft">{contest.status}</span><span className="text-xs text-muted">{contest.participants}/{contest.maxParticipants} participants</span></div>
                <h2 className="mt-4 text-lg font-semibold">{contest.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{contest.description}</p>
                <dl className="mt-4 space-y-2 border-t border-line pt-4 text-xs"><div className="flex justify-between gap-3"><dt className="text-muted">{contest.status === "completed" ? "Ended" : "Starts"}</dt><dd className="text-right text-white">{formatDate(contest.status === "completed" ? contest.endsAt : contest.startsAt)}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted">Duration · questions</dt><dd className="text-white">{contest.durationMinutes} min · {contest.questionIds.length}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted">Prize pool</dt><dd className="text-white">{contest.prizeCoins} coins</dd></div></dl>
                <Link href={`/contests/${contest.id}`} className="mt-5 inline-flex w-full justify-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#8b6cff]">{contest.status === "completed" ? "View results" : "View contest"}</Link>
              </div>
            </article>)}
          </div>
        )}
      </div>
    </main>
  );
}
