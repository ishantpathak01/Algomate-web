# Project Gap Analysis

## Executive status

The contest lifecycle now has a real backend and connected frontends, but judging and safe result finalization require operator infrastructure. Other product areas from the initial feature list remain absent or mock-backed. A UI or API type alone is not evidence that a backend workflow is available.

## Priority gaps

| Priority | Area | Implemented | Remaining work / risk |
|---|---|---|---|
| P0 | Judge execution | Judge0-compatible remote adapter, sanitized verdict response, explicit unconfigured errors | Configure isolated judge, credentials/language IDs, quotas, monitoring, and load tests. Code is not executed locally. |
| P0 | Result transactions | Idempotent result/reward writes and coin balance transaction | Requires Mongo replica set; no background finalizer; integration-test transaction failures and concurrency. |
| P0 | Contest security | Verified Clerk identity, server-derived user/role, ownership checks, hidden-test projection, no leaderboard in participation UI | Browser monitoring is client-reported; no automatic penalty. Add rate limiting, snapshot/version guarantees, and security testing. |
| P1 | Contest regression tests | Validator/judge configuration and existing API tests | No Mongo-backed tests for duplicate registration, capacity races, late submissions, owner locks, or reward retries. |
| P1 | Admin contest workflow | Review queue, approve/reject/cancel API, audit events, UI | Add detailed question review/search, admin edit UI, audit log browsing, and state-transition integration tests. |
| P1 | Student dashboards/profile | Existing visual shell and Clerk identity | Backend profile/onboarding and dashboard aggregate routes remain unimplemented; some screens use mocks/placeholders. |
| P1 | Wallet/merchandise | Contest reward credits and `CoinTransaction` records | Wallet read APIs, merchandise/catalog, redemption, and atomic debits are absent. |
| P1 | Mentoring | Mentor application approval and dashboard contest/question/participant APIs | Mentor discovery, profile updates, availability, booking, booking payments, and notifications are absent or mock-backed. |
| P2 | Chat and notifications | Demo surfaces/API declarations | No backend message, notification, delivery, or real-time Socket.IO implementation. |
| P2 | General admin | Contest review and question override | User management, suspensions, analytics, broader question search, and audit-log browsing are absent. |

## Contest-specific caveats

- The UI’s prize pool maps to first place; multi-place awards require API-level prize data.
- Score is points for an accepted problem minus the configured wrong-attempt penalty before the first acceptance, floored at zero. Time is a ranking tiebreaker, not a score deduction.
- Fullscreen/tab/window telemetry is untrusted client input and has no automatic penalty/disqualification policy.
- Results are finalized on an authorized leaderboard request. No read is available during an active contest; rewards may be delayed if nobody requests the leaderboard.
- Synchronous judge calls process test cases one by one and are unsuitable for high volume.
- A contest result records a scoring version, but there is no immutable problem snapshot or migration tool.
- Mentor edit protections are enforced in backend services; admin question override is available. Additional lifecycle tests are needed.

## Recommended acceptance sequence

1. Configure isolated judge and replica-set Mongo; verify environment and deployment health.
2. Add replica-set integration tests for auth, ownership, capacity, state transitions, hidden test privacy, and transaction idempotency.
3. Add asynchronous judging/finalization, limits, monitoring, and source-code retention.
4. Complete student profile/dashboard/wallet and mentor availability/booking APIs.
5. Complete admin platform tools and notifications/chat.
6. Perform end-to-end testing against production-like Clerk, MongoDB, and judge configurations.

See [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) for phased work and release gates.
