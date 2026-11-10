import { z } from "zod";

const prizeSchema = z.object({
  place: z.number().int().positive(),
  description: z.string().trim().min(1).max(240),
  coins: z.number().int().nonnegative(),
});

export const createContestSchema = z
  .object({
    title: z.string().trim().min(3).max(160),
    description: z.string().trim().min(1).max(10_000),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    duration: z.number().int().positive().max(1440),
    prizes: z.array(prizeSchema).max(20).default([]),
  })
  .refine((value) => value.endTime > value.startTime, {
    message: "endTime must be later than startTime.",
    path: ["endTime"],
  });

export const questionSchema = z.object({
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(1).max(20_000),
  difficulty: z.enum(["easy", "medium", "hard"]),
  constraints: z.array(z.string().trim().min(1).max(500)).max(30).default([]),
  testCases: z
    .array(
      z.object({
        input: z.string().max(10_000),
        expectedOutput: z.string().max(10_000),
        isHidden: z.boolean().default(true),
      }),
    )
    .max(200)
    .default([]),
});

export const submissionSchema = z.object({
  contestId: z.string().regex(/^[a-f\d]{24}$/i),
  questionId: z.string().regex(/^[a-f\d]{24}$/i),
  sourceCode: z.string().min(1).max(100_000),
  language: z.enum(["javascript", "typescript", "python", "java", "cpp"]),
});
