"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { platformApi } from "@/lib/api/endpoints";

export default function DashboardRoleRedirect() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace("/login");
      return;
    }

    let active = true;
    void platformApi.auth.currentUser()
      .then((user) => {
        if (!active) return;
        const destination = user.role === "mentor"
          ? "/mentor/dashboard"
          : user.role === "admin"
            ? "/admin/dashboard"
            : "/student/dashboard";
        router.replace(destination);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Could not verify your account role.");
        }
      });

    return () => {
      active = false;
    };
  }, [attempt, isLoaded, isSignedIn, router]);

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-5 text-foreground">
        <section className="w-full max-w-lg rounded-2xl border border-line bg-card p-7 text-center">
          <h1 className="text-xl font-semibold">Could not open your dashboard</h1>
          <p role="alert" className="mt-3 text-sm leading-6 text-muted">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setError("");
                setAttempt((value) => value + 1);
              }}
              className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#8b6cff]"
            >
              Try again
            </button>
            <Link href="/" className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-muted hover:text-white">
              Back home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background text-muted">
      <div role="status" className="flex items-center gap-3 text-sm">
        <span className="size-5 animate-spin rounded-full border-2 border-brand/20 border-t-brand" />
        Verifying your account and opening your dashboard…
      </div>
    </main>
  );
}
