import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import Chatbot from "@/components/shared/Chatbot";
import { Hero, Sponsors, Features, Topics, HowItWorks, Contests, Mentors, Rewards, Faq, FinalCTA } from "@/components/landing";
import MentorCTA from "@/components/landing/MentorCTA";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Sponsors />
        <Features />
        <Topics />
        <HowItWorks />
        <Contests />
        <Mentors />
        <Rewards />
        <Faq />
        <FinalCTA />
        <MentorCTA />
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}
