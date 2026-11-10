# Contest System

## Implemented lifecycle

| Step | Current behavior |
|---|---|
| Mentor creates a contest | Approved mentor submits contest details and owned question mappings. New contests are saved as `draft`. |
| Mentor requests publication | A draft or rejected contest is submitted to the admin review queue. |
| Admin reviews | An active Mongo user with the `admin` role can approve, reject with a reason, or cancel. Review actions are recorded in `AuditLog`. |
| Students discover | Public contest listing and detail APIs expose only public contests in approved lifecycle states. |
| Registration | An active student registers once before the deadline, while capacity remains. A unique participation index prevents duplicate registrations. |
| Participation | A registered student starts an authenticated fullscreen session while the contest is ongoing. The server records `startedAt` and a bounded `expiresAt`. |
| Submit answers | Source is persisted server-side, checked against the selected question/language/session, and evaluated using the configured external Judge0-compatible service. |
| End session | Student may finalize once; expired/ended participation cannot continue submitting. |
| Final results | The first authorized leaderboard request after contest end computes and persists results, awards coins transactionally, and marks the contest complete. |

Relevant routes are documented in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md); data models are listed in [DATABASE_DESIGN.md](./DATABASE_DESIGN.md).

## Contest and question authoring

The mentor workspace form in [`MentorWorkspace.tsx`](../src/components/mentor/MentorWorkspace.tsx) collects schedule, registration deadline, duration, capacity, rules, visibility, a banner URL, prize pool, and selected question IDs. It previews the contest before saving or requesting review. Selected question point values and order are mapped into the contest request. The current UI represents the prize pool as a single first-place award; use the API directly to configure multiple prize places.

Backend validation rejects invalid/expired schedules, duplicate question IDs or order values, duplicate prize places, and contest durations longer than the scheduled window. Question ownership is checked against the authenticated mentor account. The server derives owner and reviewer IDs from the verified Clerk identity and Mongo user record, never from request data.

Question records include statement/formats, difficulty, topics, constraints, samples, hidden tests, supported languages and resource limits. Mentor question responses may include hidden tests. Student contest-question responses are explicitly projected to samples and omit hidden tests and test-case details.

Mentors cannot edit a contest after any student has registered, after its start time, or after completion/cancellation. Questions used by an ended/completed contest are locked for mentors; admins can edit questions through the separate admin endpoint. Referenced questions cannot be deleted.

## Scoring and ranking policy

The current scoring behavior is `contest-score-v1`:

1. A problem contributes its configured contest points if an accepted submission exists.
2. Each wrong/non-accepted attempt before that problem's first accepted attempt reduces its points by the contest's `wrongAttemptPenalty`, clamped to zero.
3. If there is no accepted submission, the problem contributes zero points.
4. Ranked entrants must have started a session; disqualified and never-started registrations are not ranked or rewarded.
5. Ranking order is total score descending, accepted problem count descending, elapsed participation time ascending, registration time ascending, then a stable participation ID.
6. Prize coins are awarded to matching rank places. A unique user/reference transaction key and Mongo transaction make reward credits idempotent.

Elapsed time breaks ties; it does **not** currently subtract points. Fullscreen/tab/window events are recorded as client-reported counts and have no automatic score penalty or disqualification policy. These facts must not be presented as enforced anti-cheat guarantees.

## Code judging and operational prerequisites

Express does not execute submitted code locally. [`judge.service.ts`](../backend/src/services/judge.service.ts) sends each test case to a configured Judge0-compatible remote service. Configure `JUDGE_API_URL`, optional `JUDGE_API_TOKEN`, and `JUDGE_LANGUAGE_IDS` (JSON map from supported language keys to IDs supported by the configured judge) in the backend environment. Example variables are listed in [`backend/.env.example`](../backend/.env.example); no credentials or language IDs are committed.

Without a judge URL or a mapping for the chosen language, submissions fail explicitly with a 503 response. Production use requires an isolated, trusted judge service, its authentication, correct language IDs, network timeout/availability monitoring, rate limits, and adequate request capacity. The current API waits synchronously for judge results and evaluates test cases serially; it is not a scalable asynchronous queue.

Finalization uses MongoDB transactions. Mongo must run as a replica set (including a single-node replica set for development); standalone deployments cannot safely finalize results/rewards. Finalization is triggered by a leaderboard request, not by a scheduled worker. If no one requests results, persistence and reward delivery are delayed until a later request.

## Participation UX and limits

The student surface is [`participate/[contestId]/page.tsx`](../src/app/participate/%5BcontestId%5D/page.tsx). It restores the caller's registration/session on reload, provides a fullscreen start/return action, server-derived countdown, question navigation, statement/sample views, language selector, per-question source editor, submission verdict, and a final-submit action. The editor and final-submit control are blocked while outside fullscreen. The leaderboard is intentionally absent from the participation page. Public contest list and detail pages are under [`src/app/(public)/contests`](../src/app/(public)/contests).

Fullscreen and tab/window events originate in the browser and are not tamper-proof. Client telemetry can be omitted or forged; it should be used for operational review only. The server timer and submission checks are authoritative.

## Known gaps

- The code editor is a plain textarea, not a syntax-aware editor.
- No local sample runner, compile output, per-test-case detail, submission retry queue, or asynchronous judging UI exists.
- Scoring policies are fixed in the service and have no per-contest time deduction configuration.
- Contest notifications, registration confirmation delivery, and scheduled reminders are not wired.
- The admin review interface is operational, but question search/filter and broader admin question management are not built.
- Public contests and mentor workspace use backend API data; unrelated student dashboard, booking, chat, wallet redemption, and notification screens may still use mock or placeholder behavior.
- Database-dependent ownership, capacity races, approval transitions, and result transaction behavior need integration tests against a replica-set MongoDB before production.
