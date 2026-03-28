# Demo 2: Context Engineering with Google Antigravity
## Same Prompt, Better Output (10 min)

### What You'll Prove
Same prompt complexity as Demo 1 → dramatically better output. The difference? Structured context.

**Google Antigravity** loads context in two layers:
- **Skills** — Reusable capability packages (activate automatically by file location)
- **Knowledge Items** — Persistent team memory (survives restarts)

### Pre-flight
- [ ] Antigravity IDE open, VoteJam project loaded
- [ ] Skills installed: backend-skill/, frontend-skill/
- [ ] KIs installed: coding-standards.ki.md, api-patterns.ki.md
- [ ] Skills panel visible in sidebar

### Step 1: SHOW Context (1.5 min)
Open Skills panel → click backend-skill/SKILL.md

**Say:** "This is how we package patterns for the AI. Zod validation, auth middleware, repository pattern, testing rules. When you work in src/routes/, this loads automatically."

Open Knowledge panel → click coding-standards.ki.md

**Say:** "Skills are capabilities. KIs are team memory — standards, naming, security. These survive restarts."

### Step 2: BUILD (3 min)
Type this prompt:

```
Create a new POST endpoint for voting on songs.
POST /api/v1/songs/:songId/vote with { direction: "up" | "down" }.
- One vote per user per song
- Server-side rate limiting
- Include a test file
```

**While generating, narrate:**
- "No mention of Zod. Watch it appear. Backend-skill loaded it."
- "See requireAuth? Not in my prompt. That's from the API patterns KI."
- "Test file too. From the testing rules in the Skill."
- "Same prompt as Lovable. Completely different output."

### Step 3: COMPARE (1 min)
Point out what's different from Demo 1:
- Auth middleware (automatic)
- Server-side rate limiting (not client-side)
- Tests alongside code
- Team naming conventions

### Step 4: SHOW Artifacts (1 min)
Click Artifacts panel.

**Say:** "The agent logged its reasoning. Plans, decisions, trade-offs. Not a black box."

### What the Audience Notices
- Context is the multiplier — same prompt, better output
- Skills load automatically (no explicit routing)
- KIs persist across sessions
- Artifacts show transparent reasoning
- The pattern works in any tool (Cursor, Claude Code, Copilot)

### Checkpoint
1. Context engineering = structuring AI input, not prompting better
2. Skills = reusable capability packages
3. KIs = team memory that outlives sessions
4. The pattern is tool-agnostic

### Backup
If Antigravity lags: walk through Skills/KI files manually, narrate expected output.
