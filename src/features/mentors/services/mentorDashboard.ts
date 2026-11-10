import { apiRequest, PlatformApiError, jsonBody } from "@/lib/api/client";
import type {
  CreateMentorContestInput,
  CreateMentorQuestionInput,
  MentorBooking,
  MentorContest,
  MentorDashboardData,
  MentorDashboardResult,
  MentorQuestion,
} from "../types/dashboard";
import {
  getMockMentorDashboard,
  setMockAvailability,
  updateMockBooking,
  updateMockAvailability,
  updateMockProfile,
} from "./mock/mentorDashboard";

function isUnavailable(error: unknown): boolean {
  return !(error instanceof PlatformApiError) || error.status === 404 || error.status >= 500;
}

async function withMockFallback<T>(request: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (!isUnavailable(error)) throw error;
    return fallback();
  }
}

export async function getMentorDashboard(): Promise<MentorDashboardResult> {
  try {
    const data = await apiRequest<MentorDashboardData>("/mentor/dashboard");
    return { data, source: "api" };
  } catch (error) {
    if (!isUnavailable(error)) throw error;
    return {
      data: getMockMentorDashboard(),
      source: "mock",
      warning: error instanceof PlatformApiError
        ? `Mentor dashboard API returned ${error.status}; showing local demo data.`
        : "Mentor dashboard API is unavailable; showing local demo data.",
    };
  }
}

function contestPayload(input: Partial<CreateMentorContestInput>) {
  const payload: Record<string, unknown> = {};
  if (input.title !== undefined) payload.title = input.title;
  if (input.description !== undefined) payload.description = input.description;
  if (input.startsAt !== undefined) payload.startTime = input.startsAt;
  if (input.endsAt !== undefined) payload.endTime = input.endsAt;
  if (input.registrationDeadline !== undefined) payload.registrationDeadline = input.registrationDeadline;
  if (input.durationMinutes !== undefined) payload.duration = input.durationMinutes;
  if (input.maxParticipants !== undefined) payload.maxParticipants = input.maxParticipants;
  if (input.rules !== undefined) payload.rules = input.rules;
  if (input.visibility !== undefined) payload.visibility = input.visibility;
  if (input.bannerImageUrl !== undefined) payload.bannerImageUrl = input.bannerImageUrl;
  if (input.questionIds !== undefined) {
    payload.questions = input.questionMappings ?? input.questionIds.map((questionId, order) => ({
      questionId,
      points: 100,
      order,
    }));
  }
  if (input.prizeCoins !== undefined) {
    payload.prizes = input.prizeCoins > 0
      ? [{ place: 1, description: "First place", coins: input.prizeCoins }]
      : [];
  }
  return payload;
}

function questionPayload(input: Partial<CreateMentorQuestionInput>) {
  const payload: Record<string, unknown> = {};
  if (input.title !== undefined) payload.title = input.title;
  if (input.statement !== undefined) payload.description = input.statement;
  if (input.inputFormat !== undefined) payload.inputFormat = input.inputFormat;
  if (input.outputFormat !== undefined) payload.outputFormat = input.outputFormat;
  if (input.difficulty !== undefined) payload.difficulty = input.difficulty;
  if (input.topics !== undefined) payload.topics = input.topics;
  if (input.points !== undefined) payload.points = input.points;
  if (input.constraints !== undefined) payload.constraints = input.constraints;
  if (input.examples !== undefined) payload.sampleCases = input.examples;
  if (input.hiddenTestCases !== undefined || input.examples !== undefined) {
    const publicCases = input.examples?.map((item) => ({
      input: item.input,
      expectedOutput: item.output,
      isHidden: false,
    })) ?? [];
    const hiddenCases = input.hiddenTestCases?.map((item) => ({
      input: item.input,
      expectedOutput: item.output,
      isHidden: true,
    })) ?? [];
    payload.testCases = [...publicCases, ...hiddenCases];
  }
  if (input.supportedLanguages !== undefined) payload.supportedLanguages = input.supportedLanguages;
  if (input.timeLimitMs !== undefined) payload.timeLimitMs = input.timeLimitMs;
  if (input.memoryLimitMb !== undefined) payload.memoryLimitMb = input.memoryLimitMb;
  return payload;
}

export const mentorDashboardApi = {
  contests: () => apiRequest<MentorContest[]>("/mentor/contests"),
  createContest: (input: CreateMentorContestInput) =>
    apiRequest<MentorContest>("/mentor/contests", { method: "POST", body: jsonBody(contestPayload(input)) }),
  updateContest: (id: string, input: Partial<CreateMentorContestInput>) =>
    apiRequest<MentorContest>(`/mentor/contests/${encodeURIComponent(id)}`, { method: "PATCH", body: jsonBody(contestPayload(input)) }),
  submitContestForReview: (id: string) =>
    apiRequest<MentorContest>(`/mentor/contests/${encodeURIComponent(id)}/submit-review`, { method: "POST" }),
  questions: () => apiRequest<MentorQuestion[]>("/mentor/questions"),
  createQuestion: (input: CreateMentorQuestionInput) =>
    apiRequest<MentorQuestion>("/mentor/questions", { method: "POST", body: jsonBody(questionPayload(input)) }),
  updateQuestion: (id: string, input: Partial<CreateMentorQuestionInput>) =>
    apiRequest<MentorQuestion>(`/mentor/questions/${encodeURIComponent(id)}`, { method: "PATCH", body: jsonBody(questionPayload(input)) }),
  deleteQuestion: (id: string) =>
    apiRequest<void>(`/mentor/questions/${encodeURIComponent(id)}`, { method: "DELETE" }),
  participants: () => apiRequest<MentorDashboardData["participants"]>("/mentor/participants"),
  bookings: () =>
    withMockFallback(
      () => apiRequest<MentorBooking[]>("/mentor/bookings"),
      () => getMockMentorDashboard().bookings,
    ),
  updateBooking: (id: string, status: MentorBooking["status"]) =>
    withMockFallback(
      () => apiRequest<MentorBooking>(`/mentor/bookings/${encodeURIComponent(id)}`, { method: "PATCH", body: jsonBody({ status }) }),
      () => updateMockBooking(id, status),
    ),
  availability: () =>
    withMockFallback(
      () => apiRequest<MentorDashboardData["availability"]>("/mentor/availability"),
      () => getMockMentorDashboard().availability,
    ),
  setAvailability: (input: Omit<MentorDashboardData["availability"][number], "id">) =>
    withMockFallback(
      () => apiRequest<MentorDashboardData["availability"][number]>("/mentor/availability", { method: "PUT", body: jsonBody(input) }),
      () => setMockAvailability(input),
    ),
  updateAvailability: (id: string, status: "available" | "blocked") =>
    withMockFallback(
      () => apiRequest<MentorDashboardData["availability"][number]>("/mentor/availability", { method: "PUT", body: jsonBody({ id, status }) }),
      () => updateMockAvailability(id, status),
    ),
  profile: () =>
    withMockFallback(
      () => apiRequest<MentorDashboardData["profile"]>("/mentor/profile"),
      () => getMockMentorDashboard().profile,
    ),
  updateProfile: (input: Partial<MentorDashboardData["profile"]>) =>
    withMockFallback(
      () => apiRequest<MentorDashboardData["profile"]>("/mentor/profile", { method: "PUT", body: jsonBody(input) }),
      () => updateMockProfile(input),
    ),
};
