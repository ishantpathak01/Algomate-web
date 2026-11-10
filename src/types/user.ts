export type AccountRole = "student" | "mentor" | "admin";

export type SocialLinks = {
  leetcode?: string;
  github?: string;
  portfolio?: string;
};

export type StudentProfile = {
  id: string;
  username: string;
  name: string;
  email: string;
  pictureUrl?: string;
  college: string;
  mobile?: string;
  skills: string[];
  socialLinks: SocialLinks;
  about: string;
  coinBalance: number;
};

export type PublicUserProfile = Omit<StudentProfile, "email" | "mobile">;
export type UserStatus = "active" | "suspended";

export type UserAnalytics = {
  contestsEntered: number;
  problemsSolved: number;
  averageScore: number;
  currentRank?: number;
};
