const iconPaths = {
  overview: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  contest: "M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v1a3 3 0 0 0 4 3M16 6h4v1a3 3 0 0 1-4 3M12 13v4M8 20h8",
  history: "M3 12a9 9 0 1 0 2.64-6.36L3 8m0-5v5h5m4-1v5l3 2",
  mentors: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1M16 5.5a3 3 0 0 1 0 5.5M18 14a5 5 0 0 1 3 5v1",
  bookings: "M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1zm3 8h3m-3 4h8",
  rewards: "M12 3v18m6-14H9a3 3 0 1 0 0 6h6a3 3 0 1 1 0 6H5",
  chat: "M4 5h16v11H9l-5 4z",
  notifications: "M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12h4",
  profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1",
  settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0-5v2m0 14v2m9-9h-2M5 12H3m15.36-6.36-1.42 1.42M7.06 16.94l-1.42 1.42m12.72 0-1.42-1.42M7.06 7.06 5.64 5.64",
  logout: "M10 17l5-5-5-5m5 5H3m9-9h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7",
  search: "m20 20-4.5-4.5M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0z",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  clock: "M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  coin: "M12 3c5 0 9 2 9 4.5S17 12 12 12 3 10 3 7.5 7 3 12 3zm-9 4.5v4c0 2.5 4 4.5 9 4.5s9-2 9-4.5v-4M3 11v4c0 2.5 4 4.5 9 4.5s9-2 9-4.5v-4",
  trend: "m3 17 6-6 4 4 8-8m-6 0h6v6",
  check: "m5 12 4 4L19 6",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6 6 18",
  bell: "M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12h4",
} as const;

export type DashboardIconName = keyof typeof iconPaths;

export default function DashboardIcon({
  name,
  className = "size-5",
}: {
  name: DashboardIconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}
