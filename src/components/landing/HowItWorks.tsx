import SectionTitle from "@/components/ui/SectionTitle";

const steps = [
  ["Create your profile", "Pick your target company and how long you have to prepare."],
  ["Join a contest", "Register for an upcoming round and solve problems against the clock."],
  ["Learn from a mentor", "Review your solutions and fix gaps in a 1:1 session."],
  ["Collect coins", "Earn for every solve and rank, then redeem them in the rewards store."],
];

export default function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-5 py-12">
      <SectionTitle title="From Sign Up" accent="To Your First Reward" />
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(([t, d], i) => (
          <li key={t} className="rounded-2xl border border-line bg-card p-6">
            <span className="mb-4 grid size-8 place-items-center rounded-full border border-brand text-sm font-semibold text-brand-soft">{i + 1}</span>
            <h3 className="font-semibold">{t}</h3>
            <p className="mt-1.5 text-sm text-muted">{d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
