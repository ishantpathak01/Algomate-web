import { User } from "../models/User.js";
import AppError from "../utils/AppError.js";
import type { mentorApplicationSchema, mentorReviewSchema } from "../validators/mentor.validators.js";
import type { z } from "zod";

type MentorApplicationInput = z.infer<typeof mentorApplicationSchema>;
type MentorReviewInput = z.infer<typeof mentorReviewSchema>;

function toMentorProfile(user: {
  _id: { toString(): string };
  name: string;
  email: string;
  profileImage?: string | null;
  mentorApplication?: {
    status?: "none" | "pending" | "approved" | "rejected";
    description?: string | null;
    skills?: string[] | null;
    contactEmail?: string | null;
    reviewedAt?: Date | null;
  };
}) {
  const id = user._id.toString();
  return {
    id,
    userId: id,
    name: user.name,
    email: user.email,
    profileImage: user.profileImage,
    description: user.mentorApplication?.description ?? "",
    skills: user.mentorApplication?.skills ?? [],
    contactEmail: user.mentorApplication?.contactEmail ?? user.email,
    approvalStatus: user.mentorApplication?.status === "approved"
      ? "approved"
      : user.mentorApplication?.status === "rejected"
        ? "rejected"
        : "pending",
    approvedAt: user.mentorApplication?.reviewedAt?.toISOString(),
  };
}

export async function submitMentorApplication(clerkUserId: string, input: MentorApplicationInput) {
  const user = await User.findOne({ clerkUserId });
  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "Your account could not be found. Refresh and try again.");
  }
  if (user.accountStatus !== "active") {
    throw new AppError(403, "ACCOUNT_SUSPENDED", "This account is currently suspended.");
  }
  if (user.role === "admin" || user.role === "mentor") {
    throw new AppError(409, "APPLICATION_NOT_ALLOWED", "This account already has an elevated platform role.");
  }

  const status = user.mentorApplication?.status ?? "none";
  if (status === "pending") return toMentorProfile(user);

  user.mentorApplication = {
    status: "pending",
    description: input.description,
    skills: input.skills,
    contactEmail: input.contactEmail ?? user.email,
    reviewedBy: undefined,
    reviewedAt: undefined,
  };
  await user.save();
  return toMentorProfile(user);
}

export async function listPendingMentorApplications() {
  const users = await User.find({
    $or: [
      { "mentorApplication.status": "pending" },
      { role: "mentor", "mentorApplication.status": { $ne: "approved" } },
    ],
  })
    .select("name email profileImage mentorApplication")
    .sort({ updatedAt: 1 })
    .lean();
  return users.map((user) => toMentorProfile(user));
}

export async function reviewMentorApplication(
  mentorId: string,
  clerkAdminId: string,
  input: MentorReviewInput,
) {
  const admin = await User.findOne({ clerkUserId: clerkAdminId }).select("_id role accountStatus").lean();
  if (!admin || admin.role !== "admin" || admin.accountStatus !== "active") {
    throw new AppError(403, "FORBIDDEN", "An active administrator account is required.");
  }

  const reviewedStatus = input.decision === "approve" ? "approved" : "rejected";
  const applicant = await User.findOneAndUpdate(
    {
      _id: mentorId,
      accountStatus: "active",
      $or: [
        { role: "student", "mentorApplication.status": "pending" },
        { role: "mentor", "mentorApplication.status": { $ne: "approved" } },
      ],
    },
    {
      $set: {
        role: input.decision === "approve" ? "mentor" : "student",
        "mentorApplication.status": reviewedStatus,
        "mentorApplication.reviewedBy": admin._id,
        "mentorApplication.reviewedAt": new Date(),
      },
    },
    { new: true, runValidators: true },
  );

  if (!applicant) {
    const existing = await User.exists({ _id: mentorId });
    if (!existing) throw new AppError(404, "APPLICATION_NOT_FOUND", "The mentor application was not found.");
    throw new AppError(409, "APPLICATION_NOT_PENDING", "This account does not have a pending mentor application.");
  }

  return toMentorProfile(applicant);
}
