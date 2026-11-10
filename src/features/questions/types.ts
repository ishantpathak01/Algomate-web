import type { ContestQuestion } from "@/types/contest";

export type { ContestQuestion };

export type QuestionDraft = Omit<ContestQuestion, "id">;
