import type { StudentDashboardData } from "@/features/users/types/dashboard";

const futureDate = (daysAhead: number, hour: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

export const sampleStudentDashboard: StudentDashboardData = {
  profile: {
    name: "Alex Morgan",
    username: "alexmorgan",
    college: "Northstar Institute of Technology",
  },
  stats: {
    contestsParticipated: 18,
    contestsWon: 4,
    coinBalance: 1280,
    averageScore: 76,
    scoreChange: 8,
  },
  upcomingContests: [
    {
      id: "arrays-hashing-sprint",
      title: "Arrays & Hashing Sprint",
      startsAt: futureDate(2, 19),
      durationMinutes: 90,
      difficulty: "Beginner",
      coinReward: 500,
      registrationStatus: "registered",
    },
    {
      id: "graphs-dp-showdown",
      title: "Graphs & DP Showdown",
      startsAt: futureDate(5, 18),
      durationMinutes: 120,
      difficulty: "Intermediate",
      coinReward: 850,
      registrationStatus: "open",
    },
    {
      id: "monthly-grand-prix",
      title: "Monthly Grand Prix",
      startsAt: futureDate(9, 20),
      durationMinutes: 150,
      difficulty: "Advanced",
      coinReward: 1200,
      registrationStatus: "open",
    },
  ],
  performance: [
    { label: "Jun", score: 48 },
    { label: "Jul", score: 57 },
    { label: "Aug", score: 53 },
    { label: "Sep", score: 68 },
    { label: "Oct", score: 72 },
    { label: "Nov", score: 82 },
  ],
  recentContests: [
    {
      id: "weekly-code-arena-18",
      title: "Weekly Code Arena #18",
      date: futureDate(-3, 18),
      score: 92,
      rank: 2,
      coinsEarned: 250,
      status: "Won",
    },
    {
      id: "backend-battle",
      title: "Backend Battle: API Edition",
      date: futureDate(-8, 18),
      score: 78,
      rank: 14,
      coinsEarned: 90,
      status: "Completed",
    },
    {
      id: "logic-league",
      title: "Logic League Qualifier",
      date: futureDate(-15, 18),
      score: 64,
      rank: 31,
      coinsEarned: 40,
      status: "Participated",
    },
  ],
  recommendedMentors: [
    {
      id: "aarav-mehta",
      name: "Aarav Mehta",
      organization: "SDE II · ex-Amazon",
      skills: ["DSA", "Graphs", "Interviews"],
      rating: 4.9,
      coinsPerSession: 300,
    },
    {
      id: "neha-kapoor",
      name: "Neha Kapoor",
      organization: "Software Engineer · Google",
      skills: ["Dynamic programming", "System design"],
      rating: 4.8,
      coinsPerSession: 350,
    },
    {
      id: "rohan-iyer",
      name: "Rohan Iyer",
      organization: "Backend Lead · Flipkart",
      skills: ["Backend", "Career growth"],
      rating: 4.9,
      coinsPerSession: 280,
    },
  ],
  recentActivity: [
    {
      id: "activity-contest",
      title: "Contest completed",
      description: "You placed 2nd in Weekly Code Arena #18.",
      date: futureDate(-3, 20),
      kind: "contest",
    },
    {
      id: "activity-coins",
      title: "Coins added",
      description: "You earned 250 coins from your contest result.",
      date: futureDate(-3, 20),
      kind: "coins",
    },
    {
      id: "activity-booking",
      title: "Mentor session confirmed",
      description: "Your session with Neha is confirmed for next week.",
      date: futureDate(-5, 12),
      kind: "booking",
    },
    {
      id: "activity-profile",
      title: "Profile updated",
      description: "Your skills and portfolio links are up to date.",
      date: futureDate(-7, 10),
      kind: "profile",
    },
  ],
  notifications: [
    {
      id: "notification-contest",
      title: "Contest reminder",
      message: "Arrays & Hashing Sprint starts soon. Review the contest schedule.",
      createdAt: futureDate(-1, 12),
    },
    {
      id: "notification-coins",
      title: "Coins earned",
      message: "Your recent contest result added 250 coins to your balance.",
      createdAt: futureDate(-3, 20),
    },
  ],
  unreadNotifications: 2,
};
