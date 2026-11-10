"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { PlatformApiError, setAccessTokenGetter } from "@/lib/api/client";
import { platformApi } from "@/lib/api/endpoints";
import type {
  ContestApiRecord,
  ContestParticipationApiRecord,
  ContestQuestionApiRecord,
  ContestSubmissionApiRecord,
} from "@/types/api";
import type { ProgrammingLanguage } from "@/types/contest";

const languages: ProgrammingLanguage[] = ["javascript", "typescript", "python", "java", "cpp"];

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`;
}

function messageFrom(error: unknown) {
  return error instanceof Error ? error.message : "The contest request failed. Please try again.";
}

export default function ParticipatePage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <main className="grid min-h-screen place-items-center bg-background px-5 text-center"><section className="max-w-lg rounded-2xl border border-line bg-card p-8"><h1 className="text-xl font-semibold text-white">Sign-in setup required</h1><p className="mt-2 text-sm text-muted">Configure Clerk before joining a contest session.</p></section></main>;
  }
  return <AuthenticatedParticipationPage />;
}

function AuthenticatedParticipationPage() {
  const { contestId } = useParams<{ contestId: string }>();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [contest, setContest] = useState<ContestApiRecord | null>(null);
  const [participation, setParticipation] = useState<ContestParticipationApiRecord | null>(null);
  const [questions, setQuestions] = useState<ContestQuestionApiRecord[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [language, setLanguage] = useState<ProgrammingLanguage>("javascript");
  const [sourceByQuestion, setSourceByQuestion] = useState<Record<string, string>>({});
  const [submission, setSubmission] = useState<ContestSubmissionApiRecord | null>(null);
  const [clock, setClock] = useState(() => Date.now());
  const [fullscreenActive, setFullscreenActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [monitoringNotice, setMonitoringNotice] = useState("");

  const selectedQuestion = useMemo(
    () => questions.find((question) => question.id === selectedId) ?? questions[0],
    [questions, selectedId],
  );
  const sourceCode = selectedQuestion ? sourceByQuestion[selectedQuestion.id] ?? "" : "";

  const loadContest = useCallback(async () => {
    try {
      setAccessTokenGetter(getToken);
      setContest(await platformApi.contests.get(contestId));
      try {
        const existingParticipation = await platformApi.contests.participation(contestId);
        setParticipation(existingParticipation);
        if (["in_progress", "submitted", "completed"].includes(existingParticipation.status)) {
          const contestQuestions = await platformApi.contests.questions(contestId);
          setQuestions(contestQuestions);
          setSelectedId(contestQuestions[0]?.id ?? "");
          setLanguage(contestQuestions[0]?.supportedLanguages[0] ?? "javascript");
        }
      } catch (participationError) {
        if (!(participationError instanceof PlatformApiError) || participationError.status !== 404) {
          throw participationError;
        }
      }
    } catch (loadError) {
      setError(messageFrom(loadError));
    } finally {
      setLoading(false);
    }
  }, [contestId, getToken]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    setAccessTokenGetter(getToken);
    const requestId = window.setTimeout(() => void loadContest(), 0);
    return () => {
      window.clearTimeout(requestId);
      setAccessTokenGetter(null);
    };
  }, [getToken, isLoaded, isSignedIn, loadContest, user?.id]);

  useEffect(() => {
    if (!participation?.expiresAt || participation.status !== "in_progress") {
      return;
    }
    const intervalId = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, [participation]);

  const remainingSeconds = participation?.expiresAt && participation.status === "in_progress"
    ? Math.max(0, Math.ceil((Date.parse(participation.expiresAt) - clock) / 1000))
    : null;

  const recordMonitorEvent = useCallback(async (kind: "fullscreen_exit" | "visibility_hidden" | "window_blur") => {
    try {
      await platformApi.contests.reportMonitoringEvent(contestId, kind);
    } catch (monitorError) {
      setMonitoringNotice(messageFrom(monitorError));
    }
  }, [contestId]);

  useEffect(() => {
    if (participation?.status !== "in_progress") return;
    const onFullscreenChange = () => {
      setFullscreenActive(Boolean(document.fullscreenElement));
      if (!document.fullscreenElement) void recordMonitorEvent("fullscreen_exit");
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") void recordMonitorEvent("visibility_hidden");
    };
    const onBlur = () => void recordMonitorEvent("window_blur");
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
    };
  }, [participation?.status, recordMonitorEvent]);

  async function register() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      setParticipation(await platformApi.contests.register(contestId));
      setNotice("Registration complete. Return when the contest is ongoing to start your timed session.");
    } catch (registerError) {
      setError(messageFrom(registerError));
    } finally {
      setBusy(false);
    }
  }

  async function reenterFullscreen() {
    try {
      await document.documentElement.requestFullscreen();
      setFullscreenActive(true);
    } catch (fullscreenError) {
      setError(messageFrom(fullscreenError));
    }
  }

  async function start() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (typeof document.documentElement.requestFullscreen !== "function") {
        throw new Error("This browser does not support fullscreen participation.");
      }
      await document.documentElement.requestFullscreen();
      setFullscreenActive(true);
      const activeParticipation = await platformApi.contests.start(contestId);
      setParticipation(activeParticipation);
      const contestQuestions = await platformApi.contests.questions(contestId);
      setQuestions(contestQuestions);
      setSelectedId(contestQuestions[0]?.id ?? "");
      setLanguage(contestQuestions[0]?.supportedLanguages[0] ?? "javascript");
    } catch (startError) {
      setError(messageFrom(startError));
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => undefined);
        setFullscreenActive(false);
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedQuestion) return;
    setBusy(true);
    setError("");
    setNotice("");
    setSubmission(null);
    try {
      const result = await platformApi.contests.submit(selectedQuestion.id, {
        contestId,
        sourceCode,
        language,
      });
      setSubmission(result);
      setNotice("Submission evaluated.");
    } catch (submitError) {
      setError(messageFrom(submitError));
    } finally {
      setBusy(false);
    }
  }

  async function finishContest() {
    setBusy(true);
    setError("");
    try {
      setParticipation(await platformApi.contests.finalize(contestId));
      setNotice("Your contest session has been submitted. Results will be available after the contest ends.");
    } catch (finalizeError) {
      setError(messageFrom(finalizeError));
    } finally {
      setBusy(false);
    }
  }

  if (!isLoaded || loading) {
    return <main className="grid min-h-screen place-items-center bg-background text-sm text-muted">Loading contest…</main>;
  }
  if (!isSignedIn) {
    return <main className="grid min-h-screen place-items-center bg-background px-5 text-center"><section className="max-w-lg rounded-2xl border border-line bg-card p-8"><h1 className="text-xl font-semibold text-white">Sign in to participate</h1><p className="mt-2 text-sm text-muted">Contest participation requires an authenticated student account.</p><Link href="/login" className="mt-5 inline-flex rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white">Sign in</Link></section></main>;
  }
  if (!contest) {
    return <main className="mx-auto max-w-3xl px-5 py-20 text-center"><h1 className="text-xl font-semibold text-white">Contest unavailable</h1><p role="alert" className="mt-3 text-sm text-rose-300">{error}</p><button onClick={() => { setLoading(true); setError(""); void loadContest(); }} className="mt-5 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">Try again</button></main>;
  }

  const isUpcoming = contest.status === "upcoming";
  const isOngoing = contest.status === "ongoing";
  const isFinished = participation?.status === "submitted" || participation?.status === "completed" || participation?.status === "disqualified";

  return (
    <main className="min-h-screen bg-background text-white">
      <header className="sticky top-0 z-20 border-b border-line bg-background/95 px-4 py-4 backdrop-blur sm:px-7">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <Link href={`/contests/${contestId}`} className="text-xs text-brand-soft hover:text-white">← Contest details</Link>
            <h1 className="mt-1 truncate text-lg font-semibold sm:text-xl">{contest.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            {participation?.status === "in_progress" && <span className={`rounded-xl border px-4 py-2 font-mono text-lg font-bold ${remainingSeconds !== null && remainingSeconds < 300 ? "border-rose-400/40 text-rose-300" : "border-line text-white"}`} aria-live="polite">{remainingSeconds === null ? "--:--" : formatTime(remainingSeconds)}</span>}
            {participation?.status === "in_progress" && <button onClick={() => void finishContest()} disabled={busy || !fullscreenActive} className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Submit contest</button>}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-7">
        {error && <p role="alert" className="mb-4 rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-200">{error}</p>}
        {notice && <p role="status" className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3 text-sm text-emerald-200">{notice}</p>}
        {monitoringNotice && <p role="status" className="mb-4 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-xs text-amber-100">Monitoring event could not be recorded: {monitoringNotice}</p>}

        {(!participation || participation.status === "registered") && (
          <section className="mx-auto max-w-2xl rounded-2xl border border-line bg-card p-7 text-center sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-soft">{contest.status}</p>
            <h2 className="mt-3 text-2xl font-semibold">Contest participation</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              {participation?.status === "registered" && isUpcoming
                ? "You are registered. Your timed, fullscreen session becomes available when the contest starts."
                : isUpcoming
                ? "Register now. Your timed, fullscreen session becomes available when the contest starts."
                : isOngoing
                  ? "Start your registered session in fullscreen. The timer begins when you start."
                  : "This contest is not currently accepting participation."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              {isUpcoming && !participation && <button onClick={() => void register()} disabled={busy} className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Please wait…" : "Register for contest"}</button>}
              {isOngoing && <button onClick={() => void start()} disabled={busy} className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Starting…" : "Start fullscreen session"}</button>}
            </div>
          </section>
        )}

        {participation && participation.status !== "registered" && !questions.length && (
          <section className="mx-auto max-w-2xl rounded-2xl border border-line bg-card p-7 text-center">
            <h2 className="text-xl font-semibold">Session unavailable</h2>
            <p className="mt-2 text-sm text-muted">No contest questions are currently available for this session.</p>
          </section>
        )}

        {questions.length > 0 && (
          <div className="grid gap-5 lg:grid-cols-[270px_minmax(0,1fr)]">
            <aside className="h-fit rounded-2xl border border-line bg-card p-4">
              <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Questions</h2><span className="text-xs text-muted">{questions.length}</span></div>
              <nav className="space-y-2" aria-label="Contest questions">
                {questions.map((question, index) => (
                  <button key={question.id} onClick={() => { setSelectedId(question.id); setLanguage(question.supportedLanguages[0] ?? "javascript"); setSubmission(null); }} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm ${selectedQuestion?.id === question.id ? "border-brand/50 bg-brand/10 text-white" : "border-line text-muted hover:text-white"}`}>
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-xs">{index + 1}</span><span className="truncate">{question.title}</span><span className="ml-auto text-[10px]">{question.points}p</span>
                  </button>
                ))}
              </nav>
              <p className="mt-4 border-t border-line pt-4 text-[11px] leading-5 text-muted">The leaderboard is intentionally not shown during participation. Fullscreen/tab events are recorded for review; they do not currently incur automatic penalties.</p>
            </aside>

            {selectedQuestion && (
              <section className="grid min-h-[72vh] gap-5 xl:grid-cols-2">
                <article className="rounded-2xl border border-line bg-card p-5 sm:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-wide text-brand-soft">{selectedQuestion.difficulty} · {selectedQuestion.points} points</p><h2 className="mt-2 text-2xl font-semibold">{selectedQuestion.title}</h2></div><div className="flex flex-wrap gap-1">{selectedQuestion.topics.map((topic) => <span key={topic} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] text-muted">{topic}</span>)}</div></div>
                  <div className="mt-6 space-y-5 text-sm leading-7 text-muted">
                    <p className="whitespace-pre-wrap">{selectedQuestion.statement}</p>
                    {selectedQuestion.inputFormat && <div><h3 className="font-semibold text-white">Input format</h3><p className="whitespace-pre-wrap">{selectedQuestion.inputFormat}</p></div>}
                    {selectedQuestion.outputFormat && <div><h3 className="font-semibold text-white">Output format</h3><p className="whitespace-pre-wrap">{selectedQuestion.outputFormat}</p></div>}
                    {selectedQuestion.constraints.length > 0 && <div><h3 className="font-semibold text-white">Constraints</h3><ul className="list-disc pl-5">{selectedQuestion.constraints.map((constraint) => <li key={constraint}>{constraint}</li>)}</ul></div>}
                    {selectedQuestion.sampleCases.map((sample, index) => <div key={index} className="rounded-xl border border-line p-4"><h3 className="mb-2 font-semibold text-white">Example {index + 1}</h3><p>Input</p><pre className="overflow-auto rounded-lg bg-black/30 p-3 text-xs text-white">{sample.input}</pre><p className="mt-2">Output</p><pre className="overflow-auto rounded-lg bg-black/30 p-3 text-xs text-white">{sample.output}</pre>{sample.explanation && <p className="mt-2">{sample.explanation}</p>}</div>)}
                  </div>
                </article>
                <form onSubmit={(event) => void submitAnswer(event)} className="flex min-h-[65vh] flex-col rounded-2xl border border-line bg-card p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between gap-3"><h2 className="font-semibold">Code editor</h2><label className="sr-only" htmlFor="language">Programming language</label><select id="language" value={language} onChange={(event) => setLanguage(event.target.value as ProgrammingLanguage)} className="rounded-lg border border-line bg-background px-3 py-2 text-xs text-white">{languages.filter((item) => selectedQuestion.supportedLanguages.includes(item)).map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                  <textarea aria-label="Source code" value={sourceCode} onChange={(event) => setSourceByQuestion((current) => ({ ...current, [selectedQuestion.id]: event.target.value }))} spellCheck={false} disabled={isFinished || !fullscreenActive || remainingSeconds === 0} placeholder={`Write your ${language} solution here…`} className="min-h-[400px] flex-1 resize-y rounded-xl border border-line bg-[#08090e] p-4 font-mono text-xs leading-6 text-slate-100 outline-none focus:border-brand/50 disabled:opacity-60" />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-[11px] text-muted">Hidden tests remain private. Code is evaluated by the configured external judge.</p><button type="submit" disabled={busy || isFinished || !fullscreenActive || remainingSeconds === 0 || !sourceCode.trim()} className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Submitting…" : "Submit solution"}</button></div>
                  {submission && <div role="status" className="mt-3 rounded-xl border border-line bg-background px-4 py-3 text-sm"><div className="flex justify-between gap-3"><strong className={submission.status === "accepted" ? "text-emerald-300" : "text-amber-200"}>{submission.status.replaceAll("_", " ")}</strong><span>{submission.score} points</span></div><p className="mt-1 text-xs text-muted">Tests passed: {submission.passedTestCases}/{submission.totalTestCases} · Attempt {submission.attemptNumber}</p></div>}
                </form>
              </section>
            )}

            {isFinished && <p className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm text-amber-100">Your session has ended. The leaderboard and final ranking are not displayed in this workspace.</p>}
          </div>
        )}
      </div>
      {participation?.status === "in_progress" && !fullscreenActive && <div className="fixed inset-0 z-50 grid place-items-center bg-background/95 px-5 text-center backdrop-blur"><section className="max-w-md rounded-2xl border border-line bg-card p-7"><h2 className="text-xl font-semibold">Fullscreen required</h2><p className="mt-2 text-sm leading-6 text-muted">Return to fullscreen to continue the contest session. This exit is recorded for review.</p><button onClick={() => void reenterFullscreen()} className="mt-5 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white">Return to fullscreen</button></section></div>}
    </main>
  );
}
