import { platformApi } from "@/lib/api/endpoints";

export const listMentors = platformApi.mentors.list;
export const getMentor = platformApi.mentors.get;
export const applyToBecomeMentor = platformApi.mentors.apply;
export const getMentorAvailability = platformApi.mentors.availability;
export const bookMentorSlot = platformApi.mentors.book;
