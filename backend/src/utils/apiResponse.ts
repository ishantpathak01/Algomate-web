import type { Response } from "express";
import type { ApiFailure, ApiSuccess } from "../types/api.js";

export function sendSuccess<T>(response: Response, data: T, status = 200): Response<ApiSuccess<T>> {
  return response.status(status).json({ success: true, data });
}

export function sendFailure(
  response: Response,
  code: string,
  message: string,
  status: number,
  details?: unknown,
): Response<ApiFailure> {
  return response.status(status).json({
    success: false,
    error: { code, message, ...(details === undefined ? {} : { details }) },
  });
}
