export type Mentor = {
  name: string;
  role: string;
  skills: string[];
  rating: string;
  sessions: number;
};

export const mentors: Mentor[] = [
  { name: "Aarav Mehta", role: "SDE-2, ex-Amazon", skills: ["DSA", "Graphs", "Mock interviews"], rating: "4.9", sessions: 120 },
  { name: "Neha Kapoor", role: "Software Engineer, Google", skills: ["Dynamic programming", "System design"], rating: "4.8", sessions: 96 },
  { name: "Rohan Iyer", role: "Backend Lead, Flipkart", skills: ["Backend", "Resume review", "Roadmaps"], rating: "4.9", sessions: 84 },
];
