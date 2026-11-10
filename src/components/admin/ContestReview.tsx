"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { setAccessTokenGetter } from "@/lib/api/client";
import { platformApi } from "@/lib/api/endpoints";
import type { ContestApiRecord } from "@/types/api";

export default function ContestReview() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <Notice title="Sign-in setup required" message="Configure Clerk before reviewing contests." />;
  }
  return <AuthenticatedContestReview />;
}

function AuthenticatedContestReview() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [contests, setContests] = useState<ContestApiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState("");

  const refresh = useCallback(async () => {
    try {
      setContests(await platformApi.admin.contests());
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load contests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    setAccessTokenGetter(getToken);
    const requestId = window.setTimeout(() => void refresh(), 0);
    return () => {
      window.clearTimeout(requestId);
      setAccessTokenGetter(null);
    };
  }, [getToken, isLoaded, isSignedIn, refresh, user?.id]);

  async function review(contest: ContestApiRecord, decision: "approve" | "reject" | "cancel") {
    const reason = decision === "reject" ? window.prompt("Why is this contest being rejected?")?.trim() : undefined;
    if (decision === "reject" && !reason) return;
    if (decision === "cancel" && !window.confirm(`Cancel “${contest.title}”?`)) return;
    setBusyId(contest.id);
    setError("");
    setNotice("");
    try {
      await platformApi.admin.reviewContest(contest.id, decision, reason);
      setNotice(`Contest ${decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "cancelled"}.`);
      await refresh();
    } catch (reasonError) {
      setError(reasonError instanceof Error ? reasonError.message : "Contest review failed.");
    } finally {
      setBusyId("");
    }
  }

  if (!isLoaded) return <main className="grid min-h-screen place-items-center bg-background text-sm text-muted">Loading review queue…</main>;
  if (!isSignedIn) return <Notice title="Sign in required" message="Sign in with an administrator account to review contests." />;
  if (loading) return <main className="grid min-h-screen place-items-center bg-background text-sm text-muted">Loading review queue…</main>;

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-soft">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold">Contest review</h1>
        <p className="mt-2 text-sm text-muted">Review submitted contest schedules, questions, and prize settings before they become public.</p>
        {error && <p role="alert" className="mt-5 rounded-xl border border-rose-400/20 bg-rose-400/[0.06] p-4 text-sm text-rose-200">{error}</p>}
        {notice && <p role="status" className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4 text-sm text-emerald-200">{notice}</p>}
        <div className="mt-6 space-y-3">
          {contests.map((contest) => <article key={contest.id} className="rounded-2xl border border-line bg-card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold">{contest.title}</h2><span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] uppercase text-muted">{contest.status.replaceAll("_", " ")}</span></div><p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{contest.description}</p><p className="mt-3 text-xs text-muted">Mentor: {contest.createdBy.name ?? contest.createdBy.id} · {contest.questionIds.length} questions · {contest.prizeCoins} prize coins · {contest.maxParticipants} max participants</p><p className="mt-1 text-xs text-muted">{new Date(contest.startsAt).toLocaleString()} – {new Date(contest.endsAt).toLocaleString()}</p>{contest.reviewReason && <p className="mt-2 text-xs text-rose-200">Review note: {contest.reviewReason}</p>}</div>
              <div className="flex flex-wrap gap-2">
                {contest.status === "pending_review" && <>
                  <button disabled={busyId === contest.id} onClick={() => void review(contest, "approve")} className="rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-200 disabled:opacity-50">Approve</button>
                  <button disabled={busyId === contest.id} onClick={() => void review(contest, "reject")} className="rounded-lg bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-200 disabled:opacity-50">Reject</button>
                </>}
                {!["completed", "cancelled"].includes(contest.status) && <button disabled={busyId === contest.id} onClick={() => void review(contest, "cancel")} className="rounded-lg border border-line px-3 py-2 text-xs text-muted hover:text-white disabled:opacity-50">Cancel contest</button>}
              </div>
            </div>
          </article>)}
          {contests.length === 0 && <p className="rounded-2xl border border-line bg-card p-8 text-center text-sm text-muted">No contests have been created.</p>}
        </div>
      </div>
    </main>
  );
}

function Notice({ title, message }: { title: string; message: string }) {
  return <main className="grid min-h-screen place-items-center bg-background px-5 text-center"><section className="max-w-lg rounded-2xl border border-line bg-card p-8"><h1 className="text-xl font-semibold text-white">{title}</h1><p className="mt-2 text-sm text-muted">{message}</p></section></main>;
}
