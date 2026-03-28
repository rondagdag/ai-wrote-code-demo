# Demo 2: Antigravity Demo Prompts & Presenter Notes

## Setup Checklist (Before Talk)

- [ ] Antigravity IDE open with VoteJam project
- [ ] Backend skill enabled in Skills panel
- [ ] Frontend skill enabled in Skills panel
- [ ] coding-standards.ki.md loaded in Knowledge panel
- [ ] api-patterns.ki.md loaded in Knowledge panel
- [ ] Project clean state (no pending changes)
- [ ] Font size: 18pt+
- [ ] Screen recording ready (backup)

---

## Segment 1: Show Context Loading (1.5 min)

### What You'll Do
1. Open Skills panel (left sidebar)
2. Click `backend-skill/SKILL.md`
3. Scroll to show route handler pattern and repository pattern
4. Then click Knowledge Items panel
5. Click `coding-standards.ki.md`
6. Scroll to show naming conventions and security rules

### What You'll Say

**Opening:**
"This is Google Antigravity. It loads context in two layers. First: Skills — these are capability packages that activate automatically based on where you're working in the code."

**While showing backend-skill:**
"In this Skill, I've documented the patterns the team uses for Express routes. Zod validation schemas, how to structure error handling with AppError, parameterized queries for safety, and testing rules. When the agent works anywhere in `src/routes/` or `src/repositories/`, this loads automatically. No prompt engineering. No manual activation. It's just there."

**While showing coding-standards.ki.md:**
"And this is a Knowledge Item — team memory that survives restarts. Naming conventions, TypeScript strictness, security non-negotiables like 'never string concatenation in SQL' and 'all endpoints require auth by default.' This lives in the system. Every session, this context is available."

**Closing Segment 1:**
"The magic isn't in asking better. It's in structuring what you already know as reusable context."

---

## Segment 2: Build with Context (3 min)

### What You'll Do
1. Click into the IDE code editor
2. Navigate to `src/routes/` (or create a new route file)
3. Paste the BUILD PROMPT (below)
4. Let Antigravity generate the code
5. Narrate what happens in real-time

### Build Prompt
Copy and paste exactly:

```
Create a new POST endpoint for voting on songs.
POST /api/v1/songs/:songId/vote with { direction: "up" | "down" }.
- One vote per user per song
- Server-side rate limiting
- Include a test file
```

### What to Narrate (As Code Generates)

**At the start:**
"Same prompt as we threw at Lovable in Demo 1. Simple request. Let's see what happens."

**When Zod schema appears:**
"Watch — Zod validation. I never mentioned Zod in my prompt. The backend-skill loaded it automatically. The agent knows this team validates input with Zod."

**When requireAuth middleware appears:**
"See `requireAuth` middleware on the route? Not in my prompt. That came from api-patterns.ki.md. 'All endpoints require auth by default' — that's stored team knowledge."

**When rate limiting logic appears:**
"Server-side rate limiting. Not client-side. The Skill showed the pattern. Express-rate-limit middleware, per-user enforcement. This is production-ready, not prototype code."

**When test file appears:**
"Tests too. From the testing rules in the Skill. Happy path, auth failure, validation failure, business logic failure. The agent knows what good coverage looks like."

**After generation completes:**
"Same conversation. Completely different output. Not because I asked better. Because the context told the agent what 'good' means for this team."

---

## Segment 3: Compare with Demo 1 (1 min)

### What You'll Do
- Keep the generated code on screen
- Point to specific lines while talking

### What to Say

"Let me point out what's different from the Lovable demo:

**Line 1:** `requireAuth` middleware. Lovable couldn't add this. No backend, no session model.

**Lines 5-8:** Zod schema validation. Lovable would have left input unvalidated.

**Lines 25-30:** Server-side rate limiting. Not bypassable. Lovable put this in the frontend.

**End of file:** Test suite. Happy path, auth failure, validation failure, conflict detection. Lovable generated zero tests.

Same prompt. Five-minute conversation vs. five-minute explanation of what's missing. That's context."

---

## Segment 4: Show Artifacts / Reasoning (1 min)

### What You'll Do
1. Click the Artifacts panel (usually bottom-left)
2. Scroll through the log to show decision points

### What to Say

"The agent logged its thinking. Here's what it decided:

- 'Backend-skill shows requireAuth pattern, apply it'
- 'API patterns KI specifies rate limiting, use express-rate-limit'
- 'Testing rules say three test cases minimum, write four'
- 'Coding standards say parameterized queries only, confirm in repo method'

You can see every decision. You're not trusting a black box. You're reading the agent's reasoning."

---

## Segment 5: Checkpoint — The Teaching Moment (1 min)

### What to Say (Key Takeaway)

"Here's what you learned:

1. **Context engineering is not prompting better.** It's structuring what you know. Skills package patterns. KIs store team memory.

2. **Skills are reusable.** This backend-skill works in any Express/TypeScript project. You write it once. It works forever.

3. **Knowledge Items persist.** This coding-standards.ki survives restarts. New team members, new sessions, same standards.

4. **The pattern is tool-agnostic.** This works in Cursor. This works in Claude Code. This works in Copilot. The difference is context, not tool.

5. **Output scales with context.** Lovable had zero context. Antigravity had two Skills and two KIs. Compare the code quality. That's why we're teaching this."

---

## Backup Plan (If Antigravity Lags or Fails)

If the generation is slow or times out:

1. **Switch to manual walkthrough:** Open `src/routes/songs.ts` (a pre-written reference implementation)
2. **Narrate the code:** "Here's what I'd expect Antigravity to generate. Let me walk you through it."
3. **Point to Skills/KIs:** "These patterns came from here [click backend-skill]. These rules came from here [click coding-standards.ki]."
4. **Conclude:** "The output should look like this. The context enabled it. Even if generation is slow, the context works."

---

## Timing

- Segment 1 (Show Context): 1.5 min
- Segment 2 (Build): 3 min (1 min setup + 2 min narration while generating)
- Segment 3 (Compare): 1 min
- Segment 4 (Artifacts): 1 min
- Segment 5 (Checkpoint): 1 min
- **Total: ~7.5 min (leaves 2.5 min buffer in the 10 min slot)**

---

## Key Phrases to Repeat

- "Same prompt, completely different output"
- "Context is the multiplier"
- "Not prompting better. Structuring what you know"
- "This survives restarts"
- "This works in any tool"
- "That came from the Skill" / "That came from the KI"

---

## Common Questions (Be Ready)

**Q: "Can I use Skills outside VoteJam?"**
A: "Yes. They're patterns, not code. Package patterns from your own projects as Skills. They work anywhere."

**Q: "Do I need to maintain these?"**
A: "Yes. As your standards evolve, update the Skills and KIs. That's one prompt per update, not a hundred emails."

**Q: "What if my AI tool doesn't support Skills?"**
A: "Then paste the Skills and KIs as context. Manually. Same result, different workflow."

**Q: "How do I get started?"**
A: "Pick one pattern from your codebase. Write it as a Skill. Test with one prompt. Iterate. You don't need perfect — you need consistent."
