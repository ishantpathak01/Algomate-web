import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CursorGlow from "@/components/common/CursorGlow";
import AuthProvider from "@/components/common/AuthProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AlgoMate – Compete, learn, earn",
  description: "Join coding contests, learn from mentors and earn rewards on AlgoMate.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <div className="bg-glow" aria-hidden />
        <CursorGlow />
        <AuthProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
