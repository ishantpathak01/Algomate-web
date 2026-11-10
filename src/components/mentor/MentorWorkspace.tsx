"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import DashboardIcon, { type DashboardIconName } from "@/components/dashboard/DashboardIcon";
import Logo from "@/components/ui/Logo";
import { setAccessTokenGetter } from "@/lib/api/client";
import { platformApi } from "@/lib/api/endpoints";
import { mentorDashboardApi, getMentorDashboard } from "@/features/mentors/services/mentorDashboard";
import type {
  CreateMentorContestInput,
  CreateMentorQuestionInput,
  MentorBooking,
  MentorContest,
  MentorContestStatus,
  MentorDashboardData,
  MentorDashboardResult,
  MentorParticipant,
  MentorQuestion,
} from "@/features/mentors/types/dashboard";
import type { MentorApprovalStatus } from "@/types/mentor";

type AuthUser = Awaited<ReturnType<typeof platformApi.auth.currentUser>>;
type PageState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "not-mentor"; user: AuthUser }
  | { status: "ready"; user: AuthUser; result: MentorDashboardResult };

const navigation: Array<{ label: string; href: string; icon: DashboardIconName }> = [
  { label: "Overview", href: "/mentor/dashboard", icon: "overview" },
  { label: "My contests", href: "/mentor/contests", icon: "contest" },
  { label: "Create contest", href: "/mentor/contests/create", icon: "check" },
  { label: "Question bank", href: "/mentor/questions", icon: "history" },
  { label: "Participants", href: "/mentor/participants", icon: "mentors" },
  { label: "Bookings", href: "/mentor/bookings", icon: "bookings" },
  { label: "Availability", href: "/mentor/availability", icon: "clock" },
  { label: "Messages", href: "/mentor/messages", icon: "chat" },
  { label: "Notifications", href: "/mentor/notifications", icon: "notifications" },
  { label: "My profile", href: "/mentor/profile", icon: "profile" },
  { label: "Settings", href: "/mentor/profile", icon: "settings" },
];

function dateLabel(date: string, withTime = false) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(new Date(date));
}

function humanStatus(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-card p-5 shadow-sm shadow-black/20 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white">{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatusBadge({ value }: { value: string }) {
  const tone = value === "approved" || value === "completed" || value === "ongoing" || value === "confirmed"
    ? "bg-emerald-400/10 text-emerald-300"
    : value === "rejected" || value === "suspended" || value === "cancelled"
      ? "bg-rose-400/10 text-rose-300"
      : value === "upcoming" || value === "requested" || value === "pending"
        ? "bg-amber-400/10 text-amber-200"
        : "bg-white/[0.07] text-muted";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${tone}`}>{humanStatus(value)}</span>;
}

export default function MentorWorkspace() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <GateCard title="Sign-in setup required" message="Configure Clerk in your local environment before opening the mentor workspace." />;
  }
  return <AuthenticatedMentorWorkspace />;
}

function GateCard({ title, message, children }: { title: string; message: string; children?: ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 text-center">
      <section className="w-full max-w-xl rounded-2xl border border-line bg-card p-8">
        <h1 className="text-xl font-bold text-white">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted">{message}</p>
        {children}
      </section>
    </main>
  );
}

function AuthenticatedMentorWorkspace() {
  const pathname = usePathname();
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [filter, setFilter] = useState<"all" | MentorContestStatus>("all");
  const [questionFilter, setQuestionFilter] = useState("all");
  const [questionTopic, setQuestionTopic] = useState("all");
  const [contestFilter, setContestFilter] = useState("all");
  const [questionEditor, setQuestionEditor] = useState<MentorQuestion | null>(null);
  const [questionEditing, setQuestionEditing] = useState(false);
  const [contestEditor, setContestEditor] = useState<MentorContest | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [localMessages, setLocalMessages] = useState<MentorDashboardData["messages"]>([]);

  const load = useCallback(async (): Promise<PageState> => {
    setAccessTokenGetter(getToken);
    try {
      const currentUser = await platformApi.auth.currentUser();
      if (currentUser.accountStatus !== "active") {
        return { status: "error", message: "This account is suspended. Contact an administrator for help." };
      }
      if (currentUser.role !== "mentor" || currentUser.mentorApplicationStatus !== "approved") {
        return { status: "not-mentor", user: currentUser };
      }
      const result = await getMentorDashboard();
      return { status: "ready", user: currentUser, result };
    } catch (error) {
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Could not verify your account with the backend.",
      };
    }
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let active = true;
    void load().then((next) => {
      if (active) setState(next);
    });
    return () => {
      active = false;
      setAccessTokenGetter(null);
    };
  }, [isLoaded, isSignedIn, load, user?.id]);

  const refresh = async () => {
    setState({ status: "loading" });
    setState(await load());
  };

  if (!isLoaded) {
    return (
      <main className="grid min-h-screen place-items-center bg-background text-muted">
        <div role="status" className="flex items-center gap-3 text-sm">
          <span className="size-5 animate-spin rounded-full border-2 border-brand/20 border-t-brand" />
          Loading mentor workspace…
        </div>
      </main>
    );
  }
  if (!isSignedIn || !user) {
    return <GateCard title="Sign in to continue" message="Your mentor workspace is available after signing in.">
      <Link href="/login" className="mt-5 inline-flex rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#8b6cff]">Go to sign in</Link>
    </GateCard>;
  }
  if (state.status === "loading") {
    return (
      <main className="grid min-h-screen place-items-center bg-background text-muted">
        <div role="status" className="flex items-center gap-3 text-sm">
          <span className="size-5 animate-spin rounded-full border-2 border-brand/20 border-t-brand" />
          Loading mentor workspace…
        </div>
      </main>
    );
  }
  if (state.status === "error") {
    return <GateCard title="Could not verify mentor access" message={state.message}>
      <button onClick={() => void refresh()} className="mt-5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#8b6cff]">Try again</button>
    </GateCard>;
  }
  if (state.status === "not-mentor") {
    if (state.user.mentorApplicationStatus === "pending" || state.user.role === "mentor") {
      return <MentorApprovalGate
        name={state.user.name}
        status={state.user.mentorApplicationStatus === "rejected" ? "rejected" : "pending"}
        onLogout={() => void signOut({ redirectUrl: "/" })}
      />;
    }
    if (state.user.mentorApplicationStatus === "approved") {
      return <MentorApprovalGate name={state.user.name} status="pending" onLogout={() => void signOut({ redirectUrl: "/" })} />;
    }
    return <MentorApplicationGate user={state.user} />;
  }

  const { user: account, result } = state;
  const data = result.data;
  const approvalStatus = data.profile.approvalStatus as MentorApprovalStatus;
  if (approvalStatus !== "approved") {
    return <MentorApprovalGate name={account.name} status={approvalStatus} onLogout={() => void signOut({ redirectUrl: "/" })} />;
  }

  const section = pathname === "/mentor/dashboard" ? "overview"
    : pathname === "/mentor/contests/create" ? "contest-create"
      : pathname.startsWith("/mentor/contests/") ? "contests"
        : pathname === "/mentor/contests" ? "contests"
          : pathname === "/mentor/questions/create" ? "question-create"
            : pathname.startsWith("/mentor/questions/") ? "questions"
              : pathname === "/mentor/questions" ? "questions"
                : pathname.startsWith("/mentor/participants") ? "participants"
                  : pathname.startsWith("/mentor/bookings") ? "bookings"
                    : pathname.startsWith("/mentor/availability") ? "availability"
                      : pathname.startsWith("/mentor/messages") ? "messages"
                        : pathname.startsWith("/mentor/notifications") ? "notifications"
                          : pathname.startsWith("/mentor/profile") ? "profile" : "overview";
  const name = account.name || user.fullName || user.firstName || "Mentor";
  const selectedContestId = pathname.startsWith("/mentor/contests/") && pathname !== "/mentor/contests/create"
    ? decodeURIComponent(pathname.split("/")[3] ?? "")
    : null;
  const selectedContest = selectedContestId ? data.contests.find((contest) => contest.id === selectedContestId) : undefined;
  const lockedQuestionIds = new Set(data.contests.filter((contest) => contest.status === "completed").flatMap((contest) => contest.questionIds));

  async function mutate<T>(operation: () => Promise<T>, success: string, after?: (value: T) => void): Promise<boolean> {
    setErrorMessage("");
    setNotice("");
    try {
      const value = await operation();
      after?.(value);
      setNotice(result.source === "mock" ? `${success} Demo change only; it is not saved to the server.` : success);
      await refresh();
      return true;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "The action could not be completed.");
      return false;
    }
  }

  const filteredContests = data.contests.filter((contest) =>
    (filter === "all" || contest.status === filter) &&
    contest.title.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const filteredQuestions = data.questions.filter((question) =>
    question.title.toLowerCase().includes(search.trim().toLowerCase()) &&
    (questionFilter === "all" || question.difficulty === questionFilter) &&
    (questionTopic === "all" || question.topics.includes(questionTopic)),
  );
  const filteredParticipants = data.participants.filter((participant) =>
    `${participant.name} ${participant.username} ${participant.college}`.toLowerCase().includes(search.trim().toLowerCase()) &&
    (contestFilter === "all" || participant.contestId === contestFilter),
  );

  const logout = async () => {
    await signOut({ redirectUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="md:grid md:grid-cols-[250px_minmax(0,1fr)]">
        <MentorSidebar pathname={pathname} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={() => void logout()} />
        <div className="min-w-0">
          <header className="sticky top-0 z-30 flex min-h-[72px] items-center gap-3 border-b border-line bg-black/90 px-4 backdrop-blur md:px-8">
            <button type="button" onClick={() => setMobileOpen(true)} className="rounded-xl p-2 text-muted hover:bg-white/5 md:hidden" aria-label="Open mentor navigation">
              <DashboardIcon name="menu" />
            </button>
            <label className="relative max-w-[420px] flex-1">
              <DashboardIcon name="search" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your workspace" aria-label="Search mentor workspace" className="h-10 w-full rounded-xl border border-line bg-card pl-9 pr-3 text-sm text-white outline-none placeholder:text-muted focus:border-brand/50" />
            </label>
            <div className="ml-auto flex items-center gap-2">
              <StatusBadge value={approvalStatus} />
              <Link href="/mentor/contests/create" className="hidden items-center gap-2 rounded-xl bg-brand px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#8b6cff] sm:inline-flex">
                <DashboardIcon name="check" className="size-4" /> Create contest
              </Link>
              <Link href="/mentor/notifications" aria-label={`${data.notifications.filter((item) => !item.read).length} unread notifications`} className="relative grid size-10 place-items-center rounded-xl text-muted transition hover:bg-white/5 hover:text-white">
                <DashboardIcon name="bell" className="size-[18px]" />
                {data.notifications.some((item) => !item.read) && <span className="absolute right-0.5 top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">{data.notifications.filter((item) => !item.read).length}</span>}
              </Link>
              <div className="relative">
                <button type="button" onClick={() => setProfileMenuOpen((open) => !open)} aria-expanded={profileMenuOpen} aria-label="Open mentor profile menu" className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-white/5">
                  {user.imageUrl ? (
                    // Clerk provides the signed-in user's image URL.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.imageUrl} alt="" className="size-9 rounded-full object-cover" />
                  ) : <span className="grid size-9 place-items-center rounded-full bg-brand/20 text-sm font-bold text-brand-soft">{name[0]}</span>}
                  <span className="hidden max-w-32 text-left sm:block"><span className="block truncate text-xs font-semibold text-white">{name}</span><span className="block text-[10px] text-muted">Mentor</span></span>
                </button>
                {profileMenuOpen && <div className="absolute right-0 top-12 z-40 w-44 rounded-xl border border-line bg-card p-2 shadow-xl shadow-black/40">
                  <Link href="/mentor/profile" onClick={() => setProfileMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-white">My profile</Link>
                  <button onClick={() => void logout()} className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-300 hover:bg-rose-400/10">Log out</button>
                </div>}
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-[1500px] space-y-5 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
            {result.source === "mock" && (
              <div role="status" className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-xs leading-5 text-amber-200">
                <strong>Demo workspace:</strong> {result.warning ?? "Showing local sample data. Changes are not saved to the backend."} Mentor access was verified from the authenticated account, but approval and management actions must be enforced by the backend.
              </div>
            )}
            {notice && <p role="status" className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3 text-xs text-emerald-200">{notice}</p>}
            {errorMessage && <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 text-xs text-rose-200">{errorMessage}</p>}

            {section === "overview" && <Overview data={data} name={name} onPublish={(id) => void mutate(() => mentorDashboardApi.updateContest(id, { status: "upcoming" }), "Contest published.")} />}
            {section === "contests" && selectedContest && <ContestDetails contest={selectedContest} data={data} onEdit={(contest) => setContestEditor(contest)} />}
            {section === "contests" && pathname === "/mentor/contests" && (
              <ContestManager
                contests={filteredContests}
                filter={filter}
                onFilter={setFilter}
                onEdit={(contest) => setContestEditor(contest)}
                onPublish={(contest) => void mutate(() => mentorDashboardApi.updateContest(contest.id, { status: "upcoming" }), "Contest published.")}
              />
            )}
            {section === "contest-create" && (
              <ContestForm questions={data.questions} onSubmit={(input) => void mutate(
                () => contestEditor
                  ? mentorDashboardApi.updateContest(contestEditor.id, input)
                  : mentorDashboardApi.createContest(input),
                contestEditor ? "Contest updated." : "Contest created.",
                () => setContestEditor(null),
              )} />
            )}
            {(section === "questions" || section === "question-create") && (
              <QuestionManager
                questions={filteredQuestions}
                filter={questionFilter}
                onFilter={setQuestionFilter}
                topicFilter={questionTopic}
                onTopicFilter={setQuestionTopic}
                topics={[...new Set(data.questions.flatMap((question) => question.topics))]}
                lockedQuestionIds={lockedQuestionIds}
                onEdit={(question) => { setQuestionEditor(question); setQuestionEditing(false); }}
                initialOpen={section === "question-create"}
                onCreate={(input) => mutate(() => mentorDashboardApi.createQuestion(input), "Question created.")}
                onDelete={(question) => {
                  if (window.confirm(`Delete “${question.title}”?`)) {
                    void mutate(() => mentorDashboardApi.deleteQuestion(question.id), "Question deleted.");
                  }
                }}
              />
            )}
            {section === "participants" && <Participants data={data} participants={filteredParticipants} filter={contestFilter} onFilter={setContestFilter} />}
            {section === "bookings" && <Bookings bookings={data.bookings} onUpdate={(booking, status) => void mutate(() => mentorDashboardApi.updateBooking(booking.id, status), `Booking ${status}.`)} />}
            {section === "availability" && <Availability data={data} onAdd={(slot) => void mutate(() => mentorDashboardApi.setAvailability(slot), "Availability updated.")} onUpdate={(id, status) => void mutate(() => mentorDashboardApi.updateAvailability(id, status), "Availability updated.")} />}
            {section === "messages" && <Messages messages={localMessages.length ? localMessages : data.messages} draft={messageDraft} setDraft={setMessageDraft} onSend={() => {
              const text = messageDraft.trim();
              if (!text) return;
              setLocalMessages((messages) => [...(messages.length ? messages : data.messages), { id: `local-${Date.now()}`, studentName: data.messages[0]?.studentName ?? "Student", body: text, createdAt: new Date().toISOString(), fromMentor: true }]);
              setMessageDraft("");
              setNotice("Message added to this local demo conversation. Real messaging API is not connected.");
            }} />}
            {section === "notifications" && <Notifications notifications={data.notifications} />}
            {section === "profile" && <MentorProfile data={data} onSave={(input) => void mutate(() => mentorDashboardApi.updateProfile(input), "Profile updated.")} />}
            {contestEditor && section === "contests" && (
              <Modal onClose={() => setContestEditor(null)} title={`Edit ${contestEditor.title}`}>
                <ContestForm questions={data.questions} initial={contestEditor} compact onSubmit={(input) => void mutate(() => mentorDashboardApi.updateContest(contestEditor.id, input), "Contest updated.", () => setContestEditor(null))} />
              </Modal>
            )}
            {questionEditor && (
              <Modal onClose={() => { setQuestionEditor(null); setQuestionEditing(false); }} title={questionEditing ? `Edit: ${questionEditor.title}` : `Preview: ${questionEditor.title}`}>
                {questionEditing
                  ? <QuestionForm initial={questionEditor} onSave={async (input) => { await mentorDashboardApi.updateQuestion(questionEditor.id, input); await refresh(); setQuestionEditor(null); setQuestionEditing(false); }} />
                  : <>
                    <QuestionPreview question={questionEditor} />
                    <div className="mt-5 flex justify-end gap-2">
                      <button onClick={() => setQuestionEditor(null)} className="rounded-lg border border-line px-3 py-2 text-sm text-muted hover:text-white">Close</button>
                      {!lockedQuestionIds.has(questionEditor.id) && <button onClick={() => setQuestionEditing(true)} className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-[#8b6cff]">Edit question</button>}
                      {lockedQuestionIds.has(questionEditor.id) && <span className="self-center text-xs text-amber-200">Locked after completed contest; admin editing required.</span>}
                    </div>
                  </>}
              </Modal>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function MentorSidebar({ pathname, mobileOpen, onClose, onLogout }: { pathname: string; mobileOpen: boolean; onClose: () => void; onLogout: () => void }) {
  return <>
    {mobileOpen && <button aria-label="Close mentor navigation" onClick={onClose} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-line bg-black px-4 py-5 transition-transform md:sticky md:top-0 md:z-20 md:h-screen md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
      <div className="flex items-center justify-between px-2">
        <Link href="/mentor/dashboard" aria-label="Mentor dashboard"><Logo className="text-white" /></Link>
        <button onClick={onClose} className="rounded-lg p-2 text-muted hover:bg-white/5 md:hidden" aria-label="Close navigation"><DashboardIcon name="close" /></button>
      </div>
      <p className="mb-3 mt-9 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Mentor workspace</p>
      <nav className="space-y-1 overflow-y-auto" aria-label="Mentor navigation">
        {navigation.map((item) => {
          const active = pathname === item.href || (item.href !== "/mentor/dashboard" && item.href !== "/mentor/contests/create" && pathname.startsWith(`${item.href}/`));
          return <Link key={item.label} href={item.href} onClick={onClose} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition ${active ? "bg-brand/15 text-brand-soft" : "text-muted hover:bg-white/5 hover:text-white"}`}>
            <DashboardIcon name={item.icon} className="size-[18px]" />{item.label}
          </Link>;
        })}
      </nav>
      <button onClick={onLogout} className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-muted transition hover:bg-rose-400/10 hover:text-rose-300">
        <DashboardIcon name="logout" className="size-[18px]" />Log out
      </button>
    </aside>
  </>;
}

function MentorApprovalGate({ name, status, onLogout }: { name: string; status: MentorApprovalStatus; onLogout: () => void }) {
  const messages: Record<MentorApprovalStatus, string> = {
    pending: "Your mentor application is awaiting admin review. Mentor tools will unlock after approval.",
    rejected: "Your mentor application was not approved. Contact support if you believe this is a mistake.",
    suspended: "Mentor access is suspended. Please contact an administrator.",
    approved: "Your mentor access is active.",
  };
  return <GateCard title={`Welcome, ${name}`} message={messages[status]}>
    <div className="mt-5 flex items-center justify-center gap-3"><StatusBadge value={status} /><button onClick={onLogout} className="rounded-lg border border-line px-3 py-2 text-sm text-muted hover:text-white">Log out</button></div>
  </GateCard>;
}

function MentorApplicationGate({ user }: { user: AuthUser }) {
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { signOut } = useClerk();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await platformApi.mentors.apply({ description, skills: skills.split(",").map((skill) => skill.trim()).filter(Boolean), contactEmail: user.email });
      setSubmitted(true);
    } catch (reason) {
      setError(reason instanceof Error ? `Application was not submitted: ${reason.message}` : "Application could not be submitted.");
    }
  }
  if (submitted) {
    return <MentorApprovalGate name={user.name} status="pending" onLogout={() => void signOut({ redirectUrl: "/" })} />;
  }
  return <GateCard title="Mentor access required" message={`Signed in as ${user.name}. This account does not currently have an approved mentor role. Submit an application for admin review; access is not granted by this form.`}>
    <form onSubmit={submit} className="mt-6 space-y-3 text-left">
      {user.mentorApplicationStatus === "rejected" && <p className="text-xs text-amber-200">Your previous application was rejected. You may submit an updated application for review.</p>}
      <label className="block text-xs font-medium text-muted">Mentor experience and introduction<textarea required minLength={30} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1 min-h-24 w-full rounded-xl border border-line bg-black/30 p-3 text-sm text-white outline-none focus:border-brand/50" /></label>
      <label className="block text-xs font-medium text-muted">Skills (comma separated)<input required value={skills} onChange={(event) => setSkills(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line bg-black/30 px-3 text-sm text-white outline-none focus:border-brand/50" /></label>
      {error && <p role="alert" className="text-xs text-rose-300">{error}</p>}
      <button className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8b6cff]">Submit for review</button>
    </form>
  </GateCard>;
}

const statCards: Array<{ key: keyof MentorDashboardData["stats"]; label: string; icon: DashboardIconName; color: string }> = [
  { key: "totalContests", label: "Total contests created", icon: "contest", color: "bg-brand/10 text-brand-soft" },
  { key: "activeContests", label: "Active contests", icon: "trend", color: "bg-emerald-400/10 text-emerald-300" },
  { key: "participants", label: "Total participants", icon: "mentors", color: "bg-blue-400/10 text-blue-300" },
  { key: "questions", label: "Total questions", icon: "history", color: "bg-violet-400/10 text-violet-300" },
  { key: "upcomingSessions", label: "Upcoming sessions", icon: "bookings", color: "bg-amber-400/10 text-amber-200" },
  { key: "coinsDistributed", label: "Coins distributed", icon: "coin", color: "bg-amber-400/10 text-amber-300" },
];

function Overview({ data, name, onPublish }: { data: MentorDashboardData; name: string; onPublish: (id: string) => void }) {
  return <>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-sm font-medium text-brand-soft">MENTOR WORKSPACE</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Welcome back, {name.split(/\s+/)[0]}.</h1><p className="mt-2 text-sm text-muted">Your contests, learners, and sessions at a glance.</p></div>
      <Link href="/mentor/contests/create" className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8b6cff]"><DashboardIcon name="check" className="size-4" />Create contest</Link>
    </div>
    <section aria-label="Mentor statistics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {statCards.map((card) => <article key={card.key} className="rounded-2xl border border-line bg-card p-5 shadow-sm transition hover:border-brand/30">
        <div className="flex items-start justify-between"><p className="text-[13px] text-muted">{card.label}</p><span className={`grid size-10 place-items-center rounded-xl ${card.color}`}><DashboardIcon name={card.icon} className="size-5" /></span></div>
        <p className="mt-4 text-3xl font-bold text-white">{data.stats[card.key].toLocaleString()}</p>
        <p className="mt-1 text-xs text-muted">Current account total</p>
      </article>)}
    </section>
    <ContestManager contests={data.contests.slice(0, 4)} filter="all" onFilter={() => {}} onEdit={() => {}} onPublish={(contest) => onPublish(contest.id)} compact />
    <Bookings bookings={data.bookings.slice(0, 3)} onUpdate={() => {}} compact />
  </>;
}

function ContestManager({ contests, filter, onFilter, onEdit, onPublish, compact = false }: { contests: MentorContest[]; filter: "all" | MentorContestStatus; onFilter: (filter: "all" | MentorContestStatus) => void; onEdit: (contest: MentorContest) => void; onPublish: (contest: MentorContest) => void; compact?: boolean }) {
  return <Panel title={compact ? "Your contests" : "Contest management"} subtitle="Track schedules, registrations, questions, and prizes." action={<Link href="/mentor/contests/create" className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-[#8b6cff]">Create contest</Link>}>
    {!compact && <div className="mb-4 flex flex-wrap gap-2">{(["all", "draft", "upcoming", "ongoing", "completed"] as const).map((value) => <button key={value} onClick={() => onFilter(value)} className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${filter === value ? "bg-brand/20 text-brand-soft" : "bg-white/[0.05] text-muted hover:text-white"}`}>{value}</button>)}</div>}
    {contests.length === 0 ? <Empty>No contests match this filter.</Empty> : <div className="overflow-x-auto"><table className="w-full min-w-[790px] text-left text-xs">
      <thead className="border-y border-line text-[10px] uppercase tracking-wide text-muted"><tr>{["Contest", "Status", "Schedule", "Participants", "Questions", "Prize", "Actions"].map((item) => <th key={item} className="px-3 py-3 font-semibold first:pl-1">{item}</th>)}</tr></thead>
      <tbody className="divide-y divide-line">{contests.map((contest) => <tr key={contest.id} className="hover:bg-white/[0.025]">
        <td className="py-4 pl-1 pr-3"><p className="font-semibold text-white">{contest.title}</p><p className="mt-1 max-w-48 truncate text-muted">{contest.description}</p></td>
        <td className="px-3 py-4"><StatusBadge value={contest.status} /></td>
        <td className="px-3 py-4 text-muted">{dateLabel(contest.startsAt)}<span className="block mt-1">{contest.durationMinutes} min</span></td>
        <td className="px-3 py-4 text-white">{contest.participants}/{contest.maxParticipants}</td>
        <td className="px-3 py-4 text-white">{contest.questionIds.length}</td>
        <td className="px-3 py-4 text-amber-300">{contest.prizeCoins.toLocaleString()} coins</td>
        <td className="px-3 py-4"><div className="flex flex-wrap gap-2">
          <Link href={`/mentor/contests/${encodeURIComponent(contest.id)}`} className="text-brand-soft hover:text-white">View</Link>
          {contest.status !== "completed" && <button onClick={() => onEdit(contest)} className="text-muted hover:text-white">Edit</button>}
          {contest.status === "draft" && <button onClick={() => onPublish(contest)} className="text-emerald-300 hover:text-emerald-200">Publish</button>}
          <Link href="/mentor/questions" className="text-muted hover:text-white">Questions</Link>
          <Link href={`/mentor/participants?contestId=${encodeURIComponent(contest.id)}`} className="text-muted hover:text-white">People</Link>
        </div></td>
      </tr>)}</tbody>
    </table></div>}
  </Panel>;
}

function ContestDetails({ contest, data, onEdit }: { contest: MentorContest; data: MentorDashboardData; onEdit: (contest: MentorContest) => void }) {
  const participants = data.participants.filter((participant) => participant.contestId === contest.id);
  const questions = data.questions.filter((question) => contest.questionIds.includes(question.id));
  return <>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-sm font-medium uppercase tracking-wide text-brand-soft">Contest workspace</p><h1 className="mt-2 text-3xl font-semibold text-white">{contest.title}</h1><p className="mt-2 max-w-3xl text-sm text-muted">{contest.description}</p></div>
      <div className="flex items-center gap-2"><StatusBadge value={contest.status} />{contest.status !== "completed" && <button onClick={() => onEdit(contest)} className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-[#8b6cff]">Edit contest</button>}</div>
    </div>
    {contest.status === "completed" && <p role="status" className="rounded-xl border border-amber-400/20 bg-amber-400/[0.05] p-3 text-xs text-amber-200">This contest is complete. Mentors can no longer edit its content or questions; contact an admin for changes.</p>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[
        ["Schedule", `${dateLabel(contest.startsAt, true)} – ${dateLabel(contest.endsAt, true)}`],
        ["Duration", `${contest.durationMinutes} minutes`],
        ["Participants", `${contest.participants} / ${contest.maxParticipants}`],
        ["Prize pool", `${contest.prizeCoins.toLocaleString()} coins`],
      ].map(([label, value]) => <article key={label} className="rounded-xl border border-line bg-card p-4"><p className="text-xs text-muted">{label}</p><p className="mt-2 text-sm font-semibold text-white">{value}</p></article>)}
    </div>
    <Panel title="Contest questions" subtitle="Question content and hidden tests remain private to the mentor workspace.">
      <div className="space-y-2">{questions.map((question) => <article key={question.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-4"><div><p className="text-sm font-semibold text-white">{question.title}</p><p className="mt-1 text-xs text-muted">{question.topics.join(" · ")} · {question.points} points · {question.hiddenTestCases.length} hidden tests</p></div><StatusBadge value={question.difficulty} /></article>)}</div>
      {questions.length === 0 && <Empty>No questions have been added to this contest.</Empty>}
    </Panel>
    <Panel title={contest.status === "completed" ? "Final participants" : "Participants"} subtitle={contest.status === "ongoing" ? "Scores are visible to mentors only; no live leaderboard is exposed here." : "Participant details and submission progress."}>
      <div className="space-y-2">{participants.map((participant) => <ParticipantRow key={participant.id} participant={participant} contest={contest} />)}</div>
      {participants.length === 0 && <Empty>No participants have joined this contest yet.</Empty>}
    </Panel>
  </>;
}

function ContestForm({ questions, initial, compact = false, onSubmit }: { questions: MentorQuestion[]; initial?: MentorContest; compact?: boolean; onSubmit: (input: CreateMentorContestInput) => void }) {
  const [preview, setPreview] = useState<CreateMentorContestInput | null>(null);
  const [formError, setFormError] = useState("");
  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    const form = new FormData(event.currentTarget);
    const startsAt = String(form.get("startsAt"));
    const endsAt = String(form.get("endsAt"));
    const deadline = String(form.get("registrationDeadline"));
    const questionIds = form.getAll("questionIds").map(String);
    if (new Date(endsAt) <= new Date(startsAt)) return setFormError("End date must be after the start date.");
    if (new Date(deadline) > new Date(startsAt)) return setFormError("Registration deadline must be before contest start.");
    if (questionIds.length === 0) return setFormError("Choose at least one contest question.");
    setPreview({
      title: String(form.get("title")).trim(),
      description: String(form.get("description")).trim(),
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      registrationDeadline: new Date(deadline).toISOString(),
      durationMinutes: Number(form.get("durationMinutes")),
      maxParticipants: Number(form.get("maxParticipants")),
      questionIds,
      prizeCoins: Number(form.get("prizeCoins")),
      visibility: String(form.get("visibility")) as "public" | "private",
      status: initial?.status ?? "draft",
      bannerImageUrl: String(form.get("bannerImage") ?? ""),
      rules: String(form.get("rules") ?? ""),
    });
  };
  if (preview) return <Panel title="Review contest" subtitle="Check the details before saving this contest.">
    <div className="space-y-2 text-sm">{preview.bannerImageUrl && (
      // The mentor may provide an image URL from any host.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={preview.bannerImageUrl} alt="" className="mb-4 max-h-48 w-full rounded-xl object-cover" />
    )}<h3 className="text-xl font-bold text-white">{preview.title}</h3><p className="text-muted">{preview.description}</p><p className="text-muted">{dateLabel(preview.startsAt, true)} – {dateLabel(preview.endsAt, true)} · {preview.durationMinutes} minutes</p><p className="text-muted">{preview.questionIds.length} questions · {preview.prizeCoins} prize coins · {preview.maxParticipants} max participants · {preview.visibility}</p></div>
    <div className="mt-5 flex flex-wrap gap-2"><button onClick={() => setPreview(null)} className="rounded-lg border border-line px-4 py-2 text-sm text-muted hover:text-white">Back to edit</button><button onClick={() => onSubmit(preview)} className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-white hover:border-brand/40">Save draft</button><button onClick={() => onSubmit({ ...preview, status: "upcoming" })} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-[#8b6cff]">Publish contest</button></div>
  </Panel>;
  return <Panel title={initial ? "Edit contest" : "Create contest"} subtitle={compact ? undefined : "Build the schedule and select questions. Review before saving."}>
    <form onSubmit={onFormSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Contest title"><input name="title" required maxLength={100} defaultValue={initial?.title} className={inputClass} /></Field>
      <Field label="Banner image URL (optional)"><input name="bannerImage" type="url" defaultValue={initial?.bannerImageUrl} className={inputClass} /></Field>
      <Field label="Start date and time"><input name="startsAt" type="datetime-local" required defaultValue={initial ? localDateTime(initial.startsAt) : ""} className={inputClass} /></Field>
      <Field label="End date and time"><input name="endsAt" type="datetime-local" required defaultValue={initial ? localDateTime(initial.endsAt) : ""} className={inputClass} /></Field>
      <Field label="Registration deadline"><input name="registrationDeadline" type="datetime-local" required defaultValue={initial ? localDateTime(initial.registrationDeadline) : ""} className={inputClass} /></Field>
      <Field label="Duration (minutes)"><input name="durationMinutes" type="number" min={15} max={600} required defaultValue={initial?.durationMinutes ?? 120} className={inputClass} /></Field>
      <Field label="Maximum participants"><input name="maxParticipants" type="number" min={1} required defaultValue={initial?.maxParticipants ?? 100} className={inputClass} /></Field>
      <Field label="Prize pool (coins)"><input name="prizeCoins" type="number" min={0} required defaultValue={initial?.prizeCoins ?? 500} className={inputClass} /></Field>
      <Field label="Visibility"><select name="visibility" defaultValue={initial?.visibility ?? "public"} className={inputClass}><option value="public">Public</option><option value="private">Private</option></select></Field>
      <div className="sm:col-span-2"><Field label="Description"><textarea name="description" required minLength={20} rows={3} defaultValue={initial?.description} className={inputClass} /></Field></div>
      <fieldset className="sm:col-span-2"><legend className="mb-2 text-xs font-medium text-muted">Select contest questions</legend><div className="grid gap-2 sm:grid-cols-2">{questions.map((question) => <label key={question.id} className="flex items-center gap-2 rounded-lg border border-line p-3 text-xs text-white"><input type="checkbox" name="questionIds" value={question.id} defaultChecked={initial?.questionIds.includes(question.id)} className="accent-[#7c5cf5]" />{question.title}<span className="ml-auto text-muted">{question.points} pts</span></label>)}</div></fieldset>
      <Field label="Contest rules"><textarea name="rules" rows={2} defaultValue={initial?.rules} placeholder="Rules and participation expectations" className={inputClass} /></Field>
      <div className="flex items-end text-xs text-muted">Questions are locked for mentors after contest completion.</div>
      {formError && <p role="alert" className="sm:col-span-2 text-xs text-rose-300">{formError}</p>}
      <div className="sm:col-span-2"><button className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8b6cff]">Preview contest</button></div>
    </form>
  </Panel>;
}

function QuestionManager({ questions, filter, onFilter, topicFilter, onTopicFilter, topics, lockedQuestionIds, onEdit, onDelete, onCreate, initialOpen }: { questions: MentorQuestion[]; filter: string; onFilter: (value: string) => void; topicFilter: string; onTopicFilter: (value: string) => void; topics: string[]; lockedQuestionIds: Set<string>; onEdit: (question: MentorQuestion) => void; onDelete: (question: MentorQuestion) => void; onCreate: (input: CreateMentorQuestionInput) => Promise<boolean>; initialOpen: boolean }) {
  return <Panel title="Question bank" subtitle="Create and maintain reusable contest questions." action={<Link href="/mentor/questions/create" className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-[#8b6cff]">Create question</Link>}>
    <div className="mb-4 flex flex-wrap gap-2"><select value={filter} onChange={(event) => onFilter(event.target.value)} className={`${inputClass} max-w-52`}><option value="all">All difficulties</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select><select value={topicFilter} onChange={(event) => onTopicFilter(event.target.value)} className={`${inputClass} max-w-52`}><option value="all">All topics</option>{topics.map((topic) => <option key={topic} value={topic}>{topic}</option>)}</select></div>
    <div className="grid gap-3 md:grid-cols-2">{questions.map((question) => <article key={question.id} className="rounded-xl border border-line p-4 transition hover:border-brand/30">
      <div className="flex items-start justify-between gap-2"><div><h3 className="text-sm font-semibold text-white">{question.title}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{question.statement}</p></div><StatusBadge value={question.difficulty} /></div>
      <div className="mt-3 flex flex-wrap gap-1.5">{question.topics.map((topic) => <span key={topic} className="rounded-full bg-white/[0.06] px-2 py-1 text-[10px] text-muted">{topic}</span>)}</div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted"><span>{question.points} pts · {question.usageCount} uses</span><span>{dateLabel(question.createdAt)}</span></div>
      <p className="mt-2 text-[10px] text-muted">{question.hiddenTestCases.length} hidden tests · private to mentors</p>
      {lockedQuestionIds.has(question.id) && <p className="mt-2 text-[10px] text-amber-200">Used in a completed contest; only admins can edit this question.</p>}
      <div className="mt-3 flex gap-3 text-xs"><button onClick={() => onEdit(question)} className="text-brand-soft hover:text-white">Preview{lockedQuestionIds.has(question.id) ? "" : " / edit"}</button>{!lockedQuestionIds.has(question.id) && <button onClick={() => onDelete(question)} className="text-rose-300 hover:text-rose-200">Delete</button>}</div>
    </article>)}</div>
    <div id="question-editor" className="mt-5"><QuestionForm key={String(initialOpen)} initiallyOpen={initialOpen} onSave={onCreate} /></div>
  </Panel>;
}

function QuestionForm({ onSave, initial, initiallyOpen = true }: { onSave: (input: CreateMentorQuestionInput) => Promise<boolean | void>; initial?: MentorQuestion; initiallyOpen?: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    let examples: CreateMentorQuestionInput["examples"];
    let hiddenTestCases: CreateMentorQuestionInput["hiddenTestCases"];
    try {
      const parsedExamples: unknown = JSON.parse(String(form.get("examples")));
      const parsedHidden: unknown = JSON.parse(String(form.get("hiddenTestCases")));
      if (!Array.isArray(parsedExamples) || !Array.isArray(parsedHidden)) throw new Error();
      if (!parsedExamples.every((item) => typeof item === "object" && item !== null && "input" in item && "output" in item)) throw new Error();
      if (!parsedHidden.every((item) => typeof item === "object" && item !== null && "input" in item && "output" in item)) throw new Error();
      examples = parsedExamples;
      hiddenTestCases = parsedHidden;
    } catch {
      setError("Examples and hidden test cases must be valid JSON arrays.");
      return;
    }
    const input: CreateMentorQuestionInput = {
      title: String(form.get("title")).trim(),
      statement: String(form.get("statement")).trim(),
      inputFormat: String(form.get("inputFormat")).trim(),
      outputFormat: String(form.get("outputFormat")).trim(),
      constraints: String(form.get("constraints")).split("\n").map((item) => item.trim()).filter(Boolean),
      examples,
      difficulty: String(form.get("difficulty")) as MentorQuestion["difficulty"],
      topics: String(form.get("topics")).split(",").map((item) => item.trim()).filter(Boolean),
      points: Number(form.get("points")),
      timeLimitMs: Number(form.get("timeLimitMs")),
      memoryLimitMb: Number(form.get("memoryLimitMb")),
      supportedLanguages: form.getAll("languages").map(String),
      hiddenTestCases,
      status: "active",
    };
    if (input.supportedLanguages.length === 0) {
      setError("Choose at least one supported language.");
      return;
    }
    setSaving(true);
    try {
      const saved = await onSave(input);
      if (saved !== false) setOpen(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Question could not be saved.");
    } finally {
      setSaving(false);
    }
  }
  if (!open) return <button onClick={() => setOpen(true)} className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-muted hover:border-brand/40 hover:text-white">Open question form</button>;
  return <form onSubmit={(event) => void submit(event)} className="space-y-3 rounded-xl border border-line bg-black/20 p-4">
    <h3 className="text-sm font-semibold text-white">{initial ? "Edit programming question" : "New programming question"}</h3>
    <Field label="Title"><input required name="title" defaultValue={initial?.title} className={inputClass} /></Field>
    <Field label="Problem statement"><textarea required minLength={20} name="statement" rows={3} defaultValue={initial?.statement} className={inputClass} /></Field>
    <div className="grid gap-3 sm:grid-cols-2"><Field label="Input format"><textarea name="inputFormat" required defaultValue={initial?.inputFormat} className={inputClass} /></Field><Field label="Output format"><textarea name="outputFormat" required defaultValue={initial?.outputFormat} className={inputClass} /></Field></div>
    <Field label="Constraints (one per line)"><textarea name="constraints" required defaultValue={initial?.constraints.join("\n")} className={inputClass} /></Field>
    <div className="grid gap-3 sm:grid-cols-3"><Field label="Difficulty"><select name="difficulty" defaultValue={initial?.difficulty ?? "easy"} className={inputClass}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></Field><Field label="Points"><input name="points" type="number" min={1} required defaultValue={initial?.points ?? 100} className={inputClass} /></Field><Field label="Time limit (ms)"><input name="timeLimitMs" type="number" min={100} required defaultValue={initial?.timeLimitMs ?? 2000} className={inputClass} /></Field></div>
    <div className="grid gap-3 sm:grid-cols-2"><Field label="Memory limit (MB)"><input name="memoryLimitMb" type="number" min={16} required defaultValue={initial?.memoryLimitMb ?? 256} className={inputClass} /></Field><Field label="Topics (comma separated)"><input name="topics" required defaultValue={initial?.topics.join(", ")} placeholder="Arrays, Graphs" className={inputClass} /></Field></div>
    <fieldset><legend className="mb-2 text-xs text-muted">Supported languages</legend><div className="flex flex-wrap gap-3">{["TypeScript", "Python", "Java", "C++"].map((language) => <label key={language} className="flex items-center gap-1.5 text-xs text-white"><input type="checkbox" name="languages" value={language} defaultChecked={initial?.supportedLanguages.includes(language) ?? language === "TypeScript"} className="accent-[#7c5cf5]" />{language}</label>)}</div></fieldset>
    <Field label="Examples JSON"><textarea required name="examples" defaultValue={JSON.stringify(initial?.examples ?? [{ input: "1 2", output: "3" }], null, 2)} className={`${inputClass} font-mono`} /></Field>
    <Field label="Hidden test cases JSON (mentor-only)"><textarea required name="hiddenTestCases" defaultValue={JSON.stringify(initial?.hiddenTestCases ?? [{ input: "5 7", output: "12" }], null, 2)} className={`${inputClass} font-mono`} /></Field>
    {error && <p role="alert" className="text-xs text-rose-300">{error}</p>}
    <div className="flex gap-2"><button disabled={saving} className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save question"}</button><button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-line px-4 py-2 text-xs text-muted">Cancel</button></div>
  </form>;
}

function QuestionPreview({ question }: { question: MentorQuestion }) {
  return <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1 text-sm">
    <div className="flex gap-2"><StatusBadge value={question.difficulty} /><span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] text-muted">{question.points} points</span></div>
    <p className="whitespace-pre-wrap leading-6 text-muted">{question.statement}</p>
    <div><h4 className="text-xs font-semibold text-white">Input format</h4><p className="mt-1 text-xs text-muted">{question.inputFormat}</p></div>
    <div><h4 className="text-xs font-semibold text-white">Output format</h4><p className="mt-1 text-xs text-muted">{question.outputFormat}</p></div>
    <div><h4 className="text-xs font-semibold text-white">Constraints</h4><ul className="mt-1 list-disc pl-5 text-xs text-muted">{question.constraints.map((item) => <li key={item}>{item}</li>)}</ul></div>
    {question.examples.map((example, index) => <div key={index}><h4 className="text-xs font-semibold text-white">Example {index + 1}</h4><pre className="mt-1 overflow-x-auto rounded-lg bg-black/30 p-3 text-xs text-muted">Input: {example.input}{"\n"}Output: {example.output}{example.explanation ? `\n${example.explanation}` : ""}</pre></div>)}
    <p className="rounded-lg border border-amber-400/20 bg-amber-400/[0.05] p-3 text-xs text-amber-200">{question.hiddenTestCases.length} hidden test cases are stored privately and never shown to students.</p>
  </div>;
}

function Participants({ data, participants, filter, onFilter }: { data: MentorDashboardData; participants: MentorParticipant[]; filter: string; onFilter: (value: string) => void }) {
  return <Panel title="Participants" subtitle="Participant scores are shown without a live leaderboard; rank is available only after a contest completes.">
    <select value={filter} onChange={(event) => onFilter(event.target.value)} className={`${inputClass} mb-4 max-w-64`}><option value="all">All contests</option>{data.contests.map((contest) => <option key={contest.id} value={contest.id}>{contest.title}</option>)}</select>
    <div className="space-y-2">{participants.map((participant) => <ParticipantRow key={participant.id} participant={participant} contest={data.contests.find((item) => item.id === participant.contestId)} />)}</div>
    {participants.length === 0 && <Empty>No participants match your search.</Empty>}
  </Panel>;
}

function ParticipantRow({ participant, contest }: { participant: MentorParticipant; contest?: MentorContest }) {
  return <article className="grid gap-3 rounded-xl border border-line p-4 sm:grid-cols-[1.4fr_1.2fr_repeat(3,0.6fr)] sm:items-center">
    <div><Link href={`/users/${encodeURIComponent(participant.username)}`} className="text-sm font-semibold text-white hover:text-brand-soft">{participant.name}</Link><Link href={`/users/${encodeURIComponent(participant.username)}`} className="mt-1 block text-xs text-brand-soft hover:text-white">@{participant.username}</Link></div>
    <div><p className="truncate text-xs text-muted">{contest?.title ?? "Contest"}</p><p className="mt-1 truncate text-[10px] text-muted">{participant.college}</p></div>
    <p className="text-xs text-muted">{participant.submissions} submissions</p>
    <p className="text-xs font-semibold text-white">{participant.score} pts{contest?.status === "completed" && participant.rank ? ` · #${participant.rank}` : ""}</p>
    <StatusBadge value={participant.status} />
  </article>;
}

function Bookings({ bookings, onUpdate, compact = false }: { bookings: MentorBooking[]; onUpdate: (booking: MentorBooking, status: MentorBooking["status"]) => void; compact?: boolean }) {
  return <Panel title={compact ? "Upcoming sessions" : "Mentorship bookings"} subtitle={compact ? "Manage the latest requests." : "Accept requests, manage sessions, and track earned coins."} action={!compact ? <StatusBadge value={`${bookings.filter((item) => item.status === "requested").length} pending`} /> : <Link href="/mentor/bookings" className="text-xs font-semibold text-brand-soft">Manage all →</Link>}>
    <div className="space-y-3">{bookings.map((booking) => <article key={booking.id} className="flex flex-col justify-between gap-3 rounded-xl border border-line p-4 sm:flex-row sm:items-center">
      <div><Link href={`/users/${encodeURIComponent(booking.username)}`} className="text-sm font-semibold text-white hover:text-brand-soft">{booking.studentName} <span className="text-xs font-normal text-muted">· @{booking.username}</span></Link><p className="mt-1 text-xs text-muted">{booking.topic} · {booking.college}</p><p className="mt-1 text-xs text-muted">{dateLabel(booking.startsAt, true)} – {new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(new Date(booking.endsAt))}</p></div>
      <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-amber-300">+{booking.coinsReceived} coins</span><StatusBadge value={booking.status} />
        {!compact && booking.status === "requested" && <><button onClick={() => onUpdate(booking, "confirmed")} className="rounded-lg bg-brand px-3 py-1.5 text-[11px] font-semibold text-white">Accept</button><button onClick={() => onUpdate(booking, "cancelled")} className="rounded-lg border border-line px-3 py-1.5 text-[11px] text-muted hover:text-white">Reject</button></>}
        {!compact && booking.status === "confirmed" && <button onClick={() => onUpdate(booking, "completed")} className="rounded-lg border border-emerald-400/20 px-3 py-1.5 text-[11px] text-emerald-300">Mark complete</button>}
      </div>
    </article>)}</div>
    {bookings.length === 0 && <Empty>No upcoming bookings.</Empty>}
  </Panel>;
}

function Availability({ data, onAdd, onUpdate }: { data: MentorDashboardData; onAdd: (slot: Omit<MentorDashboardData["availability"][number], "id">) => void; onUpdate: (id: string, status: "available" | "blocked") => void }) {
  const [weekday, setWeekday] = useState("Monday");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("16:00");
  const [endTime, setEndTime] = useState("17:00");
  const [status, setStatus] = useState<"available" | "blocked">("available");
  return <Panel title="Availability" subtitle="Add weekly slots for students to request. Overlapping slots are rejected.">
    <form onSubmit={(event) => { event.preventDefault(); onAdd({ weekday, date: date || undefined, startTime, endTime, status }); }} className="grid gap-3 rounded-xl border border-line p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] lg:items-end">
      <Field label="Weekday"><select value={weekday} onChange={(event) => setWeekday(event.target.value)} className={inputClass}>{["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((day) => <option key={day}>{day}</option>)}</select></Field>
      <Field label="Specific date (optional)"><input type="date" value={date} onChange={(event) => setDate(event.target.value)} className={inputClass} /></Field>
      <Field label="Start time"><input type="time" required value={startTime} onChange={(event) => setStartTime(event.target.value)} className={inputClass} /></Field>
      <Field label="End time"><input type="time" required value={endTime} onChange={(event) => setEndTime(event.target.value)} className={inputClass} /></Field>
      <Field label="Slot type"><select value={status} onChange={(event) => setStatus(event.target.value as "available" | "blocked")} className={inputClass}><option value="available">Available</option><option value="blocked">Block time</option></select></Field>
      <button className="rounded-lg bg-brand px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#8b6cff]">Add slot</button>
    </form>
    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{data.availability.map((slot) => <article key={slot.id} className="flex items-center justify-between rounded-xl border border-line p-4"><div><p className="text-sm font-semibold text-white">{slot.date ? dateLabel(slot.date) : slot.weekday}</p><p className="mt-1 text-xs text-muted">{slot.startTime} – {slot.endTime}</p></div><div className="flex items-center gap-2"><StatusBadge value={slot.status} /><button onClick={() => onUpdate(slot.id, slot.status === "blocked" ? "available" : "blocked")} className="text-[10px] text-brand-soft hover:text-white">{slot.status === "blocked" ? "Unblock" : "Block"}</button></div></article>)}</div>
    <h3 className="mb-3 mt-7 text-sm font-semibold text-white">Upcoming sessions</h3><div className="space-y-2">{data.bookings.filter((booking) => booking.status === "confirmed" || booking.status === "requested").map((booking) => <p key={booking.id} className="rounded-lg bg-white/[0.03] p-3 text-xs text-muted">{dateLabel(booking.startsAt, true)} · {booking.studentName} · {humanStatus(booking.status)}</p>)}</div>
  </Panel>;
}

function Messages({ messages, draft, setDraft, onSend }: { messages: MentorDashboardData["messages"]; draft: string; setDraft: (value: string) => void; onSend: () => void }) {
  return <Panel title="Messages" subtitle="Mentor-to-student messages. Real-time Socket.IO delivery can be connected when the messaging API is ready.">
    <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-line">
      <div className="border-b border-line px-4 py-3"><p className="text-sm font-semibold text-white">{messages[0]?.studentName ?? "Your students"}</p><p className="text-[10px] text-muted">Mentorship conversation · demo preview</p></div>
      <div className="flex min-h-72 flex-col gap-3 bg-black/20 p-4">{messages.map((message) => <div key={message.id} className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-5 ${message.fromMentor ? "self-end bg-brand text-white" : "self-start border border-line bg-card text-muted"}`}><p>{message.body}</p><time className="mt-1 block text-[10px] opacity-70">{dateLabel(message.createdAt, true)}</time></div>)}</div>
      <form onSubmit={(event) => { event.preventDefault(); onSend(); }} className="flex gap-2 border-t border-line p-3"><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message…" className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-black/30 px-3 text-sm text-white outline-none placeholder:text-muted focus:border-brand/50" /><button className="rounded-lg bg-brand px-4 text-xs font-semibold text-white hover:bg-[#8b6cff]">Send</button></form>
    </div>
  </Panel>;
}

function Notifications({ notifications }: { notifications: MentorDashboardData["notifications"] }) {
  return <Panel title="Notifications" subtitle="Booking updates, contest activity, and session reminders.">
    <div className="space-y-2">{notifications.map((item) => <article key={item.id} className="flex gap-3 rounded-xl border border-line p-4"><span className={`mt-1 size-2 shrink-0 rounded-full ${item.read ? "bg-white/20" : "bg-brand"}`} /><div className="min-w-0 flex-1"><div className="flex flex-wrap justify-between gap-2"><h3 className="text-sm font-semibold text-white">{item.title}</h3><time className="text-[10px] text-muted">{dateLabel(item.createdAt, true)}</time></div><p className="mt-1 text-xs leading-5 text-muted">{item.message}</p></div></article>)}</div>
    {notifications.length === 0 && <Empty>You’re all caught up.</Empty>}
  </Panel>;
}

function MentorProfile({ data, onSave }: { data: MentorDashboardData; onSave: (input: Partial<MentorDashboardData["profile"]>) => void }) {
  return <Panel title="Mentor profile" subtitle="Manage your public mentor profile. Approval status is controlled by an administrator.">
    <form onSubmit={(event) => { event.preventDefault(); const f = new FormData(event.currentTarget); onSave({ name: String(f.get("name")), profileImageUrl: String(f.get("profileImageUrl")), headline: String(f.get("headline")), about: String(f.get("about")), organization: String(f.get("organization")), experienceYears: Number(f.get("experienceYears")), skills: String(f.get("skills")).split(",").map((x) => x.trim()).filter(Boolean), languages: String(f.get("languages")).split(",").map((x) => x.trim()).filter(Boolean), githubUrl: String(f.get("githubUrl")), linkedInUrl: String(f.get("linkedInUrl")), portfolioUrl: String(f.get("portfolioUrl")), coinsPerSession: Number(f.get("coinsPerSession")) }); }} className="grid gap-4 sm:grid-cols-2">
      <Field label="Name"><input name="name" required defaultValue={data.profile.name} className={inputClass} /></Field>
      <Field label="Profile image URL"><input name="profileImageUrl" type="url" defaultValue={data.profile.profileImageUrl} className={inputClass} /></Field>
      <Field label="Professional headline"><input name="headline" required defaultValue={data.profile.headline} className={inputClass} /></Field>
      <Field label="College / company"><input name="organization" defaultValue={data.profile.organization} className={inputClass} /></Field>
      <Field label="Experience (years)"><input name="experienceYears" type="number" min={0} defaultValue={data.profile.experienceYears} className={inputClass} /></Field>
      <Field label="Skills (comma separated)"><input name="skills" defaultValue={data.profile.skills.join(", ")} className={inputClass} /></Field>
      <Field label="Programming languages (comma separated)"><input name="languages" defaultValue={data.profile.languages.join(", ")} className={inputClass} /></Field>
      <Field label="GitHub"><input name="githubUrl" type="url" defaultValue={data.profile.githubUrl} className={inputClass} /></Field>
      <Field label="LinkedIn"><input name="linkedInUrl" type="url" defaultValue={data.profile.linkedInUrl} className={inputClass} /></Field>
      <Field label="Portfolio"><input name="portfolioUrl" type="url" defaultValue={data.profile.portfolioUrl} className={inputClass} /></Field>
      <Field label="Session price (coins)"><input name="coinsPerSession" type="number" min={0} defaultValue={data.profile.coinsPerSession} className={inputClass} /></Field>
      <div className="sm:col-span-2"><Field label="About"><textarea name="about" rows={5} defaultValue={data.profile.about} className={inputClass} /></Field></div>
      <div className="sm:col-span-2 flex items-center justify-between"><StatusBadge value={data.profile.approvalStatus} /><button className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#8b6cff]">Save profile</button></div>
    </form>
  </Panel>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-[70] grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
    <section role="dialog" aria-modal="true" aria-label={title} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-card p-5 shadow-2xl shadow-black/50 sm:p-6"><div className="mb-4 flex items-start justify-between gap-3"><h2 className="text-lg font-bold text-white">{title}</h2><button onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-white/5 hover:text-white" aria-label="Close dialog"><DashboardIcon name="close" /></button></div>{children}</section>
  </div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-xs font-medium text-muted">{label}<span className="mt-1 block">{children}</span></label>;
}

const inputClass = "w-full rounded-lg border border-line bg-black/25 px-3 py-2.5 text-sm text-white outline-none placeholder:text-muted focus:border-brand/50";

function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-white/[0.03] p-5 text-center text-sm text-muted">{children}</p>;
}

function localDateTime(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
