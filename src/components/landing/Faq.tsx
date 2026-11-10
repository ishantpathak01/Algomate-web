import SectionTitle from "@/components/ui/SectionTitle";

const faqs = [
  ["Is AlgoMate free to join?", "Yes. Creating an account is free, and most contests are free to enter."],
  ["How do I earn coins?", "You earn coins for solving problems, placing in contests and keeping daily streaks."],
  ["What can I redeem coins for?", "Mentor sessions, contest fee waivers and AlgoMate merch."],
  ["Who are the mentors?", "Working engineers from top tech companies who have been through the same interviews."],
];

export default function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-12">
      <SectionTitle title="Common" accent="Questions" />
      <div className="space-y-3">
        {faqs.map(([q, a]) => (
          <details key={q} className="group rounded-2xl border border-line bg-card px-5 py-4 open:border-brand">
            <summary className="cursor-pointer list-none font-medium after:float-right after:text-brand-soft after:content-['+'] group-open:after:content-['–']">{q}</summary>
            <p className="mt-2 text-sm text-muted">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
