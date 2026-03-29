# Research: Song Voting System

## Vote Persistence Strategy

Decision: Model votes as one row per `(song_id, user_id)` with a DB-level `UNIQUE(song_id, user_id)` constraint.
Rationale: This directly enforces the one-vote-per-user-per-song invariant and avoids race-prone app-only checks.
Alternatives considered: In-memory `Map<songId, Set<userId>>` (insufficient for process restarts and concurrency), per-song denormalized user arrays (poor queryability and update safety).

## Toggle Semantics

Decision: Apply idempotent toggle rules: no existing vote -> insert vote; same-direction vote -> delete vote; opposite-direction vote -> update direction.
Rationale: Matches acceptance criteria and keeps user intent deterministic.
Alternatives considered: Reject repeat votes with `400` (conflicts with spec), always overwrite to latest without toggle-off (breaks toggle behavior).

## Vote Count Accuracy

Decision: Treat `songs.votes` as derived state maintained in storage (trigger/materialized count), not manually mutated in route handlers.
Rationale: Avoids drift between `votes` rows and aggregate totals and satisfies the requirement that count is not app-level only.
Alternatives considered: Increment/decrement counters in handler logic (fragile under retries/concurrency), periodic batch recomputation only (too stale for endpoint response).

## Validation Boundary

Decision: Validate `songId` as UUID at route boundary before repository calls and validate body with Zod enum `'up' | 'down'`.
Rationale: Prevents malformed identifiers from propagating and keeps error handling predictable (`400` for invalid input).
Alternatives considered: Repository-only validation (later failure, less clear API contract), no UUID validation (unsafe and against constraints).

## Rate Limiting Scope

Decision: Rate-limit vote changes to 10 per minute per authenticated user (preferred key: user ID; fallback IP only when auth context is unavailable).
Rationale: Spec requires per-user limit and authenticated voting, making user ID the correct identity key.
Alternatives considered: IP-only limiter (incorrect in shared NAT/proxy scenarios), global limiter (too coarse, harms unrelated users).

## Transaction and Concurrency Pattern

Decision: Execute vote insert/update/delete and count refresh in one repository operation boundary designed for transactional execution in PostgreSQL.
Rationale: Ensures endpoint returns a consistent post-operation vote total under concurrent requests.
Alternatives considered: Multi-step non-transactional updates (race risk), eventual asynchronous recount without synchronous response data (inconsistent response guarantees).
