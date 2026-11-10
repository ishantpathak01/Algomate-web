# API Documentation

## Conventions and authentication

Frontend requests use [`apiRequest`](../src/lib/api/client.ts), which prefixes `/api`, sends JSON, and attaches the Clerk access token from the frontend token bridge. Success responses use `{ "success": true, "data": ... }`; errors use `{ "success": false, "error": { "code": "...", "message": "...", "details": ... } }`.

All authenticated routes below require a verified Clerk session and an active Mongo `User` with the listed role. Mentor contest/question routes additionally require `mentorApplication.status === "approved"`. User, mentor, and admin IDs are derived from the verified session and MongoDB, not accepted from request bodies.

## Shared, auth, and mentor application routes

| Method | Path | Access | Summary |
|---|---|---|---|
| `GET` | `/api/health` | Public | Health status; database absence returns `503 DATABASE_UNAVAILABLE`. |
| `GET` | `/api/auth/me` | Clerk session | Synchronizes Clerk identity fields to MongoDB and returns the account/role state. New accounts default to student. |
| `POST` | `/api/mentor-applications` | Clerk session | Submit mentor description, skills, and optional contact email. |
| `GET` | `/api/admin/mentors` | Active admin | List mentor applications. |
| `POST` | `/api/admin/mentors/:mentorId/review` | Active admin | Approve or reject an application; approval is server-controlled. |

## Student contest routes

| Method | Path | Access | Request | Result |
|---|---|---|---|---|
| `GET` | `/api/contests?status=&search=` | Public | Optional status (`upcoming`, `ongoing`, `completed`) and search string | Public contest list; default listing excludes ended contests. |
| `GET` | `/api/contests/:contestId` | Public | — | Public contest details and question IDs, never question/test-case contents. |
| `POST` | `/api/contests/:contestId/registrations` | Active student | Empty body | Register once if public, upcoming, before deadline, and under capacity. Returns participation. |
| `GET` | `/api/contests/:contestId/participation` | Active student | — | Return the caller's registration/session state; expired sessions are transitioned to completed. |
| `POST` | `/api/contests/:contestId/participation/start` | Active student | Empty body | Start or resume registered participation; server assigns start and expiry timestamps. |
| `GET` | `/api/contests/:contestId/questions` | Active student | — | Contest questions only for an active/finished participant; hidden tests are excluded. |
| `POST` | `/api/questions/:questionId/submissions` | Active student | `{ "contestId": "...", "sourceCode": "...", "language": "javascript" }` | Evaluate source using the configured external judge; response omits source code and hidden test inputs. |
| `GET` | `/api/contests/:contestId/submissions` | Active student participant | — | Own submission history without source code. |
| `POST` | `/api/contests/:contestId/monitoring-events` | Active student | `{ "kind": "fullscreen_exit" \| "visibility_hidden" \| "window_blur" }` | Increment client-reported monitoring counters for the active session. |
| `POST` | `/api/contests/:contestId/participation/finalize` | Active student | Empty body | Finalize the active session once; repeated calls return the existing submitted state. |
| `GET` | `/api/contests/:contestId/leaderboard` | Active student | — | After end time, finalize results/rewards if needed, then return rankings. Leaderboards remain unavailable during contests. |
| `GET` | `/api/student/contest-history` | Active student | — | Participation history with score/rank when finalized. |

Contest submission response includes ID, language, verdict, score, attempt number, passed/total test counts, metrics if available, and timestamp. Source code is not returned. If judging is not configured/reachable, the API reports an explicit 503/502 error; `judge_error` records are excluded from scoring.

## Mentor contest and question routes

| Method | Path | Access | Request / behavior |
|---|---|---|---|
| `GET` | `/api/mentor/dashboard` | Approved mentor | Dashboard data, statistics, contests, questions, and participant rows. |
| `GET` | `/api/mentor/contests` | Approved mentor | List owned contests. |
| `POST` | `/api/mentor/contests` | Approved mentor | Create draft. Request uses `title`, `description`, `startTime`, `endTime`, `registrationDeadline`, `duration`, `maxParticipants`, optional rules/visibility/banner, `questions: [{ questionId, points, order }]`, and prizes. |
| `PATCH` | `/api/mentor/contests/:contestId` | Approved owner | Update an unstarted, non-cancelled contest. Same API field names as create; partial updates accepted. |
| `POST` | `/api/mentor/contests/:contestId/submit-review` | Approved owner | Submit a draft/rejected contest for admin review. |
| `GET` | `/api/mentor/questions` | Approved mentor | List owned questions, including private test cases for the owner. |
| `POST` | `/api/mentor/questions` | Approved mentor | Create a question; includes statement/formats/difficulty/tags/points/constraints, `sampleCases`, private `testCases`, supported languages, and time/memory limits. |
| `PATCH` | `/api/mentor/questions/:questionId` | Approved owner | Update own question unless used by an ended/completed contest. |
| `DELETE` | `/api/mentor/questions/:questionId` | Approved owner | Delete only if no contest references it. |
| `GET` | `/api/mentor/participants` | Approved mentor | Owned contest participants and submissions; rank is included only after completion, and live scores are not exposed. |

The frontend translates its `startsAt`/`endsAt`/`durationMinutes`/`questionIds`/`prizeCoins` and question form field names to these API DTOs. The current mentor form maps its prize pool to one first-place prize; use the API to configure multiple prize places.

## Admin contest routes

| Method | Path | Access | Request / behavior |
|---|---|---|---|
| `GET` | `/api/admin/contests` | Active admin | List all contests, including review status/reason and creator. |
| `POST` | `/api/admin/contests/:contestId/review` | Active admin | `{ "decision": "approve" \| "reject" \| "cancel", "reason"?: "..." }`. Rejection requires a reason; approval is disallowed after registration closes or the contest starts. Action is recorded in `AuditLog`. |
| `PATCH` | `/api/admin/contests/questions/:questionId` | Active admin | Update question fields, including questions locked to mentors after contest completion; action is audited. |

Admin identities must be provisioned with the `admin` role out-of-band. No self-service admin role grant exists.

## External judge configuration

Set the optional backend variables `JUDGE_API_URL`, `JUDGE_API_TOKEN`, and `JUDGE_LANGUAGE_IDS` (JSON language-to-ID mapping) after provisioning a trusted Judge0-compatible service. The backend does not execute untrusted code itself. Missing configuration returns `503 JUDGE_NOT_CONFIGURED` or `503 JUDGE_LANGUAGE_UNAVAILABLE`; transport/response problems return sanitized judge errors. Do not send judge credentials to the browser or commit them.

## Not yet implemented backend APIs

The following frontend modules remain placeholders/mock-backed or have no mounted routes:

- Student profile/onboarding and dashboard analytics.
- Mentor booking, availability, profile updates, notifications, and real-time chat.
- Wallet history, merchandise catalog/redemption, and related coin spending.
- General admin users/analytics/audit-log browsing and question search/filter.
- Contest notification delivery and background result finalization.

Frontend declarations for these APIs are not evidence of backend availability. See [PROJECT_GAP_ANALYSIS.md](./PROJECT_GAP_ANALYSIS.md).
