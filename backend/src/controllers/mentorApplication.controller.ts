import type { RequestHandler } from "express";
import AppError from "../utils/AppError.js";
import {
  listPendingMentorApplications,
  reviewMentorApplication,
  submitMentorApplication,
} from "../services/mentorApplication.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { mentorApplicationSchema, mentorReviewSchema } from "../validators/mentor.validators.js";

export const createMentorApplication: RequestHandler = async (request, response) => {
  const clerkUserId = request.platformAuth?.userId;
  if (!clerkUserId) throw new AppError(401, "UNAUTHENTICATED", "Sign in to continue.");
  const input = mentorApplicationSchema.parse(request.body);
  const application = await submitMentorApplication(clerkUserId, input);
  sendSuccess(response, application, 201);
};

export const getPendingMentorApplications: RequestHandler = async (_request, response) => {
  sendSuccess(response, await listPendingMentorApplications());
};

export const reviewMentorApplicationController: RequestHandler = async (request, response) => {
  const clerkAdminId = request.platformAuth?.userId;
  if (!clerkAdminId) throw new AppError(401, "UNAUTHENTICATED", "Sign in to continue.");
  const mentorId = request.params.mentorId;
  if (typeof mentorId !== "string") {
    throw new AppError(400, "INVALID_ID", "A valid mentor application identifier is required.");
  }
  const { decision } = mentorReviewSchema.parse(request.body);
  const result = await reviewMentorApplication(mentorId, clerkAdminId, { decision });
  sendSuccess(response, result);
};
