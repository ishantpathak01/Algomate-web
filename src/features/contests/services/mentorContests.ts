import { platformApi } from "@/lib/api/endpoints";

export const listMyContests = platformApi.mentorWorkspace.contests;
export const createContest = platformApi.mentorWorkspace.createContest;
export const updateContest = platformApi.mentorWorkspace.updateContest;
export const publishContest = platformApi.mentorWorkspace.publishContest;
export const listContestParticipants = platformApi.mentorWorkspace.participants;
