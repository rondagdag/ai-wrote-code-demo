# VoteJam Demo — From Cool Demo to Production Code

**Five approaches to AI-assisted development. One app. One hour.**

Companion repo for the talk: *"From Cool Demo to Production Code"*

---

## Folder Structure

```
demo/
├── 00-starter/              Base project — types, middleware, routes, 14 tests
├── 01-vibe-coding/          Lovable: UI in 60 seconds, then break it
├── 02-context-engineering/  GitHub Copilot: copilot-instructions.md = better output
├── 03-spec-driven/          spec-kit + Claude Code: specs as contracts
├── 04-copilot-agent/        GitHub Copilot: issue → PR, no human needed
├── 05-claude-github/        @claude: code review via PR mentions
├── WORKSHOP_GUIDE.md        Master timing, prep checklist, troubleshooting
└── README.md                This file
```

## Learning Path

```
Starter → Vibe → Context → Spec-Driven → Copilot Agent → @claude
```

Each step adds rigor, structure, and autonomy.

---

## The Five Demos

**Demo 1: Vibe Coding** — Paste a prompt into Lovable. Working app in 60 seconds. Then ask for auth + database and watch it fall apart. *A-ha: fast ≠ shippable.*

**Demo 2: Context Engineering** — Same prompt in GitHub Copilot with `.github/copilot-instructions.md` loaded. Auth, tests, and team patterns appear automatically. *A-ha: same prompt + structured context = dramatically better output.*

**Demo 3: Spec-Driven** — Write a 60-line spec. Run spec-kit slash commands in Claude Code (VS Code). 400+ lines of validated code with tests. *A-ha: the spec IS the review checklist.*

**Demo 4: Copilot Agent** — Create a GitHub issue. Assign it to Copilot. It branches, codes, tests, and opens a draft PR. *A-ha: issue before lunch, PR after lunch.*

**Demo 5: @claude** — Comment `@claude` on a PR. Claude analyzes the diff, catches security issues, suggests tests. *A-ha: code review that never sleeps.*

---

## Decision Matrix

| | Vibe | Context Eng | Spec-Driven | Event-Driven Agents |
|---|---|---|---|---|
| **Speed** | Minutes | Hours | Hours | Hours (async) |
| **Consistency** | Low | High | Highest | High + guardrails |
| **Best For** | Prototypes | Feature dev | Production | Workflow automation |
| **Key Artifact** | Prompt | copilot-instructions.md | Spec file | Workflows + issues |

**Rule of thumb:** Match the method to the risk.

---

## Three Takeaways

1. **Match the method to the risk.** Vibe for exploration, context for delivery, specs for production, agents for automation.
2. **Context is the multiplier.** Same AI + better context = dramatically better output.
3. **Let agents work while you sleep.** Define boundaries, deploy agents, review results.

---

## Resources

- [Lovable](https://lovable.dev) — Vibe coding
- [GitHub Copilot](https://github.com/features/copilot) — Context engineering
- [spec-kit](https://github.com/github/spec-kit) — Spec-driven development
- [GitHub Copilot Coding Agent](https://github.com/features/copilot) — Copilot coding agent
- [Claude Code GitHub Actions](https://github.com/anthropics/claude-code-action) — @claude in GitHub

---

**Speaker:** Ron Dagdag
