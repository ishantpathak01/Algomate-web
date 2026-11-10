"use client";

import Link from "next/link";
import { SignIn, SignUp } from "@clerk/nextjs";
import Icon from "@/components/ui/Icon";
import Logo from "@/components/ui/Logo";

type AuthPageProps = {
  mode: "login" | "signup";
  audience?: "student" | "mentor";
};

export default function AuthPage({ mode, audience = "student" }: AuthPageProps) {
  const isSignup = mode === "signup";
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const dashboardPath = audience === "mentor" ? "/mentor/dashboard" : "/dashboard";
  const signInPath = audience === "mentor" ? "/login/mentor" : "/login";
  const signUpPath = audience === "mentor" ? "/signup/mentor" : "/signup";

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="relative grid w-full max-w-5xl gap-8 overflow-hidden rounded-3xl border border-line bg-card p-6 shadow-2xl shadow-black/20 sm:p-9 md:grid-cols-[0.9fr_1.1fr] md:gap-12 md:p-12">
        <div className="absolute -left-24 -top-24 size-64 rounded-full bg-brand/10 blur-3xl" aria-hidden />
        <div className="relative flex flex-col justify-center">
          <Link href="/" aria-label="AlgoMate home" className="mb-8 inline-flex">
            <Logo />
          </Link>
          <p className="text-sm font-medium text-brand-soft">{isSignup ? "START FOR FREE" : "WELCOME BACK"}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            {isSignup ? "Create your account" : "Sign in to AlgoMate"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {isSignup ? "Join the community and start making progress." : "Pick up right where you left off."}
          </p>

          <div className="mt-8 rounded-2xl border border-line bg-black/20 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Everything you need to grow</p>
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand-soft">
                  <Icon name="code" className="size-[18px]" />
                </span>
                <div>
                  <p className="text-sm font-medium">Practice at your pace</p>
                  <p className="mt-0.5 text-xs text-muted">280+ problems across core topics</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand-soft">
                  <Icon name="trophy" className="size-[18px]" />
                </span>
                <div>
                  <p className="text-sm font-medium">Put your skills to the test</p>
                  <p className="mt-0.5 text-xs text-muted">Join weekly coding contests</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand-soft">
                  <Icon name="users" className="size-[18px]" />
                </span>
                <div>
                  <p className="text-sm font-medium">Learn with mentors</p>
                  <p className="mt-0.5 text-xs text-muted">Get guidance from working engineers</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative rounded-2xl border border-line bg-black/20 p-5 sm:p-7">
          <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
              {isSignup ? "Secure account setup" : "Secure account access"}
            </p>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
              Powered by Clerk
            </span>
          </div>

          {clerkConfigured ? (
            <div className="flex justify-center">
              {isSignup ? (
                <SignUp routing="hash" signInUrl={signInPath} forceRedirectUrl={dashboardPath} />
              ) : (
                <SignIn routing="hash" signUpUrl={signUpPath} forceRedirectUrl={dashboardPath} />
              )}
            </div>
          ) : (
            <p role="status" className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm leading-6 text-amber-100">
              Clerk is not configured yet. Add the Clerk publishable key to the frontend environment
              and the matching publishable and secret keys to <code>backend/.env</code>.
            </p>
          )}

          <p className="mt-6 text-center text-sm text-muted">
            {isSignup ? "Already have an account?" : "New to AlgoMate?"}{" "}
            <Link href={isSignup ? signInPath : signUpPath} className="font-semibold text-brand-soft hover:underline">
              {isSignup ? "Sign in" : "Create an account"}
            </Link>
          </p>
          <Link href="/" className="mt-6 flex items-center justify-center gap-2 text-sm text-muted transition hover:text-white">
            <span aria-hidden>←</span> Back to AlgoMate
          </Link>
        </div>
      </section>
    </main>
  );
}
