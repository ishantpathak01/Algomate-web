import Link from "next/link";
import Countdown from "@/components/ui/Countdown";
import SectionTitle from "@/components/ui/SectionTitle";
import { contests, formatStart } from "@/services/mock/contests";

export default function Contests() {
  return (
    <section id="contests" className="mx-auto max-w-6xl px-5 py-12">
      <SectionTitle title="Upcoming" accent="Contests" sub="Register now and get a reminder before it starts." />
      <div className="grid gap-4 lg:grid-cols-3">
        {contests.map((c) => (
          <article key={c.title} className="flex flex-col gap-3 rounded-2xl border border-line bg-card p-6 transition hover:border-brand">
            <p className="text-sm text-muted">{c.level} · {c.sponsor}</p>
            <h3 className="text-lg font-semibold">{c.title}</h3>
            <p className="text-sm text-muted">{formatStart(c.startsAt)}</p>
            <p className="text-3xl font-semibold text-brand-soft">{c.prize}</p>
            <Countdown target={c.startsAt} />
            <Link href="/signup" className="mt-auto rounded-xl bg-brand py-3 text-center font-medium transition hover:bg-[#8b6cff]">Register</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
