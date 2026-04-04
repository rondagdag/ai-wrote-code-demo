# Workshop Guide — From Cool Demo to Production Code
## 60-Minute Talk (expandable to 90-min workshop)

---

## Timing Table

| # | Section | Time | Tool | A-Ha Moment |
|---|---------|------|------|-------------|
| — | Opening + Hook + Pain Points | 5 min | Slides | "The AI doesn't know what it doesn't know" |
| — | Context Window + Roadmap | 3 min | Slides | "Same model, different context, different output" |
| 1 | **Demo: Vibe Coding** | 8 min | Lovable | "Fast ≠ shippable" |
| — | Context Eng theory slides | 5 min | Slides | "Context is the multiplier" |
| 2 | **Demo: Context Engineering** | 10 min | VS Code + GitHub Copilot | "Instructions + Skills + Slash Commands = three layers" |
| — | Before/After comparison | 2 min | Slides | Emotional peak of the talk |
| — | Spec-Driven theory slides | 3 min | Slides | "The spec IS the review checklist" |
| 3 | **Demo: Spec-Driven** | 10 min | VS Code + Claude Code | "60-line spec → 400+ validated lines" |
| — | Event-Driven Agents intro | 3 min | Slides | "Agents work async — like a teammate" |
| 4 | **Demo: Copilot Agent** | 3 min | GitHub | "Issue before lunch, PR after lunch" |
| 5 | **Demo: @claude** | 3 min | GitHub | "Reviews PRs while you sleep" |
| — | Playbook + Close | 5 min | Slides | "Match the method to the risk" |
| | **TOTAL** | **60 min** | | |

**Workshop mode (90 min):** Add 15 min hands-on after Demo 1, 15 min after Demo 3.

---

## Presenter Prep Checklist

### Accounts & Access
- [ ] Lovable (lovable.dev) — logged in, project ready
- [ ] VS Code + GitHub Copilot extension — VoteJam loaded, `.github/copilot-instructions.md` in place
- [ ] VS Code + Claude Code extension — spec-kit initialized (`specify init votejam --ai claude`)
- [ ] GitHub repo with VoteJam — both workflow files deployed
- [ ] ANTHROPIC_API_KEY secret set in GitHub repo settings
- [ ] Copilot Business/Enterprise enabled on the repo

### Pre-Stage (Day of Talk)
- [ ] Assign a GitHub issue to Copilot **1 hour before** (Demo 4 pre-made PR)
- [ ] Comment `@claude` on a PR **30 min before** (Demo 5 pre-made response)
- [ ] Pre-run spec-kit pipeline once (backup output for Demo 3)

### Tech Setup
- [ ] Browser tabs ready: Lovable, GitHub issue, GitHub PR
- [ ] VS Code Copilot: VoteJam open, Copilot Chat visible, `.github/copilot-instructions.md` + `.github/skills/` expanded in Explorer
- [ ] VS Code: VoteJam open, Claude Code agent mode, spec file in tab
- [ ] Font size: 18pt+ in ALL tools
- [ ] Backup: screenshots/recordings of each demo saved locally

---

## Demo Checkpoint Map

```
00-starter/              ← Full working project: types, middleware, routes, 14 tests
     ↓
01-vibe-coding/          ← Prompts only (Lovable is browser-based)
     ↓
02-context-engineering/  ← .github/copilot-instructions.md + .github/skills/ (SKILL.md agent skills)
     ↓                     JUMP POINT: start here if Demo 1 was pre-recorded
03-spec-driven/          ← Spec file + CLAUDE.md + Claude Code config
     ↓                     JUMP POINT: start here if Demos 1-2 ran long
04-copilot-agent/        ← Workflow + sample issue + pre-made PR
     ↓
05-claude-github/        ← Workflow + CLAUDE.md + sample comments
```

Each folder is a checkpoint. You can jump to any section.

---

## If Things Go Wrong

| Problem | Fix |
|---------|-----|
| Lovable is down | Show pre-recorded video, keep talking |
| Copilot slow/offline | Open copilot-instructions.md + reference impl side by side, narrate the connections |
| spec-kit fails | Show pre-run output, walk through the spec |
| Copilot agent slow | "It's async — here's one it already finished" → pre-made PR |
| @claude no response | Same — pre-made response ready |
| WiFi dies | All files work offline. Walk through code. |

---

## Three Rules

1. **Never apologize for tools.** If slow, narrate: "This is async. Here's a completed one."
2. **Always hit the a-ha.** Every demo has ONE moment. Land it.
3. **Story > code.** You're teaching a maturity spectrum, not syntax.
