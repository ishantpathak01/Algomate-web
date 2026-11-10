import DashboardIcon, { type DashboardIconName } from "./DashboardIcon";
import type { StudentDashboardData } from "@/features/users/types/dashboard";

const cards: Array<{
  label: string;
  value: (data: StudentDashboardData) => string;
  note: string | ((data: StudentDashboardData) => string);
  icon: DashboardIconName;
  accent: string;
}> = [
  {
    label: "Contests participated",
    value: (data) => data.stats.contestsParticipated.toLocaleString(),
    note: "Keep showing up",
    icon: "contest",
    accent: "bg-blue-400/10 text-blue-300",
  },
  {
    label: "Contests won",
    value: (data) => data.stats.contestsWon.toLocaleString(),
    note: "Every win starts with practice",
    icon: "contest",
    accent: "bg-amber-400/10 text-amber-300",
  },
  {
    label: "Coin balance",
    value: (data) => data.stats.coinBalance.toLocaleString(),
    note: "Ready to spend on rewards",
    icon: "coin",
    accent: "bg-brand/10 text-brand-soft",
  },
  {
    label: "Average contest score",
    value: (data) => `${data.stats.averageScore}%`,
    note: (data) => `${data.stats.scoreChange >= 0 ? "+" : ""}${data.stats.scoreChange}% from last month`,
    icon: "trend",
    accent: "bg-emerald-400/10 text-emerald-300",
  },
];

export default function StatsCards({ data }: { data: StudentDashboardData }) {
  return (
    <section aria-label="Contest statistics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="rounded-2xl border border-line bg-card p-5 shadow-sm shadow-black/20 transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[13px] font-medium text-muted">{card.label}</p>
            <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${card.accent}`}>
              <DashboardIcon name={card.icon} className="size-[19px]" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-white">{card.value(data)}</p>
          <p className="mt-1 text-xs text-muted">
            {typeof card.note === "function" ? card.note(data) : card.note}
          </p>
        </article>
      ))}
    </section>
  );
}
