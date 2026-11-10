import { Router } from "express";
import {
  getContestHistory,
  getContestParticipationState,
  getContestQuestionList,
  getContestResults,
  getPublicContestDetails,
  getPublicContestList,
  getSubmissionHistory,
  registerContestParticipant,
  reportContestMonitoringEvent,
  startContest,
  submitContestFinal,
  submitQuestion,
} from "../controllers/contest.controller.js";
import { requireAuthentication, requireRole } from "../middleware/auth.js";
import { validateBody } from "../validators/validate.js";
import { submissionSchema, violationSchema } from "../validators/contest.validators.js";

export const publicContestRouter = Router();
publicContestRouter.get("/", getPublicContestList);
publicContestRouter.get("/:contestId", getPublicContestDetails);
publicContestRouter.get("/:contestId/leaderboard", requireAuthentication, requireRole("student"), getContestResults);
publicContestRouter.get("/:contestId/questions", requireAuthentication, requireRole("student"), getContestQuestionList);
publicContestRouter.post("/:contestId/registrations", requireAuthentication, requireRole("student"), registerContestParticipant);
publicContestRouter.get("/:contestId/participation", requireAuthentication, requireRole("student"), getContestParticipationState);
publicContestRouter.post("/:contestId/participation/start", requireAuthentication, requireRole("student"), startContest);
publicContestRouter.post("/:contestId/participation/finalize", requireAuthentication, requireRole("student"), submitContestFinal);
publicContestRouter.post("/:contestId/monitoring-events", requireAuthentication, requireRole("student"), validateBody(violationSchema), reportContestMonitoringEvent);
publicContestRouter.get("/:contestId/submissions", requireAuthentication, requireRole("student"), getSubmissionHistory);

export const studentContestRouter = Router();
studentContestRouter.get("/contest-history", requireAuthentication, requireRole("student"), getContestHistory);

export const submissionRouter = Router();
submissionRouter.post("/:questionId/submissions", requireAuthentication, requireRole("student"), validateBody(submissionSchema), submitQuestion);
