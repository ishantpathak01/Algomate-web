import { platformApi } from "@/lib/api/endpoints";

export const listQuestionsForContest = platformApi.contests.questions;
export const getQuestion = platformApi.questions.get;
export const createQuestion = platformApi.questions.create;
export const updateQuestion = platformApi.questions.update;
export const deleteQuestion = platformApi.questions.remove;
