import { contests } from "@/services/mock/contests";

export default function Sponsors() {
  const names = [...new Set(contests.map((c) => c.sponsor))];
  return (
    <section className="border-y border-line py-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 text-sm text-muted">
        <span>Contests sponsored by</span>
        {names.map((n) => <b key={n} className="text-base font-semibold text-white/80">{n}</b>)}
      </div>
    </section>
  );
}
