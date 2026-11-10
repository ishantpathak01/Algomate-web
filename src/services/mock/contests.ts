export type Contest = {
  level: "Beginner" | "Intermediate" | "Advanced";
  title: string;
  sponsor: string;
  prize: string;
  startsAt: string; // ISO date with timezone. Replace with real dates from your API.
};

export const contests: Contest[] = [
  { level: "Beginner", title: "Arrays & Hashing Sprint", sponsor: "Zeta Labs", prize: "₹25,000", startsAt: "2026-11-15T20:00:00+05:30" },
  { level: "Intermediate", title: "Graphs & DP Showdown", sponsor: "Cloudnine", prize: "₹50,000", startsAt: "2026-11-22T20:00:00+05:30" },
  { level: "Advanced", title: "Monthly Grand Prix", sponsor: "Nimbus Pay", prize: "₹1,00,000", startsAt: "2026-11-29T20:00:00+05:30" },
];

/** Same text on server and client (fixed timezone), so no hydration mismatch. */
export function formatStart(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata",
  }) + " IST";
}
