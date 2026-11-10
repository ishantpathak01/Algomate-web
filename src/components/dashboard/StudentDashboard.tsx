"use client";

import Link from "next/link";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import type { DashboardResult, StudentDashboardData } from "@/features/users/types/dashboard";
import { getStudentDashboard } from "@/features/users/services/dashboard";
import { setAccessTokenGetter } from "@/lib/api/client";
import { platformApi } from "@/lib/api/endpoints";
import DashboardHeader from "./DashboardHeader";
import DashboardIcon from "./DashboardIcon";
import DashboardSidebar from "./DashboardSidebar";
import PerformanceChart from "./PerformanceChart";
import RecentActivity from "./RecentActivity";
import RecentContests from "./RecentContests";
import RecommendedMentors from "./RecommendedMentors";
import StatsCards from "./StatsCards";
import UpcomingContests from "./UpcomingContests";
import WelcomeSection from "./WelcomeSection";

type DashboardState =
  | { status: "loading" }
  | {
      status: "ready";
      result: DashboardResult;
      accountWarning?: string;
    }
  | { status: "error"; message: string };

function getDisplayName(data: StudentDashboardData, clerkName?: string | null) {
  return data.profile.name || clerkName || "Student";
}

export default function StudentDashboard() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-5 text-center text-foreground">
        <div className="max-w-lg rounded-2xl border border-line bg-card p-8 shadow-sm">
          <h1 className="text-xl font-bold text-white">Sign-in setup required</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Configure the Clerk publishable key and secret key in your local environment to open the student dashboard.
          </p>
          <Link href="/login" className="mt-5 inline-flex rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8b6cff]">
            Go to sign in
          </Link>
        </div>
      </main>
    );
  }
  return <AuthenticatedStudentDashboard />;
}

function AuthenticatedStudentDashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const [state, setState] = useState<DashboardState>({ status: "loading" });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchDashboard = useCallback(async (): Promise<DashboardState> => {
    setAccessTokenGetter(getToken);
    try {
      const [accountResult, dashboardResult] = await Promise.allSettled([
        platformApi.auth.currentUser(),
        getStudentDashboard(),
      ]);

      if (dashboardResult.status === "rejected") {
        const error = dashboardResult.reason;
        return {
        status: "error",
        message: error instanceof Error ? error.message : "Could not load dashboard data.",
        };
      }

      return {
        status: "ready",
        result: dashboardResult.value,
        accountWarning:
          accountResult.status === "rejected"
            ? accountResult.reason instanceof Error
              ? `Account sync unavailable: ${accountResult.reason.message}`
              : "Account sync with the backend is unavailable."
            : undefined,
      };
    } catch (error) {
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Could not load dashboard data.",
      };
    }
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let active = true;
    void fetchDashboard().then((nextState) => {
      if (active) setState(nextState);
    });
    return () => {
      active = false;
    };
  }, [fetchDashboard, isLoaded, isSignedIn, user?.id]);

  if (!isLoaded) {
    return (
      <main className="grid min-h-screen place-items-center bg-background">
        <div role="status" className="flex items-center gap-3 text-sm font-medium text-muted">
          <span className="size-5 animate-spin rounded-full border-2 border-brand/20 border-t-brand" />
          Loading your student workspace…
        </div>
      </main>
    );
  }
  if (!isSignedIn || !user) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-5 text-center">
        <div className="max-w-lg rounded-2xl border border-line bg-card p-8 shadow-sm">
          <h1 className="text-xl font-bold text-white">Sign in to continue</h1>
          <p className="mt-2 text-sm leading-6 text-muted">Your student dashboard is available after you sign in.</p>
          <Link href="/login" className="mt-5 inline-flex rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8b6cff]">
            Go to sign in
          </Link>
        </div>
      </main>
    );
  }

  const clerkName = user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress || "Student";
  const result = state.status === "ready" ? state.result : null;
  const data = result?.data;
  const displayName = data
    ? result?.source === "sample" ? clerkName : getDisplayName(data, clerkName)
    : clerkName;
  const profile = data
    ? {
        ...data.profile,
        name: displayName,
        profileImage: result?.source === "sample" ? user.imageUrl : data.profile.profileImage || user.imageUrl,
      }
    : null;

  async function handleLogout() {
    try {
      await signOut({ redirectUrl: "/login" });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? `Could not log out: ${error.message}` : "Could not log out. Please try again.",
      });
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="md:grid md:grid-cols-[260px_minmax(0,1fr)]">
        <DashboardSidebar
          mobileOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          onLogout={() => void handleLogout()}
        />
        <div className="min-w-0">
          <DashboardHeader
            coinBalance={data?.stats.coinBalance ?? 0}
            notifications={data?.notifications ?? []}
            unreadNotifications={data?.unreadNotifications ?? 0}
            displayName={displayName}
            profileImage={user.imageUrl}
            contests={data?.upcomingContests ?? []}
            mentors={data?.recommendedMentors ?? []}
            onMenuClick={() => setMobileMenuOpen(true)}
            onLogout={() => void handleLogout()}
          />

          <main className="mx-auto max-w-[1500px] space-y-5 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
            {state.status === "loading" && (
              <div role="status" className="grid min-h-[50vh] place-items-center text-sm text-muted">
                <span className="flex items-center gap-3">
                  <span className="size-5 animate-spin rounded-full border-2 border-brand/20 border-t-brand" />
                  Loading your dashboard…
                </span>
              </div>
            )}

            {state.status === "error" && (
              <section role="alert" className="rounded-2xl border border-rose-400/20 bg-card p-6 shadow-sm">
                <h1 className="font-bold text-white">We couldn’t load your dashboard</h1>
                <p className="mt-2 text-sm leading-6 text-muted">{state.message}</p>
                <button
                  type="button"
                  onClick={() => {
                    setState({ status: "loading" });
                    void fetchDashboard().then(setState);
                  }}
                  className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#8b6cff]"
                >
                  Try again
                </button>
              </section>
            )}

            {state.status === "ready" && data && profile && (
              <>
                {result?.source === "sample" && (
                  <div role="status" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-xs text-amber-200">
                    <span><strong>Sample preview:</strong> {result.warning ?? "This dashboard uses illustrative data because the student dashboard API is not available yet."}</span>
                    <span className="font-medium">Not saved to your account</span>
                  </div>
                )}
                {state.accountWarning && (
                  <div role="status" className="rounded-xl border border-orange-400/20 bg-orange-400/[0.06] px-4 py-3 text-xs leading-5 text-orange-200">
                    {state.accountWarning}
                  </div>
                )}

                <WelcomeSection profile={profile} />
                <StatsCards data={data} />

                <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.8fr)]">
                  <div className="space-y-5">
                    <UpcomingContests contests={data.upcomingContests} />
                    <PerformanceChart data={data.performance} />
                  </div>
                  <div className="space-y-5">
                    <RecommendedMentors mentors={data.recommendedMentors} />
                    <RecentActivity activities={data.recentActivity} />
                  </div>
                </div>

                <RecentContests contests={data.recentContests} />
                <footer className="flex flex-wrap items-center justify-between gap-2 px-1 pb-5 text-[11px] text-muted">
                  <span>AlgoMate student workspace</span>
                  <Link href="/student/rewards" className="inline-flex items-center gap-1 font-medium text-brand-soft hover:text-white">
                    <DashboardIcon name="coin" className="size-3.5" />
                    {data.stats.coinBalance.toLocaleString()} coins available
                  </Link>
                </footer>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
