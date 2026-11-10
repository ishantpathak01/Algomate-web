import type { RequestHandler } from "express";
import { sendFailure } from "../utils/apiResponse.js";

const notFound: RequestHandler = (request, response) => {
  sendFailure(response, "NOT_FOUND", `Route ${request.method} ${request.path} was not found.`, 404);
};

export default notFound;
