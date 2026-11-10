import mongoose from "mongoose";
import { AuditLog } from "../models/AuditLog.js";
import { CoinTransaction } from "../models/CoinTransaction.js";
import { Contest } from "../models/Contest.js";
import { ContestParticipation } from "../models/ContestParticipation.js";
import { ContestResult } from "../models/ContestResult.js";
import { Question } from "../models/Question.js";
import { Submission } from "../models/Submission.js";
import { User } from "../models/User.js";
import AppError from "../utils/AppError.js";
import type { createContestSchema, questionSchema, updateContestSchema } from "../validators/contest.validators.js";
import type { z } from "zod";

type CreateContestInput = z.infer<typeof createContestSchema>;
type UpdateContestInput = z.infer<typeof updateContestSchema>;
type QuestionInput = z.infer<typeof questionSchema>;

async function getAccount(clerkUserId: string, role?: "student" | "mentor" | "admin") {
  const account = await User.findOne({ clerkUserId, accountStatus: "active" });
  if (!account || (role && account.role !== role)) {
    throw new AppError(403, "FORBIDDEN", "An active account with the required role is required.");
  }
  return account;
}

function oid(value: { toString(): string } | string): string {
  return value.toString();
}

function currentStatus(contest: {
  status: string;
  startTime: Date;
  endTime: Date;
}): string {
  if (contest.status !== "upcoming" && contest.status !== "ongoing") return contest.status;
  const now = Date.now();
  if (now >= contest.endTime.getTime()) return "completed";
  if (now >= contest.startTime.getTime()) return "ongoing";
  return "upcoming";
}

function serializeContest(contest: {
  _id: { toString(): string };
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  registrationDeadline: Date;
  duration: number;
  maxParticipants: number;
  registeredCount: number;
  rules?: string;
  visibility: "public" | "private";
  bannerImageUrl?: string | null;
  status: string;
  review?: { status?: string | null; reason?: string | null } | null;
  prizes: Array<{ place: number; description: string; coins: number }>;
  questions: Array<{ questionId: { toString(): string }; points: number; order: number }>;
  createdBy: { toString(): string } | { _id: { toString(): string }; name: string };
}) {
  const createdBy = typeof contest.createdBy === "object" && "_id" in contest.createdBy
    ? { id: oid(contest.createdBy._id), name: contest.createdBy.name }
    : { id: oid(contest.createdBy) };
  return {
    id: oid(contest._id),
    title: contest.title,
    description: contest.description,
    startsAt: contest.startTime.toISOString(),
    endsAt: contest.endTime.toISOString(),
    registrationDeadline: contest.registrationDeadline.toISOString(),
    durationMinutes: contest.duration,
    maxParticipants: contest.maxParticipants,
    participants: contest.registeredCount,
    rules: contest.rules ?? "",
    visibility: contest.visibility,
    bannerImageUrl: contest.bannerImageUrl,
    status: currentStatus(contest),
    reviewStatus: contest.review?.status ?? "pending",
    reviewReason: contest.review?.reason,
    prizes: contest.prizes,
    prizeCoins: contest.prizes.reduce((sum, prize) => sum + prize.coins, 0),
    questions: [...contest.questions]
      .sort((left, right) => left.order - right.order)
      .map((question) => ({ questionId: oid(question.questionId), points: question.points, order: question.order })),
    questionIds: contest.questions.map((question) => oid(question.questionId)),
    createdBy,
  };
}

function toContestPersistence(input: Partial<CreateContestInput>) {
  const result: Record<string, unknown> = {};
  if (input.title !== undefined) result.title = input.title;
  if (input.description !== undefined) result.description = input.description;
  if (input.startTime !== undefined) result.startTime = input.startTime;
  if (input.endTime !== undefined) result.endTime = input.endTime;
  if (input.registrationDeadline !== undefined) result.registrationDeadline = input.registrationDeadline;
  if (input.duration !== undefined) result.duration = input.duration;
  if (input.maxParticipants !== undefined) result.maxParticipants = input.maxParticipants;
  if (input.rules !== undefined) result.rules = input.rules;
  if (input.visibility !== undefined) result.visibility = input.visibility;
  if (input.bannerImageUrl !== undefined) result.bannerImageUrl = input.bannerImageUrl || undefined;
  if (input.wrongAttemptPenalty !== undefined) result.wrongAttemptPenalty = input.wrongAttemptPenalty;
  if (input.questions !== undefined) result.questions = input.questions;
  if (input.prizes !== undefined) result.prizes = input.prizes;
  return result;
}

async function validateQuestionOwnership(clerkUserId: string, questions: CreateContestInput["questions"]) {
  const mentor = await getAccount(clerkUserId, "mentor");
  const questionIds = questions.map((item) => item.questionId);
  const count = await Question.countDocuments({ _id: { $in: questionIds }, createdBy: mentor._id });
  if (count !== questionIds.length) {
    throw new AppError(400, "INVALID_QUESTION_SELECTION", "Every contest question must exist and belong to this mentor.");
  }
}

export async function listMentorContests(clerkUserId: string) {
  const mentor = await getAccount(clerkUserId, "mentor");
  const contests = await Contest.find({ createdBy: mentor._id }).sort({ startTime: -1 }).lean();
  return contests.map(serializeContest);
}

function serializeQuestion(question: {
  _id: { toString(): string };
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  difficulty: string;
  topics: string[];
  points: number;
  constraints: string[];
  sampleCases: Array<{ input: string; output: string; explanation?: string | null }>;
  testCases: Array<{ input: string; expectedOutput: string; isHidden: boolean }>;
  supportedLanguages: string[];
  timeLimitMs: number;
  memoryLimitMb: number;
  createdAt: Date;
}) {
  return {
    id: question._id.toString(),
    title: question.title,
    statement: question.description,
    inputFormat: question.inputFormat,
    outputFormat: question.outputFormat,
    difficulty: question.difficulty,
    topics: question.topics,
    points: question.points,
    constraints: question.constraints,
    examples: question.sampleCases.map((item) => ({
      input: item.input,
      output: item.output,
      explanation: item.explanation,
    })),
    hiddenTestCases: question.testCases.filter((item) => item.isHidden).map((item) => ({
      input: item.input,
      output: item.expectedOutput,
    })),
    sampleTestCases: question.testCases.filter((item) => !item.isHidden).map((item) => ({
      input: item.input,
      output: item.expectedOutput,
    })),
    supportedLanguages: question.supportedLanguages,
    timeLimitMs: question.timeLimitMs,
    memoryLimitMb: question.memoryLimitMb,
    createdAt: question.createdAt.toISOString(),
    usageCount: 0,
    status: "active",
  };
}

export async function listMentorQuestions(clerkUserId: string) {
  const mentor = await getAccount(clerkUserId, "mentor");
  const questions = await Question.find({ createdBy: mentor._id }).sort({ createdAt: -1 }).lean();
  return questions.map(serializeQuestion);
}

export async function createMentorQuestion(clerkUserId: string, input: QuestionInput) {
  const mentor = await getAccount(clerkUserId, "mentor");
  const question = await Question.create({
    ...input,
    createdBy: mentor._id,
    points: input.points ?? 100,
  });
  return serializeQuestion(question.toObject());
}

export async function updateAdminQuestion(clerkAdminId: string, questionId: string, input: Partial<QuestionInput>) {
  const admin = await getAccount(clerkAdminId, "admin");
  const question = await Question.findById(questionId);
  if (!question) throw new AppError(404, "QUESTION_NOT_FOUND", "Question was not found.");
  Object.assign(question, input);
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await question.save({ session });
      await AuditLog.create([{
        actorId: admin._id,
        action: "question.admin_update",
        entityType: "Question",
        entityId: question.id,
      }], { session });
    });
  } finally {
    await session.endSession();
  }
  return serializeQuestion(question.toObject());
}

export async function updateMentorQuestion(clerkUserId: string, questionId: string, input: Partial<QuestionInput>) {
  const mentor = await getAccount(clerkUserId, "mentor");
  const question = await Question.findOne({ _id: questionId, createdBy: mentor._id });
  if (!question) throw new AppError(404, "QUESTION_NOT_FOUND", "Question was not found.");
  const usedByCompletedContest = await Contest.exists({
    "questions.questionId": question._id,
    $or: [{ status: "completed" }, { endTime: { $lte: new Date() } }],
  });
  if (usedByCompletedContest) throw new AppError(409, "QUESTION_LOCKED", "Questions used in completed contests can only be edited by an admin.");
  Object.assign(question, input);
  await question.save();
  return serializeQuestion(question.toObject());
}

export async function deleteMentorQuestion(clerkUserId: string, questionId: string) {
  const mentor = await getAccount(clerkUserId, "mentor");
  const question = await Question.findOne({ _id: questionId, createdBy: mentor._id });
  if (!question) throw new AppError(404, "QUESTION_NOT_FOUND", "Question was not found.");
  const isReferenced = await Contest.exists({ "questions.questionId": question._id });
  if (isReferenced) throw new AppError(409, "QUESTION_IN_USE", "Remove this question from contests before deleting it.");
  await question.deleteOne();
}

export async function getMentorDashboard(clerkUserId: string) {
  const mentor = await getAccount(clerkUserId, "mentor");
  const contestIds = await Contest.find({ createdBy: mentor._id }).distinct("_id");
  const [contests, questions, participations] = await Promise.all([
    Contest.find({ _id: { $in: contestIds } }).sort({ startTime: -1 }).lean(),
    Question.find({ createdBy: mentor._id }).sort({ createdAt: -1 }).lean(),
    ContestParticipation.find({ contestId: { $in: contestIds } }),
  ]);
  const [participants, results] = await Promise.all([
    listMentorParticipants(clerkUserId),
    ContestResult.find({ contestId: { $in: contestIds } }).lean(),
  ]);
  const allQuestions = questions.map(serializeQuestion);
  const allContests = contests.map(serializeContest);
  const contestById = new Map(contests.map((contest) => [contest._id.toString(), contest]));
  const coinsDistributed = results.reduce((total, result) => {
    const contest = contestById.get(result.contestId.toString());
    return total + (contest?.prizes.find((prize) => prize.place === result.rank)?.coins ?? 0);
  }, 0);
  return {
    profile: {
      name: mentor.name,
      profileImageUrl: mentor.profileImage ?? "",
      headline: "",
      about: mentor.about ?? "",
      organization: "",
      experienceYears: 0,
      skills: mentor.skills,
      languages: [],
      githubUrl: mentor.githubUrl ?? "",
      linkedInUrl: "",
      portfolioUrl: mentor.portfolioUrl ?? "",
      coinsPerSession: 0,
      approvalStatus: "approved",
    },
    stats: {
      totalContests: contests.length,
      activeContests: allContests.filter((item) => item.status === "ongoing").length,
      participants: participations.length,
      questions: questions.length,
      upcomingSessions: 0,
      coinsDistributed,
    },
    contests: allContests,
    questions: allQuestions,
    participants,
    bookings: [],
    availability: [],
    notifications: [],
    messages: [],
  };
}

export async function createMentorContest(clerkUserId: string, input: CreateContestInput) {
  await validateQuestionOwnership(clerkUserId, input.questions);
  const mentor = await getAccount(clerkUserId, "mentor");
  const contest = await Contest.create({
    ...toContestPersistence(input),
    createdBy: mentor._id,
    status: "draft",
    review: { status: "pending" },
  });
  return serializeContest(contest.toObject());
}

export async function listMentorParticipants(clerkUserId: string) {
  const mentor = await getAccount(clerkUserId, "mentor");
  const contestIds = await Contest.find({ createdBy: mentor._id }).distinct("_id");
  const participations = await ContestParticipation.find({ contestId: { $in: contestIds } })
    .populate({ path: "userId", select: "name username college", populate: { path: "college", select: "name" } })
    .populate("contestId", "title status startTime endTime")
    .sort({ registeredAt: -1 })
    .limit(500)
    .lean();
  const results = await ContestResult.find({ contestId: { $in: contestIds } }).lean();
  const resultsByParticipant = new Map(results.map((result) => [`${result.contestId}:${result.userId}`, result]));
  const submissionCounts = await Submission.aggregate<{ _id: string; count: number }>([
    { $match: { contestId: { $in: contestIds } } },
    { $group: { _id: { $concat: [{ $toString: "$contestId" }, ":", { $toString: "$userId" }] }, count: { $sum: 1 } } },
  ]);
  const countMap = new Map(submissionCounts.map((item) => [item._id, item.count]));
  return participations.flatMap((participation) => {
    const user = participation.userId as unknown as {
      _id: { toString(): string };
      name: string;
      username?: string;
      college?: { name: string } | null;
    } | null;
    const contest = participation.contestId as unknown as { _id: { toString(): string }; title: string; status: string } | null;
    if (!user || !contest) return [];
    const key = `${contest._id}:${user._id}`;
    const result = resultsByParticipant.get(key);
    return [{
      id: participation._id.toString(),
      name: user.name,
      username: user.username ?? user._id.toString(),
      college: user.college?.name ?? "",
      contestId: contest._id.toString(),
      contestName: contest.title,
      submissions: countMap.get(key) ?? 0,
      score: result?.score ?? 0,
      rank: contest.status === "completed" ? result?.rank : undefined,
      status: participation.status,
    }];
  });
}

export async function updateMentorContest(clerkUserId: string, contestId: string, input: UpdateContestInput) {
  const mentor = await getAccount(clerkUserId, "mentor");
  const contest = await Contest.findOne({ _id: contestId, createdBy: mentor._id });
  if (!contest) throw new AppError(404, "CONTEST_NOT_FOUND", "Contest was not found.");
  if (contest.status === "completed" || contest.status === "cancelled" || contest.startTime <= new Date()) {
    throw new AppError(409, "CONTEST_LOCKED", "Started, completed, or cancelled contests cannot be edited by mentors.");
  }
  if (contest.registeredCount > 0) {
    throw new AppError(409, "CONTEST_HAS_REGISTRATIONS", "Contests cannot be changed after students have registered.");
  }
  if (input.questions) await validateQuestionOwnership(clerkUserId, input.questions);

  const merged = {
    startTime: input.startTime ?? contest.startTime,
    endTime: input.endTime ?? contest.endTime,
    registrationDeadline: input.registrationDeadline ?? contest.registrationDeadline,
  };
  const now = new Date();
  const duration = input.duration ?? contest.duration;
  if (
    merged.startTime <= now ||
    merged.endTime <= merged.startTime ||
    merged.registrationDeadline < now ||
    merged.registrationDeadline > merged.startTime ||
    duration > (merged.endTime.getTime() - merged.startTime.getTime()) / 60_000
  ) {
    throw new AppError(400, "INVALID_CONTEST_SCHEDULE", "Contest dates or registration deadline are invalid.");
  }
  Object.assign(contest, toContestPersistence(input));
  contest.review ??= { status: "pending" };
  if (contest.review.status === "approved") {
    contest.status = "pending_review";
    contest.review = { status: "pending" };
  }
  await contest.save();
  return serializeContest(contest.toObject());
}

export async function submitMentorContestForReview(clerkUserId: string, contestId: string) {
  const mentor = await getAccount(clerkUserId, "mentor");
  const contest = await Contest.findOne({ _id: contestId, createdBy: mentor._id });
  if (!contest) throw new AppError(404, "CONTEST_NOT_FOUND", "Contest was not found.");
  if (!["draft", "rejected"].includes(contest.status)) {
    throw new AppError(409, "INVALID_CONTEST_STATE", "Only draft or rejected contests can be submitted for review.");
  }
  const now = new Date();
  if (contest.startTime <= now || contest.endTime <= now || contest.registrationDeadline < now || contest.questions.length === 0) {
    throw new AppError(400, "INVALID_CONTEST", "Contest must have a future registration deadline, start time, end time, and at least one question.");
  }
  contest.status = "pending_review";
  contest.review = { status: "pending" };
  await contest.save();
  return serializeContest(contest.toObject());
}

export async function listAdminContests() {
  const contests = await Contest.find().populate("createdBy", "name").sort({ updatedAt: -1 }).lean();
  return contests.map(serializeContest);
}

export async function reviewContest(
  clerkAdminId: string,
  contestId: string,
  input: { decision: "approve" | "reject" | "cancel"; reason?: string },
) {
  const admin = await getAccount(clerkAdminId, "admin");
  const contest = await Contest.findById(contestId);
  if (!contest) throw new AppError(404, "CONTEST_NOT_FOUND", "Contest was not found.");

  if (input.decision === "cancel") {
    if (contest.status === "completed") throw new AppError(409, "CONTEST_COMPLETED", "Completed contests cannot be cancelled.");
    contest.status = "cancelled";
  } else {
    if (contest.status !== "pending_review") throw new AppError(409, "CONTEST_NOT_PENDING", "Contest is not waiting for review.");
    if (input.decision === "approve") {
      if (contest.startTime <= new Date() || contest.registrationDeadline < new Date() || contest.endTime <= new Date()) {
        throw new AppError(409, "CONTEST_SCHEDULE_EXPIRED", "A contest can only be approved before registration closes and before it starts.");
      }
      contest.status = "upcoming";
      contest.review = { status: "approved" };
    } else {
      if (!input.reason?.trim()) throw new AppError(400, "REJECTION_REASON_REQUIRED", "Provide a reason when rejecting a contest.");
      contest.status = "rejected";
      contest.review = { status: "rejected", reason: input.reason };
    }
  }
  contest.review = {
    ...contest.review,
    status: contest.review?.status ?? "pending",
    reviewedBy: admin._id,
    reviewedAt: new Date(),
  };
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await contest.save({ session });
      await AuditLog.create([{
        actorId: admin._id,
        action: `contest.${input.decision}`,
        entityType: "Contest",
        entityId: contest.id,
        metadata: input.reason ? { reason: input.reason } : {},
      }], { session });
    });
  } finally {
    await session.endSession();
  }
  return serializeContest(contest.toObject());
}

export async function listPublicContests(query: { status?: string; search?: string }) {
  const now = new Date();
  const filter: Record<string, unknown> = {
    visibility: "public",
    status: { $in: ["upcoming", "ongoing", "completed"] },
  };
  if (query.status && ["upcoming", "ongoing", "completed"].includes(query.status)) {
    if (query.status === "upcoming") filter.startTime = { $gt: now };
    if (query.status === "ongoing") {
      filter.startTime = { $lte: now };
      filter.endTime = { $gt: now };
    }
    if (query.status === "completed") filter.endTime = { $lte: now };
  } else {
    filter.endTime = { $gt: now };
  }
  if (query.search?.trim()) filter.title = { $regex: escapeRegex(query.search.trim()), $options: "i" };
  const contests = await Contest.find(filter).sort({ startTime: 1 }).limit(100).lean();
  return contests.map(serializeContest);
}

export async function getPublicContest(contestId: string) {
  const contest = await Contest.findOne({
    _id: contestId,
    visibility: "public",
    status: { $in: ["upcoming", "ongoing", "completed"] },
  }).populate("createdBy", "name").lean();
  if (!contest) throw new AppError(404, "CONTEST_NOT_FOUND", "Contest was not found.");
  return serializeContest(contest);
}

export async function getContestQuestions(clerkUserId: string, contestId: string) {
  const user = await getAccount(clerkUserId, "student");
  const contest = await Contest.findOne({ _id: contestId, visibility: "public" }).lean();
  if (!contest || !["upcoming", "ongoing", "completed"].includes(contest.status)) {
    throw new AppError(404, "CONTEST_NOT_FOUND", "Contest was not found.");
  }
  const participation = await ContestParticipation.findOne({ contestId, userId: user._id });
  if (!participation || !["in_progress", "submitted", "completed"].includes(participation.status)) {
    throw new AppError(403, "PARTICIPATION_REQUIRED", "Start your registered contest session to access its questions.");
  }
  if (participation.status === "in_progress" && participation.expiresAt && participation.expiresAt <= new Date()) {
    await ContestParticipation.updateOne({ _id: participation._id, status: "in_progress" }, { $set: { status: "completed" } });
    throw new AppError(409, "PARTICIPATION_EXPIRED", "Your contest session has expired.");
  }
  const sortedQuestions = [...contest.questions].sort((a, b) => a.order - b.order);
  const questionIds = sortedQuestions.map((question) => question.questionId);
  const questions = await Question.find({ _id: { $in: questionIds } })
    .select("title description inputFormat outputFormat difficulty topics constraints sampleCases supportedLanguages timeLimitMs memoryLimitMb")
    .lean();
  const questionMap = new Map(questions.map((question) => [question._id.toString(), question]));
  return sortedQuestions.flatMap((mapping) => {
    const question = questionMap.get(mapping.questionId.toString());
    if (!question) return [];
    return [{
      id: question._id.toString(),
      contestId,
      title: question.title,
      statement: question.description,
      inputFormat: question.inputFormat,
      outputFormat: question.outputFormat,
      difficulty: question.difficulty,
      topics: question.topics,
      constraints: question.constraints,
      sampleCases: question.sampleCases,
      supportedLanguages: question.supportedLanguages,
      timeLimitMs: question.timeLimitMs,
      memoryLimitMb: question.memoryLimitMb,
      points: mapping.points,
    }];
  });
}

export async function registerForContest(clerkUserId: string, contestId: string) {
  const student = await getAccount(clerkUserId, "student");
  const now = new Date();
  const contest = await Contest.findOneAndUpdate(
    {
      _id: contestId,
      visibility: "public",
      status: "upcoming",
      registrationDeadline: { $gte: now },
      startTime: { $gt: now },
      $expr: { $lt: ["$registeredCount", "$maxParticipants"] },
    },
    { $inc: { registeredCount: 1 } },
    { new: true },
  );
  if (!contest) throw new AppError(409, "REGISTRATION_CLOSED", "Registration is closed, the contest is full, or it is not open.");
  try {
    const participation = await ContestParticipation.create({ contestId, userId: student._id });
    return serializeParticipation(participation);
  } catch (error) {
    await Contest.updateOne({ _id: contestId }, { $inc: { registeredCount: -1 } });
    if (isDuplicateKeyError(error)) {
      throw new AppError(409, "ALREADY_REGISTERED", "You are already registered for this contest.");
    }
    throw error;
  }
}

export async function getContestParticipation(clerkUserId: string, contestId: string) {
  const student = await getAccount(clerkUserId, "student");
  const contestExists = await Contest.exists({
    _id: contestId,
    visibility: "public",
    status: { $in: ["upcoming", "ongoing", "completed"] },
  });
  if (!contestExists) throw new AppError(404, "CONTEST_NOT_FOUND", "Contest was not found.");
  let participation = await ContestParticipation.findOne({ contestId, userId: student._id });
  if (!participation) throw new AppError(404, "PARTICIPATION_NOT_FOUND", "No contest registration was found.");
  if (
    participation.status === "in_progress" &&
    participation.expiresAt &&
    participation.expiresAt <= new Date()
  ) {
    participation = await ContestParticipation.findOneAndUpdate(
      { _id: participation._id, status: "in_progress" },
      { $set: { status: "completed" } },
      { new: true },
    ) ?? participation;
  }
  return serializeParticipation(participation);
}

export async function startContestParticipation(clerkUserId: string, contestId: string) {
  const student = await getAccount(clerkUserId, "student");
  const contest = await Contest.findOne({ _id: contestId, visibility: "public" });
  if (!contest || !["upcoming", "ongoing"].includes(currentStatus(contest))) {
    throw new AppError(409, "CONTEST_NOT_ACTIVE", "This contest is not currently accepting participation.");
  }
  const now = new Date();
  if (now < contest.startTime || now >= contest.endTime) {
    throw new AppError(409, "CONTEST_NOT_ACTIVE", "The contest is not within its scheduled participation window.");
  }
  let participation = await ContestParticipation.findOne({ contestId, userId: student._id });
  if (!participation) throw new AppError(403, "REGISTRATION_REQUIRED", "Register for this contest before participating.");
  if (participation.status === "completed" || participation.status === "submitted") return serializeParticipation(participation);
  if (participation.status === "disqualified") throw new AppError(403, "PARTICIPATION_BLOCKED", "Participation is not available for this account.");
  if (!participation.startedAt) {
    const expiresAt = new Date(Math.min(now.getTime() + contest.duration * 60_000, contest.endTime.getTime()));
    participation = await ContestParticipation.findOneAndUpdate(
      { _id: participation._id, status: "registered", startedAt: { $exists: false } },
      { $set: { startedAt: now, expiresAt, status: "in_progress" } },
      { new: true },
    ) ?? await ContestParticipation.findById(participation._id);
    if (!participation) throw new AppError(409, "PARTICIPATION_NOT_ACTIVE", "The contest participation could not be started.");
  }
  if (participation.expiresAt && participation.expiresAt <= now) {
    participation.status = "completed";
    await participation.save();
    throw new AppError(409, "PARTICIPATION_EXPIRED", "Your contest time has expired.");
  }
  return serializeParticipation(participation);
}

function serializeParticipation(participation: {
  _id: { toString(): string };
  contestId: { toString(): string };
  status: string;
  registeredAt: Date;
  startedAt?: Date | null;
  expiresAt?: Date | null;
  finalSubmittedAt?: Date | null;
}) {
  return {
    id: participation._id.toString(),
    contestId: participation.contestId.toString(),
    status: participation.status,
    registeredAt: participation.registeredAt.toISOString(),
    startedAt: participation.startedAt?.toISOString(),
    expiresAt: participation.expiresAt?.toISOString(),
    finalSubmittedAt: participation.finalSubmittedAt?.toISOString(),
  };
}

export async function recordMonitoringEvent(
  clerkUserId: string,
  contestId: string,
  kind: "fullscreen_exit" | "visibility_hidden" | "window_blur",
) {
  const student = await getAccount(clerkUserId, "student");
  const field = kind === "fullscreen_exit" ? "violationCounts.fullscreenExit"
    : kind === "visibility_hidden" ? "violationCounts.visibilityHidden"
      : "violationCounts.windowBlur";
  const participation = await ContestParticipation.findOneAndUpdate(
    { contestId, userId: student._id, status: "in_progress", expiresAt: { $gt: new Date() } },
    { $inc: { [field]: 1 }, $set: { lastViolationAt: new Date() } },
    { new: true },
  );
  if (!participation) throw new AppError(409, "PARTICIPATION_NOT_ACTIVE", "No active contest participation was found.");
  return serializeParticipation(participation);
}

export async function submitContestAnswer(clerkUserId: string, questionId: string, input: {
  contestId: string;
  sourceCode: string;
  language: "javascript" | "typescript" | "python" | "java" | "cpp";
}) {
  const student = await getAccount(clerkUserId, "student");
  const contest = await Contest.findById(input.contestId);
  const now = new Date();
  if (!contest || contest.visibility !== "public" || currentStatus(contest) !== "ongoing" || now >= contest.endTime) {
    throw new AppError(409, "CONTEST_ENDED", "Submissions are closed for this contest.");
  }
  const participation = await ContestParticipation.findOne({
    contestId: contest._id,
    userId: student._id,
    status: "in_progress",
    expiresAt: { $gt: now },
  });
  if (!participation) throw new AppError(403, "PARTICIPATION_REQUIRED", "An active registered contest session is required.");

  const mapping = contest.questions.find((item) => item.questionId.toString() === questionId);
  if (!mapping) throw new AppError(404, "QUESTION_NOT_IN_CONTEST", "Question is not part of this contest.");
  const question = await Question.findById(questionId).select("+testCases");
  if (!question) throw new AppError(404, "QUESTION_NOT_FOUND", "Question was not found.");
  if (!question.supportedLanguages.includes(input.language)) {
    throw new AppError(400, "LANGUAGE_NOT_SUPPORTED", "This language is not supported for the selected question.");
  }
  const attemptNumber = await Submission.countDocuments({ userId: student._id, contestId: contest._id, questionId }) + 1;
  if (attemptNumber > 50) throw new AppError(429, "SUBMISSION_LIMIT", "Submission limit reached for this question.");

  const testCases = question.testCases.map((testCase) => ({
    input: testCase.input,
    expectedOutput: testCase.expectedOutput,
  }));
  if (testCases.length === 0) throw new AppError(503, "QUESTION_NOT_JUDGEABLE", "This question has no configured test cases.");

  const submission = await Submission.create({
    userId: student._id,
    contestId: contest._id,
    questionId: question._id,
    sourceCode: input.sourceCode,
    language: input.language,
    status: "running",
    attemptNumber,
    totalTestCases: testCases.length,
  }).catch((error: unknown) => {
    if (isDuplicateKeyError(error)) {
      throw new AppError(409, "SUBMISSION_CONFLICT", "A concurrent submission was recorded. Refresh your submission history before retrying.");
    }
    throw error;
  });
  try {
    const { evaluateWithConfiguredJudge } = await import("./judge.service.js");
    const result = await evaluateWithConfiguredJudge({
      sourceCode: input.sourceCode,
      language: input.language,
      cases: testCases,
      timeLimitMs: question.timeLimitMs,
      memoryLimitMb: question.memoryLimitMb,
    });
    submission.status = result.status;
    submission.passedTestCases = result.passedTestCases;
    submission.executionTime = result.executionTime;
    submission.memoryUsed = result.memoryUsed;
    submission.score = result.status === "accepted" ? mapping.points : 0;
    submission.completedAt = new Date();
    await submission.save();
    return serializeSubmission(submission);
  } catch (error) {
    submission.status = "judge_error";
    submission.completedAt = new Date();
    await submission.save();
    throw error;
  }
}

function serializeSubmission(submission: {
  _id: { toString(): string };
  questionId: { toString(): string };
  contestId: { toString(): string };
  language: string;
  status: string;
  score: number;
  attemptNumber: number;
  passedTestCases: number;
  totalTestCases: number;
  executionTime?: number | null;
  memoryUsed?: number | null;
  submittedAt: Date;
}) {
  return {
    id: submission._id.toString(),
    questionId: submission.questionId.toString(),
    contestId: submission.contestId.toString(),
    language: submission.language,
    status: submission.status,
    score: submission.score,
    attemptNumber: submission.attemptNumber,
    passedTestCases: submission.passedTestCases,
    totalTestCases: submission.totalTestCases,
    executionTime: submission.executionTime,
    memoryUsed: submission.memoryUsed,
    submittedAt: submission.submittedAt.toISOString(),
  };
}

export async function submitFinalContest(clerkUserId: string, contestId: string) {
  const student = await getAccount(clerkUserId, "student");
  const now = new Date();
  const participation = await ContestParticipation.findOneAndUpdate(
    {
      contestId,
      userId: student._id,
      status: "in_progress",
      expiresAt: { $gt: now },
      finalSubmittedAt: { $exists: false },
    },
    { $set: { status: "submitted", finalSubmittedAt: now } },
    { new: true },
  );
  if (!participation) {
    const alreadySubmitted = await ContestParticipation.findOne({ contestId, userId: student._id, status: "submitted" });
    if (alreadySubmitted) return serializeParticipation(alreadySubmitted);
    throw new AppError(403, "PARTICIPATION_REQUIRED", "An active contest participation is required.");
  }
  return serializeParticipation(participation);
}

export async function listMySubmissions(clerkUserId: string, contestId: string) {
  const student = await getAccount(clerkUserId, "student");
  const participation = await ContestParticipation.exists({ contestId, userId: student._id });
  if (!participation) throw new AppError(403, "PARTICIPATION_REQUIRED", "Register for this contest to view submission history.");
  const submissions = await Submission.find({ userId: student._id, contestId })
    .select("-sourceCode")
    .sort({ submittedAt: -1 })
    .limit(200)
    .lean();
  return submissions.map(serializeSubmission);
}

export async function finalizeContest(contestId: string) {
  const contest = await Contest.findById(contestId);
  if (!contest) throw new AppError(404, "CONTEST_NOT_FOUND", "Contest was not found.");
  if (contest.visibility !== "public") throw new AppError(404, "CONTEST_NOT_FOUND", "Contest was not found.");
  if (["draft", "pending_review", "rejected", "cancelled"].includes(contest.status)) {
    throw new AppError(409, "CONTEST_NOT_FINALIZABLE", "Only approved contests can be finalized.");
  }
  if (contest.endTime > new Date()) throw new AppError(409, "CONTEST_NOT_ENDED", "Results are available after the contest ends.");

  const participations = await ContestParticipation.find({
    contestId: contest._id,
    startedAt: { $exists: true },
    status: { $ne: "disqualified" },
  }).sort({ registeredAt: 1, _id: 1 }).lean();
  const questionIds = contest.questions.map((item) => item.questionId);
  const submissions = await Submission.find({
    contestId: contest._id,
    userId: { $in: participations.map((item) => item.userId) },
    questionId: { $in: questionIds },
    status: { $ne: "judge_error" },
  }).sort({ submittedAt: 1 }).lean();

  const resultRows = participations.map((participation) => {
    const participantSubmissions = submissions.filter((submission) => submission.userId.equals(participation.userId));
    const questionResults = contest.questions.map((mapping) => {
      const attempts = participantSubmissions.filter((submission) => submission.questionId.equals(mapping.questionId));
      const accepted = attempts.find((submission) => submission.status === "accepted");
      const acceptedIndex = attempts.findIndex((submission) => submission.status === "accepted");
      const wrongAttempts = attempts.filter((submission, index) =>
        submission.status !== "accepted" && (acceptedIndex < 0 || index < acceptedIndex),
      ).length;
      const pointsEarned = accepted
        ? Math.max(0, mapping.points - contest.wrongAttemptPenalty * wrongAttempts)
        : 0;
      return { questionId: mapping.questionId, pointsEarned, wrongAttempts, acceptedAt: accepted?.submittedAt };
    });
    const score = questionResults.reduce((total, item) => total + item.pointsEarned, 0);
    const acceptedCount = questionResults.filter((item) => item.acceptedAt).length;
    const elapsedSeconds = participation.startedAt
      ? Math.max(0, Math.floor(((participation.finalSubmittedAt ?? participation.expiresAt ?? contest.endTime).getTime() - participation.startedAt.getTime()) / 1000))
      : 0;
    return {
      participation,
      questionResults,
      score,
      acceptedCount,
      wrongAttempts: questionResults.reduce((total, item) => total + item.wrongAttempts, 0),
      elapsedSeconds,
    };
  }).sort((a, b) =>
    b.score - a.score ||
    b.acceptedCount - a.acceptedCount ||
    a.elapsedSeconds - b.elapsedSeconds ||
    a.participation.registeredAt.getTime() - b.participation.registeredAt.getTime() ||
    a.participation._id.toString().localeCompare(b.participation._id.toString()),
  );

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      for (const [index, row] of resultRows.entries()) {
        await ContestResult.updateOne(
          { contestId: contest._id, userId: row.participation.userId },
          {
            $setOnInsert: {
              contestId: contest._id,
              userId: row.participation.userId,
              participationId: row.participation._id,
              score: row.score,
              rank: index + 1,
              acceptedCount: row.acceptedCount,
              wrongAttempts: row.wrongAttempts,
              elapsedSeconds: row.elapsedSeconds,
              questionResults: row.questionResults,
              scoringVersion: "contest-score-v1",
              publishedAt: new Date(),
            },
          },
          { upsert: true, session },
        );

        const prize = contest.prizes.find((item) => item.place === index + 1);
        if (prize && prize.coins > 0) {
          const transaction = await CoinTransaction.updateOne(
            { userId: row.participation.userId, referenceId: `contest:${contest.id}:rank:${index + 1}` },
            { $setOnInsert: {
              userId: row.participation.userId,
              amount: prize.coins,
              type: "credit",
              reason: `Contest reward: ${contest.title} (rank ${index + 1})`,
              referenceId: `contest:${contest.id}:rank:${index + 1}`,
            } },
            { upsert: true, session },
          );
          if (transaction.upsertedCount) {
            await User.updateOne({ _id: row.participation.userId }, { $inc: { coins: prize.coins } }, { session });
          }
        }

        await ContestParticipation.updateOne(
          { _id: row.participation._id, status: { $in: ["registered", "in_progress", "submitted"] } },
          { $set: { status: "completed" } },
          { session },
        );
      }
      await Contest.updateOne({ _id: contest._id }, { $set: { status: "completed" } }, { session });
    });
  } catch (error) {
    console.error("Contest result finalization failed:", error);
    throw new AppError(503, "RESULT_FINALIZATION_FAILED", "Could not safely finalize results and rewards. Verify MongoDB transaction support.");
  } finally {
    await session.endSession();
  }
  return getContestLeaderboard(contestId, undefined);
}

export async function getContestLeaderboard(contestId: string, clerkUserId?: string) {
  const contest = await Contest.findById(contestId);
  if (!contest) throw new AppError(404, "CONTEST_NOT_FOUND", "Contest was not found.");
  if (contest.visibility !== "public") throw new AppError(404, "CONTEST_NOT_FOUND", "Contest was not found.");
  if (contest.endTime > new Date()) throw new AppError(403, "LEADERBOARD_HIDDEN", "The leaderboard is hidden until the contest ends.");
  if (currentStatus(contest) !== "completed") throw new AppError(409, "RESULTS_NOT_READY", "Contest results are not ready.");
  if (clerkUserId) await getAccount(clerkUserId, "student");
  const results = await ContestResult.find({ contestId }).populate("userId", "username name").sort({ rank: 1 }).lean();
  return results.map((result) => {
    const user = result.userId as unknown as { _id: { toString(): string }; username?: string; name: string };
    const prize = contest.prizes.find((item) => item.place === result.rank);
    return {
      rank: result.rank,
      userId: user._id.toString(),
      username: user.username ?? user.name,
      score: result.score,
      acceptedCount: result.acceptedCount,
      wrongAttempts: result.wrongAttempts,
      elapsedSeconds: result.elapsedSeconds,
      coinsAwarded: prize?.coins ?? 0,
    };
  });
}

export async function listMyContestHistory(clerkUserId: string) {
  const student = await getAccount(clerkUserId, "student");
  const participations = await ContestParticipation.find({ userId: student._id })
    .populate("contestId", "title startTime endTime status")
    .sort({ updatedAt: -1 })
    .limit(100)
    .lean();
  const results = await ContestResult.find({ userId: student._id }).lean();
  const resultMap = new Map(results.map((result) => [result.contestId.toString(), result]));
  return participations.flatMap((participation) => {
    const contest = participation.contestId as unknown as { _id: { toString(): string }; title: string; startTime: Date; endTime: Date; status: string } | null;
    if (!contest) return [];
    const result = resultMap.get(contest._id.toString());
    return [{
      contestId: contest._id.toString(),
      title: contest.title,
      startsAt: contest.startTime.toISOString(),
      endsAt: contest.endTime.toISOString(),
      status: participation.status,
      registeredAt: participation.registeredAt.toISOString(),
      score: result?.score,
      rank: result?.rank,
      acceptedCount: result?.acceptedCount,
      wrongAttempts: result?.wrongAttempts,
    }];
  });
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isDuplicateKeyError(error: unknown): error is { code: number } {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}
