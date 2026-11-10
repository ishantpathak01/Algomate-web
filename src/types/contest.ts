export type ContestStatus = "upcoming" | "ongoing" | "completed" | "cancelled";
export type SubmissionStatus = "queued" | "running" | "accepted" | "wrong_answer" | "error";
export type ProgrammingLanguage = "javascript" | "typescript" | "python" | "java" | "cpp";

export type Contest = {
  id: string;
  slug: string;
  name: string;
  description: string;
  sponsorName: string;
  sponsorLogoUrl?: string;
  startsAt: string;
  endsAt: string;
  status: ContestStatus;
  prizes: Array<{ place: number; description: string; coins: number }>;
  organizerOffers: string[];
};

export type ContestQuestion = {
  id: string;
  contestId: string;
  title: string;
  statement: string;
  difficulty: "easy" | "medium" | "hard";
  topics: string[];
  constraints: string[];
  sampleCases: Array<{ input: string; output: string; explanation?: string }>;
  supportedLanguages: ProgrammingLanguage[];
  timeLimitMs: number;
  memoryLimitMb: number;
};

export type ContestSubmission = {
  id: string;
  questionId: string;
  language: ProgrammingLanguage;
  sourceCode: string;
  status: SubmissionStatus;
  score: number;
  submittedAt: string;
};

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  score: number;
  coinsAwarded: number;
};

export type ContestParticipation = {
  contestId: string;
  userId: string;
  score: number;
  rank?: number;
  startedAt: string;
  submittedAt?: string;
  fullscreenExits: number;
  tabSwitches: number;
};
