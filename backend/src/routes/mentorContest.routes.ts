import { Router } from "express";
import {
  getMentorContestList,
  getMentorOverview,
  getMentorParticipantList,
  getMentorQuestionList,
  patchMentorContest,
  patchMentorQuestion,
  postMentorContest,
  postMentorQuestion,
  removeMentorQuestion,
  requestContestReview,
} from "../controllers/contest.controller.js";
import { requireApprovedMentor } from "../middleware/auth.js";
import { validateBody } from "../validators/validate.js";
import { createContestSchema, questionSchema, updateContestSchema } from "../validators/contest.validators.js";

const mentorContestRouter = Router();
mentorContestRouter.use(requireApprovedMentor);
mentorContestRouter.get("/dashboard", getMentorOverview);
mentorContestRouter.get("/contests", getMentorContestList);
mentorContestRouter.post("/contests", validateBody(createContestSchema), postMentorContest);
mentorContestRouter.patch("/contests/:contestId", validateBody(updateContestSchema), patchMentorContest);
mentorContestRouter.post("/contests/:contestId/submit-review", requestContestReview);
mentorContestRouter.get("/questions", getMentorQuestionList);
mentorContestRouter.post("/questions", validateBody(questionSchema), postMentorQuestion);
mentorContestRouter.patch("/questions/:questionId", validateBody(questionSchema.partial()), patchMentorQuestion);
mentorContestRouter.delete("/questions/:questionId", removeMentorQuestion);
mentorContestRouter.get("/participants", getMentorParticipantList);

export default mentorContestRouter;
