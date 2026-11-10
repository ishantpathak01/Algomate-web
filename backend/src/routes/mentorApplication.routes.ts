import { Router } from "express";
import {
  createMentorApplication,
  getPendingMentorApplications,
  reviewMentorApplicationController,
} from "../controllers/mentorApplication.controller.js";
import { requireAuthentication, requireRole } from "../middleware/auth.js";

export const mentorApplicationRouter = Router();
mentorApplicationRouter.post("/", requireAuthentication, createMentorApplication);

export const adminMentorApplicationRouter = Router();
adminMentorApplicationRouter.get("/", requireRole("admin"), getPendingMentorApplications);
adminMentorApplicationRouter.post("/:mentorId/review", requireRole("admin"), reviewMentorApplicationController);
