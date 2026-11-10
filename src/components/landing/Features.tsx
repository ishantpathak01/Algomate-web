import SectionTitle from "@/components/ui/SectionTitle";

const items = [
  { title: "Coding contests", text: "Join timed rounds with live leaderboards and prizes from sponsors." },
  { title: "Mentor sessions", text: "Book 1:1 sessions for mock interviews, code reviews and a clear study plan." },
  { title: "Coin rewards", text: "Collect coins for every solve, rank and streak, then spend them on perks." },
  { title: "Live leaderboards", text: "See your rank update as you solve, and compare with friends." },
  { title: "Daily streaks", text: "Build a habit. Keep a streak going and earn bonus coins every week." },
  { title: "Sponsor prizes", text: "Win cash prizes and fast-track interviews from companies that hire." },
];

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-12">
      <SectionTitle title="Everything You Need" accent="To Level Up" sub="Practice, compete and get guidance in one place." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f) => (
          <div key={f.title} className="rounded-2xl border border-line bg-card p-6 transition hover:border-brand">
            <h3 className="mb-2 font-semibold">{f.title}</h3>
            <p className="text-sm leading-relaxed text-muted">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
