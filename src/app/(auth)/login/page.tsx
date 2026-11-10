import type { Metadata } from "next";
import AuthPage from "@/features/auth/components/AuthPage";

export const metadata: Metadata = {
  title: "Log in | AlgoMate",
};

export default function LoginPage() {
  return <AuthPage mode="login" />;
}
