import Link from "next/link";
import type { DashboardMentor } from "@/features/users/types/dashboard";
import DashboardIcon from "./DashboardIcon";

export default function RecommendedMentors({ mentors }: { mentors: DashboardMentor[] }) {
  return (
    <section className="rounded-2xl border border-line bg-card p-5 shadow-sm shadow-black/20 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white">Recommended mentors</h2>
          <p className="mt-1 text-xs text-muted">Learn from people who have been there.</p>
        </div>
        <Link href="/mentors" className="whitespace-nowrap text-xs font-semibold text-brand-soft hover:text-white">Explore all →</Link>
      </div>
      {mentors.length === 0 ? (
        <p className="mt-5 rounded-xl bg-white/[0.03] p-5 text-center text-sm text-muted">Mentor recommendations will appear here.</p>
      ) : (
        <div className="mt-5 space-y-3">
          {mentors.map((mentor) => (
            <article key={mentor.id} className="rounded-xl border border-line p-4 transition hover:border-brand/40 hover:bg-brand/[0.04]">
              <div className="flex items-start gap-3">
                {mentor.profileImage ? (
                  // Mentor image URL comes from the API.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mentor.profileImage} alt="" className="size-11 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand/15 text-sm font-bold text-brand-soft">
                    {mentor.name.trim().charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-white">{mentor.name}</h3>
                  <p className="mt-0.5 truncate text-xs text-muted">{mentor.organization}</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-300">★ {mentor.rating.toFixed(1)}</span>
              </div>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {mentor.skills.slice(0, 3).map((skill) => (
                  <li key={skill} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] font-medium text-muted">{skill}</li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1 text-xs font-medium text-amber-300">
                  <DashboardIcon name="coin" className="size-3.5" />
                  {mentor.coinsPerSession} coins / session
                </span>
                <Link href={`/mentors/${encodeURIComponent(mentor.id)}`} className="rounded-lg border border-line px-3 py-1.5 text-[11px] font-semibold text-muted transition hover:border-brand/50 hover:text-white">
                  View profile
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
