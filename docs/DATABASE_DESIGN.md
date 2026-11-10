# MongoDB Database Design

Schemas use Mongoose and live in [`backend/src/models`](../backend/src/models). Unless noted, timestamps are enabled and `versionKey` is disabled.

## Core models

### `User`

In [`User.ts`](../backend/src/models/User.ts): Clerk ID, unique username/email, name/image, role (`student | mentor | admin`), college, mobile, skills, social URLs, about, coin balance, onboarding flag, account status, and embedded mentor application state/reviewer metadata. Authentication services synchronize Clerk identity fields; backend roles and status drive authorization.

Indexes include unique `clerkUserId`, unique sparse `username`, unique `email`, and `{ role, accountStatus }`.

### `Contest`

In [`Contest.ts`](../backend/src/models/Contest.ts):

- Title/description, start/end, registration deadline, duration, participant cap/count, visibility, banner URL, and rules.
- Embedded ordered question mappings `{ questionId, points, order }`.
- Wrong-attempt penalty, creator reference, prize places, and status.
- Review subdocument with pending/approved/rejected state, reason, reviewer, and review timestamp.

Status values are `draft`, `pending_review`, `rejected`, `upcoming`, `ongoing`, `completed`, and `cancelled`. Timestamps are used for authoring/update ordering. Indexes support status/date and question-reference lookups.

### `Question`

In [`Question.ts`](../backend/src/models/Question.ts): statement and input/output formats, difficulty, topic tags, points, constraints, public sample cases, test cases with `isHidden`, supported languages, time/memory limits, and creator reference. Hidden tests are included only in mentor/admin projections and in server-side judging; student projections select only public problem fields.

### `ContestParticipation`

In [`ContestParticipation.ts`](../backend/src/models/ContestParticipation.ts): contest/user references, state (`registered`, `in_progress`, `submitted`, `completed`, `disqualified`), registration/start/expiry/final-submit timestamps, monitoring event counts, and last event timestamp. A unique `{ contestId, userId }` index enforces one registration per user/contest. Additional index supports roster/status queries.

Capacity increments are atomic on the Contest document. A duplicate registration rolls the counter increment back; the unique participation index is the final duplicate guard.

### `Submission`

In [`Submission.ts`](../backend/src/models/Submission.ts): participant/contest/question refs, private source code, language, verdict, execution/memory metrics, score, attempt number, passed/total tests, and submit/finish timestamps. A unique `{ userId, contestId, questionId, attemptNumber }` index prevents duplicate attempt numbers. History API explicitly excludes `sourceCode`.

### `ContestResult`

In [`ContestResult.ts`](../backend/src/models/ContestResult.ts): one final result per user/contest, rank, score, accepted/wrong counts, elapsed seconds, per-question points, scoring version, and publish time. Unique indexes enforce `{ contestId, userId }` and `{ contestId, rank }`.

### `CoinTransaction`

In [`CoinTransaction.ts`](../backend/src/models/CoinTransaction.ts): user, positive amount, credit/debit type, reason, optional reference, and creation time. A partial unique `{ userId, referenceId }` index makes named reward references idempotent. Final contest rewards update this ledger and `User.coins` inside a Mongo transaction.

### `AuditLog`

In [`AuditLog.ts`](../backend/src/models/AuditLog.ts): actor, action, entity type/ID, structured metadata, and timestamp. Contest approval/rejection/cancellation and admin question updates write audit records.

### Existing mentor/application models

`Booking` stores student/mentor, date, time strings, coins, and status; `College` stores an active named college. Booking and availability APIs are not part of the current contest integration. The booking time index is not a robust overlap exclusion constraint.

## Relationships

```text
User -- college --> College
User -- mentorApplication.reviewedBy --> User
Contest -- createdBy --> User
Contest -- questions[].questionId --> Question
Question -- createdBy --> User
ContestParticipation -- contestId --> Contest
ContestParticipation -- userId --> User
Submission -- userId --> User
Submission -- contestId --> Contest
Submission -- questionId --> Question
ContestResult -- contestId/userId/participationId --> Contest/ User/ ContestParticipation
CoinTransaction -- userId --> User
AuditLog -- actorId --> User
Booking -- studentId/mentorId --> User
```

## Consistency and operations

- Contest ownership is checked in services using the mentor resolved from verified Clerk identity.
- Participant registration uses an atomic capacity filter and a unique compound registration index.
- Participation start/final-submit transitions use conditional atomic updates to avoid overwriting concurrent state.
- Submission attempt numbers use a unique index; concurrent collision returns a conflict. Judge failures are retained as `judge_error` and excluded from score.
- Result rows, reward transactions, user coin balances, participation completion, and contest completion are written in one MongoDB transaction. This requires a replica set. The leaderboard request triggers finalization; no background finalizer exists.
- Result records are immutable after initial insert under the current service. Any future scoring-policy migration needs a new scoring version and an explicit admin operation.
- Monitoring counts are client-reported and should not be used as trusted evidence.

## Current gaps

No separate asynchronous judge-job/test-result model, immutable question snapshot, notification/outbox, availability, merchandise/redemption, or chat model exists. Mentor editing is blocked after start/completion in service logic, but there is no versioned problem snapshot for contests already in progress. Backups, retention, coin reconciliation, indexes migration strategy, and replica-set operations still need production procedures.
