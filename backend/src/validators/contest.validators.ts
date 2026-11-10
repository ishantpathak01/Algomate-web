import { z } from "zod";

const prizeSchema = z.object({
  place: z.number().int().positive(),
  description: z.string().trim().min(1).max(240),
  coins: z.number().int().nonnegative(),
});

const contestFields = {
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(20).max(10_000),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  registrationDeadline: z.coerce.date(),
  duration: z.number().int().positive().max(600),
  maxParticipants: z.number().int().positive().max(100_000),
  rules: z.string().trim().max(10_000).default(""),
  visibility: z.enum(["public", "private"]).default("public"),
  bannerImageUrl: z.string().url().max(2048).refine((value) => /^https?:\/\//i.test(value), {
    message: "bannerImageUrl must use HTTP or HTTPS.",
  }).optional().or(z.literal("")),
  wrongAttemptPenalty: z.number().int().min(0).max(100_000).default(0),
  questions: z.array(z.object({
    questionId: z.string().regex(/^[a-f\d]{24}$/i),
    points: z.number().int().positive().max(100_000),
    order: z.number().int().nonnegative(),
  })).min(1).max(100),
  prizes: z.array(prizeSchema).max(20).default([]),
};

const contestFieldsSchema = z.object(contestFields);

export const createContestSchema = contestFieldsSchema
  .refine((value) => value.endTime > value.startTime, {
    message: "endTime must be later than startTime.",
    path: ["endTime"],
  })
  .refine((value) => value.registrationDeadline <= value.startTime, {
    message: "registrationDeadline must not be later than contest start.",
    path: ["registrationDeadline"],
  })
  .refine((value) => value.registrationDeadline >= new Date(), {
    message: "registrationDeadline must be in the future.",
    path: ["registrationDeadline"],
  })
  .refine((value) => new Set(value.questions.map(({ questionId }) => questionId)).size === value.questions.length, {
    message: "A question can only be selected once.",
    path: ["questions"],
  })
  .refine((value) => new Set(value.questions.map(({ order }) => order)).size === value.questions.length, {
    message: "Each question must have a unique order.",
    path: ["questions"],
  })
  .refine((value) => value.duration <= (value.endTime.getTime() - value.startTime.getTime()) / 60_000, {
    message: "Contest duration cannot exceed its scheduled time window.",
    path: ["duration"],
  })
  .refine((value) => new Set(value.prizes.map(({ place }) => place)).size === value.prizes.length, {
    message: "Each prize place can only be configured once.",
    path: ["prizes"],
  });

export const updateContestSchema = contestFieldsSchema.partial()
  .refine((value) => value.startTime === undefined || value.endTime === undefined || value.endTime > value.startTime, {
    message: "endTime must be later than startTime.",
    path: ["endTime"],
  })
  .refine((value) =>
    value.registrationDeadline === undefined ||
    value.startTime === undefined ||
    value.registrationDeadline <= value.startTime,
  {
    message: "registrationDeadline must not be later than contest start.",
    path: ["registrationDeadline"],
  })
  .refine((value) => value.questions === undefined ||
    new Set(value.questions.map(({ questionId }) => questionId)).size === value.questions.length, {
    message: "A question can only be selected once.",
    path: ["questions"],
  })
  .refine((value) => value.questions === undefined ||
    new Set(value.questions.map(({ order }) => order)).size === value.questions.length, {
    message: "Each question must have a unique order.",
    path: ["questions"],
  })
  .refine((value) => value.startTime === undefined || value.endTime === undefined || value.duration === undefined ||
    value.duration <= (value.endTime.getTime() - value.startTime.getTime()) / 60_000, {
    message: "Contest duration cannot exceed its scheduled time window.",
    path: ["duration"],
  })
  .refine((value) => value.prizes === undefined ||
    new Set(value.prizes.map(({ place }) => place)).size === value.prizes.length, {
    message: "Each prize place can only be configured once.",
    path: ["prizes"],
  });

export const questionSchema = z.object({
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(1).max(20_000),
  inputFormat: z.string().trim().max(5000).default(""),
  outputFormat: z.string().trim().max(5000).default(""),
  difficulty: z.enum(["easy", "medium", "hard"]),
  topics: z.array(z.string().trim().min(1).max(50)).max(30).default([]),
  points: z.number().int().positive().max(100_000).default(100),
  constraints: z.array(z.string().trim().min(1).max(500)).max(30).default([]),
  sampleCases: z.array(z.object({
    input: z.string().max(10_000),
    output: z.string().max(10_000),
    explanation: z.string().max(2000).optional(),
  })).max(20).default([]),
  testCases: z.array(z.object({
    input: z.string().max(10_000),
    expectedOutput: z.string().max(10_000),
    isHidden: z.boolean().default(true),
  })).min(1).max(200),
  supportedLanguages: z.array(z.enum(["javascript", "typescript", "python", "java", "cpp"])).min(1).max(5),
  timeLimitMs: z.number().int().min(100).max(30_000).default(2000),
  memoryLimitMb: z.number().int().min(16).max(2048).default(256),
});

export const submissionSchema = z.object({
  contestId: z.string().regex(/^[a-f\d]{24}$/i),
  sourceCode: z.string().trim().min(1).max(100_000),
  language: z.enum(["javascript", "typescript", "python", "java", "cpp"]),
});

export const contestReviewSchema = z.object({
  decision: z.enum(["approve", "reject", "cancel"]),
  reason: z.string().trim().max(2000).optional(),
});

export const violationSchema = z.object({
  kind: z.enum(["fullscreen_exit", "visibility_hidden", "window_blur"]),
});
