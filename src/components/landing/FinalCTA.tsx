import Link from "next/link";

export default function FinalCTA() {
  return (
    <section id="join" className="mx-auto max-w-6xl px-5 py-12 text-center">
      <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
        Ready For Your
        <span className="block text-brand-soft">Dream Company?</span>
      </h2>
      <p className="mx-auto mt-4 max-w-sm text-muted">Create a free account and join your first contest this week.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {/* Point these at your real auth routes */}
        <Link href="/signup" className="rounded-xl bg-brand px-7 py-3.5 font-semibold transition hover:bg-[#8b6cff]">Sign up free</Link>
        <Link href="/login" className="rounded-xl border border-line bg-card px-7 py-3.5 font-semibold transition hover:border-brand">Login</Link>
      </div>
    </section>
  );
}
