import type { RequestHandler } from "express";
import { getHealthStatus } from "../services/health.service.js";
import { sendFailure, sendSuccess } from "../utils/apiResponse.js";

export const getHealth: RequestHandler = (_request, response) => {
  const health = getHealthStatus();
  if (health.database !== "connected") {
    sendFailure(
      response,
      "DATABASE_UNAVAILABLE",
      "The API is running but the database connection is not ready.",
      503,
      health,
    );
    return;
  }
  sendSuccess(response, health);
};
