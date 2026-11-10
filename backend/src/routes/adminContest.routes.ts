import { Router } from "express";
import { getAdminContestList, patchAdminQuestion, postContestReview } from "../controllers/contest.controller.js";
import { requireRole } from "../middleware/auth.js";
import { validateBody } from "../validators/validate.js";
import { contestReviewSchema, questionSchema } from "../validators/contest.validators.js";

const adminContestRouter = Router();
adminContestRouter.use(requireRole("admin"));
adminContestRouter.get("/", getAdminContestList);
adminContestRouter.post("/:contestId/review", validateBody(contestReviewSchema), postContestReview);
adminContestRouter.patch("/questions/:questionId", validateBody(questionSchema.partial()), patchAdminQuestion);

export default adminContestRouter;
