# Demo 5: @claude in GitHub — Step-by-Step Script

## Pre-Demo Setup (Do 30 min before talk)

### Checklist
- [ ] .github/workflows/claude.yml is pushed to main
- [ ] ANTHROPIC_API_KEY secret is set in repo settings (Settings → Secrets and variables → Actions)
- [ ] CLAUDE.md is in repo root with project context
- [ ] Create a sample PR with a deliberate issue (missing validation, hardcoded value, or unfinished test)
- [ ] Add a comment to the PR: `@claude Review this PR for security issues and suggest improvements.`
- [ ] Wait 1-2 minutes for Claude to respond
- [ ] Note the PR URL and Claude's response
- [ ] Keep browser tabs open: PR with comment + Claude's response

### Claude.md Content
Make sure CLAUDE.md provides clear context:
- Project name and purpose
- Tech stack
- Coding patterns you use
- Security standards
- Testing expectations

---

## During the Talk (3 min total)

### Segment 1: Show the Setup (30 sec)
**Click path**: GitHub Repo → Code → .github/workflows/claude.yml

**Say**:
"Here's the entire Claude setup. Two pieces: a workflow file and an API key secret. That's it. The workflow listens for @claude mentions anywhere on the repo—issues, PRs, comments. When it sees your message, it spins up Claude to analyze your code."

**Pause 3 sec** for audience to look at the workflow file.

---

### Segment 2: Trigger Claude (1 min)
**Click path**: GitHub Repo → Pull Requests → [Your sample PR]

**Say**:
"Let me show you a real PR. Notice it has a subtle issue—maybe missing validation or a hardcoded value. Watch what happens when I ask Claude for a review."

**Action**: Scroll to comment section. Show the comment: `@claude Review this PR for security issues and suggest improvements.`

**Say**:
"I've already added this comment. Claude's running now, analyzing the diff and checking it against our CLAUDE.md standards. This takes 1-2 minutes. But I don't want to stare at a loading spinner, so let me jump to one Claude already reviewed."

**Pause 2 sec**.

"Switch to the response."

---

### Segment 3: Walk Through Claude's Response (1.5 min)
**Click path**: [Open pre-made PR tab with Claude's response]

**Say**:
"Here's Claude's response. Let me highlight the key parts."

**Action 1 — Show the security catch**:
Point to where Claude identified a missing input validation or hardcoded secret.
"Claude caught a security issue we might have missed. It explains why it's risky and what to do instead."

**Action 2 — Show inline suggestions**:
Point to code snippets Claude suggested.
"These are concrete suggestions with code. Claude even explains the reasoning. And here's the key: it's all in the PR thread. Reviewers can read context and discussion in one place."

**Action 3 — Show test suggestion**:
Point to where Claude suggested adding a test case.
"Claude also spotted missing test coverage and suggested what to add. Not just 'add tests'—actual test code we can use."

**Say**:
"All of this is logged in the PR. Nothing gets lost. You can search it later. You can use it to onboard new team members. It's auditable and searchable."

---

### Segment 4: A-HA Moment (20 sec)
**Say**:
"Here's why this matters: Your team reviews PRs during business hours. Claude reviews them at 3 AM. On weekends. While you're in meetings. By the time you wake up, there's already thoughtful feedback in your PRs. That's async, continuous code review without hiring a night shift."

**Pause 2 sec**.

"And because Claude is stateless, it doesn't get tired or distracted. Same rigor every time. Every PR gets reviewed against your standards."

---

## Sample PR with Deliberate Issues

When creating the sample PR for demo, include ONE of these issues:

### Option A: Missing Input Validation
```typescript
app.get('/api/v1/songs/search', (req, res) => {
  const { q } = req.query;
  // Missing: check if q is empty string
  const results = db.songs.filter(song =>
    song.title.includes(q) || song.artist.includes(q)
  );
  res.json(results);
});
```

Claude will suggest: Add validation with Zod, return 400 if q is missing or empty.

### Option B: Hardcoded Admin Token
```typescript
const adminToken = 'secret-token-12345'; // Hardcoded! Bad!

app.post('/api/admin/stats', (req, res) => {
  if (req.headers.authorization !== `Bearer ${adminToken}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // ...
});
```

Claude will suggest: Move to environment variables, never hardcode secrets.

### Option C: Incomplete Test Coverage
```typescript
describe('POST /api/v1/songs', () => {
  test('creates a song with valid data', async () => {
    const res = await request(app)
      .post('/api/v1/songs')
      .send({ title: 'Bohemian Rhapsody', artist: 'Queen' });
    expect(res.status).toBe(201);
  });
  // Missing: test invalid data, test missing fields, test duplicate prevention
});
```

Claude will suggest: Add tests for validation errors, edge cases, and business rules.

---

## Sample Comments to Use

### Comment 1 (Security Review)
```
@claude Review this PR for security issues and suggest improvements.
```

### Comment 2 (Specific Request)
```
@claude This endpoint is missing rate limiting. Can you suggest how to add it?
```

### Comment 3 (Explanation Request)
```
@claude Explain what this function does and suggest better naming. Does it follow our patterns?
```

---

## If Claude is Slow (Backup Plan)

If Claude hasn't responded by talk time:

**Say**:
"Claude's working on that review now. I triggered it earlier, so let me show you one it already completed." → Switch to pre-made response tab.

This keeps momentum. The audience sees the magic with a pre-made example. Real-time is nice, but reliable is better for a demo.

---

## Talking Points for Q&A

**"Does Claude always catch all the issues?"**
"No. It's a tool, not a replacement for humans. The magic is that it catches common patterns and tedious stuff so your reviewers can focus on architecture and business logic."

**"Can it auto-commit fixes?"**
"Yes. If you set the workflow to write permissions and ask Claude to 'fix this security issue,' it can commit directly. We don't do that here because we want humans to review first."

**"What if Claude misunderstands?"**
"Same as a junior dev. You can reply in the PR thread and Claude will see the context in future reviews. You can also improve CLAUDE.md to clarify standards."

**"Is it expensive?"**
"Claude API costs roughly $0.01 per PR review (depends on PR size). That's cheaper than paying for a human reviewer, and it never gets tired."

**"Does it work in private repos?"**
"Yes. As long as the repo has the secret set, Claude has access."
