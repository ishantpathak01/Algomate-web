import Link from "next/link";
import SectionTitle from "@/components/ui/SectionTitle";
import { mentors } from "@/services/mock/mentors";

export default function Mentors() {
  return (
    <section id="mentors" className="mx-auto max-w-6xl px-5 py-12">
      <SectionTitle title="Learn From" accent="Real Engineers" sub="Mentors who have been through the same interviews." />
      <div className="grid gap-4 lg:grid-cols-3">
        {mentors.map((m) => (
          <article key={m.name} className="rounded-2xl border border-line bg-card p-6 transition hover:border-brand">
            <div className="mb-4 grid size-12 place-items-center rounded-full bg-brand/20 text-lg font-bold text-brand-soft">{m.name[0]}</div>
            <h3 className="font-bold">{m.name}</h3>
            <p className="text-sm text-muted">{m.role}</p>
            <ul className="my-4 flex flex-wrap gap-1.5">
              {m.skills.map((s) => <li key={s} className="rounded-full border border-line px-3 py-0.5 text-xs text-muted">{s}</li>)}
            </ul>
            <div className="flex items-center justify-between text-sm text-muted">
              <span>★ {m.rating} · {m.sessions} sessions</span>
              <Link href="#join" className="font-semibold text-brand-soft hover:underline">Book</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
