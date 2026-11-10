"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/ui/Logo";
import DashboardIcon, { type DashboardIconName } from "./DashboardIcon";

const navigation: Array<{ label: string; href: string; icon: DashboardIconName }> = [
  { label: "Overview", href: "/student/dashboard", icon: "overview" },
  { label: "Explore contests", href: "/student/contests", icon: "contest" },
  { label: "My contest history", href: "/student/history", icon: "history" },
  { label: "Find mentors", href: "/mentors", icon: "mentors" },
  { label: "My bookings", href: "/student/bookings", icon: "bookings" },
  { label: "Rewards & coins", href: "/student/rewards", icon: "rewards" },
  { label: "Chat", href: "/student/chat", icon: "chat" },
  { label: "Notifications", href: "/student/notifications", icon: "notifications" },
  { label: "My profile", href: "/student/profile", icon: "profile" },
  { label: "Settings", href: "/student/profile", icon: "settings" },
];

export default function DashboardSidebar({
  mobileOpen,
  onClose,
  onLogout,
}: {
  mobileOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-line bg-black px-4 py-5 transition-transform duration-200 md:sticky md:top-0 md:z-20 md:h-screen md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <Link href="/student/dashboard" aria-label="AlgoMate student dashboard">
            <Logo className="text-white" />
          </Link>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-muted transition hover:bg-white/5 hover:text-white md:hidden" aria-label="Close menu">
            <DashboardIcon name="close" />
          </button>
        </div>

        <p className="mb-3 mt-10 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          Learning space
        </p>
        <nav className="space-y-1" aria-label="Student navigation">
          {navigation.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/student/dashboard" && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition ${
                  active
                    ? "bg-brand/15 text-brand-soft"
                    : "text-muted hover:bg-white/5 hover:text-white"
                }`}
              >
                <DashboardIcon name={item.icon} className="size-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-brand/20 bg-brand/[0.07] p-4">
          <p className="text-sm font-semibold text-white">Keep the momentum</p>
          <p className="mt-1 text-xs leading-5 text-muted">A little practice today can make your next contest count.</p>
          <Link href="/student/contests" onClick={onClose} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-brand-soft">
            Browse contests <DashboardIcon name="arrow" className="size-3.5" />
          </Link>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-muted transition hover:bg-rose-400/10 hover:text-rose-300"
        >
          <DashboardIcon name="logout" className="size-[18px]" />
          Log out
        </button>
      </aside>
    </>
  );
}
