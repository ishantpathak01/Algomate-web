import AppError from "../utils/AppError.js";

type JudgeCase = {
  input: string;
  expectedOutput: string;
};

type JudgeVerdict = "accepted" | "wrong_answer" | "runtime_error" | "compilation_error" | "time_limit_exceeded";

export type JudgeResult = {
  status: JudgeVerdict;
  passedTestCases: number;
  totalTestCases: number;
  executionTime?: number;
  memoryUsed?: number;
};

type JudgeConfig = {
  url?: string;
  token?: string;
  languageIds: Partial<Record<"javascript" | "typescript" | "python" | "java" | "cpp", number>>;
};

function getJudgeConfig(): JudgeConfig {
  let languageIds: JudgeConfig["languageIds"] = {};
  const rawIds = process.env.JUDGE_LANGUAGE_IDS;
  if (rawIds) {
    try {
      const parsed: unknown = JSON.parse(rawIds);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error("JUDGE_LANGUAGE_IDS must be a JSON object.");
      }
      for (const [language, id] of Object.entries(parsed)) {
        if (!["javascript", "typescript", "python", "java", "cpp"].includes(language) || !Number.isInteger(id) || Number(id) <= 0) {
          throw new Error("JUDGE_LANGUAGE_IDS contains an invalid language or numeric ID.");
        }
        languageIds = { ...languageIds, [language]: Number(id) };
      }
    } catch (error) {
      throw new AppError(503, "JUDGE_CONFIGURATION_INVALID", error instanceof Error ? error.message : "Judge language configuration is invalid.");
    }
  }
  const url = process.env.JUDGE_API_URL?.trim();
  if (url) {
    try {
      const parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new Error();
    } catch {
      throw new AppError(503, "JUDGE_CONFIGURATION_INVALID", "JUDGE_API_URL must be a valid HTTP(S) URL.");
    }
  }
  return {
    url,
    token: process.env.JUDGE_API_TOKEN?.trim(),
    languageIds,
  };
}

function decodeBase64(value: string | null | undefined): string | undefined {
  return value ? Buffer.from(value, "base64").toString("utf8") : undefined;
}

function mapVerdict(description: string): JudgeVerdict | null {
  const normalized = description.toLowerCase();
  if (normalized === "accepted") return "accepted";
  if (normalized.includes("in queue") || normalized.includes("processing")) return null;
  if (normalized.includes("time limit")) return "time_limit_exceeded";
  if (normalized.includes("compilation")) return "compilation_error";
  if (normalized.includes("wrong answer")) return "wrong_answer";
  return "runtime_error";
}

export async function evaluateWithConfiguredJudge(input: {
  sourceCode: string;
  language: "javascript" | "typescript" | "python" | "java" | "cpp";
  cases: JudgeCase[];
  timeLimitMs: number;
  memoryLimitMb: number;
}): Promise<JudgeResult> {
  const config = getJudgeConfig();
  if (!config.url) {
    throw new AppError(503, "JUDGE_NOT_CONFIGURED", "Code judging is unavailable until a trusted external judge service is configured.");
  }
  const languageId = config.languageIds[input.language];
  if (!languageId) {
    throw new AppError(503, "JUDGE_LANGUAGE_UNAVAILABLE", `The configured judge does not support ${input.language}.`);
  }

  let passedTestCases = 0;
  let executionTime = 0;
  let memoryUsed = 0;
  for (const testCase of input.cases) {
    let response: Response;
    try {
      response = await fetch(`${config.url.replace(/\/+$/, "")}/submissions?base64_encoded=true&wait=true`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(config.token ? { "X-Auth-Token": config.token } : {}),
        },
        signal: AbortSignal.timeout(45_000),
        body: JSON.stringify({
          source_code: Buffer.from(input.sourceCode).toString("base64"),
          language_id: languageId,
          stdin: Buffer.from(testCase.input).toString("base64"),
          expected_output: Buffer.from(testCase.expectedOutput).toString("base64"),
          cpu_time_limit: input.timeLimitMs / 1000,
          wall_time_limit: Math.max(input.timeLimitMs / 1000 * 2, 1),
          memory_limit: input.memoryLimitMb * 1024,
        }),
      });
    } catch {
      throw new AppError(502, "JUDGE_UNAVAILABLE", "The external judge could not be reached.");
    }
    if (!response.ok) {
      throw new AppError(502, "JUDGE_REQUEST_FAILED", `The external judge returned HTTP ${response.status}.`);
    }

    const body: unknown = await response.json();
    if (!isJudgeResponse(body)) {
      throw new AppError(502, "JUDGE_RESPONSE_INVALID", "The external judge returned an invalid response.");
    }
    const verdict = mapVerdict(body.status.description);
    if (!verdict) {
      throw new AppError(503, "JUDGE_PENDING", "The external judge has not completed this test case.");
    }
    if (verdict !== "accepted") {
      return {
        status: verdict,
        passedTestCases,
        totalTestCases: input.cases.length,
        executionTime: executionTime || undefined,
        memoryUsed: memoryUsed || undefined,
      };
    }
    passedTestCases += 1;
    executionTime = Math.max(executionTime, Math.round(Number(body.time ?? 0) * 1000));
    memoryUsed = Math.max(memoryUsed, Number(body.memory ?? 0));
  }
  return {
    status: "accepted",
    passedTestCases,
    totalTestCases: input.cases.length,
    executionTime: executionTime || undefined,
    memoryUsed: memoryUsed || undefined,
  };
}

function isJudgeResponse(value: unknown): value is {
  status: { description: string };
  time?: string | number | null;
  memory?: number | null;
  stdout?: string | null;
  expected_output?: string | null;
} {
  return typeof value === "object" && value !== null &&
    "status" in value && typeof value.status === "object" && value.status !== null &&
    "description" in value.status && typeof value.status.description === "string";
}

export function decodeJudgeOutput(value: string | null | undefined): string | undefined {
  return decodeBase64(value);
}
