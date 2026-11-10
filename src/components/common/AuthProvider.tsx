"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { useEffect, type ReactNode } from "react";
import { setAccessTokenGetter } from "@/lib/api/client";

function ApiTokenBridge() {
  const { getToken } = useAuth();

  useEffect(() => {
    setAccessTokenGetter(getToken);
    return () => setAccessTokenGetter(null);
  }, [getToken]);

  return null;
}

export default function AuthProvider({
  children,
  publishableKey,
}: {
  children: ReactNode;
  publishableKey?: string;
}) {
  if (!publishableKey) return children;

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ApiTokenBridge />
      {children}
    </ClerkProvider>
  );
}
