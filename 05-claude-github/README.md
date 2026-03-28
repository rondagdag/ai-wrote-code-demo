# Demo 5: @claude in GitHub
## AI Code Review That Never Sleeps (3 min)

### What You'll Show
Comment @claude on a PR. Claude analyzes, suggests improvements, or auto-commits fixes.

### Pre-flight
- [ ] GitHub repo with claude.yml workflow deployed
- [ ] ANTHROPIC_API_KEY secret set in repo settings
- [ ] CLAUDE.md in repo root
- [ ] Pre-made @claude response ready (triggered 30 min before talk)
- [ ] Browser tabs: PR page with @claude comment + response

### Demo Flow

**SHOW** (30 sec): Open .github/workflows/claude.yml
"Two things: this workflow file + an API key secret. That's the entire setup."

**TRIGGER** (1 min): Open a PR. Add comment: `@claude Review this PR for security issues and suggest improvements.`
"Claude will analyze the diff, check against CLAUDE.md standards, and respond."
"This takes 1-2 minutes. Let me show you one it already answered."

**WALK THROUGH** (1.5 min): Open pre-made @claude response.
- Show the analysis (inline code suggestions)
- Show it caught a security issue
- Show it suggested a test case
- "All in the PR thread. No context switching."

### A-HA Moment
"Your teammate reviews PRs and answers questions while you sleep. And it's auditable — everything's in the PR thread."

### Backup
If Claude is slow: "Here's one it already reviewed." → pre-made response screenshot.
