# Demo 2: GitHub Copilot Context Engineering — Presenter Notes

## Setup Checklist (Before Talk)

- [ ] VS Code open with VoteJam project
- [ ] GitHub Copilot extension active (green icon in status bar)
- [ ] Copilot Chat panel open (Ctrl+Alt+I / Cmd+Option+I)
- [ ] `.github/copilot-instructions.md` visible in Explorer sidebar
- [ ] Project in clean state (no pending changes)
- [ ] Font size: 18pt+ in editor AND chat panel
- [ ] Screen recording ready (backup)
- [ ] Lovable output from Demo 1 visible in a separate tab (for compare)

---

## Segment 1: Show the Context File (1.5 min)

### What You'll Do
1. Click `.github/copilot-instructions.md` in Explorer
2. Open it in the editor — full screen
3. Slowly scroll through, calling out key sections

### What You'll Say

**Opening:**
"This is the single file that transforms GitHub Copilot from a generic AI into a team-aware AI. It's called `copilot-instructions.md` and it lives in the `.github/` folder of your repo."

**While showing the coding patterns section:**
"This section documents how WE write Express routes. Zod for validation, the repository pattern, how we structure error handling with AppError. When Copilot generates anything in this repo, it reads this first."

**While showing security rules:**
"Here's the part that matters for production code. 'All endpoints require `requireAuth` middleware by default.' 'Never use string concatenation in SQL — always parameterized queries.' 'Rate limiting is server-side only.' These are non-negotiables we've written ONCE, and now the AI follows them every time."

**While showing testing rules:**
"Testing rules. 'Every route file gets a matching test file. Minimum scenarios: happy path, authentication failure, validation failure, business logic failure.' The AI knows what good coverage looks like for us specifically."

**Closing Segment 1:**
"This is the onboarding packet for the AI. Human developers get a README. The AI gets this. Same idea."

---

## Segment 2: Build with Context (3 min)

### What You'll Do
1. Click into Copilot Chat panel
2. Type (or paste) the BUILD PROMPT below
3. Let Copilot generate — narrate in real time
4. After generation, point to the key outputs

### Build Prompt
Copy and paste exactly:

```
@workspace Create a new POST endpoint for voting on songs.
POST /api/v1/songs/:songId/vote with { direction: "up" | "down" }.
- One vote per user per song
- Server-side rate limiting
- Include a test file
```

### What to Narrate (As Code Generates)

**At the start:**
"Same prompt as we threw at Lovable in Demo 1. Let's watch what happens with context."

**When Zod schema appears:**
"Zod validation. I never mentioned Zod. The instructions file says 'use Zod for all input validation.' Copilot read that and applied it automatically."

**When `requireAuth` middleware appears:**
"`requireAuth` middleware — not in my prompt. The instructions say 'all endpoints require auth by default.' The AI followed a rule I wrote once."

**When rate limiting logic appears:**
"Server-side rate limiting using express-rate-limit. Not the client-side approach Lovable took. This is per-user enforcement — bypassable on the client, not here."

**When test file appears:**
"Test file alongside the implementation. Happy path, auth failure, validation failure, conflict detection. The instructions said exactly what coverage to include. The AI delivered it."

**After generation completes:**
"Same prompt. Completely different output. Not because I asked differently. Because the context told the AI what 'good' means for this team."

---

## Segment 3: Compare with Demo 1 (1 min)

### What You'll Do
- Switch to the Lovable tab (or show a screenshot of Demo 1 output)
- Point at the Copilot output side by side

### What to Say

"Let me put these side by side.

**Auth:** Lovable — none, or client-side only. Copilot — `requireAuth` middleware, server-enforced.

**Validation:** Lovable — basic or missing. Copilot — Zod schema with typed error messages.

**Rate limiting:** Lovable — client-side at best. Copilot — express-rate-limit, server-side, per-user.

**Tests:** Lovable — zero. Copilot — full test file, four scenarios.

Same prompt. Same AI model under the hood. One had a `.github/copilot-instructions.md`. One didn't. That file is the entire difference."

---

## Segment 4: Trace the Context (1 min)

### What You'll Do
1. Split the editor: instructions file on the left, generated code on the right
2. Point to specific lines in each, connecting them

### What to Say

"Here's the accountability layer — and this is what I love about this approach."

(Point from instructions to code)

"Line 12 in instructions: 'Use Zod for all input validation.' → Line 8 in generated code: the Zod schema."

"Line 18: 'All endpoints require `requireAuth`.' → Line 3 of the route: `router.post('/:songId/vote', requireAuth, ...)`"

"Line 24: 'Every route gets a test file with happy path, auth failure, and validation failure.' → Three test cases in the test file."

"I can audit every AI decision. I can trace every generated line back to a decision my team made. This isn't a black box — it's a transparent system where the instructions are the contract."

---

## Segment 5: Checkpoint — The Teaching Moment (1 min)

### What to Say

"Here's what you learned:

1. **Context engineering is not prompting better.** It's structuring what you already know into a file the AI can always access. One file. Every interaction.

2. **`.github/copilot-instructions.md` is your team's AI onboarding packet.** Write it once. Every developer on your team now gets the same AI behavior. No drift. No inconsistency.

3. **`@workspace` + instructions = codebase awareness.** Copilot sees your patterns AND your rules. Output improves with every file you add.

4. **The pattern is tool-agnostic.** CLAUDE.md in Claude Code, .cursorrules in Cursor, copilot-instructions.md here. Different names, same idea: structured context beats clever prompts every time.

5. **Output quality scales with context quality.** Lovable had no context. Copilot had a well-structured instructions file. The code quality difference you saw is proportional to that context gap."

---

## Backup Plan (If Copilot is Slow or Fails)

1. **Manual walkthrough mode:** Open the instructions file + a pre-written reference implementation side by side
2. **Narrate the connection:** "Here's what I'd expect Copilot to generate. Let me show you why — this rule in the instructions maps to this line in the output."
3. **Point to instructions → code:** Walk through 3-4 specific connections. The teaching moment is the same.
4. **Conclude:** "The instructions drove every decision. Whether generation is live or I'm showing you the expected output — the context is the multiplier."

---

## Timing

| Segment | Duration |
|---|---|
| Segment 1 — Show Context File | 1.5 min |
| Segment 2 — Build | 3 min (1 min setup + 2 min narration) |
| Segment 3 — Compare | 1 min |
| Segment 4 — Trace | 1 min |
| Segment 5 — Checkpoint | 1 min |
| **Total** | **~7.5 min (2.5 min buffer)** |

---

## Key Phrases to Repeat

- "Same prompt, completely different output"
- "Context is the multiplier"
- "Not prompting better — structuring what you know"
- "Write the instructions once, every session benefits"
- "I can trace every line back to a decision in the instructions file"
- "Tool-agnostic — same idea in Claude Code, Cursor, or Copilot"

---

## Common Questions (Be Ready)

**Q: "Does this file need to be in `.github/`?"**
A: "For GitHub Copilot, yes — `.github/copilot-instructions.md` is the supported path. Claude Code uses `CLAUDE.md`. Cursor uses `.cursorrules`. Same concept, different filename."

**Q: "How long should the instructions file be?"**
A: "Start lean — 50 to 100 lines. The most valuable sections are: coding patterns (what your team uses), security non-negotiables, and testing standards. Add golden examples when you can."

**Q: "Do I need to update it?"**
A: "Yes, as your standards evolve. But it's one pull request to update the file, and every AI session immediately gets the new standards. Much faster than updating a wiki that humans ignore."

**Q: "What if my team doesn't agree on standards?"**
A: "Writing the instructions file is actually the forcing function for HAVING that conversation. Teams that write the file discover the disagreements and resolve them. The AI just makes the lack of standards visible."

**Q: "Can I have multiple instruction files?"**
A: "GitHub Copilot currently reads one primary instructions file, but you can attach additional context with `#file` references in the chat. For structured projects, split by domain and reference the right file per task."
