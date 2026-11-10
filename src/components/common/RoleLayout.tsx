import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "@/components/ui/Logo";
import Sidebar, { type SidebarItem } from "./Sidebar";

export default function RoleLayout({
  children,
  title,
  items,
}: {
  children: ReactNode;
  title: string;
  items: SidebarItem[];
}) {
  return (
    <div className="min-h-screen bg-[#07070a]">
      <header className="flex h-16 items-center justify-between border-b border-line bg-black/90 px-5 md:px-8">
        <Link href="/" aria-label="AlgoMate home"><Logo /></Link>
        <span className="text-sm text-muted">{title} workspace</span>
      </header>
      <div className="mx-auto grid max-w-7xl md:grid-cols-[220px_1fr]">
        <Sidebar title={title} items={items} />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
