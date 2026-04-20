# Tasks: Song Voting System

**Input**: Design documents from `specs/001-song-voting/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Tests**: Test tasks are MANDATORY (Red-Green TDD — see constitution). Tests MUST be written before implementation code. Write failing tests first, then implement until they pass.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: Which user story this task belongs to (`US1`)
- Exact file paths are included in every description

---

## Phase 1: Setup

**Purpose**: Create the new type needed before any other work can reference it.

- [X] T001 [P] Create `VoteResponse` interface in `src/types/VoteResponse.ts`

**Checkpoint**: `VoteResponse` type is importable by repo and route files.

---

## Phase 2: Foundational (Blocking Bug Fixes)

**Purpose**: Fix three bugs in existing code that will cause compilation errors or wrong
runtime behaviour regardless of which story is being worked on. No user story implementation
can pass its tests until these are resolved.

⚠️ **CRITICAL**: Complete this phase before any Phase 3 work begins.

- [X] T002 [P] Remove the direct `import rateLimit from 'express-rate-limit'` import (keep only `import { rateLimit } from '../middleware/rateLimit'`) in `src/routes/songs.ts`
- [X] T003 [P] Change `songVoters` field type from `Map<string, Set<string>>` to `Map<string, Map<string, 'up' | 'down'>>` and update its usages in `src/repositories/songRepo.ts`
- [X] T004 Remove `hasUserVoted()` and `recordVote()` methods; delete the `this.userVotes` reference that references an undefined property in `src/repositories/songRepo.ts`

**Checkpoint**: Project compiles with `tsc --noEmit`. No runtime reference errors.

---

## Phase 3: User Story 1 — Vote on a Song (Priority: P1) 🎯 MVP

**Goal**: Authenticated users can cast, change, or toggle off a vote on any existing song.
The endpoint enforces: toggle semantics, UUID param validation, server-side rate limiting
(10/min/user), and returns a `VoteResponse` shape.

**Independent Test**: Run `npm test -- votes` — all scenarios in
`src/routes/__tests__/votes.test.ts` pass green.

### Tests for User Story 1 ⚠️ Write these FIRST — confirm they FAIL before implementing

- [X] T005 [P] [US1] Update the existing 409-duplicate-vote test: change it to assert toggle-off behaviour — second vote in the same direction returns 200 with `userVote: null` and decremented `votes` in `src/routes/__tests__/votes.test.ts`
- [X] T006 [P] [US1] Add vote-change test: user votes `up`, then votes `down` — expects 200 with `userVote: 'down'` and `votes` adjusted by -2 in `src/routes/__tests__/votes.test.ts`
- [X] T007 [P] [US1] Add UUID param validation test: `songId = 'not-a-uuid'` expects 400 `VALIDATION_ERROR` in `src/routes/__tests__/votes.test.ts`
- [X] T008 [P] [US1] Update all existing happy-path assertions to expect the `VoteResponse` shape (`songId`, `votes`, `userVote`) instead of the full `Song` shape in `src/routes/__tests__/votes.test.ts`

**Confirm RED**: Run `npm test -- votes` and verify the updated/new tests fail before proceeding.

### Implementation for User Story 1

- [X] T009 [US1] Implement `songRepo.vote(songId, userId, direction)` toggle method that returns `VoteResponse | undefined` using the `Map<userId, direction>` structure; handles insert / toggle-off / direction-change cases in `src/repositories/songRepo.ts`
- [X] T010 [US1] Add `reset()` method update to clear the new `Map<string, Map<…>>` structure (ensures test isolation) in `src/repositories/songRepo.ts`
- [X] T011 [US1] Add `songId` UUID param validation with `z.string().uuid()` before any repo call; throw `AppError('Invalid song ID format', 400, 'VALIDATION_ERROR')` on failure in `src/routes/songs.ts`
- [X] T012 [US1] Replace the vote route handler body: remove the `hasUserVoted` / `recordVote` calls; call `songRepo.vote(songId, userId, direction)` and return `ApiResponse<VoteResponse>` in `src/routes/songs.ts`
- [X] T013 [US1] Change `voteLimiter` `max` from `5` to `10` to match spec (10 vote changes/min/user) in `src/routes/songs.ts`

**Checkpoint**: Run `npm test -- votes` — all 7+ scenarios in `votes.test.ts` pass. User Story 1 is fully functional and independently testable.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across the full test suite and verification against the quickstart.

- [X] T014 [P] Run the full test suite (`npm test`) and confirm zero failures across both `songs.test.ts` and `votes.test.ts`
- [X] T015 [P] Walk through all `quickstart.md` curl examples against a running local server (`npm run dev`) and confirm each returns the documented response shape

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    └─► Phase 2 (Foundational bug fixes)
            └─► Phase 3 (User Story 1 — tests then implementation)
                    └─► Phase 4 (Polish)
```

- **Phase 1** — No dependencies; start immediately
- **Phase 2** — Depends on Phase 1 (T001 must exist for imports to resolve)
- **Phase 3** — Depends on Phase 2 completion (compilation must pass before tests can run)
- **Phase 4** — Depends on all Phase 3 implementation tasks complete

### User Story Dependencies

- **US1** is the only user story; it can begin immediately after Phase 2 completes.

### Within Phase 3 (User Story 1)

```
T005, T006, T007, T008  (test tasks — all parallel, all FAIL before implementation)
        │
        ▼
T009  (songRepo.vote() — core toggle logic)
        │
        ├─► T010  (reset() fix — parallel with T011–T013)
        ├─► T011  (UUID param validation)
        ├─► T012  (route handler update — depends on T009)
        └─► T013  (rate limit fix — parallel)
```

### Parallel Opportunities

| Group | Tasks | Can run in parallel |
|-------|-------|-------------------|
| Phase 1 | T001 | Standalone |
| Phase 2 bug fixes | T002, T003 | Yes — different files |
| Phase 2 bug fixes | T004 | After T003 (same file) |
| US1 tests | T005, T006, T007, T008 | Yes — all in same file, non-overlapping sections |
| US1 impl | T009, T013 | Yes — T013 is a 1-line change, independent of T009 |
| US1 impl | T010, T011 | Yes — different concerns in different files/methods |
| Polish | T014, T015 | Yes — independent verification steps |

---

## Parallel Example: User Story 1 Tests (if pair-programming)

```bash
# Developer A — toggle semantics tests
# Edit: votes.test.ts → update T005 (duplicate-vote → toggle-off test) + T006 (direction-change test)

# Developer B — validation + shape tests
# Edit: votes.test.ts → add T007 (UUID validation test) + T008 (VoteResponse shape assertions)

# Both confirm RED before implementation begins
npm test -- votes
```

---

## Implementation Strategy

**MVP Scope**: All of User Story 1 (this feature IS the MVP — there are no lower-priority stories).

**Delivery order**:
1. Phase 1 + Phase 2 — unblock compilation (~15 min)
2. Phase 3 tests (RED) — confirm failures are for the right reason (~20 min)
3. Phase 3 implementation (GREEN) — `songRepo.vote()` first, then route updates (~30 min)
4. Phase 4 — full suite + manual quickstart validation (~10 min)

**Total estimate**: ~75 min for a single developer working sequentially.
