import cors from "cors";
import express from "express";
import helmet from "helmet";
import { clerkMiddleware } from "@clerk/express";
import authRouter from "./routes/auth.routes.js";
import healthRouter from "./routes/health.routes.js";
import { adminMentorApplicationRouter, mentorApplicationRouter } from "./routes/mentorApplication.routes.js";
import { publicContestRouter, studentContestRouter, submissionRouter } from "./routes/contest.routes.js";
import mentorContestRouter from "./routes/mentorContest.routes.js";
import adminContestRouter from "./routes/adminContest.routes.js";
import errorHandler from "./middleware/errorHandler.js";
import notFound from "./middleware/notFound.js";

export type AppConfig = {
  frontendUrl?: string;
  clerkPublishableKey?: string;
  clerkSecretKey?: string;
  authEnabled?: boolean;
};

export function createApp(config: AppConfig = {}) {
  const frontendUrl = config.frontendUrl ?? process.env.FRONTEND_URL ?? "http://localhost:3000";
  const allowedOrigins = new Set(
    frontendUrl.split(",").map((origin) => origin.trim()).filter(Boolean),
  );
  const app = express();

  app.disable("x-powered-by");
  if (config.authEnabled !== false) {
    if (!config.clerkPublishableKey || !config.clerkSecretKey) {
      throw new Error("Clerk keys are required to create the authenticated API application.");
    }
    app.use(
      clerkMiddleware({
        publishableKey: config.clerkPublishableKey,
        secretKey: config.clerkSecretKey,
        authorizedParties: [...allowedOrigins],
      }),
    );
  }
  app.use(helmet());
  app.use(
    cors({
      credentials: true,
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error("Origin is not allowed by CORS."));
      },
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use("/api/health", healthRouter);
  if (config.authEnabled !== false) {
    app.use("/api/auth", authRouter);
    app.use("/api/mentor-applications", mentorApplicationRouter);
    app.use("/api/admin/mentors", adminMentorApplicationRouter);
    app.use("/api/contests", publicContestRouter);
    app.use("/api/questions", submissionRouter);
    app.use("/api/student", studentContestRouter);
    app.use("/api/mentor", mentorContestRouter);
    app.use("/api/admin/contests", adminContestRouter);
  }
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
