import { platformApi } from "@/lib/api/endpoints";

export const getStudentProfile = () => platformApi.profile.get();
export const updateStudentProfile = platformApi.profile.update;
