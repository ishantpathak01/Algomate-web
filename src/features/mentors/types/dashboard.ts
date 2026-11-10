import type { MentorApprovalStatus } from "@/types/mentor";

export type MentorContestStatus = "draft" | "upcoming" | "ongoing" | "completed";
export type MentorQuestionDifficulty = "easy" | "medium" | "hard";

export type MentorContest = {
  id: string;
  title: string;
  description: string;
  status: MentorContestStatus;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  registrationDeadline: string;
  maxParticipants: number;
  participants: number;
  questionIds: string[];
  prizeCoins: number;
  visibility: "public" | "private";
  bannerImageUrl?: string;
  rules?: string;
};

export type MentorQuestion = {
  id: string;
  title: string;
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  examples: Array<{ input: string; output: string; explanation?: string }>;
  difficulty: MentorQuestionDifficulty;
  topics: string[];
  points: number;
  timeLimitMs: number;
  memoryLimitMb: number;
  supportedLanguages: string[];
  hiddenTestCases: Array<{ input: string; output: string }>;
  createdAt: string;
  usageCount: number;
  status: "active" | "draft";
};

export type MentorParticipant = {
  id: string;
  name: string;
  username: string;
  college: string;
  contestId: string;
  submissions: number;
  score: number;
  rank?: number;
  status: "registered" | "in_progress" | "completed";
};

export type MentorBooking = {
  id: string;
  studentName: string;
  username: string;
  college: string;
  startsAt: string;
  endsAt: string;
  status: "requested" | "confirmed" | "completed" | "cancelled";
  coinsReceived: number;
  topic: string;
};

export type MentorAvailabilitySlot = {
  id: string;
  weekday: string;
  date?: string;
  startTime: string;
  endTime: string;
  status: "available" | "blocked";
};

export type MentorNotification = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

export type MentorMessage = {
  id: string;
  studentName: string;
  body: string;
  createdAt: string;
  fromMentor: boolean;
};

export type MentorProfileData = {
  name: string;
  profileImageUrl?: string;
  headline: string;
  about: string;
  organization: string;
  experienceYears: number;
  skills: string[];
  languages: string[];
  githubUrl: string;
  linkedInUrl: string;
  portfolioUrl: string;
  coinsPerSession: number;
  approvalStatus: MentorApprovalStatus;
};

export type MentorDashboardData = {
  profile: MentorProfileData;
  stats: {
    totalContests: number;
    activeContests: number;
    participants: number;
    questions: number;
    upcomingSessions: number;
    coinsDistributed: number;
  };
  contests: MentorContest[];
  questions: MentorQuestion[];
  participants: MentorParticipant[];
  bookings: MentorBooking[];
  availability: MentorAvailabilitySlot[];
  notifications: MentorNotification[];
  messages: MentorMessage[];
};

export type MentorDashboardResult = {
  data: MentorDashboardData;
  source: "api" | "mock";
  warning?: string;
};

export type CreateMentorContestInput = Omit<MentorContest, "id" | "participants">;
export type CreateMentorQuestionInput = Omit<MentorQuestion, "id" | "createdAt" | "usageCount">;
