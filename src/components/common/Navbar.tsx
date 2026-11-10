"use client";
import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { Suspense, useState } from "react";
import Icon, { IconName } from "@/components/ui/Icon";
import Logo from "@/components/ui/Logo";

const links: { href: string; label: string; icon: IconName }[] = [
  { href: "/#home", label: "Home", icon: "home" },
  { href: "/#contests", label: "Contests", icon: "trophy" },
  { href: "/#mentors", label: "Mentors", icon: "users" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label="AlgoMate home"><Logo /></Link>

        <nav className="hidden gap-8 text-sm text-muted md:flex" aria-label="Main">
          {links.map((l) => (
            <Link key={l.label} href={l.href} className="flex items-center gap-2 transition hover:text-white">
              <Icon name={l.icon} className="size-[18px]" />
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
            <Suspense fallback={<span className="size-9" />}>
              <Show when="signed-out">
                <Link href="/login" className="hidden rounded-xl px-3 py-2 text-sm font-medium text-muted transition hover:text-white sm:block">
                  Log in
                </Link>
                <Link href="/signup" className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-medium transition hover:bg-[#8b6cff]">
                  <Icon name="user" className="size-4" />
                  Sign up
                </Link>
              </Show>
              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  className="hidden rounded-xl border border-brand/30 bg-brand/10 px-4 py-2 text-sm font-medium text-brand-soft transition hover:border-brand/60 hover:bg-brand/20 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:block"
                >
                  Dashboard
                </Link>
                <UserButton />
              </Show>
            </Suspense>
          ) : (
            <>
              <Link href="/login" className="hidden rounded-xl px-3 py-2 text-sm font-medium text-muted transition hover:text-white sm:block">
                Log in
              </Link>
              <Link href="/signup" className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-medium transition hover:bg-[#8b6cff]">
                <Icon name="user" className="size-4" />
                Sign up
              </Link>
            </>
          )}
          <button className="rounded-lg p-2 text-muted md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line px-5 py-2 md:hidden" aria-label="Mobile">
          {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && (
            <Suspense fallback={null}>
              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 py-2.5 font-medium text-muted transition hover:text-brand-soft"
                >
                  <Icon name="home" className="size-[18px]" />
                  Dashboard
                </Link>
              </Show>
            </Suspense>
          )}
          {links.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="flex items-center gap-3 py-2.5 text-muted hover:text-white">
              <Icon name={l.icon} className="size-[18px]" />
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
