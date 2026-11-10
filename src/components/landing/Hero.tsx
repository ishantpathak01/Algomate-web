import Link from "next/link";
import Countdown from "@/components/ui/Countdown";
import { contests, formatStart } from "@/services/mock/contests";

const perks = [
  "Weekly coding contests with sponsor prizes",
  "1:1 sessions with working engineers",
  "Coins for every solve, redeemable for perks",
  "Free practice problems and concept guides",
];

// Placeholder platform numbers – replace with your real ones.
const stats = [["280+", "Practice problems"], ["65+", "Core concepts"]];

export default function Hero() {
  const next = contests[0];
  return (
    <section id="home" className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-12 lg:grid-cols-[1.1fr_1fr] lg:py-20">
      <div className="text-center lg:text-left">
        <h1 className="rise text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Compete. Learn.
          <span className="block text-brand-soft">Earn rewards.</span>
        </h1>
        <p className="rise mx-auto mt-5 max-w-md text-base text-muted sm:text-lg lg:mx-0 [animation-delay:100ms]">
          Join coding contests, get guidance from mentors and earn coins for every problem you solve.
        </p>
        <div className="rise mt-8 flex flex-wrap justify-center gap-3 lg:justify-start [animation-delay:200ms]">
          <Link href="#contests" className="rounded-xl bg-brand px-6 py-3 font-medium transition hover:bg-[#8b6cff]">Explore contests</Link>
          <Link href="#mentors" className="rounded-xl border border-line bg-card px-6 py-3 font-medium transition hover:border-brand">Find mentors</Link>
        </div>
        <p className="rise mt-5 text-sm text-muted [animation-delay:300ms]">Free to join. No credit card needed.</p>
      </div>

      <div className="rise space-y-3 [animation-delay:250ms]">
        <div className="rounded-2xl border border-line bg-card p-5">
          <div className="flex items-center justify-between text-xs text-muted">
            <span><span className="mr-2 inline-block size-2 animate-pulse rounded-full bg-emerald-400" />Next contest</span>
            <span>Sponsored by {next.sponsor}</span>
          </div>
          <h3 className="mt-2 font-semibold">{next.title}</h3>
          <p className="mt-1 text-sm text-muted">{formatStart(next.startsAt)}</p>
          <p className="mb-4 mt-2 text-lg font-semibold text-brand-soft">{next.prize} prize pool</p>
          <Countdown target={next.startsAt} />
        </div>

        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="mb-3 text-xs text-muted">What you get</p>
          <ul className="space-y-2.5 text-sm">
            {perks.map((p) => (
              <li key={p} className="flex gap-3">
                <span className="mt-0.5 text-brand-soft">✓</span><span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stats.map(([n, l]) => (
            <div key={l} className="rounded-2xl border border-line bg-card p-5">
              <p className="text-2xl font-semibold text-brand-soft">{n}</p>
              <p className="mt-1 text-xs text-muted">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
