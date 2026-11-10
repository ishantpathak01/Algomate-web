import type { AccountRole } from "@/types/user";

export function hasRole(userRole: AccountRole | null, requiredRole: AccountRole): boolean {
  return userRole === requiredRole;
}
