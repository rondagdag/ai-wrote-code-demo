# Demo 2: Context Engineering with GitHub Copilot
## Same Prompt, Better Output (10 min)

### What You'll Prove
Same prompt as Demo 1 → dramatically better output. The difference? Three layers of structured context that Copilot reads automatically.

### The Three Context Layers

| Layer | File | When it loads |
|---|---|---|
| **Instructions** | `.github/copilot-instructions.md` | Always — every interaction in this repo |
| **Agent Skills** | `.github/skills/[name]/SKILL.md` | Automatically — when your prompt matches the skill's description |
| **Slash commands** | Built-in | On demand — `/explain`, `/fix`, `/tests`, `/doc` |

**Key insight:** Skills auto-load. You don't reference them manually — Copilot reads your prompt, matches it against skill descriptions, and loads the relevant skill automatically.

---

### Pre-flight

> **Setup:** Copy the entire `02-context-engineering/.github/` folder into your VoteJam repo's `.github/` folder. That gives you:
> - `.github/copilot-instructions.md` — always-on instructions
> - `.github/skills/backend-api/SKILL.md` — auto-loads for backend work
> - `.github/skills/frontend-ui/SKILL.md` — auto-loads for frontend work

- [ ] VS Code open with VoteJam project loaded
- [ ] GitHub Copilot extension active (check status bar — look for the Copilot icon)
- [ ] Copilot Chat panel open (Ctrl+Alt+I / Cmd+Option+I)
- [ ] `.github/copilot-instructions.md` visible in Explorer sidebar
- [ ] `.github/skills/` folder visible and expanded in Explorer
- [ ] Font size: 18pt+ in both editor and chat panel

---

### Step 1: SHOW the Instructions File (1.5 min)
Open `.github/copilot-instructions.md` in the editor.

**Say:** "This is Layer 1 — the always-on context file. Every Copilot interaction in this repo reads this first. No activation, no prompting needed."

Scroll through and call out:
- **Coding patterns** — "Zod validation, repository pattern, Express error handling"
- **Security rules** — "All mutations require auth. Rate limiting is server-side only."
- **Testing rules** — "Every route gets a test file. Four required scenarios."

**Say:** "Team standards, written once. The AI applies them every time."

---

### Step 2: SHOW Agent Skills (1.5 min)
Open `.github/skills/backend-api/SKILL.md`.

**Say:** "This is Layer 2 — an agent skill. Notice the YAML frontmatter at the top."

Point to the frontmatter:
```yaml
---
name: backend-api
description: >
  Deep backend development patterns for VoteJam's Express/TypeScript API.
  Use when building new API routes, repository methods, middleware, or rate limiting.
  Activates automatically when working on endpoints, handlers, src/routes/...
allowed-tools:
  - read_file
  - write_file
  - run_terminal_command
---
```

**Say:** "Three things to notice. `name` — how it's identified. `description` — this is the trigger. Copilot reads this and decides whether to load the skill based on what you're asking. And `allowed-tools` — these are the tools the agent can use automatically without asking for permission."

**Say:** "The description IS the trigger. Write it like a decision rule, not a label."

---

### Step 3: BUILD — Watch Skills Auto-Load (3 min)
Open Copilot Chat. Type this prompt:

```
@workspace Create a new POST endpoint for voting on songs.
POST /api/v1/songs/:songId/vote with { direction: "up" | "down" }.
- One vote per user per song
- Server-side rate limiting
- Include a test file
```

**While generating, narrate:**
- "No mention of Zod. Watch it appear — instructions file, Layer 1."
- "No mention of `requireAuth` — 'all mutations require auth by default' — instructions again."
- "Rate limiting using `express-rate-limit` — server-side. The backend-api skill loaded that pattern automatically because my prompt matched 'building API routes.'"
- "Test file — four scenarios. That's the instructions + skill working together."

**After generation:**
"Same prompt as Lovable in Demo 1. Completely different output. Not because I prompted differently. Because the context told the AI what 'good' means for this team — before the first word was generated."

---

### Step 4: TRACE THE CONTEXT (1 min)
Open `.github/copilot-instructions.md` side-by-side with the generated code.

**Say:** "Every line in this output is auditable. I can trace each decision back to the file that drove it."

Point to specific lines:
- `requireAuth` ← "All mutations require auth" in instructions
- Zod schema ← "Use Zod for all input validation" in instructions
- Rate limiter setup ← rate limiting pattern from `backend-api` skill
- Test structure ← "Happy path + auth failure + validation failure" in instructions

---

### Step 5: COMPARE with Demo 1 (30 sec)

| | Lovable (Demo 1) | Copilot + Context (Demo 2) |
|---|---|---|
| Auth | UI-only, bypassable | `requireAuth` middleware, server-enforced |
| Rate limiting | Client-side | `express-rate-limit`, per-user |
| Validation | Basic or missing | Zod schema, typed errors |
| Tests | Zero | Full file, 4 scenarios |

"Same prompt. Same AI model under the hood. The context is the entire difference."

---

### Step 6: SLASH COMMANDS — Built-In Power (1 min)
Select a block of generated code in the editor.

**Show quickly:**
- `/explain` — "What does this middleware chain do? Plain English."
- `/tests` — "Generate tests just for this selection."
- `/fix` — "Something's broken — fix it."
- `/doc` — "Document this for the next developer."

**Say:** "These are Layer 3 — built-in, no setup, work on any codebase. Fast actions on selected code."

---

### The Full Picture

```
copilot-instructions.md    ← Always loaded. Team standards.
skills/backend-api/        ← Auto-loads when prompt = backend work
skills/frontend-ui/        ← Auto-loads when prompt = UI work
/explain /fix /tests /doc  ← Built-in. Selection-based. Zero setup.
```

"Three layers. One coherent system. This is context engineering — not prompt engineering."

---

### Backup
If Copilot is slow: open the instructions file + the backend-api skill side-by-side with a pre-written reference implementation. Walk through how each section of each file influenced each section of the generated code. Same teaching moment, no live generation needed.
