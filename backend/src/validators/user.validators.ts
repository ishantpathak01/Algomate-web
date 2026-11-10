import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));

export const onboardingSchema = z.object({
  username: z.string().trim().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/).transform((value) => value.toLowerCase()),
  college: z.string().regex(/^[a-f\d]{24}$/i),
  mobile: z.string().trim().max(24).optional(),
  skills: z.array(z.string().trim().min(1).max(50)).max(30).default([]),
  leetcodeUrl: optionalUrl,
  githubUrl: optionalUrl,
  portfolioUrl: optionalUrl,
  about: z.string().trim().max(1000).optional(),
});

export const updateProfileSchema = onboardingSchema.partial();

export const adminUserStatusSchema = z.object({
  accountStatus: z.enum(["active", "suspended"]),
});
