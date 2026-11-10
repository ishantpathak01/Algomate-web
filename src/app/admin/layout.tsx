import type { ReactNode } from "react";
import RoleLayout from "@/components/common/RoleLayout";

const items = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Users", href: "/admin/users" },
  { label: "Mentors", href: "/admin/mentors" },
  { label: "Contests", href: "/admin/contests" },
  { label: "Questions", href: "/admin/questions" },
  { label: "Analytics", href: "/admin/analytics" },
  { label: "Audit logs", href: "/admin/audit-logs" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RoleLayout title="Admin" items={items}>{children}</RoleLayout>;
}
