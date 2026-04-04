# Demo 2: Context Engineering with GitHub Copilot
## Same Prompt, Better Output (10 min)

### What You'll Prove
Same prompt complexity as Demo 1 → dramatically better output. The difference? Structured context loaded into GitHub Copilot via a custom instructions file.

**GitHub Copilot** reads context from:
- **`.github/copilot-instructions.md`** — Repo-level custom instructions (always loaded for this repo)
- **`#file` references** — Pinned context files attached to a specific chat turn
- **`@workspace`** — References the entire codebase during generation

### Pre-flight
- [ ] VS Code open with VoteJam project loaded
- [ ] GitHub Copilot extension active (check status bar)
- [ ] Copilot Chat panel open (Ctrl+Alt+I / Cmd+Option+I)
- [ ] `.github/copilot-instructions.md` visible in Explorer
- [ ] Font size: 18pt+ in both editor and chat

### Step 1: SHOW Context File (1.5 min)
Open `.github/copilot-instructions.md` in the editor.

**Say:** "This is our team's context file for GitHub Copilot. It's automatically loaded for every Copilot interaction in this repo. No activation needed."

Scroll through and call out:
- **Coding patterns section** — "Zod for validation, repository pattern, Express error handling"
- **Security rules** — "All endpoints require auth by default. Parameterized queries only. Never string-concatenate SQL."
- **Testing rules** — "Every route gets a test file. Happy path + auth failure + validation failure"
- **Naming conventions** — "camelCase for variables, PascalCase for types, kebab-case for files"

**Say:** "This is the equivalent of giving a new developer a complete onboarding packet — before they write their first line of code."

### Step 2: BUILD (3 min)
Open Copilot Chat. Type this prompt exactly:

```
@workspace Create a new POST endpoint for voting on songs.
POST /api/v1/songs/:songId/vote with { direction: "up" | "down" }.
- One vote per user per song
- Server-side rate limiting
- Include a test file
```

**While generating, narrate:**
- "No mention of Zod. Watch it appear. The instructions file loaded it."
- "See `requireAuth`? Not in my prompt. 'All endpoints require auth by default' — that's from our instructions."
- "Test file alongside the implementation. Our instructions say every route gets one."
- "Same prompt as Lovable. Completely different output."

### Step 3: COMPARE (1 min)
Point out what's different from Demo 1:
- Auth middleware (automatic, from instructions)
- Server-side rate limiting (not client-side)
- Tests alongside code (coverage from rules)
- Team naming conventions (consistent, not invented)

### Step 4: TRACE THE CONTEXT (1 min)
Open `.github/copilot-instructions.md` side-by-side with the generated code.

**Say:** "Here's the accountability layer. I can point to every decision in the generated code and trace it back to a line in our instructions file. This is transparent, reviewable AI output."

Point to:
- `requireAuth` ← "All endpoints require auth" in instructions
- Zod schema ← "Use Zod for all input validation" in instructions
- Test file structure ← "Happy path + auth failure + validation failure" in instructions

### What the Audience Notices
- Same prompt → wildly different output when context is structured
- Instructions file is just a Markdown file — no new tooling needed
- `@workspace` gives Copilot full codebase awareness
- Every AI decision is traceable to a line in the instructions
- The pattern works in Claude Code, Cursor, and any tool with an instructions file

### Checkpoint
1. Context engineering = structuring what you know, not prompting better
2. `.github/copilot-instructions.md` = the team's onboarding packet for AI
3. Same instructions + `@workspace` = consistent output across the whole team
4. Every AI decision is auditable

### Backup
If Copilot is slow: open the instructions file + a pre-written reference implementation side-by-side. Walk through how each section of the instructions influenced each section of the code. Same teaching moment, no live generation needed.
