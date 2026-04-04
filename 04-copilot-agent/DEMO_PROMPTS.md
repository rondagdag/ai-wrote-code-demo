# Demo 4: Copilot Coding Agent — Step-by-Step Script

## Pre-Demo Setup (Do 1 hour before talk)

### Checklist
- [ ] Repo is public or Copilot has access
- [ ] .github/workflows/copilot-setup-steps.yml is pushed to main
- [ ] Copilot Business/Enterprise is enabled on your GitHub organization
- [ ] Create the sample issue (copy-paste from "Sample Issue" section below)
- [ ] Assign the issue to @copilot
- [ ] Wait for Copilot to create a PR (5-10 minutes)
- [ ] Once PR is open, note the PR URL and branch name
- [ ] Keep browser tabs open: issue + PR

### Network/Demo Timing
- Live demo time is ~3 min
- Copilot typically takes 5-10 min to complete
- Always have a "finished" PR ready as backup

---

## During the Talk (3 min total)

### Segment 1: Show the Setup (30 sec)
**Click path**: GitHub Repo → Code → .github/workflows/copilot-setup-steps.yml

**Say**:
"Here's the entire setup Copilot needs. One workflow file. It handles Node setup, dependencies, and type-checking. That's it. Simple, right?"

**Pause 3 sec** for audience to look.

---

### Segment 2: Trigger the Agent (1 min)
**Click path**: GitHub Repo → Issues → [Your sample issue]

**Say**:
"This is a real issue from our backlog: add a search endpoint for songs. Watch what happens when I assign it to Copilot."

**Action**: Click "Assignees" → type "copilot" → press Enter

**Say**:
"One click. The agent is now working asynchronously. It's:
1. Reading our codebase
2. Understanding the patterns we use
3. Planning the implementation
4. Writing tests
5. Opening a PR when done

This normally takes a developer 30-45 minutes. Copilot does it in 5-10 minutes. And it runs in the background while we keep talking."

**Pause 2 sec**.

"But I don't want you to watch it work. Let me show you one it already finished."

---

### Segment 3: Walk Through the PR (1.5 min)
**Click path**: [Open pre-made PR tab]

**Say**:
"This is a PR Copilot created earlier today. Let me walk you through it."

**Action 1 — Show branch name**:
Point to "copilot/add-search-endpoint" or similar.
"Copilot created this branch. Notice the name is semantic — it describes the work."

**Action 2 — Show code changes**:
Scroll through the diff.
"The implementation follows our patterns. It uses Zod for validation, the repository pattern for data access, and requireAuth middleware for security. This isn't boilerplate—it's thoughtful code that fits our codebase."

**Action 3 — Show PR description**:
Point to the PR body.
"The description links back to the issue, explains what changed, and calls out the test coverage. Useful for reviewers."

**Action 4 — Show CI status**:
Point to CI checks.
"Tests pass. Type-checking passes. The workflow ran without errors."

**Say**:
"So from a single issue assignment, we got a fully implemented, tested, and documented PR ready for review. No human coding required."

---

### Segment 4: A-HA Moment (20 sec)
**Say**:
"Here's the key insight: You assigned this issue at 9 AM before grabbing coffee. While you were in meetings, the agent implemented it. By lunch time, there's a draft PR waiting for you to review. That's truly async AI—like having a remote teammate who never sleeps."

**Pause 2 sec**.

"And because it's all in GitHub, it's auditable, trackable, and integrated into your workflow. No context switching. No waiting for your team to get to it."

---

## Sample Issue (copy-paste into GitHub Issues)

```markdown
## Add search endpoint for songs

### Description
Add a GET endpoint at `/api/v1/songs/search` that accepts a `q` query parameter and returns songs matching by title or artist (case-insensitive).

### Requirements
- Return empty array if no matches
- Return 400 if `q` is missing or empty
- Include tests for all cases

### Acceptance Criteria
- [ ] GET /api/v1/songs/search?q=bohemian returns matching songs
- [ ] GET /api/v1/songs/search (no q param) returns 400 with VALIDATION_ERROR
- [ ] GET /api/v1/songs/search?q=nonexistent returns empty array with 200
- [ ] Tests included and passing
```

---

## If Copilot is Slow (Backup Plan)

If the agent hasn't finished by talk time:

**Say**:
"Copilot's working in the background now. I triggered it 30 minutes ago. Here's one it already completed earlier today." → Switch to pre-made PR tab.

This keeps the energy and momentum. The audience still sees the magic, just with a pre-recorded example.

---

## Talking Points for Q&A

**"Does it always write perfect code?"**
"No. It's 70-80% there—super useful, but reviewers always catch things. That's why the PR review step is crucial."

**"Does it follow our patterns?"**
"In this repo, yes, because it read the codebase and our `.github/copilot-instructions.md`. With a new codebase, create that file first — it's the team standards the agent reads before writing anything."

**"What if it misunderstands the issue?"**
"Same as with a junior dev. You can comment on the PR, or re-open the issue with clarification and re-assign."

**"Is it expensive?"**
"Copilot Business is about $20/month per user or $231/year. The time savings pay for it on the first PR."
