# AlgoMate Project Overview

## Summary

AlgoMate is a Next.js web application for coding contests, student progress, mentor discovery, and rewards, backed by an Express API and MongoDB. Clerk provides sign-in and verified request identity. The repository has student/mentor dashboard UI, a persisted mentor application and admin approval flow, and now an API-backed contest lifecycle spanning authoring, review, registration, participation, remote judging, scoring, results, and coin awards.

The contest implementation depends on an external Judge0-compatible service and replica-set MongoDB transactions. Features outside the contest and mentor-application paths remain incomplete; see [PROJECT_GAP_ANALYSIS.md](./PROJECT_GAP_ANALYSIS.md).

## Roles

### Student

- Clerk account synchronization and student contest access.
- Public contest discovery/details, registration, fullscreen participation workspace, timed submissions, and finalized leaderboard/history endpoints.
- Student dashboard, profile/onboarding, mentor booking, wallet redemption, chat, and notifications are still placeholders, mock-backed, or unconnected.

### Mentor

- Mentor application is persisted; pending applicants remain locked, and only admin approval changes the Mongo role.
- Approved mentors can create/manage contests and questions, submit contests for review, and view contest participants.
- Mentor booking/availability/profile APIs, notifications, and real-time messaging are not connected to backend services.

### Admin

- Admin role is assigned out of band and checked on backend endpoints.
- Contest list/review and admin question updates are implemented with audit records.
- Broad user management, platform analytics, audit-log browsing, and question search/filter remain unimplemented.

## Architecture

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4 |
| Authentication | Clerk Next.js SDK and Clerk Express middleware |
| Backend | Node.js, Express 5, TypeScript |
| Persistence | MongoDB through Mongoose 8 |
| Validation | Zod 4 |
| Code judging | Optional external Judge0-compatible API; no untrusted code runs inside Express |
| Tests | Backend Node test runner; frontend ESLint and TypeScript checks/build |

Request flow: Clerk issues a session token; the frontend API wrapper attaches it; Express verifies it; route middleware resolves the active Mongo user/role; service code performs validation/ownership/state checks; the API responds with a standard success/error envelope.

## Important implementation surfaces

- [`src/app`](../src/app): App Router routes for public/student/mentor/admin areas.
- [`src/components/contests`](../src/components/contests): API-backed contest browser.
- [`src/app/participate`](../src/app/participate): authenticated timed participation route.
- [`src/components/mentor/MentorWorkspace.tsx`](../src/components/mentor/MentorWorkspace.tsx): mentor contest/question workspace.
- [`src/components/admin/ContestReview.tsx`](../src/components/admin/ContestReview.tsx): admin contest review UI.
- [`src/lib/api`](../src/lib/api): request client and API contracts.
- [`backend/src/app.ts`](../backend/src/app.ts): mounted Express routers.
- [`backend/src/services/contest.service.ts`](../backend/src/services/contest.service.ts): contest lifecycle, scoring, ownership, and finalization.
- [`backend/src/services/judge.service.ts`](../backend/src/services/judge.service.ts): external judge boundary.
- [`backend/src/models`](../backend/src/models): users, contests, questions, participation, submissions, results, coin transactions, and audit logs.

## Feature status

| Feature | Status |
|---|---|
| Clerk login and user synchronization | Implemented; backend sync creates default student accounts. |
| Mentor application and approval gate | Implemented with backend role/status checks. |
| Public contest browsing/details | Connected to contest API. |
| Mentor contest/question authoring | Connected to backend; owned questions validated and submissions require review. |
| Admin contest approval/rejection/cancellation | Implemented with audit records and UI. |
| Student contest registration/session | Implemented with unique registration, capacity check, server timer, and final-submit transition. |
| Code submission/scoring | Implemented against optional remote judge; not operational until configured. |
| Leaderboard/coin rewards | Persisted on first post-contest leaderboard request; Mongo transaction required. |
| Hidden test confidentiality | Student API projection excludes hidden test cases and submissions never return source. |
| Student profile/onboarding/dashboard analytics | Incomplete or mock-backed. |
| Mentor discovery, bookings, availability, chat, notifications | Incomplete or mock-backed. |
| Merchandise redemption and wallet spending | Incomplete. |
| Full admin platform management | Incomplete; contest review/question override only. |

## Verification expectations

Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` at the frontend root; run `npm test` from `backend/`. Production readiness additionally requires a configured trusted judge, replica-set MongoDB, and integration tests for concurrent registration/submission/finalization, role checks, and transaction rollback.
