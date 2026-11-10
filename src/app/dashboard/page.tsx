import type { Metadata } from "next";
import DashboardRoleRedirect from "@/components/auth/DashboardRoleRedirect";

export const metadata: Metadata = {
  title: "Dashboard | AlgoMate",
};

export default function DashboardPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-5 text-foreground">
        <p role="status" className="max-w-lg rounded-xl border border-amber-300/20 bg-amber-300/5 p-5 text-sm leading-6 text-amber-100">
          Clerk is not configured. Add the Clerk publishable key to the frontend environment before opening your dashboard.
        </p>
      </main>
    );
  }

  return <DashboardRoleRedirect />;
}
