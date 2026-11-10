export type DashboardProfile = {
  name: string;
  username?: string;
  profileImage?: string;
  college?: string;
};

export type DashboardContest = {
  id: string;
  title: string;
  startsAt: string;
  durationMinutes: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  coinReward: number;
  registrationStatus: "registered" | "open";
};

export type DashboardContestResult = {
  id: string;
  title: string;
  date: string;
  score: number;
  rank: number;
  coinsEarned: number;
  status: "Won" | "Completed" | "Participated";
};

export type DashboardMentor = {
  id: string;
  name: string;
  organization: string;
  profileImage?: string;
  skills: string[];
  rating: number;
  coinsPerSession: number;
};

export type DashboardActivity = {
  id: string;
  title: string;
  description: string;
  date: string;
  kind: "contest" | "coins" | "booking" | "profile";
};

export type DashboardNotification = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
};

export type StudentDashboardData = {
  profile: DashboardProfile;
  stats: {
    contestsParticipated: number;
    contestsWon: number;
    coinBalance: number;
    averageScore: number;
    scoreChange: number;
  };
  upcomingContests: DashboardContest[];
  performance: Array<{ label: string; score: number }>;
  recentContests: DashboardContestResult[];
  recommendedMentors: DashboardMentor[];
  recentActivity: DashboardActivity[];
  notifications: DashboardNotification[];
  unreadNotifications: number;
};

export type DashboardResult = {
  data: StudentDashboardData;
  source: "api" | "sample";
  warning?: string;
};
