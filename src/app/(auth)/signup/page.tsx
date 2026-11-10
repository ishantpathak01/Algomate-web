import type { Metadata } from "next";
import AuthPage from "@/features/auth/components/AuthPage";

export const metadata: Metadata = {
  title: "Sign up | AlgoMate",
};

export default function SignupPage() {
  return <AuthPage mode="signup" />;
}
