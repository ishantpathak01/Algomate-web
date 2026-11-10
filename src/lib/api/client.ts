export class PlatformApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "PlatformApiError";
  }
}

type AccessTokenGetter = () => Promise<string | null>;

let accessTokenGetter: AccessTokenGetter | null = null;

export function setAccessTokenGetter(getter: AccessTokenGetter | null): void {
  accessTokenGetter = getter;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await accessTokenGetter?.();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (init?.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${apiUrl.replace(/\/$/, "")}/api${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw new PlatformApiError(getApiErrorMessage(body, response.status), response.status);
  }

  if (response.status === 204) return undefined as T;
  const body: unknown = await response.json();
  if (isSuccessEnvelope(body)) return body.data as T;
  return body as T;
}

function getApiErrorMessage(body: unknown, status: number): string {
  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "object" &&
    body.error !== null &&
    "message" in body.error &&
    typeof body.error.message === "string"
  ) {
    return body.error.message;
  }
  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "string"
  ) {
    return body.error;
  }
  return `Platform API request failed (${status}).`;
}

function isSuccessEnvelope(value: unknown): value is { success: true; data: unknown } {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    value.success === true &&
    "data" in value
  );
}

export function jsonBody(value: unknown): string {
  return JSON.stringify(value);
}
