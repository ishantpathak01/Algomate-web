"use client";

import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";

export function useAuth() {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const { user } = useUser();
  return { user, isLoaded, isAuthenticated: isSignedIn === true };
}
