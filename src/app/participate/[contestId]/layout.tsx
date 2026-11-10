import type { ReactNode } from "react";

export default function ParticipationLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#07070a]">{children}</div>;
}
