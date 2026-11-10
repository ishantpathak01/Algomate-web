import { isDatabaseConnected } from "../config/database.js";

export function getHealthStatus() {
  const database = isDatabaseConnected() ? "connected" : "disconnected";
  return {
    status: database === "connected" ? "ok" : "unavailable",
    database,
    timestamp: new Date().toISOString(),
  } as const;
}
