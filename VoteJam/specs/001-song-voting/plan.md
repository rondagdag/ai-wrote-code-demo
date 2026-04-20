# Implementation Plan: Song Voting System

**Branch**: `001-song-voting` | **Date**: 2026-04-20 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-song-voting/spec.md`

## Summary

Add a `POST /api/v1/songs/:songId/vote` endpoint that lets authenticated users vote a song
up or down, with toggle semantics (same direction removes the vote, opposite direction
changes it). Votes are tracked per-user at the repository layer; a server-side rate limit
of 10 vote changes/minute/user prevents abuse. Implementation is in-memory (in-process
`SongRepository`) but designed so swapping in PostgreSQL requires zero route changes.

## Technical Context

**Language/Version**: TypeScript 5 (strict), Node.js 20+  
**Primary Dependencies**: Express.js 4, Zod, express-rate-limit, Vitest, Supertest  
**Storage**: In-memory `Map`-based repository (swap target: PostgreSQL `votes` table)  
**Testing**: Vitest + Supertest; co-located in `src/routes/__tests__/`  
**Target Platform**: Linux server (REST API)  
**Project Type**: web-service  
**Performance Goals**: Vote endpoint p95 < 200ms  
**Constraints**: One vote per user per song (UNIQUE on user+song); rate limit 10/min/user  
**Scale/Scope**: Party/session scale — hundreds of users, dozens of songs  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Red-Green TDD** — `votes.test.ts` exists with 6 scenarios; tests are written first; all four mandatory scenario types covered (happy path, auth failure, validation failure, business-logic failure)
- [x] **II. Repository Pattern** — `songRepo` handles all vote data access; route handler calls repo methods only; vote direction and toggle logic live in the repository layer
- [x] **III. Input Validation** — `VoteSongSchema` (Zod `z.enum(['up','down'])`) wraps the mutation; `songId` param validated as UUID via Zod before any repo call
- [x] **IV. Security by Default** — `requireAuth` on the vote route; `express-rate-limit` at 10/min keyed by `req.user.id`; no client-side enforcement
- [x] **V. Consistent API Contract** — Response uses `ApiResponse<VoteResponse>`; error codes are `NOT_FOUND`, `UNAUTHORIZED`, `RATE_LIMITED`, `VALIDATION_ERROR` (all from the approved set)

## Project Structure

### Documentation (this feature)

```text
specs/001-song-voting/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── vote-api.md
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app.ts                          # Express app — register votes router
├── routes/
│   ├── songs.ts                    # Song CRUD + vote endpoint
│   └── __tests__/
│       ├── songs.test.ts           # Song CRUD tests
│       └── votes.test.ts           # Vote endpoint tests (already exists)
├── repositories/
│   └── songRepo.ts                 # SongRepository — owns vote toggle logic
├── middleware/
│   ├── auth.ts                     # requireAuth
│   ├── rateLimit.ts                # rateLimit helper
│   └── validation.ts               # validateBody(ZodSchema)
├── types/
│   ├── ApiResponse.ts              # ApiResponse<T> envelope
│   ├── Song.ts                     # Song entity
│   └── VoteResponse.ts             # NEW — vote endpoint response shape
└── utils/
    └── errors.ts                   # AppError
```

**Structure Decision**: Single project layout. All new code lives inside the existing `src/`
tree. The only new file is `src/types/VoteResponse.ts`; all other changes are modifications
to existing files (`songs.ts`, `songRepo.ts`).

## Known Issues in Existing Code (to fix during implementation)

| File | Issue | Fix |
|------|-------|-----|
| `src/routes/songs.ts` | Duplicate `rateLimit` import (both `express-rate-limit` and `../middleware/rateLimit`) | Remove `import rateLimit from 'express-rate-limit'`; use the project's `rateLimit` helper |
| `src/routes/songs.ts` | Rate limit set to `max: 5` but spec requires 10/min | Change to `max: 10` |
| `src/repositories/songRepo.ts` | `updateVotes` references `this.userVotes` (undefined) instead of `this.songVoters` | Fix property name |
| `src/routes/songs.ts` | Vote endpoint calls `songRepo.hasUserVoted` then `songRepo.recordVote` separately, but spec requires toggle semantics | Replace with single `songRepo.vote(songId, userId, direction)` that handles toggle |
| `src/routes/songs.ts` | Response returns `Song` type; spec defines `{ songId, votes, userVote }` shape | Return `ApiResponse<VoteResponse>` |
| `src/routes/songs.ts` | `songId` param not validated as UUID before repo call | Add Zod UUID parse of `req.params.songId` |

## Complexity Tracking

> No constitution violations requiring justification.
