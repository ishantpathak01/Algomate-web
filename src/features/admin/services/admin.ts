import { platformApi } from "@/lib/api/endpoints";

export const getAdminDashboard = platformApi.admin.dashboard;
export const listUsers = platformApi.admin.users;
export const suspendUser = platformApi.admin.suspendUser;
export const listMentorsForReview = platformApi.admin.mentors;
export const reviewMentor = platformApi.admin.reviewMentor;
export const suspendMentor = platformApi.admin.suspendMentor;
export const listAdminContests = platformApi.admin.contests;
export const reviewContest = platformApi.admin.reviewContest;
export const searchQuestions = platformApi.admin.questions;
export const updateCompletedContestQuestion = platformApi.admin.updateQuestion;
export const getPlatformAnalytics = platformApi.admin.analytics;
export const getAuditLog = platformApi.admin.auditLog;
