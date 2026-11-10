import "dotenv/config";
import { createApp } from "./app.js";
import { connectFromEnvironment, disconnectFromDatabase } from "./config/database.js";
import { loadEnvironment } from "./config/env.js";

export async function startServer(): Promise<void> {
  const environment = loadEnvironment();
  await connectFromEnvironment(environment);

  const app = createApp({
    frontendUrl: environment.FRONTEND_URL,
    clerkPublishableKey: environment.CLERK_PUBLISHABLE_KEY,
    clerkSecretKey: environment.CLERK_SECRET_KEY,
  });
  const server = app.listen(environment.PORT, () => {
    console.info(`AlgoMate API listening on port ${environment.PORT}.`);
  });

  const shutdown = (signal: string) => {
    console.info(`${signal} received; closing API server.`);
    server.close((error) => {
      if (error) {
        console.error("Failed to close API server cleanly.");
        process.exitCode = 1;
      }
      void disconnectFromDatabase().catch(() => {
        console.error("Failed to close MongoDB connection cleanly.");
        process.exitCode = 1;
      });
    });
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

if (require.main === module) {
  void startServer().catch((error: unknown) => {
    const errorName = error instanceof Error ? error.name : "UnknownError";
    const configurationError =
      error instanceof Error && error.message.startsWith("Invalid backend environment:")
        ? ` ${error.message}`
        : "";
    console.error(
      `AlgoMate API startup failed (${errorName}).${configurationError} Server was not started.`,
    );
    process.exitCode = 1;
  });
}
