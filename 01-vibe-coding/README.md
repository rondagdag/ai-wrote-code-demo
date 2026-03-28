# Demo 1: Vibe Coding with Lovable
## The Speed Demo (8 min)

### What You'll Show
Paste a prompt → working app in 60 seconds. Then break it.

### Pre-flight
- [ ] Browser open to lovable.dev, logged in
- [ ] Font size: 18pt+

### The WOW Prompt
[paste this into Lovable]

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

**Say:** "Watch. Sixty seconds. Zero planning. Zero code."

### The BREAK Prompt
[paste this after the wow]

```
Add user authentication so only logged-in users can vote,
and rate-limit to 1 vote per user per song.
Connect to a PostgreSQL database for persistence.
```

**Say:** "Now watch what happens when we ask for real features."

### What the Audience Notices
- Auth is UI-only (no real sessions/JWT)
- Rate limiting is client-side (bypassable)
- No tests generated
- Database connection is stubbed
- No error handling patterns

### A-HA Moment
"AI can build fast. But fast doesn't mean shippable. No auth backend, no tests, no persistence. That's the gap we'll close."

### Checkpoint
After this demo, the audience understands:
1. Vibe coding = conversation-driven, zero planning
2. Great for prototypes and exploration
3. Falls apart when you need production concerns
4. Sets up WHY context engineering matters

### Backup
If Lovable is down: show pre-recorded screen capture (have it ready).
