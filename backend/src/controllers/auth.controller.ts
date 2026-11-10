import type { RequestHandler } from "express";
import { syncClerkUser } from "../services/auth.service.js";
import AppError from "../utils/AppError.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const getCurrentUser: RequestHandler = async (request, response) => {
  const clerkUserId = request.platformAuth?.userId;
  if (!clerkUserId) {
    throw new AppError(401, "UNAUTHENTICATED", "Sign in to continue.");
  }
  const user = await syncClerkUser(clerkUserId);
  sendSuccess(response, user);
};
