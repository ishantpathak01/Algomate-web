import Link from "next/link";
import type { DashboardProfile } from "@/features/users/types/dashboard";
import DashboardIcon from "./DashboardIcon";

export default function WelcomeSection({ profile }: { profile: DashboardProfile }) {
  const firstName = profile.name.trim().split(/\s+/)[0] || "there";

  return (
    <section className="flex flex-col justify-between gap-5 rounded-3xl border border-line bg-card p-5 shadow-sm shadow-black/20 sm:flex-row sm:items-center sm:p-7">
      <div className="flex items-center gap-4">
        {profile.profileImage ? (
          // Profile images are supplied by Clerk or the profile service.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.profileImage} alt="" className="size-14 shrink-0 rounded-2xl object-cover" />
        ) : (
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand/20 text-xl font-bold text-brand-soft">
            {firstName.charAt(0).toUpperCase()}
          </span>
        )}
        <div>
          <p className="text-sm font-medium text-brand-soft">YOUR LEARNING SPACE</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-[28px]">
            Welcome back, {firstName}!
          </h1>
          <p className="mt-1 text-sm text-muted">Small steps today. Big wins in your next contest.</p>
          {profile.college && <p className="mt-1 text-xs text-muted">{profile.college}</p>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 sm:justify-end">
        <Link href="/student/contests" className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#8b6cff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
          <DashboardIcon name="contest" className="size-4" />
          Explore contests
        </Link>
        <Link href="/mentors" className="inline-flex items-center gap-2 rounded-xl border border-line bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-muted transition hover:border-brand/50 hover:bg-brand/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
          <DashboardIcon name="mentors" className="size-4" />
          Find mentors
        </Link>
      </div>
    </section>
  );
}
