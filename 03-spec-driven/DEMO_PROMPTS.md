# Demo 3: Spec-Driven Development — Presenter Notes

## Setup Checklist (Before Demo)

- [ ] VS Code open with Claude Code extension in agent mode
- [ ] Terminal ready in VS Code
- [ ] spec-kit installed: `uv tool install specify-cli --from git+https://github.com/github/spec-kit.git`
- [ ] Project initialized: `specify init votejam --ai claude`
- [ ] Spec file: `specs/voting-feature.spec.md` present and readable
- [ ] Run the pipeline once and save output files as backup
- [ ] GitHub PR pre-created and link ready
- [ ] Know the paths to generated files (implementation, tests, checklist)

## Timeline: 10 minutes

| Time | Activity | Narration |
|------|----------|-----------|
| 0:00-2:00 | Show spec | "60 lines. Everything else is generated." |
| 2:00-5:00 | Run pipeline | Slash commands → tasks → code generation |
| 5:00-7:00 | Show results | Tests pass. Coverage high. Spec checklist complete. |
| 7:00-9:00 | Show PR | Link spec to review. Emphasize "contract not conversation." |
| 9:00-10:00 | A-HA moment | "The spec IS the review." |

---

## Step-by-Step Commands

### STEP 1: SHOW the Spec (0:00-2:00)

**Action:**
```bash
cat specs/voting-feature.spec.md
```
Or open in editor: `specs/voting-feature.spec.md`

**What to Say:**

> "This is a feature spec I wrote. 60 lines. Everything after this — the code, the tests, the implementation strategy — the agent generates it."
>
> "Let me walk you through the structure. First, the interface contract. This is the API boundary — method, request shape, response shape, errors. Non-negotiable."
>
> "Then acceptance criteria. Seven testable conditions. If all seven pass, the feature works. Notice — these are testable. Not 'nice to have.' Not 'should maybe.' These are the definition of done."
>
> "Constraints section — security, performance, dependencies. The agent uses these to validate every line of code."
>
> "Non-goals. Important. What we're NOT building. Prevents scope creep."
>
> "And test scenarios — 10 cases covering happy path and edge cases."
>
> "Now, this spec is the contract. Let me generate code FROM it."

---

### STEP 2: RUN the Pipeline (2:00-5:00)

**Action in VS Code Claude Code agent mode:**

Run each command in sequence. Wait for completion between commands.

```
/constitution
```
> "First, we set project guardrails — architecture rules, naming conventions, what's off-limits. One time setup."

```
/specify
```
> "The agent reads the spec file and captures all requirements. It knows the interface, the criteria, the constraints."

```
/clarify
```
*(optional — use if the spec has any ambiguity)*
> "If anything is unclear, /clarify asks you questions before planning. Prevents surprises."

```
/plan
```
> "Creates the full implementation strategy. Think of it as a blueprint from the spec."

```
/tasks
```
> "Decomposes the plan into atomic, traceable work items. Each task links back to an acceptance criterion."

```
/analyze
```
*(optional — use for complex codebases)*
> "Reads the existing codebase first, so the generated code fits what's already there."

```
/implement
```
> "Now it generates the code AND tests from each task."
>
> "Notice: no 'write me a function.' No 'add auth.' You defined WHAT. The pipeline figures out HOW."

Wait until complete (1-2 minutes).

---

### STEP 3: SHOW Results (5:00-7:00)

**Action:**

Run the checklist command:
```
/speckit.checklist
```

Or manually run:
```
npm test && npx tsc --noEmit && echo "✅ All checks passed"
```

**What to Say:**

> "Here's the output. Seven acceptance criteria. All covered. TypeScript strict mode — zero errors. Tests are passing. Code coverage is high."
>
> "The spec said 'vote must be recorded' — there's a test for that. 'Auth required' — test for that. 'Rate limited' — test for that."
>
> "Everything in the spec has a test. The spec IS the test plan."

Show the generated files (if time):
```
ls -la src/routes/vote.ts src/tests/vote.test.ts
```

---

### STEP 4: SHOW the PR (7:00-9:00)

**Action:**

Open pre-created GitHub PR. Show:
- PR title and description (should link spec)
- Review checklist (auto-generated from acceptance criteria)
- CI status (green checkmarks)

**Link:** (Have URL ready)

**What to Say:**

> "Here's the PR. Notice the description — it links the spec. The review checklist is auto-generated from the acceptance criteria."
>
> "CI is green. TypeScript passed. Tests passed. The spec validated."
>
> "Now, compare this to the Lovable PR from Demo 1. There, we had a long conversation. Here, we have a 60-line contract."
>
> "The reviewer doesn't ask 'why is line 47 written this way?' They ask: 'Does this match the contract?' That's it. That's the review."

---

### STEP 5: A-HA Moment (9:00-10:00)

**What to Say:**

> "Here's the shift. You write the spec once. The agent generates code and tests. The PR links the spec. CI validates against the spec."
>
> "The spec IS the review. Not line-by-line review. Not 'I think this function could be clearer.' The review is: 'Does this satisfy the contract?'"
>
> "And if the agent got it wrong, you fix the spec, not the code. You iterate on the contract, not the implementation."

---

## Backup Plan

If spec-kit fails or times out:

1. **Show pre-run output files:**
   ```
   cat src/routes/vote.ts
   cat src/tests/vote.test.ts
   ```

2. **Walk through the spec manually:**
   - "The spec says 'vote recorded.' Here's the route handler that does that."
   - "The spec says 'auth required.' Here's the middleware check."
   - "The spec says 'one vote per song.' Here's the UNIQUE constraint."

3. **Run tests against pre-generated code:**
   ```
   npm test
   ```

4. **Show the checklist:**
   - Print or display pre-generated checklist output.

---

## Key Talking Points

- **Spec is contract:** Not a document. A contract. The source of truth.
- **Generated not written:** AI generates code FROM spec, not from conversation.
- **Tests are criteria:** Acceptance criteria become tests. Spec is testable.
- **Review is validation:** Reviewers validate spec compliance, not style.
- **Iteration is on spec:** If something's wrong, fix the spec, regenerate code.
- **CI enforces contract:** Pipeline ensures code matches spec.

---

## Time Savers

- Pre-generate output before demo. Have files ready.
- Timing is tight — keep narration concise.
- If audience asks "how did it know to use Repository pattern?" — answer: "Context from Demo 2. The CLAUDE.md file in this project."
- If asked "what if the spec is wrong?" — answer: "Fix the spec, regenerate. Tests catch it fast."
