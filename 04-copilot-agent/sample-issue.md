# Sample GitHub Issue for Demo 4

Copy and paste this into a new GitHub issue in your repo.

---

## Add search endpoint for songs

### Description
Add a GET endpoint at `/api/v1/songs/search` that accepts a `q` query parameter and returns songs matching by title or artist (case-insensitive).

### Requirements
- Return empty array if no matches
- Return 400 if `q` is missing or empty
- Include tests for all cases
- Follow existing endpoint patterns (validation, response envelope, error handling)

### Acceptance Criteria
- [ ] GET /api/v1/songs/search?q=bohemian returns matching songs
- [ ] GET /api/v1/songs/search (no q param) returns 400 with VALIDATION_ERROR
- [ ] GET /api/v1/songs/search?q=nonexistent returns empty array with 200
- [ ] All tests pass
- [ ] Type-checking passes (npx tsc --noEmit)

---

## After Creating the Issue

1. Assign it to @copilot (or the Copilot user/app in your org)
2. Wait 5-10 minutes for Copilot to create a PR
3. Keep the issue and PR tabs open for the demo
