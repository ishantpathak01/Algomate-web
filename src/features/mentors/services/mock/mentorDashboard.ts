import type {
  CreateMentorContestInput,
  CreateMentorQuestionInput,
  MentorBooking,
  MentorContest,
  MentorDashboardData,
  MentorQuestion,
} from "../../types/dashboard";

const dateInDays = (days: number, hour: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

const initialDemoData: MentorDashboardData = {
  profile: {
    name: "Mentor Preview",
    profileImageUrl: "",
    headline: "Senior Software Engineer",
    about: "Helping students build strong foundations in algorithms and software engineering.",
    organization: "AlgoMate Mentor Network",
    experienceYears: 6,
    skills: ["Algorithms", "Backend", "Interview preparation"],
    languages: ["TypeScript", "Python", "Java"],
    githubUrl: "",
    linkedInUrl: "",
    portfolioUrl: "",
    coinsPerSession: 300,
    approvalStatus: "approved",
  },
  stats: {
    totalContests: 4,
    activeContests: 2,
    participants: 186,
    questions: 23,
    upcomingSessions: 3,
    coinsDistributed: 12400,
  },
  contests: [
    {
      id: "mentor-contest-1",
      title: "Graph Theory Challenge",
      description: "A focused contest on graph traversal and shortest paths.",
      status: "upcoming",
      startsAt: dateInDays(4, 17),
      endsAt: dateInDays(4, 19),
      durationMinutes: 120,
      registrationDeadline: dateInDays(3, 17),
      maxParticipants: 300,
      participants: 86,
      questionIds: ["mentor-question-1", "mentor-question-2"],
      prizeCoins: 2500,
      visibility: "public",
      rules: "Do not share solutions during the contest.",
    },
    {
      id: "mentor-contest-2",
      title: "Dynamic Programming Basics",
      description: "Practice classic dynamic programming patterns.",
      status: "ongoing",
      startsAt: dateInDays(0, 10),
      endsAt: dateInDays(0, 12),
      durationMinutes: 120,
      registrationDeadline: dateInDays(-1, 10),
      maxParticipants: 200,
      participants: 72,
      questionIds: ["mentor-question-3"],
      prizeCoins: 1800,
      visibility: "public",
      rules: "Use only supported programming languages.",
    },
    {
      id: "mentor-contest-3",
      title: "Array Sprint",
      description: "A quick set of array and hashing problems.",
      status: "completed",
      startsAt: dateInDays(-8, 15),
      endsAt: dateInDays(-8, 17),
      durationMinutes: 120,
      registrationDeadline: dateInDays(-9, 15),
      maxParticipants: 250,
      participants: 128,
      questionIds: ["mentor-question-1", "mentor-question-3"],
      prizeCoins: 3200,
      visibility: "public",
      rules: "",
    },
    {
      id: "mentor-contest-4",
      title: "String Practice Lab",
      description: "A draft contest for string-processing practice.",
      status: "draft",
      startsAt: dateInDays(14, 16),
      endsAt: dateInDays(14, 18),
      durationMinutes: 120,
      registrationDeadline: dateInDays(13, 16),
      maxParticipants: 150,
      participants: 0,
      questionIds: ["mentor-question-2"],
      prizeCoins: 1000,
      visibility: "private",
      rules: "",
    },
  ],
  questions: [
    {
      id: "mentor-question-1",
      title: "Shortest Path Finder",
      statement: "Given a weighted graph with non-negative edge weights, find the shortest path between the source and destination.",
      inputFormat: "The first line contains vertex and edge counts, followed by the edge list and source/destination.",
      outputFormat: "Print the minimum path distance, or -1 if no path exists.",
      constraints: ["1 ≤ vertices ≤ 10⁵", "Edge weights are non-negative"],
      examples: [{ input: "4 4\n1 2 3\n2 4 2\n1 3 8\n3 4 1\n1 4", output: "5" }],
      difficulty: "medium",
      topics: ["Graphs", "Dijkstra"],
      points: 400,
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      supportedLanguages: ["TypeScript", "Python", "Java"],
      hiddenTestCases: [{ input: "2 1\n1 2 7\n1 2", output: "7" }],
      createdAt: dateInDays(-25, 12),
      usageCount: 3,
      status: "active",
    },
    {
      id: "mentor-question-2",
      title: "Balanced Brackets",
      statement: "Determine whether a string containing brackets is properly balanced.",
      inputFormat: "A single string of bracket characters.",
      outputFormat: "Print YES when balanced, otherwise NO.",
      constraints: ["1 ≤ string length ≤ 10⁵"],
      examples: [{ input: "{[()]}", output: "YES" }],
      difficulty: "easy",
      topics: ["Stacks", "Strings"],
      points: 200,
      timeLimitMs: 1000,
      memoryLimitMb: 128,
      supportedLanguages: ["TypeScript", "Python", "Java", "C++"],
      hiddenTestCases: [{ input: "([)]", output: "NO" }],
      createdAt: dateInDays(-18, 12),
      usageCount: 5,
      status: "active",
    },
    {
      id: "mentor-question-3",
      title: "Maximum Subarray",
      statement: "Find the largest possible sum of a contiguous subarray.",
      inputFormat: "An integer n followed by n integers.",
      outputFormat: "Print the largest contiguous subarray sum.",
      constraints: ["1 ≤ n ≤ 10⁵", "-10⁴ ≤ values[i] ≤ 10⁴"],
      examples: [{ input: "5\n-2 1 -3 4 2", output: "6" }],
      difficulty: "medium",
      topics: ["Arrays", "Dynamic programming"],
      points: 300,
      timeLimitMs: 1000,
      memoryLimitMb: 128,
      supportedLanguages: ["TypeScript", "Python", "Java"],
      hiddenTestCases: [{ input: "3\n-5 -2 -8", output: "-2" }],
      createdAt: dateInDays(-11, 12),
      usageCount: 2,
      status: "active",
    },
  ],
  participants: [
    { id: "participant-1", name: "Aarav Mehta", username: "aaravm", college: "Northstar Institute", contestId: "mentor-contest-1", submissions: 8, score: 720, status: "in_progress" },
    { id: "participant-2", name: "Neha Kapoor", username: "nehak", college: "Western Tech University", contestId: "mentor-contest-2", submissions: 5, score: 540, status: "in_progress" },
    { id: "participant-3", name: "Kabir Shah", username: "kabirs", college: "City Engineering College", contestId: "mentor-contest-3", submissions: 11, score: 980, rank: 1, status: "completed" },
    { id: "participant-4", name: "Sara Iyer", username: "sarai", college: "Northstar Institute", contestId: "mentor-contest-3", submissions: 9, score: 860, rank: 2, status: "completed" },
  ],
  bookings: [
    { id: "booking-1", studentName: "Riya Patel", username: "riyap", college: "Northstar Institute", startsAt: dateInDays(1, 16), endsAt: dateInDays(1, 17), status: "requested", coinsReceived: 300, topic: "Graph algorithms" },
    { id: "booking-2", studentName: "Dev Sharma", username: "devs", college: "Western Tech University", startsAt: dateInDays(2, 18), endsAt: dateInDays(2, 19), status: "confirmed", coinsReceived: 300, topic: "Interview preparation" },
    { id: "booking-3", studentName: "Anya Rao", username: "anyar", college: "City Engineering College", startsAt: dateInDays(5, 15), endsAt: dateInDays(5, 16), status: "confirmed", coinsReceived: 300, topic: "Dynamic programming" },
  ],
  availability: [
    { id: "slot-1", weekday: "Monday", startTime: "16:00", endTime: "18:00", status: "available" },
    { id: "slot-2", weekday: "Wednesday", startTime: "17:00", endTime: "19:00", status: "available" },
    { id: "slot-3", weekday: "Friday", startTime: "15:00", endTime: "17:00", status: "available" },
  ],
  notifications: [
    { id: "notification-1", title: "New booking request", message: "Riya Patel requested a session about Graph algorithms.", createdAt: dateInDays(0, 9), read: false },
    { id: "notification-2", title: "Contest registration", message: "A new participant joined Graph Theory Challenge.", createdAt: dateInDays(-1, 13), read: false },
    { id: "notification-3", title: "Session reminder", message: "Your session with Dev is coming up soon.", createdAt: dateInDays(-2, 10), read: true },
  ],
  messages: [
    { id: "message-1", studentName: "Riya Patel", body: "Could we focus on Dijkstra's algorithm in our session?", createdAt: dateInDays(0, 9), fromMentor: false },
    { id: "message-2", studentName: "Riya Patel", body: "Absolutely. Please bring a graph problem you found challenging.", createdAt: dateInDays(0, 9), fromMentor: true },
  ],
};

let demoData = structuredClone(initialDemoData);

export function getMockMentorDashboard(): MentorDashboardData {
  return structuredClone(demoData);
}

export function createMockContest(input: CreateMentorContestInput): MentorContest {
  const contest: MentorContest = { ...input, id: `demo-contest-${Date.now()}`, participants: 0 };
  demoData.contests.unshift(contest);
  demoData.stats.totalContests += 1;
  if (contest.status === "ongoing") demoData.stats.activeContests += 1;
  return structuredClone(contest);
}

export function updateMockContest(id: string, input: Partial<CreateMentorContestInput>): MentorContest {
  const contest = demoData.contests.find((item) => item.id === id);
  if (!contest) throw new Error("Contest not found.");
  if (contest.status === "completed") throw new Error("Completed contests can only be modified by an admin.");
  Object.assign(contest, input);
  return structuredClone(contest);
}

export function createMockQuestion(input: CreateMentorQuestionInput): MentorQuestion {
  const question: MentorQuestion = {
    ...input,
    id: `demo-question-${Date.now()}`,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  };
  demoData.questions.unshift(question);
  demoData.stats.questions += 1;
  return structuredClone(question);
}

export function updateMockQuestion(id: string, input: Partial<CreateMentorQuestionInput>): MentorQuestion {
  const question = demoData.questions.find((item) => item.id === id);
  if (!question) throw new Error("Question not found.");
  Object.assign(question, input);
  return structuredClone(question);
}

export function deleteMockQuestion(id: string): void {
  const question = demoData.questions.find((item) => item.id === id);
  if (!question) throw new Error("Question not found.");
  if (demoData.contests.some((contest) => contest.status !== "completed" && contest.questionIds.includes(id))) {
    throw new Error("Remove this question from active contests before deleting it.");
  }
  demoData.questions = demoData.questions.filter((item) => item.id !== id);
  demoData.stats.questions = demoData.questions.length;
}

export function updateMockBooking(id: string, status: MentorBooking["status"]): MentorBooking {
  const booking = demoData.bookings.find((item) => item.id === id);
  if (!booking) throw new Error("Booking not found.");
  booking.status = status;
  return structuredClone(booking);
}

export function setMockAvailability(input: Omit<MentorDashboardData["availability"][number], "id">) {
  const start = input.startTime.split(":").map(Number);
  const end = input.endTime.split(":").map(Number);
  if (start[0] * 60 + start[1] >= end[0] * 60 + end[1]) throw new Error("End time must be after start time.");
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  const overlapping = demoData.availability.some((slot) => {
    if (slot.weekday !== input.weekday || slot.date !== input.date || slot.status === "blocked" || input.status === "blocked") return false;
    const slotStart = slot.startTime.split(":").map(Number);
    const slotEnd = slot.endTime.split(":").map(Number);
    return startMinutes < slotEnd[0] * 60 + slotEnd[1] && endMinutes > slotStart[0] * 60 + slotStart[1];
  });
  if (overlapping) throw new Error("This slot overlaps another available time.");
  const slot = { ...input, id: `demo-slot-${Date.now()}` };
  demoData.availability.push(slot);
  return structuredClone(slot);
}

export function updateMockAvailability(id: string, status: "available" | "blocked") {
  const slot = demoData.availability.find((item) => item.id === id);
  if (!slot) throw new Error("Availability slot not found.");
  if (status === "available") {
    const start = slot.startTime.split(":").map(Number);
    const end = slot.endTime.split(":").map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    const overlapping = demoData.availability.some((other) => {
      if (other.id === id || other.weekday !== slot.weekday || other.date !== slot.date || other.status === "blocked") return false;
      const otherStart = other.startTime.split(":").map(Number);
      const otherEnd = other.endTime.split(":").map(Number);
      return startMinutes < otherEnd[0] * 60 + otherEnd[1] && endMinutes > otherStart[0] * 60 + otherStart[1];
    });
    if (overlapping) throw new Error("This slot overlaps another available time.");
  }
  slot.status = status;
  return structuredClone(slot);
}

export function updateMockProfile(input: Partial<MentorDashboardData["profile"]>) {
  demoData.profile = { ...demoData.profile, ...input, approvalStatus: demoData.profile.approvalStatus };
  return structuredClone(demoData.profile);
}

export function resetMockMentorDashboard() {
  demoData = structuredClone(initialDemoData);
}
