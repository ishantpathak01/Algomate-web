const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createContestSchema, questionSchema, updateContestSchema } = require("../dist/validators/contest.validators.js");
const { evaluateWithConfiguredJudge } = require("../dist/services/judge.service.js");

function validContest() {
  const startsAt = new Date(Date.now() + 60 * 60 * 1000);
  return {
    title: "Algorithms Open",
    description: "A programming contest for students.",
    startTime: startsAt,
    endTime: new Date(startsAt.getTime() + 2 * 60 * 60 * 1000),
    registrationDeadline: new Date(Date.now() + 30 * 60 * 1000),
    duration: 90,
    maxParticipants: 200,
    questions: [{ questionId: "0123456789abcdef01234567", points: 100, order: 0 }],
    prizes: [],
  };
}

test("contest validation rejects duplicate question mappings", () => {
  const contest = validContest();
  contest.questions.push({ ...contest.questions[0], order: 1 });
  assert.equal(createContestSchema.safeParse(contest).success, false);
});

test("contest updates accept partial fields and reject invalid date ordering", () => {
  assert.equal(updateContestSchema.safeParse({ title: "Updated contest" }).success, true);
  const startsAt = new Date(Date.now() + 60 * 60 * 1000);
  const parsed = updateContestSchema.safeParse({
    startTime: startsAt,
    endTime: new Date(startsAt.getTime() - 1000),
  });
  assert.equal(parsed.success, false);
});

test("question validation defaults omitted test-case visibility to hidden", () => {
  const parsed = questionSchema.safeParse({
    title: "Add two values",
    description: "Read two integers and output their sum.",
    difficulty: "easy",
    testCases: [{ input: "2 3", expectedOutput: "5" }],
    supportedLanguages: ["javascript"],
  });
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.testCases[0].isHidden, true);
});

test("submission judging fails explicitly when the trusted judge is not configured", async () => {
  const names = ["JUDGE_API_URL", "JUDGE_API_TOKEN", "JUDGE_LANGUAGE_IDS"];
  const previous = new Map(names.map((name) => [name, process.env[name]]));
  try {
    for (const name of names) delete process.env[name];
    await assert.rejects(
      evaluateWithConfiguredJudge({
        sourceCode: "print(1)",
        language: "python",
        cases: [{ input: "", expectedOutput: "1" }],
        timeLimitMs: 1000,
        memoryLimitMb: 128,
      }),
      (error) => error.code === "JUDGE_NOT_CONFIGURED" && error.statusCode === 503,
    );
  } finally {
    for (const [name, value] of previous) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
