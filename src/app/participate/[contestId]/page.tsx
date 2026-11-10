export default function ParticipatePage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-6 md:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="text-sm text-brand-soft">CONTEST SESSION</p>
          <h1 className="mt-1 text-2xl font-semibold">Participation workspace</h1>
        </div>
        <div className="rounded-xl border border-line px-4 py-2 text-sm text-muted">Timer integration pending</div>
      </header>
      <div className="mt-6 grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold">Questions</h2>
          <p className="mt-2 text-sm text-muted">Question list loads from the contest service.</p>
        </aside>
        <section className="min-h-[65vh] rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold">Code workspace</h2>
          <p className="mt-2 text-sm text-muted">Editor and trusted code runner integration pending.</p>
        </section>
      </div>
    </main>
  );
}
