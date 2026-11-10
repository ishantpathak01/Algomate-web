import type { Metadata } from "next";
import AuthPage from "@/features/auth/components/AuthPage";

export const metadata: Metadata = { title: "Onboarding | AlgoMate" };

export default function OnboardingPage() {
  return <AuthPage mode="signup" />;
}
