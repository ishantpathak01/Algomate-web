import { z } from "zod";

export const createBookingSchema = z
  .object({
    mentorId: z.string().regex(/^[a-f\d]{24}$/i),
    date: z.coerce.date(),
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  })
  .refine((value) => value.endTime > value.startTime, {
    message: "endTime must be after startTime.",
    path: ["endTime"],
  });
