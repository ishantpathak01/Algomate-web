import type { PlatformApi } from "@/types/api";
import { apiRequest, jsonBody } from "./client";

export const platformApi: PlatformApi = {
  auth: {
    currentUser: () => apiRequest("/auth/me"),
  },
  profile: {
    get: () => apiRequest("/profile"),
    update: (input) => apiRequest("/profile", { method: "PATCH", body: jsonBody(input) }),
  },
  contests: {
    list: (status) => apiRequest(`/contests${status ? `?status=${encodeURIComponent(status)}` : ""}`),
    get: (contestId) => apiRequest(`/contests/${encodeURIComponent(contestId)}`),
    questions: (contestId) => apiRequest(`/contests/${encodeURIComponent(contestId)}/questions`),
    submit: (questionId, input) =>
      apiRequest(`/questions/${encodeURIComponent(questionId)}/submissions`, {
        method: "POST",
        body: jsonBody(input),
      }),
    leaderboard: (contestId) => apiRequest(`/contests/${encodeURIComponent(contestId)}/leaderboard`),
  },
  questions: {
    get: (questionId) => apiRequest(`/questions/${encodeURIComponent(questionId)}`),
    create: (input) => apiRequest("/mentor/questions", { method: "POST", body: jsonBody(input) }),
    update: (questionId, input) =>
      apiRequest(`/mentor/questions/${encodeURIComponent(questionId)}`, {
        method: "PATCH",
        body: jsonBody(input),
      }),
    remove: (questionId) =>
      apiRequest(`/mentor/questions/${encodeURIComponent(questionId)}`, { method: "DELETE" }),
  },
  mentors: {
    list: (filters) => {
      const query = new URLSearchParams();
      if (filters?.query) query.set("query", filters.query);
      filters?.skills?.forEach((skill) => query.append("skill", skill));
      const suffix = query.size ? `?${query.toString()}` : "";
      return apiRequest(`/mentors${suffix}`);
    },
    get: (mentorId) => apiRequest(`/mentors/${encodeURIComponent(mentorId)}`),
    apply: (input) =>
      apiRequest("/mentor-applications", { method: "POST", body: jsonBody(input) }),
    availability: (mentorId) =>
      apiRequest(`/mentors/${encodeURIComponent(mentorId)}/availability`),
    book: (availabilityId) =>
      apiRequest("/bookings", { method: "POST", body: jsonBody({ availabilityId }) }),
    bookings: () => apiRequest("/mentor/bookings"),
    updateBooking: (bookingId, status) =>
      apiRequest(`/mentor/bookings/${encodeURIComponent(bookingId)}`, {
        method: "PATCH",
        body: jsonBody({ status }),
      }),
  },
  mentorWorkspace: {
    contests: () => apiRequest("/mentor/contests"),
    createContest: (input) => apiRequest("/mentor/contests", { method: "POST", body: jsonBody(input) }),
    updateContest: (contestId, input) =>
      apiRequest(`/mentor/contests/${encodeURIComponent(contestId)}`, {
        method: "PATCH",
        body: jsonBody(input),
      }),
    publishContest: (contestId) =>
      apiRequest(`/mentor/contests/${encodeURIComponent(contestId)}/publish`, { method: "POST" }),
    participants: (contestId) =>
      apiRequest(`/mentor/contests/${encodeURIComponent(contestId)}/participants`),
    setAvailability: (input) =>
      apiRequest("/mentor/availability", { method: "POST", body: jsonBody(input) }),
  },
  wallet: {
    transactions: () => apiRequest("/wallet/transactions"),
    merchandise: () => apiRequest("/merchandise"),
    redeem: (merchandiseId) =>
      apiRequest("/redemptions", { method: "POST", body: jsonBody({ merchandiseId }) }),
  },
  notifications: {
    list: () => apiRequest("/notifications"),
    markRead: (notificationId) =>
      apiRequest(`/notifications/${encodeURIComponent(notificationId)}/read`, { method: "POST" }),
  },
  chat: {
    conversations: () => apiRequest("/chat/conversations"),
    messages: (conversationId) =>
      apiRequest(`/chat/conversations/${encodeURIComponent(conversationId)}/messages`),
    send: (conversationId, body) =>
      apiRequest(`/chat/conversations/${encodeURIComponent(conversationId)}/messages`, {
        method: "POST",
        body: jsonBody({ body }),
      }),
  },
  bookings: {
    mine: () => apiRequest("/bookings"),
  },
  admin: {
    dashboard: () => apiRequest("/admin/dashboard"),
    users: (query) => {
      const suffix = query ? `?query=${encodeURIComponent(query)}` : "";
      return apiRequest(`/admin/users${suffix}`);
    },
    suspendUser: (userId, suspended) =>
      apiRequest(`/admin/users/${encodeURIComponent(userId)}/status`, {
        method: "PATCH",
        body: jsonBody({ suspended }),
      }),
    mentors: () => apiRequest("/admin/mentors"),
    suspendMentor: (mentorId, suspended) =>
      apiRequest(`/admin/mentors/${encodeURIComponent(mentorId)}/status`, {
        method: "PATCH",
        body: jsonBody({ suspended }),
      }),
    contests: () => apiRequest("/admin/contests"),
    reviewContest: (contestId, decision) =>
      apiRequest(`/admin/contests/${encodeURIComponent(contestId)}/review`, {
        method: "POST",
        body: jsonBody({ decision }),
      }),
    questions: (query) => {
      const suffix = query ? `?query=${encodeURIComponent(query)}` : "";
      return apiRequest(`/admin/questions${suffix}`);
    },
    updateQuestion: (questionId, input) =>
      apiRequest(`/admin/questions/${encodeURIComponent(questionId)}`, {
        method: "PATCH",
        body: jsonBody(input),
      }),
    analytics: () => apiRequest("/admin/analytics"),
    auditLog: () => apiRequest("/admin/audit-log"),
    reviewMentor: (mentorId, decision) =>
      apiRequest(`/admin/mentors/${encodeURIComponent(mentorId)}/review`, {
        method: "POST",
        body: jsonBody({ decision }),
      }),
  },
};
