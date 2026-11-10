import type { Metadata } from "next";
import AuthPage from "@/features/auth/components/AuthPage";

export const metadata: Metadata = {
  title: "Become a mentor | AlgoMate",
};

export default function MentorSignupPage() {
  return <AuthPage mode="signup" audience="mentor" />;
}
