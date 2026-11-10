import SectionTitle from "@/components/ui/SectionTitle";

const earn = [["Solve a problem", "+10"], ["Finish in a contest top 10", "+200"], ["7-day streak", "+50"]];
const redeem = [["30-min mentor session", "500 coins"], ["Contest entry fee waiver", "150 coins"], ["AlgoMate merch", "1,200 coins"]];

function Column({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      {rows.map(([a, b]) => (
        <div key={a} className="flex items-center justify-between gap-3 border-b border-line py-3 text-sm last:border-0">
          <span className="text-muted">{a}</span>
          <b className="whitespace-nowrap text-brand-soft">{b}</b>
        </div>
      ))}
    </div>
  );
}

export default function Rewards() {
  return (
    <section id="rewards" className="mx-auto max-w-6xl px-5 py-12">
      <SectionTitle title="Coins That" accent="Actually Help" sub="Earn them by practicing. Spend them on things that help." />
      <div className="grid gap-4 md:grid-cols-2">
        <Column title="Earn" rows={earn} />
        <Column title="Redeem" rows={redeem} />
      </div>
    </section>
  );
}
