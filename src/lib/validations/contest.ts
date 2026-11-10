export function validateContestSchedule(startsAt: string, endsAt: string): string | null {
  const start = Date.parse(startsAt);
  const end = Date.parse(endsAt);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return "Enter valid contest dates.";
  if (end <= start) return "Contest end time must be after its start time.";
  return null;
}
