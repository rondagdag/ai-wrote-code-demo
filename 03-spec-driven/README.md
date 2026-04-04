# Demo 3: Spec-Driven Development with spec-kit
## Contracts, Not Conversations (10 min)

### What You'll Prove
A 60-line spec → 400+ lines of validated code with tests. The spec IS the review checklist.

**spec-kit** (CLI: `specify`) runs as slash commands inside Claude Code agent mode in VS Code.

### Pre-flight
- [ ] VS Code open with Claude Code extension (agent mode)
- [ ] spec-kit installed: `uv tool install specify-cli --from git+https://github.com/github/spec-kit.git`
- [ ] Initialized: `specify init votejam --ai claude`
- [ ] Spec file ready: specs/voting-feature.spec.md
- [ ] Pre-run the pipeline once (backup output ready)

### Step 1: SHOW the Spec (2 min)
Open specs/voting-feature.spec.md

**Say:** "I wrote this. 60 lines. Everything else you're about to see is generated."

Walk through the 5 sections:
1. **Interface Contract** — types, endpoint signature, error responses
2. **Acceptance Criteria** — 7 testable conditions, DB schema
3. **Constraints** — security, performance limits, dependencies
4. **Non-Goals** — what we're NOT building
5. **Test Scenarios** — happy path + 10 edge cases

### Step 2: RUN the Pipeline (3 min)
In Claude Code agent mode, run these slash commands in order:

```
/constitution  → set project guardrails (one-time)
/specify       → agent reads your spec file
/plan          → creates implementation strategy
/tasks         → decomposes into atomic work items
/implement     → generates code + tests
```

Optional: `/clarify` between /specify and /plan if anything is ambiguous. `/analyze` before /implement for complex codebases.

**While running, narrate:**
- "The agent reads the spec and captures every requirement."
- "Each task traces back to an acceptance criterion."
- "Code AND tests generated together. The spec is the test plan."

### Step 3: SHOW Results (2 min)
Run: `/speckit.checklist` (or `npm test && npx tsc --noEmit`)

Show output:
```
✅ 7/7 acceptance criteria covered
✅ TypeScript strict: no errors
✅ Tests: 10/10 passing
✅ Coverage: 94%
```

### Step 4: SHOW the PR (1 min)
Open pre-created GitHub PR.

**Say:** "Spec is linked. Review checklist is auto-generated from acceptance criteria. CI is green. Compare this to the Lovable PR from Demo 1."

### What the Audience Notices
- Spec is the single source of truth
- Every criterion has a corresponding test
- Generated code follows team patterns (from Demo 2's context)
- The PR is reviewable — check 'does this match the contract?' — not line-by-line code review
- CI validates spec compliance automatically

### A-HA Moment
"The spec IS the code review. Reviewers check 'does this match the contract?' — not 'what does line 47 do?'"

### Checkpoint
1. Specs as executable contracts
2. AI generates code FROM specs (not conversations)
3. CI enforces spec compliance
4. Review cost drops dramatically

### Backup
If spec-kit fails: show pre-run output files, walk through the spec manually, explain what the code would look like.
