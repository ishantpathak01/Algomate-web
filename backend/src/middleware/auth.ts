import type { RequestHandler } from "express";
import { getAuth } from "@clerk/express";
import { User } from "../models/User.js";
import AppError from "../utils/AppError.js";

export const requireAuthentication: RequestHandler = (request, _response, next) => {
  const { userId } = getAuth(request);
  if (!userId) {
    next(new AppError(401, "UNAUTHENTICATED", "Sign in to continue."));
    return;
  }
  request.platformAuth = { userId };
  next();
};

export function requireRole(...roles: Array<"student" | "mentor" | "admin">): RequestHandler {
  return async (request, _response, next) => {
    const { userId } = getAuth(request);
    if (!userId) {
      next(new AppError(401, "UNAUTHENTICATED", "Sign in to continue."));
      return;
    }
    const user = await User.findOne({ clerkUserId: userId })
      .select("role accountStatus")
      .lean();
    if (!user || user.accountStatus !== "active" || !roles.includes(user.role)) {
      next(new AppError(403, "FORBIDDEN", "You do not have permission to perform this action."));
      return;
    }
    request.platformAuth = { userId, role: user.role };
    next();
  };
}

export const requireApprovedMentor: RequestHandler = async (request, _response, next) => {
  const { userId } = getAuth(request);
  if (!userId) {
    next(new AppError(401, "UNAUTHENTICATED", "Sign in to continue."));
    return;
  }

  const user = await User.findOne({ clerkUserId: userId })
    .select("role accountStatus mentorApplication.status")
    .lean();
  if (
    !user ||
    user.accountStatus !== "active" ||
    user.role !== "mentor" ||
    user.mentorApplication?.status !== "approved"
  ) {
    next(new AppError(403, "MENTOR_APPROVAL_REQUIRED", "An approved, active mentor account is required."));
    return;
  }

  request.platformAuth = { userId, role: "mentor" };
  next();
};
