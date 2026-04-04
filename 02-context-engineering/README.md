# Demo 2: Context Engineering with GitHub Copilot
## Same Prompt, Better Output (10 min)

### What You'll Prove
Same prompt complexity as Demo 1 → dramatically better output. The difference? Three layers of structured context loaded into GitHub Copilot.

**The three context layers:**
- **`.github/copilot-instructions.md`** — Always-on team standards (loaded automatically for every interaction)
- **`#file:skills/backend-api.md`** — On-demand skill files for deep domain context (loaded per task)
- **Slash commands** — Built-in Copilot actions (`/explain`, `/fix`, `/tests`, `/doc`)

### Pre-flight

> **Setup:** Copy these two things into your VoteJam repo before the talk:
> - `02-context-engineering/.github/copilot-instructions.md` → `.github/copilot-instructions.md`
> - `02-context-engineering/skills/` folder → `skills/` at repo root
>
> Copilot picks up `copilot-instructions.md` automatically. Skill files are loaded on-demand via `#file` in chat.

- [ ] VS Code open with VoteJam project loaded
- [ ] GitHub Copilot extension active (check status bar — look for the Copilot icon)
- [ ] Copilot Chat panel open (Ctrl+Alt+I / Cmd+Option+I)
- [ ] `.github/copilot-instructions.md` visible in Explorer sidebar
- [ ] `skills/backend-api.md` and `skills/frontend-ui.md` visible in Explorer
- [ ] Font size: 18pt+ in both editor and chat panel

---

### Step 1: SHOW the Instructions File (1.5 min)
Open `.github/copilot-instructions.md` in the editor.

**Say:** "This is our team's always-on context file. It's automatically loaded for every Copilot interaction in this repo. No activation, no prompting needed — it just loads."

Scroll through and call out:
- **Coding patterns** — "Zod for validation, repository pattern, Express error handling"
- **Security rules** — "All endpoints require auth by default. Rate limiting is server-side only."
- **Testing rules** — "Every route gets a test file. Happy path + auth failure + validation failure"

**Say:** "This is the equivalent of giving a new developer a complete onboarding packet — before they write their first line of code."

---

### Step 2: BUILD with Instructions (3 min)
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

---

### Step 3: COMPARE with Demo 1 (1 min)
Point out what's different from Demo 1 (Lovable):
- Auth middleware — automatic, from instructions (not UI-only like Lovable)
- Server-side rate limiting — not client-side
- Tests alongside code — came from instructions, zero extra prompting
- Team naming conventions — consistent, not invented

---

### Step 4: TRACE THE CONTEXT (1 min)
Open `.github/copilot-instructions.md` side-by-side with the generated code.

**Say:** "Here's the accountability layer. I can trace every decision in the generated code back to a line in our instructions file."

Point to:
- `requireAuth` ← "All endpoints require auth" in instructions
- Zod schema ← "Use Zod for all input validation" in instructions
- Test structure ← "Happy path + auth failure + validation failure" in instructions

---

### Step 5: SKILLS — On-Demand Deep Context (2 min)

**Say:** "The instructions file is always-on. But sometimes you need deeper domain knowledge for a specific task. That's where skill files come in."

Open `skills/backend-api.md` in the editor. Scroll through it briefly.

**Say:** "This skill file has deep backend patterns — rate limiting setup, pagination, a full reference implementation. It's not in the instructions file because you don't need it every time. You load it when the task calls for it."

In Copilot Chat, type:

```
#file:skills/backend-api.md @workspace Add pagination to the GET /api/v1/songs endpoint.
Limit: 1-100, default 20. Offset-based.
```

**Say:** "Notice the `#file` prefix. That's me pinning the skill file to this specific chat turn. Copilot now has the instructions file AND the backend skill loaded simultaneously."

Point to the generated code:
- "Coerce and validate the query params — that's from the skill file's pagination pattern."
- "The response shape — `{ songs, total }` — directly from the skill file's reference."

**Say:** "Two layers of context working together. Always-on instructions for team standards. On-demand skills for deep domain knowledge."

---

### Step 6: SLASH COMMANDS — Built-In Power (1 min)

**Say:** "The third layer is Copilot's built-in commands. No files needed."

Select a block of generated code in the editor. Then show each command:

| Command | What it does | Say while showing |
|---------|-------------|-------------------|
| `/explain` | Explains selected code in plain English | "What does this middleware chain actually do?" |
| `/fix` | Fixes a bug or type error in selection | "Copilot, this is failing — fix it." |
| `/tests` | Generates tests for selected code | "Generate tests for just this function." |
| `/doc` | Generates JSDoc/comments for selection | "Document this for the next dev." |

**Say:** "These aren't context-dependent. They work on any code in any project. Fast, built-in, zero setup."

---

### What the Audience Notices
- Three layers: always-on instructions → on-demand skills → built-in commands
- Instructions file is just a Markdown file — no new tooling required
- Skills are also just Markdown — domain knowledge you load when needed
- Every AI decision is traceable back to a file your team controls
- The pattern works in Claude Code (CLAUDE.md), Cursor (.cursorrules), and Copilot

---

### Checkpoint
1. Instructions file = always-on team onboarding for the AI
2. Skill files = on-demand domain knowledge loaded with `#file`
3. Slash commands = built-in power tools, no setup needed
4. Three layers, one coherent system — context engineering, not prompt engineering

---

### Backup
If Copilot is slow: open the instructions file + a skill file + a pre-written reference implementation side-by-side. Walk through how each section influenced each section of the code. Same teaching moment, no live generation needed.
