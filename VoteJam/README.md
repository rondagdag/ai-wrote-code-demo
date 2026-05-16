# VoteJam — Starter Project

Base project for all demos. Types, middleware, one route, passing tests.

## Quick Start

```bash
npm install
npm test        # 14 tests pass
npm run build   # TypeScript compiles clean
npm run dev     # Starts on port 3000
```

## What's Here

- **Types**: `Song`, `ApiResponse`
- **Middleware**: `requireAuth` (Bearer token auth), `validateBody` (Zod schema validation)
- **Repository**: In-memory song store with vote tracking
- **Routes**:
  - `POST /api/v1/songs` — Submit a new song (requires auth)
  - `GET /api/v1/songs` — List all songs (sorted by votes)
- **Tests**: 14 passing tests (vitest + supertest)

## Project Structure

```
src/
├── app.ts                       # Express app setup & error handler
├── types/
│   ├── Song.ts                  # Song interface
│   └── ApiResponse.ts           # Generic response wrapper
├── utils/
│   └── errors.ts                # AppError class
├── middleware/
│   ├── auth.ts                  # requireAuth middleware
│   └── validation.ts            # validateBody middleware
├── repositories/
│   └── songRepo.ts              # In-memory song store
└── routes/
    ├── songs.ts                 # Song endpoints
    └── __tests__/
        └── songs.test.ts        # Route tests
```

## What's NOT Here (That's the Point)

- No voting endpoint (Demo 2–3 build this)
- No frontend (Demo 2 builds SongCard)
- No CI pipeline (Demo 3 adds this)
- No GitHub workflows (Demos 4–5 add these)
