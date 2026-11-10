import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import AppError from "../utils/AppError.js";
import { sendFailure } from "../utils/apiResponse.js";

const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof AppError) {
    sendFailure(response, error.code, error.message, error.statusCode, error.details);
    return;
  }

  if (error instanceof ZodError) {
    sendFailure(response, "VALIDATION_ERROR", "Request validation failed.", 400, error.flatten());
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    sendFailure(response, "VALIDATION_ERROR", "Database document validation failed.", 400);
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    sendFailure(response, "INVALID_ID", "A supplied identifier is invalid.", 400);
    return;
  }

  if (isDuplicateKeyError(error)) {
    sendFailure(response, "DUPLICATE_RESOURCE", "A record with that unique value already exists.", 409);
    return;
  }

  if (isPayloadTooLargeError(error)) {
    sendFailure(response, "PAYLOAD_TOO_LARGE", "Request body exceeds the allowed size.", 413);
    return;
  }

  console.error("Unhandled API error:", error);
  const isProduction = process.env.NODE_ENV === "production";
  sendFailure(
    response,
    "INTERNAL_SERVER_ERROR",
    isProduction ? "An unexpected error occurred." : getErrorMessage(error),
    500,
  );
};

function isDuplicateKeyError(error: unknown): error is { code: number } {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

function isPayloadTooLargeError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "type" in error && error.type === "entity.too.large";
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "An unexpected error occurred.";
}

export default errorHandler;
