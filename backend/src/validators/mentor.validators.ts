import { z } from "zod";

export const mentorApplicationSchema = z.object({
  description: z.string().trim().min(30).max(2000),
  skills: z.array(z.string().trim().min(1).max(50)).min(1).max(30),
  contactEmail: z.string().trim().email().max(254).optional(),
});

export const mentorReviewSchema = z.object({
  decision: z.enum(["approve", "reject"]),
});
