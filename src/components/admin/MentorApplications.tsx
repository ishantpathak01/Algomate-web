"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { platformApi } from "@/lib/api/endpoints";
import { setAccessTokenGetter } from "@/lib/api/client";
import type { MentorProfile } from "@/types/mentor";

type ViewState =
  | { status: "loading" }
  | { status: "forbidden" }
  | { status: "error"; message: string }
  | { status: "ready"; applications: MentorProfile[] };

export default function MentorApplications() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [state, setState] = useState<ViewState>({ status: "loading" });
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchApplications = useCallback(async (): Promise<ViewState> => {
    setAccessTokenGetter(getToken);
    try {
      const currentUser = await platformApi.auth.currentUser();
      if (currentUser.role !== "admin" || currentUser.accountStatus !== "active") {
        return { status: "forbidden" };
      }
      return { status: "ready", applications: await platformApi.admin.mentors() };
    } catch (error) {
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Could not load mentor applications.",
      };
    }
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) return;
    let active = true;
    void fetchApplications().then((result) => {
      if (active) setState(result);
    });
    return () => {
      active = false;
      setAccessTokenGetter(null);
    };
  }, [fetchApplications, isLoaded, isSignedIn]);

  async function load() {
    setState(await fetchApplications());
  }

  async function review(application: MentorProfile, decision: "approve" | "reject") {
    setBusyId(application.id);
    setNotice("");
    try {
      await platformApi.admin.reviewMentor(application.id, decision);
      setNotice(`Application ${decision === "approve" ? "approved" : "rejected"}.`);
      await load();
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Could not review this application.",
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-6xl px-5 py-10 md:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-soft">Admin</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Mentor applications</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Review applicants before granting mentor access. Approval is applied by the backend and cannot be granted by the applicant.
      </p>

      {notice && <p role="status" className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-3 text-sm text-emerald-200">{notice}</p>}
      {(!isLoaded || (isSignedIn && state.status === "loading")) && <p role="status" className="mt-8 text-sm text-muted">Loading applications…</p>}
      {(isLoaded && !isSignedIn || state.status === "forbidden") && <p role="alert" className="mt-8 rounded-xl border border-rose-400/20 bg-rose-400/[0.06] p-4 text-sm text-rose-200">An active administrator account is required to review applications.</p>}
      {state.status === "error" && (
        <div className="mt-8 rounded-xl border border-rose-400/20 bg-rose-400/[0.06] p-4">
          <p role="alert" className="text-sm text-rose-200">{state.message}</p>
          <button type="button" onClick={() => void load()} className="mt-3 rounded-lg border border-line px-3 py-2 text-sm text-white hover:border-brand">Try again</button>
        </div>
      )}
      {state.status === "ready" && (
        <section className="mt-8 space-y-4">
          {state.applications.length === 0 ? (
            <div className="rounded-2xl border border-line bg-card p-8 text-center text-sm text-muted">There are no pending mentor applications.</div>
          ) : state.applications.map((application) => (
            <article key={application.id} className="rounded-2xl border border-line bg-card p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-white">{application.name ?? "Applicant"}</h2>
                  {application.email && <a className="mt-1 block text-sm text-brand-soft hover:underline" href={`mailto:${application.email}`}>{application.email}</a>}
                </div>
                <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">Pending review</span>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted">{application.description}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {application.skills.map((skill) => <li key={skill} className="rounded-full border border-line px-3 py-1 text-xs text-muted">{skill}</li>)}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={busyId === application.id}
                  onClick={() => void review(application, "approve")}
                  className="rounded-xl bg-emerald-500/15 px-4 py-2.5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/25 disabled:opacity-50"
                >
                  {busyId === application.id ? "Processing…" : "Approve mentor"}
                </button>
                <button
                  type="button"
                  disabled={busyId === application.id}
                  onClick={() => void review(application, "reject")}
                  className="rounded-xl border border-rose-400/20 px-4 py-2.5 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/10 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
