import type { Metadata } from "next";
import AuthPage from "@/features/auth/components/AuthPage";

export const metadata: Metadata = {
  title: "Mentor sign in | AlgoMate",
};

export default function MentorLoginPage() {
  return <AuthPage mode="login" audience="mentor" />;
}
