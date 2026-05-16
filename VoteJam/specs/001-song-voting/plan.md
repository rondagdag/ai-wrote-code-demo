# Implementation Plan: Song Voting System

**Branch**: `001-song-voting` | **Date**: 2026-03-28 | **Spec**: `specs/001-song-voting/spec.md`
**Input**: Feature specification from `specs/001-song-voting/spec.md`

## Summary

Implement a standards-compliant vote endpoint that supports per-user up/down vote toggling, song existence checks, UUID validation, and rate limiting, while moving vote persistence semantics to a repository contract that can be backed by PostgreSQL constraints (`UNIQUE(song_id, user_id)`) and accurate aggregate vote counts.

## Technical Context

**Language/Version**: TypeScript 5.3 on Node.js 18+
**Primary Dependencies**: Express 4.18, Zod 3.22, Vitest 1.1, Supertest 6.3
**Storage**: Current in-memory repository plus target PostgreSQL vote persistence model (`songs`, `votes`)
**Testing**: Vitest + Supertest route/integration tests
**Target Platform**: Node.js server runtime on macOS/Linux CI
**Project Type**: Backend web service (REST API)
**Performance Goals**: `POST /api/v1/songs/:songId/vote` under 200ms p95; vote count convergence within 1 second
**Constraints**: Auth required, UUID validation before data access, parameterized query boundaries at repository layer, server-side rate limiting 10 changes/min/user, one vote per song/user at storage layer
**Scale/Scope**: Single-service demo backend, moderate concurrency focused on correctness and deterministic behavior under concurrent vote changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Current constitution file (`.specify/memory/constitution.md`) is a scaffold with placeholders and no ratified principles. No enforceable constitutional gates can be evaluated yet.

**Pre-Phase-0 Gate Status**: PASS (provisional)
- No explicit constitutional violations detected because principles are not yet defined.
- Feature-level constraints from the spec are treated as mandatory gates for this plan.

**Post-Phase-1 Re-Check Status**: PASS (provisional)
- Phase 1 artifacts align with spec constraints on auth, validation, rate limiting, and DB-backed vote uniqueness.
- No contradictory governance rule is currently defined in constitution.

## Project Structure

### Documentation (this feature)

```text
specs/001-song-voting/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── vote.openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app.ts
├── middleware/
│   ├── auth.ts
│   ├── rateLimit.ts
│   └── validation.ts
├── repositories/
│   └── songRepo.ts
├── routes/
│   ├── songs.ts
│   └── __tests__/
│       ├── songs.test.ts
│       └── votes.test.ts
├── types/
│   ├── ApiResponse.ts
│   └── Song.ts
└── utils/
    └── errors.ts

specs/
└── 001-song-voting/
    ├── spec.md
    ├── plan.md
    ├── research.md
    ├── data-model.md
    ├── quickstart.md
    └── contracts/
```

**Structure Decision**: Keep a single Express service and add feature artifacts under `specs/001-song-voting/`. Implement vote behavior in `src/routes/songs.ts` and repository vote semantics in `src/repositories/songRepo.ts` while preserving existing middleware boundaries.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
