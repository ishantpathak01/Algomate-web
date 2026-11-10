import type { DashboardActivity } from "@/features/users/types/dashboard";
import DashboardIcon, { type DashboardIconName } from "./DashboardIcon";

const activityIcons: Record<DashboardActivity["kind"], DashboardIconName> = {
  contest: "contest",
  coins: "coin",
  booking: "bookings",
  profile: "profile",
};

function formatRelative(value: string) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(value));
}

export default function RecentActivity({ activities }: { activities: DashboardActivity[] }) {
  return (
    <section className="rounded-2xl border border-line bg-card p-5 shadow-sm shadow-black/20 sm:p-6">
      <h2 className="text-base font-bold text-white">Recent activity</h2>
      <p className="mt-1 text-xs text-muted">A quick look at what you’ve been up to.</p>
      {activities.length === 0 ? (
        <p className="mt-5 rounded-xl bg-white/[0.03] p-5 text-center text-sm text-muted">Your recent activity will appear here.</p>
      ) : (
        <ol className="mt-5">
          {activities.map((activity, index) => (
            <li key={activity.id} className="relative flex gap-3 pb-5 last:pb-0">
              {index < activities.length - 1 && <span aria-hidden className="absolute left-[15px] top-8 h-[calc(100%-1.25rem)] w-px bg-line" />}
              <span className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full ${
                activity.kind === "coins" ? "bg-amber-400/10 text-amber-300" : "bg-brand/10 text-brand-soft"
              }`}>
                <DashboardIcon name={activityIcons[activity.kind]} className="size-4" />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="text-xs font-semibold text-white">{activity.title}</p>
                  <time className="text-[10px] text-muted" dateTime={activity.date}>{formatRelative(activity.date)}</time>
                </div>
                <p className="mt-1 text-xs leading-5 text-muted">{activity.description}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
