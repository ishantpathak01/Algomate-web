import Link from "next/link";
import type { Contest } from "@/types/contest";

export default function ContestCard({ contest }: { contest: Contest }) {
  return (
    <article className="rounded-2xl border border-line bg-card p-5">
      <p className="text-xs uppercase tracking-wide text-muted">{contest.status} · {contest.sponsorName}</p>
      <h2 className="mt-3 font-semibold">{contest.name}</h2>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{contest.description}</p>
      <p className="mt-4 text-xs text-muted">
        {new Date(contest.startsAt).toLocaleString()} – {new Date(contest.endsAt).toLocaleString()}
      </p>
      <Link
        href={`/contests/${encodeURIComponent(contest.id)}`}
        className="mt-5 inline-flex rounded-lg border border-line px-3 py-2 text-sm font-medium transition hover:border-brand"
      >
        View contest
      </Link>
    </article>
  );
}
