# Demo 1: Vibe Coding — Presenter Notes

## Setup Checklist (Before Talk)

- [ ] Browser open to lovable.dev — logged in, blank project ready
- [ ] Font size: 18pt+ in browser
- [ ] Screen recording queued as backup (in case Lovable is down)
- [ ] Copy the WOW PROMPT and BREAK PROMPT below into a notes app so you can paste fast

---

## Timeline: 8 minutes

| Time | Activity | What You Say |
|------|----------|-------------|
| 0:00-0:30 | Setup / frame the demo | "Watch. Sixty seconds. Zero planning." |
| 0:30-1:30 | Paste WOW PROMPT, wait | Narrate as it builds |
| 1:30-3:00 | Walk through the output | "Working app. But look closer." |
| 3:00-4:00 | Paste BREAK PROMPT | "Now let's ask for real features." |
| 4:00-6:00 | Wait for result, point out gaps | "Auth is UI-only. Rate limit is client-side." |
| 6:00-8:00 | A-HA moment + bridge to Demo 2 | "Fast ≠ shippable. Here's why." |

---

## Step 1: The WOW (0:30–3:00)

### Copy-paste this prompt into Lovable:

```
Build me a party playlist voting app called "VoteJam":
- Fun, colorful UI with a music/party theme
- Text input to submit song name + artist
- List of songs ranked by votes
- Upvote/downvote buttons on each song
- Simple name entry for who submitted
- Confetti animation when a song gets 10+ votes
Make it fun with gradients and emoji.
```

### What to Say (while it generates):

> "Watch. Sixty seconds. Zero planning. Zero code from me."

**While waiting:**
> "This is vibe coding. Prompt-driven. Conversational. It's reading my prompt and generating a full working UI right now."

**When it appears:**
> "There it is. Working app. Click the upvote button — it works. Submit a song — it appears. Confetti animation — it fires. This took less time than it took me to describe it."

**Then — look closer:**
> "But here's the question. Would you ship this? Let me stress test it."

---

## Step 2: The BREAK (3:00–6:00)

### Copy-paste this prompt:

```
Add user authentication so only logged-in users can vote,
and rate-limit to 1 vote per user per song.
Connect to a PostgreSQL database for persistence.
```

### What to Say (as it "adds" features):

> "Now we're asking for production concerns. Real auth. Server-side rate limiting. A real database."

**When it finishes — point to the gaps:**

> "Here's what we got:"

Point to each:
- **Auth**: "There's a login form. But the token validation? It's checking a string client-side. Anyone who reads the source can bypass it."
- **Rate limiting**: "One vote per user per song — but it's tracked in the browser's local memory. Refresh the page? Vote again. That's client-side enforcement. Easy to bypass."
- **Database**: "The PostgreSQL connection? Stubbed out. Data resets every refresh. Nothing is actually persisting."
- **Tests**: "Zero. Not one test generated."

---

## A-HA Moment (6:00–8:00)

### What to Say:

> "This is the vibe coding trap. The app looks finished. It's demo-able. Your PM would see this and say 'ship it.' But there's no real auth backend, no server-side enforcement, no persistence, and no tests."

> "AI built it fast. Fast doesn't mean shippable."

> "Now here's what changes when you give the AI context about what 'good' means for your team."

**Bridge to Demo 2:**
> "Same prompt. Same AI. One difference — we're going to tell it our standards before it writes a single line."

---

## What the Audience Should Walk Away With

1. Vibe coding is genuinely magical for prototypes and exploration
2. The gap between "demo-able" and "shippable" is invisible in the output — you have to know to look
3. Auth, rate limiting, persistence, and testing require explicit, structured context
4. Sets up the core question for the whole talk: *what does the AI need to know to produce code your team can own?*

---

## Backup Plan

If Lovable is down or slow:

> "Lovable's not cooperating — which is actually perfect for a talk about AI reliability. Here's a screen recording I made this morning."

Play the backup recording. The teaching moment is identical.

**Key backup lines:**
- "I ran this before the talk. Same prompts, same output."
- "The gaps I'm about to show you are in every Lovable-generated app that doesn't get structured context."
