# Development Roadmap

This roadmap distinguishes completed contest work from follow-up required for a production platform. Details of current contracts and limitations are in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) and [CONTEST_SYSTEM.md](./CONTEST_SYSTEM.md).

## Phase 1 — Contest lifecycle baseline (implemented)

- Persist contests, question bank, participant sessions, submissions, results, audit events, and coin transactions.
- Add role/ownership-checked mentor authoring and admin review.
- Add public discovery, student registration, fullscreen/timer participation, safe student question projections, and submission history.
- Add remote Judge0-compatible adapter, scoring, leaderboard, and transaction-based rank rewards.
- Connect mentor, student, and admin contest surfaces.
- Validate backend build/tests and frontend lint/type/build.

## Phase 2 — Production-safe contest operations (next)

1. Provision a trusted isolated judge service, map supported language IDs, configure and rotate credentials, and exercise queue/load/failure behavior.
2. Deploy MongoDB as a replica set; verify transaction rollback and idempotent finalization under concurrent/retried leaderboard reads.
3. Add database integration tests for registration capacity/duplicates, auth/role/ownership, start/expiry, late submission, question privacy, mentor edit locks, and reward idempotency.
4. Move result finalization to a scheduled/background worker with a durable lock/outbox; keep the API able to return already-persisted results.
5. Add asynchronous judge jobs, per-test sanitized results, rate limits, source retention policy, and operational metrics.
6. Add immutable/versioned contest question snapshots so edits to a reusable question cannot change an active contest.
7. Decide and document time-based scoring/monitoring penalties before implementing them; current elapsed-time policy is only a tie-breaker, and client events carry no penalty.

## Phase 3 — Student account experience

- Implement profile/onboarding persistence, username/college data, public profiles, and student dashboard aggregates.
- Add contest notifications and results notifications.
- Connect coin wallet transaction history and a supported redemption catalog with atomic stock/balance operations.
- Add student contest history UI and result detail pages.

## Phase 4 — Mentor service experience

- Implement mentor profile persistence and profile search/detail.
- Add availability with timezone-aware slot conflict prevention and booking lifecycle.
- Add booking confirmation notifications and coin settlement.
- Implement authenticated message/conversation APIs and then Socket.IO only if real-time delivery is required.

## Phase 5 — Admin platform tools

- Build user/mentor management and suspension.
- Add contest/question search/filter and completed-question editing UI.
- Build analytics and audit-log browsing.
- Add safe admin action audit metadata, retention, and export policies.

## Release gates

- No client-supplied role or account ID is trusted.
- Hidden tests/source code do not appear in student responses.
- No local execution of untrusted submissions.
- Mongo transaction/reward guarantees pass on the target topology.
- Public errors are actionable without exposing secrets or judge internals.
- Reviewer/manual test verifies a full mentor-create → admin-approve → student-register → judge → result/reward flow.
