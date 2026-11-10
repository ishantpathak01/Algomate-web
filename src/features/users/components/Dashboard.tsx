"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import Logo from "@/components/ui/Logo";
import { platformApi } from "@/lib/api/endpoints";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: "home" as const, active: true },
  { label: "Contests", href: "/#contests", icon: "trophy" as const, active: false },
  { label: "Find a mentor", href: "/#mentors", icon: "users" as const, active: false },
];

const tasks = [
  { title: "Two Sum", category: "Arrays · Easy", progress: "15 min", color: "bg-emerald-400" },
  { title: "Valid Parentheses", category: "Stacks · Easy", progress: "20 min", color: "bg-amber-400" },
  { title: "Merge Intervals", category: "Arrays · Medium", progress: "30 min", color: "bg-brand-soft" },
];

export default function Dashboard() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <main className="grid min-h-screen place-items-center px-5 text-center">
        <p className="max-w-lg text-sm leading-6 text-muted">
          Configure <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> to use the authenticated dashboard.
        </p>
      </main>
    );
  }
  return <AuthenticatedDashboard />;
}

function AuthenticatedDashboard() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/login");
    }
    if (isLoaded && isSignedIn) {
      platformApi.auth.currentUser().then(
        () => setApiError(""),
        (error: unknown) =>
          setApiError(error instanceof Error ? error.message : "Could not sync your account with the API."),
      );
    }
  }, [isLoaded, isSignedIn, router, user?.id]);

  if (!isLoaded || !isSignedIn || !user) {
    return <main className="grid min-h-screen place-items-center text-sm text-muted">Loading your dashboard…</main>;
  }

  const name = user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress || "Student";

  return (
    <div className="min-h-screen bg-[#07070a]">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-black/90 px-5 backdrop-blur-md md:px-8">
        <Link href="/" aria-label="AlgoMate home"><Logo /></Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted sm:block">Welcome, {name}</span>
          <UserButton />
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl md:grid-cols-[220px_1fr]">
        <aside className="hidden min-h-[calc(100vh-4rem)] border-r border-line p-4 md:block">
          <p className="mb-3 px-3 pt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Workspace</p>
          <nav aria-label="Dashboard">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} aria-current={item.active ? "page" : undefined} className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${item.active ? "bg-brand/15 font-medium text-brand-soft" : "text-muted hover:bg-white/5 hover:text-white"}`}>
                <Icon name={item.icon} className="size-[18px]" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 rounded-2xl border border-brand/20 bg-brand/[0.07] p-4">
            <p className="text-sm font-semibold">Keep your streak going</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">One problem a day adds up. Your next solve is waiting.</p>
            <Link href="/#contests" className="mt-3 inline-block text-xs font-semibold text-brand-soft hover:underline">Explore contests →</Link>
          </div>
        </aside>

        <main className="min-w-0 px-5 py-8 md:px-9 md:py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-brand-soft">YOUR LEARNING SPACE</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Good to see you, {name.split(" ")[0]}.</h1>
              <p className="mt-2 text-sm text-muted">A little progress today goes a long way.</p>
            </div>
            <Link href="/#contests" className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold transition hover:bg-[#8b6cff]">Explore contests</Link>
          </div>

          {apiError && (
            <p role="alert" className="mt-5 rounded-xl border border-rose-400/20 bg-rose-400/5 p-4 text-sm text-rose-200">
              Signed in with Clerk, but account sync failed: {apiError}
            </p>
          )}

          <section aria-label="Your progress" className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Problems solved", value: "12", note: "Keep it up", icon: "code" as const },
              { label: "Current streak", value: "3 days", note: "Personal best: 7 days", icon: "home" as const },
              { label: "Contest rating", value: "1,240", note: "Getting stronger", icon: "trophy" as const },
              { label: "Coins earned", value: "180", note: "Use them for rewards", icon: "user" as const },
            ].map((stat) => (
              <article key={stat.label} className="rounded-2xl border border-line bg-card p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted">{stat.label}</p>
                  <Icon name={stat.icon} className="size-4 text-brand-soft" />
                </div>
                <p className="mt-4 text-2xl font-semibold">{stat.value}</p>
                <p className="mt-1 text-xs text-muted">{stat.note}</p>
              </article>
            ))}
          </section>

          <div className="mt-6 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
            <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold">Pick up your practice</h2>
                  <p className="mt-1 text-sm text-muted">Curated problems to sharpen your skills.</p>
                </div>
                <span className="rounded-full bg-brand/10 px-3 py-1 text-xs text-brand-soft">3 suggested</span>
              </div>
              <div className="mt-5 divide-y divide-line">
                {tasks.map((task) => (
                  <div key={task.title} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0">
                    <span className={`size-2 shrink-0 rounded-full ${task.color}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{task.title}</p>
                      <p className="mt-1 text-xs text-muted">{task.category}</p>
                    </div>
                    <span className="text-xs text-muted">{task.progress}</span>
                    <Icon name="trophy" className="size-4 text-muted" />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
              <h2 className="font-semibold">Your weekly goal</h2>
              <p className="mt-1 text-sm text-muted">Solve 5 problems this week.</p>
              <div className="mt-6 flex items-end justify-between">
                <p className="text-3xl font-semibold">3<span className="text-base text-muted"> / 5</span></p>
                <p className="text-xs text-brand-soft">2 to go</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-3/5 rounded-full bg-brand" />
              </div>
              <p className="mt-5 rounded-xl border border-line bg-white/[0.02] p-3 text-xs leading-relaxed text-muted">
                Demo dashboard: progress and stats are sample data and are not saved to an account.
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
