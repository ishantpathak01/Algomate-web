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
  createMockContest,
  createMockQuestion,
  getMockMentorDashboard,
  setMockAvailability,
  deleteMockQuestion,
  updateMockBooking,
  updateMockAvailability,
  updateMockContest,
  updateMockProfile,
  updateMockQuestion,
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

export const mentorDashboardApi = {
  contests: () =>
    withMockFallback(
      () => apiRequest<MentorContest[]>("/mentor/contests"),
      () => getMockMentorDashboard().contests,
    ),
  createContest: (input: CreateMentorContestInput) =>
    withMockFallback(
      () => apiRequest<MentorContest>("/mentor/contests", { method: "POST", body: jsonBody(input) }),
      () => createMockContest(input),
    ),
  updateContest: (id: string, input: Partial<CreateMentorContestInput>) =>
    withMockFallback(
      () => apiRequest<MentorContest>(`/mentor/contests/${encodeURIComponent(id)}`, { method: "PUT", body: jsonBody(input) }),
      () => updateMockContest(id, input),
    ),
  questions: () =>
    withMockFallback(
      () => apiRequest<MentorQuestion[]>("/mentor/questions"),
      () => getMockMentorDashboard().questions,
    ),
  createQuestion: (input: CreateMentorQuestionInput) =>
    withMockFallback(
      () => apiRequest<MentorQuestion>("/mentor/questions", { method: "POST", body: jsonBody(input) }),
      () => createMockQuestion(input),
    ),
  updateQuestion: (id: string, input: Partial<CreateMentorQuestionInput>) =>
    withMockFallback(
      () => apiRequest<MentorQuestion>(`/mentor/questions/${encodeURIComponent(id)}`, { method: "PUT", body: jsonBody(input) }),
      () => updateMockQuestion(id, input),
    ),
  deleteQuestion: (id: string) =>
    withMockFallback(
      () => apiRequest<void>(`/mentor/questions/${encodeURIComponent(id)}`, { method: "DELETE" }),
      () => deleteMockQuestion(id),
    ),
  participants: () =>
    withMockFallback(
      () => apiRequest<MentorDashboardData["participants"]>("/mentor/participants"),
      () => getMockMentorDashboard().participants,
    ),
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
