"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import DashboardIcon from "./DashboardIcon";
import type { DashboardContest, DashboardMentor, DashboardNotification } from "@/features/users/types/dashboard";

type SearchItem = { label: string; href: string; kind: "Contest" | "Mentor" };

export default function DashboardHeader({
  coinBalance,
  notifications,
  unreadNotifications,
  displayName,
  profileImage,
  contests,
  mentors,
  onMenuClick,
  onLogout,
}: {
  coinBalance: number;
  notifications: DashboardNotification[];
  unreadNotifications: number;
  displayName: string;
  profileImage?: string;
  contests: DashboardContest[];
  mentors: DashboardMentor[];
  onMenuClick: () => void;
  onLogout: () => void;
}) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function dismiss(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setSearchOpen(false);
    }
    document.addEventListener("mousedown", dismiss);
    return () => document.removeEventListener("mousedown", dismiss);
  }, []);

  const searchItems: SearchItem[] = [
    ...contests.map((contest) => ({
      label: contest.title,
      href: `/contests/${encodeURIComponent(contest.id)}`,
      kind: "Contest" as const,
    })),
    ...mentors.map((mentor) => ({
      label: mentor.name,
      href: `/mentors/${encodeURIComponent(mentor.id)}`,
      kind: "Mentor" as const,
    })),
  ];
  const results = query.trim()
    ? searchItems.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b border-line bg-black/90 px-4 backdrop-blur md:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="rounded-xl p-2 text-muted transition hover:bg-white/5 hover:text-white md:hidden"
      >
        <DashboardIcon name="menu" />
      </button>
      <div className="relative max-w-[440px] flex-1" ref={searchRef}>
        <DashboardIcon name="search" className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
          placeholder="Search contests or mentors"
          aria-label="Search contests or mentors"
          className="h-10 w-full rounded-xl border border-line bg-card pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-muted focus:border-brand/60 focus:ring-4 focus:ring-brand/10"
        />
        {searchOpen && query.trim() && (
          <div className="absolute left-0 right-0 top-12 z-40 overflow-hidden rounded-xl border border-line bg-card p-2 shadow-xl shadow-black/40">
            {results.length ? results.map((item) => (
              <Link
                key={`${item.kind}-${item.href}`}
                href={item.href}
                onClick={() => {
                  setQuery("");
                  setSearchOpen(false);
                }}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-muted transition hover:bg-brand/10 hover:text-white"
              >
                <span>{item.label}</span>
                <span className="text-xs text-muted">{item.kind}</span>
              </Link>
            )) : <p className="px-3 py-3 text-sm text-muted">No matching contests or mentors.</p>}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="relative">
          <button
            type="button"
            aria-label={`Notifications, ${unreadNotifications} unread`}
            aria-expanded={notificationsOpen}
            onClick={() => {
              setNotificationsOpen((open) => !open);
              setProfileOpen(false);
            }}
            className="relative grid size-10 place-items-center rounded-xl text-muted transition hover:bg-white/5 hover:text-white"
          >
            <DashboardIcon name="bell" className="size-[19px]" />
            {unreadNotifications > 0 && (
              <span className="absolute right-1 top-1 grid min-h-[17px] min-w-[17px] place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unreadNotifications}
              </span>
            )}
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 top-12 z-40 w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-line bg-card p-4 shadow-xl shadow-black/40">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Notifications</h2>
                <span className="text-xs text-brand-soft">{unreadNotifications} new</span>
              </div>
              <div className="mt-3 space-y-3">
                {notifications.length ? notifications.slice(0, 3).map((notification) => (
                  <article key={notification.id} className="rounded-xl border border-line bg-white/[0.03] p-3">
                    <p className="text-xs font-semibold text-white">{notification.title}</p>
                    <p className="mt-1 text-xs leading-5 text-muted">{notification.message}</p>
                  </article>
                )) : <p className="rounded-xl bg-white/[0.03] p-3 text-xs text-muted">You’re all caught up.</p>}
              </div>
              <Link href="/student/notifications" onClick={() => setNotificationsOpen(false)} className="mt-3 inline-flex text-xs font-semibold text-brand-soft hover:text-white">
                View all notifications
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-amber-400/20 bg-amber-400/[0.07] px-2.5 py-2 sm:gap-2 sm:px-3">
          <DashboardIcon name="coin" className="size-[17px] text-amber-300" />
          <span className="text-xs font-semibold text-amber-200">
            {coinBalance.toLocaleString()}<span className="hidden sm:inline"> coins</span>
          </span>
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
            onClick={() => {
              setProfileOpen((open) => !open);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-white/5"
          >
            {profileImage ? (
              // Clerk or profile-service image URL.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profileImage} alt="" className="size-9 rounded-full object-cover" />
            ) : (
              <span className="grid size-9 place-items-center rounded-full bg-brand/20 text-sm font-bold text-brand-soft">
                {displayName.trim().charAt(0).toUpperCase()}
              </span>
            )}
            <span className="hidden text-left sm:block">
              <span className="block max-w-28 truncate text-xs font-semibold text-white">{displayName}</span>
              <span className="block text-[10px] text-muted">Student</span>
            </span>
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-12 z-40 w-48 rounded-xl border border-line bg-card p-2 shadow-xl shadow-black/40">
              <Link href="/student/profile" onClick={() => setProfileOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-white/5 hover:text-white">
                My profile
              </Link>
              <Link href="/student/profile" onClick={() => setProfileOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-white/5 hover:text-white">
                Settings
              </Link>
              <button type="button" onClick={onLogout} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-300 transition hover:bg-rose-400/10">
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
