import "dotenv/config";
import { z } from "zod";

const environmentSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  MONGODB_URI: z.string().trim().min(1, "MONGODB_URI is required."),
  FRONTEND_URL: z
    .string()
    .default("http://localhost:3000")
    .refine((origins) => origins.split(",").every((origin) => z.string().url().safeParse(origin.trim()).success), {
      message: "Use comma-separated valid origin URLs.",
    }),
  CLERK_PUBLISHABLE_KEY: z.string().trim().min(1, "CLERK_PUBLISHABLE_KEY is required."),
  CLERK_SECRET_KEY: z.string().trim().min(1, "CLERK_SECRET_KEY is required."),
});

export type Environment = z.infer<typeof environmentSchema>;

export function loadEnvironment(source: NodeJS.ProcessEnv = process.env): Environment {
  const result = environmentSchema.safeParse(source);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => {
        const path = issue.path.join(".") || "environment";
        const missingValue = source[path] === undefined || source[path] === "";
        const message =
          missingValue && ["MONGODB_URI", "CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"].includes(path)
            ? `${path} is required.`
            : issue.message;
        return `${path}: ${message}`;
      })
      .join("; ");
    throw new Error(`Invalid backend environment: ${details}`);
  }
  return result.data;
}
