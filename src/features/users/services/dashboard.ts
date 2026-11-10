import { apiRequest } from "@/lib/api/client";
import type { DashboardResult, StudentDashboardData } from "../types/dashboard";
import { sampleStudentDashboard } from "@/services/mock/studentDashboard";
import { PlatformApiError } from "@/lib/api/client";

export async function getStudentDashboard(): Promise<DashboardResult> {
  try {
    const data = await apiRequest<StudentDashboardData>("/student/dashboard");
    return { data, source: "api" };
  } catch (error) {
    if (
      error instanceof PlatformApiError &&
      error.status !== 404 &&
      error.status < 500
    ) {
      throw error;
    }

    const warning =
      error instanceof PlatformApiError
        ? `Dashboard API returned ${error.status}; showing sample data.`
        : "Dashboard API is unavailable; showing sample data.";
    return { data: sampleStudentDashboard, source: "sample", warning };
  }
}
