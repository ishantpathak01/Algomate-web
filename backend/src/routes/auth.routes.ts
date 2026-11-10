import { Router } from "express";
import { getCurrentUser } from "../controllers/auth.controller.js";
import { requireAuthentication } from "../middleware/auth.js";

const authRouter = Router();
authRouter.get("/me", requireAuthentication, getCurrentUser);

export default authRouter;
