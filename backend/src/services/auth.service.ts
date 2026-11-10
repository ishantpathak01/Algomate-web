import { clerkClient } from "@clerk/express";
import { User } from "../models/User.js";
import AppError from "../utils/AppError.js";

export async function syncClerkUser(clerkUserId: string) {
  const clerkUser = await clerkClient.users.getUser(clerkUserId);
  const email = clerkUser.primaryEmailAddress?.emailAddress;
  if (!email) {
    throw new AppError(422, "EMAIL_REQUIRED", "Your Clerk account must have a primary email address.");
  }

  const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim();
  const name = fullName || email.split("@")[0];
  const user = await User.findOneAndUpdate(
    { clerkUserId },
    {
      $set: {
        email,
        name,
        profileImage: clerkUser.imageUrl,
      },
      $setOnInsert: {
        clerkUserId,
        role: "student",
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
      projection: "clerkUserId email name profileImage role accountStatus onboardingCompleted mentorApplication.status",
    },
  );

  if (!user) {
    throw new AppError(500, "USER_SYNC_FAILED", "Could not synchronize the authenticated account.");
  }
  if (user.accountStatus !== "active") {
    throw new AppError(403, "ACCOUNT_SUSPENDED", "This account is currently suspended.");
  }

  return {
    id: user.id,
    clerkUserId: user.clerkUserId,
    email: user.email,
    name: user.name,
    profileImage: user.profileImage,
    role: user.role,
    accountStatus: user.accountStatus,
    onboardingCompleted: user.onboardingCompleted,
    mentorApplicationStatus: user.mentorApplication?.status ?? "none",
  };
}
