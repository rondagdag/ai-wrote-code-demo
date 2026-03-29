---
description: "Implementation tasks for the song voting feature"
---

# Tasks: Song Voting System

**Input**: Design documents from /specs/001-song-voting/
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/vote.openapi.yaml

**Tests**: Included. The feature specification defines explicit happy-path and edge-case test scenarios.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align schema/contracts and test harness with the planned vote model.

- [X] T001 Add vote-related TypeScript DTO interfaces for request/response in src/types/Vote.ts
- [X] T002 Add repository contract types for vote operations in src/repositories/songRepo.ts
- [X] T003 [P] Add OpenAPI contract verification notes for vote response shape in specs/001-song-voting/contracts/vote.openapi.yaml

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared primitives required by all vote stories.

**CRITICAL**: No user story work starts before this phase completes.

- [X] T004 Implement UUID path param validator middleware for songId in src/middleware/validation.ts
- [X] T005 [P] Refactor rate limiter to support named limits and per-user keying in src/middleware/rateLimit.ts
- [X] T006 [P] Update auth user typing for stable per-user vote key usage in src/middleware/auth.ts
- [X] T007 Update error code constants and mappings for SONG_NOT_FOUND and RATE_LIMITED in src/utils/errors.ts
- [X] T008 Create reusable vote response builder utility in src/routes/songs.ts

**Checkpoint**: Foundation complete. User stories can now proceed.

---

## Phase 3: User Story 1 - Cast And Toggle Vote (Priority: P1) MVP

**Goal**: Authenticated users can upvote/downvote songs and toggle or switch their current vote with accurate net totals.

**Independent Test**: With a valid token and existing song, repeated calls to POST /api/v1/songs/:songId/vote must show insert, toggle-off, and switch semantics with correct votes and userVote.

### Tests For User Story 1

- [X] T009 [P] [US1] Add happy-path integration tests for insert/toggle/switch behavior in src/routes/__tests__/votes.test.ts
- [X] T010 [P] [US1] Add repository-level vote state transition tests for NO_VOTE/UP/DOWN transitions in src/routes/__tests__/votes.test.ts

### Implementation For User Story 1

- [X] T011 [US1] Replace single-vote-per-user guard with toggle/switch vote semantics in src/repositories/songRepo.ts
- [X] T012 [US1] Return vote operation result shape { songId, votes, userVote } from repository methods in src/repositories/songRepo.ts
- [X] T013 [US1] Update POST /api/v1/songs/:songId/vote handler to use toggle/switch repository contract in src/routes/songs.ts
- [X] T014 [US1] Ensure downvotes and direction switches apply net score effects defined in specs/001-song-voting/data-model.md in src/repositories/songRepo.ts
- [X] T015 [US1] Update response typing to use vote-specific DTO instead of Song for vote endpoint in src/routes/songs.ts

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Validation And Error Handling (Priority: P2)

**Goal**: The endpoint enforces auth, UUID validation, request validation, and song existence errors with contract-aligned status codes.

**Independent Test**: Invalid token, invalid songId format, invalid direction, and missing song each return expected status and error code without mutating vote state.

### Tests For User Story 2

- [X] T016 [P] [US2] Add validation/error-path tests for 400 invalid UUID and invalid direction in src/routes/__tests__/votes.test.ts
- [X] T017 [P] [US2] Add authorization and not-found tests for 401 and 404 SONG_NOT_FOUND in src/routes/__tests__/votes.test.ts

### Implementation For User Story 2

- [X] T018 [US2] Apply songId UUID validation middleware before repository access in src/routes/songs.ts
- [X] T019 [US2] Normalize vote endpoint not-found error code/message to SONG_NOT_FOUND in src/routes/songs.ts
- [X] T020 [US2] Align validation failure response code with API contract expectations in src/middleware/validation.ts
- [X] T021 [US2] Verify vote endpoint middleware order (requireAuth -> rateLimit -> validation -> handler) in src/routes/songs.ts

**Checkpoint**: User Story 2 is fully functional and testable independently.

---

## Phase 5: User Story 3 - Per-User Rate Limiting And Consistency (Priority: P3)

**Goal**: Vote changes are rate-limited to 10 per minute per authenticated user and remain deterministic under concurrent usage.

**Independent Test**: Same user receives 429 after 10 vote changes in one minute, other users are unaffected, and concurrent operations preserve a consistent aggregate vote total.

### Tests For User Story 3

- [X] T022 [P] [US3] Add per-user 10-per-minute rate limit tests (same user throttled, different user allowed) in src/routes/__tests__/votes.test.ts
- [X] T023 [P] [US3] Add concurrent voting behavior test coverage for deterministic total in src/routes/__tests__/votes.test.ts

### Implementation For User Story 3

- [X] T024 [US3] Configure vote route to use a named limiter configured for 10 requests per 60s in src/routes/songs.ts
- [X] T025 [US3] Implement limiter key function that prefers req.user.id over IP for vote route in src/middleware/rateLimit.ts
- [X] T026 [US3] Update rate limit error payload to return 429 RATE_LIMITED for vote endpoint in src/middleware/rateLimit.ts
- [X] T027 [US3] Make repository vote mutation path atomic for in-memory consistency under concurrent updates in src/repositories/songRepo.ts

**Checkpoint**: User Story 3 is fully functional and testable independently.

---

## Phase 6: Polish And Cross-Cutting Concerns

**Purpose**: Final alignment, documentation, and end-to-end verification.

- [X] T028 [P] Update endpoint behavior notes and examples for toggle/rate-limit semantics in specs/001-song-voting/quickstart.md
- [X] T029 [P] Update feature contract examples for final error codes and vote response payload in specs/001-song-voting/contracts/vote.openapi.yaml
- [X] T030 Run full vote test suite and validate no regression in songs routes tests in src/routes/__tests__/votes.test.ts
- [X] T031 Run build verification and fix any type issues introduced by vote DTO changes in tsconfig.json

---

## Dependencies And Execution Order

### Phase Dependencies

- Phase 1 (Setup): No dependencies, starts immediately.
- Phase 2 (Foundational): Depends on Phase 1 completion and blocks all user stories.
- Phase 3 (US1): Depends on Phase 2.
- Phase 4 (US2): Depends on Phase 2 and can run in parallel with US1 after foundational completion.
- Phase 5 (US3): Depends on Phase 2 and can run in parallel with US1/US2 after foundational completion.
- Phase 6 (Polish): Depends on completion of all selected user stories.

### User Story Dependencies

- US1 (P1): No dependency on other stories after foundational work.
- US2 (P2): No dependency on US1 behavior changes; validates contract and error paths independently.
- US3 (P3): No dependency on US1/US2 outcomes beyond shared foundational middleware.

### Within Each User Story

- Write tests first and confirm they fail before implementation.
- Update repository/domain behavior before route handler integration.
- Complete middleware and error mapping before final test rerun.

---

## Parallel Execution Examples

### User Story 1

- Run T009 and T010 together (both update test scenarios in src/routes/__tests__/votes.test.ts).
- Run T012 and T014 together after T011 (same repository module, but logically separable vote result and net score work).

### User Story 2

- Run T016 and T017 together for fast feedback on all edge-case status codes.
- Run T018 and T019 together once tests are failing (same route file, separate concerns).

### User Story 3

- Run T022 and T023 together to validate limiter and concurrency behavior in parallel test authoring.
- Run T025 and T026 together inside rate limiter refactor after T024 wiring is complete.

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate vote insert/toggle/switch behavior end-to-end.
4. Demo or release MVP.

### Incremental Delivery

1. Deliver MVP with US1.
2. Add US2 validation and error conformance.
3. Add US3 per-user throttling and consistency hardening.
4. Finish with Phase 6 polish and full verification.

### Team Parallelization

1. Team finishes Setup and Foundational together.
2. After checkpoint, separate owners can execute US1, US2, and US3 in parallel.
3. Rejoin for Phase 6 contract/docs/build verification.

---

## Notes

- [P] tasks are marked only where work can proceed without waiting on incomplete dependencies.
- [USx] labels map each task to a single user story for traceability.
- Every task includes an exact repository path to keep execution unambiguous.
