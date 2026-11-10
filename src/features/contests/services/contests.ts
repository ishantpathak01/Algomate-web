import { platformApi } from "@/lib/api/endpoints";

export const listContests = platformApi.contests.list;
export const getContest = platformApi.contests.get;
export const getContestQuestions = platformApi.contests.questions;
export const getContestLeaderboard = platformApi.contests.leaderboard;
