import type {
  Contest,
  ContestQuestion,
  ContestStatus,
  ContestSubmission,
  LeaderboardEntry,
} from "./contest";
import type { MentorAvailability, MentorProfile, MentorshipBooking } from "./mentor";
import type { StudentProfile } from "./user";

export type NewContestInput = Omit<Contest, "id" | "slug" | "status">;
export type ContestUpdateInput = Partial<NewContestInput>;
export type QuestionInput = Omit<ContestQuestion, "id">;

export type CoinTransaction = {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
  referenceId?: string;
};

export type MerchandiseItem = {
  id: string;
  name: string;
  description: string;
  coinCost: number;
  imageUrl?: string;
  stock: number;
};

export type PlatformNotification = {
  id: string;
  title: string;
  message: string;
  kind: "contest" | "result" | "booking" | "mentor" | "coins" | "system";
  readAt?: string;
  createdAt: string;
};

export type AuditLogEntry = {
  id: string;
  adminId: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  metadata: Record<string, unknown>;
};

export type AdminDashboardSummary = {
  registeredUsers: number;
  activeUsers: number;
  mentors: number;
  pendingMentorApplications: number;
  contests: number;
  ongoingContests: number;
};

export type ManagedUser = Pick<StudentProfile, "id" | "username" | "name" | "email"> & {
  status: "active" | "suspended";
  createdAt: string;
};

export type PlatformAnalytics = {
  userGrowth: Array<{ date: string; users: number }>;
  contestParticipation: Array<{ contestId: string; participants: number }>;
  coinDistribution: Array<{ range: string; users: number }>;
  mentorshipBookings: Array<{ date: string; bookings: number }>;
};

export type PlatformApi = {
  auth: {
    currentUser(): Promise<{
      id: string;
      clerkUserId: string;
      email: string;
      name: string;
      profileImage?: string;
      role: "student" | "mentor" | "admin";
      accountStatus: "active" | "suspended";
      onboardingCompleted: boolean;
      mentorApplicationStatus: "none" | "pending" | "approved" | "rejected";
    }>;
  };
  profile: {
    get(): Promise<StudentProfile>;
    update(input: Partial<Omit<StudentProfile, "id" | "email" | "coinBalance">>): Promise<StudentProfile>;
  };
  contests: {
    list(status?: ContestStatus): Promise<Contest[]>;
    get(contestId: string): Promise<Contest>;
    questions(contestId: string): Promise<ContestQuestion[]>;
    submit(questionId: string, input: { language: string; sourceCode: string }): Promise<ContestSubmission>;
    leaderboard(contestId: string): Promise<LeaderboardEntry[]>;
  };
  questions: {
    get(questionId: string): Promise<ContestQuestion>;
    create(input: QuestionInput): Promise<ContestQuestion>;
    update(questionId: string, input: Partial<QuestionInput>): Promise<ContestQuestion>;
    remove(questionId: string): Promise<void>;
  };
  mentors: {
    list(filters?: { query?: string; skills?: string[] }): Promise<MentorProfile[]>;
    get(mentorId: string): Promise<MentorProfile>;
    apply(input: Pick<MentorProfile, "description" | "skills" | "contactEmail">): Promise<MentorProfile>;
    availability(mentorId: string): Promise<MentorAvailability[]>;
    book(availabilityId: string): Promise<MentorshipBooking>;
    bookings(): Promise<MentorshipBooking[]>;
    updateBooking(
      bookingId: string,
      status: Extract<MentorshipBooking["status"], "confirmed" | "completed" | "cancelled">,
    ): Promise<MentorshipBooking>;
  };
  mentorWorkspace: {
    contests(): Promise<Contest[]>;
    createContest(input: NewContestInput): Promise<Contest>;
    updateContest(contestId: string, input: ContestUpdateInput): Promise<Contest>;
    publishContest(contestId: string): Promise<Contest>;
    participants(contestId: string): Promise<LeaderboardEntry[]>;
    setAvailability(input: Omit<MentorAvailability, "id" | "mentorId" | "status">): Promise<MentorAvailability>;
  };
  wallet: {
    transactions(): Promise<CoinTransaction[]>;
    merchandise(): Promise<MerchandiseItem[]>;
    redeem(merchandiseId: string): Promise<{ redemptionId: string; balance: number }>;
  };
  notifications: {
    list(): Promise<PlatformNotification[]>;
    markRead(notificationId: string): Promise<void>;
  };
  chat: {
    conversations(): Promise<Array<{ id: string; mentorId: string; updatedAt: string }>>;
    messages(conversationId: string): Promise<Array<{ id: string; body: string; createdAt: string; senderId: string }>>;
    send(conversationId: string, body: string): Promise<void>;
  };
  bookings: {
    mine(): Promise<MentorshipBooking[]>;
  };
  admin: {
    dashboard(): Promise<AdminDashboardSummary>;
    users(query?: string): Promise<ManagedUser[]>;
    suspendUser(userId: string, suspended: boolean): Promise<ManagedUser>;
    mentors(): Promise<MentorProfile[]>;
    suspendMentor(mentorId: string, suspended: boolean): Promise<MentorProfile>;
    contests(): Promise<Contest[]>;
    reviewContest(contestId: string, decision: "approve" | "cancel"): Promise<Contest>;
    questions(query?: string): Promise<ContestQuestion[]>;
    updateQuestion(questionId: string, input: Partial<QuestionInput>): Promise<ContestQuestion>;
    analytics(): Promise<PlatformAnalytics>;
    auditLog(): Promise<AuditLogEntry[]>;
    reviewMentor(mentorId: string, decision: "approve" | "reject"): Promise<MentorProfile>;
  };
};
