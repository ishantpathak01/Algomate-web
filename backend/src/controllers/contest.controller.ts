import type { RequestHandler } from "express";
import AppError from "../utils/AppError.js";
import { sendSuccess } from "../utils/apiResponse.js";
import {
  createMentorContest,
  createMentorQuestion,
  deleteMentorQuestion,
  finalizeContest,
  getContestParticipation,
  getContestLeaderboard,
  getContestQuestions,
  getMentorDashboard,
  getPublicContest,
  listAdminContests,
  listMentorContests,
  listMentorParticipants,
  listMentorQuestions,
  listMyContestHistory,
  listMySubmissions,
  listPublicContests,
  recordMonitoringEvent,
  registerForContest,
  reviewContest,
  startContestParticipation,
  submitContestAnswer,
  submitFinalContest,
  submitMentorContestForReview,
  updateMentorContest,
  updateAdminQuestion,
  updateMentorQuestion,
} from "../services/contest.service.js";

function getClerkUserId(request: Parameters<RequestHandler>[0]): string {
  const clerkUserId = request.platformAuth?.userId;
  if (!clerkUserId) throw new AppError(401, "UNAUTHENTICATED", "Sign in to continue.");
  return clerkUserId;
}

function param(request: Parameters<RequestHandler>[0], key: string): string {
  const value = request.params[key];
  if (typeof value !== "string") throw new AppError(400, "INVALID_ID", `A valid ${key} is required.`);
  return value;
}

export const getPublicContestList: RequestHandler = async (request, response) => {
  const status = typeof request.query.status === "string" ? request.query.status : undefined;
  const search = typeof request.query.search === "string" ? request.query.search : undefined;
  sendSuccess(response, await listPublicContests({ status, search }));
};

export const getPublicContestDetails: RequestHandler = async (request, response) => {
  sendSuccess(response, await getPublicContest(param(request, "contestId")));
};

export const getContestQuestionList: RequestHandler = async (request, response) => {
  sendSuccess(response, await getContestQuestions(getClerkUserId(request), param(request, "contestId")));
};

export const registerContestParticipant: RequestHandler = async (request, response) => {
  sendSuccess(response, await registerForContest(getClerkUserId(request), param(request, "contestId")), 201);
};

export const getContestParticipationState: RequestHandler = async (request, response) => {
  sendSuccess(response, await getContestParticipation(getClerkUserId(request), param(request, "contestId")));
};

export const startContest: RequestHandler = async (request, response) => {
  sendSuccess(response, await startContestParticipation(getClerkUserId(request), param(request, "contestId")));
};

export const reportContestMonitoringEvent: RequestHandler = async (request, response) => {
  const body = request.body as { kind?: "fullscreen_exit" | "visibility_hidden" | "window_blur" };
  if (!body.kind) throw new AppError(400, "VALIDATION_ERROR", "A valid monitoring event kind is required.");
  sendSuccess(response, await recordMonitoringEvent(getClerkUserId(request), param(request, "contestId"), body.kind));
};

export const submitContestFinal: RequestHandler = async (request, response) => {
  sendSuccess(response, await submitFinalContest(getClerkUserId(request), param(request, "contestId")));
};

export const submitQuestion: RequestHandler = async (request, response) => {
  const body = request.body as {
    contestId: string;
    sourceCode: string;
    language: "javascript" | "typescript" | "python" | "java" | "cpp";
  };
  sendSuccess(response, await submitContestAnswer(getClerkUserId(request), param(request, "questionId"), body), 201);
};

export const getSubmissionHistory: RequestHandler = async (request, response) => {
  sendSuccess(response, await listMySubmissions(getClerkUserId(request), param(request, "contestId")));
};

export const getContestResults: RequestHandler = async (request, response) => {
  const contestId = param(request, "contestId");
  await finalizeContest(contestId);
  sendSuccess(response, await getContestLeaderboard(contestId, getClerkUserId(request)));
};

export const getContestHistory: RequestHandler = async (request, response) => {
  sendSuccess(response, await listMyContestHistory(getClerkUserId(request)));
};

export const getMentorContestList: RequestHandler = async (request, response) => {
  sendSuccess(response, await listMentorContests(getClerkUserId(request)));
};

export const postMentorContest: RequestHandler = async (request, response) => {
  sendSuccess(response, await createMentorContest(getClerkUserId(request), request.body), 201);
};

export const patchMentorContest: RequestHandler = async (request, response) => {
  sendSuccess(response, await updateMentorContest(getClerkUserId(request), param(request, "contestId"), request.body));
};

export const requestContestReview: RequestHandler = async (request, response) => {
  sendSuccess(response, await submitMentorContestForReview(getClerkUserId(request), param(request, "contestId")));
};

export const getAdminContestList: RequestHandler = async (_request, response) => {
  sendSuccess(response, await listAdminContests());
};

export const postContestReview: RequestHandler = async (request, response) => {
  const body = request.body as { decision: "approve" | "reject" | "cancel"; reason?: string };
  sendSuccess(response, await reviewContest(getClerkUserId(request), param(request, "contestId"), body));
};

export const patchAdminQuestion: RequestHandler = async (request, response) => {
  sendSuccess(response, await updateAdminQuestion(getClerkUserId(request), param(request, "questionId"), request.body));
};

export const getMentorQuestionList: RequestHandler = async (request, response) => {
  sendSuccess(response, await listMentorQuestions(getClerkUserId(request)));
};

export const postMentorQuestion: RequestHandler = async (request, response) => {
  sendSuccess(response, await createMentorQuestion(getClerkUserId(request), request.body), 201);
};

export const patchMentorQuestion: RequestHandler = async (request, response) => {
  sendSuccess(response, await updateMentorQuestion(getClerkUserId(request), param(request, "questionId"), request.body));
};

export const removeMentorQuestion: RequestHandler = async (request, response) => {
  await deleteMentorQuestion(getClerkUserId(request), param(request, "questionId"));
  response.status(204).end();
};

export const getMentorParticipantList: RequestHandler = async (request, response) => {
  sendSuccess(response, await listMentorParticipants(getClerkUserId(request)));
};

export const getMentorOverview: RequestHandler = async (request, response) => {
  sendSuccess(response, await getMentorDashboard(getClerkUserId(request)));
};
