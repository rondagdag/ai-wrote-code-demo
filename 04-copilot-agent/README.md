# Demo 4: GitHub Copilot Coding Agent
## Issue → PR, No Human in the Loop (3 min)

### What You'll Show
Assign a GitHub issue to Copilot. It branches, codes, tests, and opens a draft PR autonomously.

### Pre-flight
- [ ] GitHub repo with VoteJam, copilot-setup-steps.yml deployed
- [ ] Copilot Business/Enterprise enabled
- [ ] Pre-made issue ready (search endpoint)
- [ ] Pre-made Copilot PR ready (assigned 1hr before talk)
- [ ] Browser tabs: issue page + PR page

### Demo Flow

**SHOW** (30 sec): Open .github/workflows/copilot-setup-steps.yml
"This is all Copilot needs. Node setup, install, type-check. One file."

**TRIGGER** (1 min): Open a GitHub issue. Click Assignees → Copilot.
"One click. The agent is working. It'll read the codebase, plan, implement, and open a PR."
"This takes 5-10 minutes normally. Let me show you one it already finished."

**WALK THROUGH** (1.5 min): Open pre-made PR.
- Show the branch name (copilot created it)
- Show the code changes (follows repo patterns)
- Show the PR description (links to issue)
- Show CI status (tests pass)

### A-HA Moment
"You assigned an issue before lunch. By the time you're back, there's a draft PR waiting. That's async AI — like a teammate."

### Backup
If Copilot is slow: "It's working async. Here's one it already finished." → pre-made PR.
