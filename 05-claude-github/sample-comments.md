# Sample @claude Comments for Demo 5

Use these as templates when testing or demoing. Copy-paste into PR comments on GitHub.

---

## Sample Comment 1: General Security Review

```
@claude Review this PR for security issues and suggest improvements.
```

**Use case**: First-time Claude review. It'll analyze the diff, check for common security problems, and suggest fixes.

**Expected response**: Claude identifies:
- Hardcoded secrets
- Missing input validation
- Unprotected endpoints
- SQL injection risks

---

## Sample Comment 2: Specific Feature Request

```
@claude This endpoint is missing rate limiting. Can you suggest how to add it using express-rate-limit?
```

**Use case**: Ask Claude about a specific missing feature. It'll provide code examples and integration advice.

**Expected response**: Claude provides:
- Example rate limit middleware
- Where to apply it in the router
- Configuration options

---

## Sample Comment 3: Code Review + Naming Feedback

```
@claude Explain what this function does and suggest better naming. Does it follow our patterns from CLAUDE.md?
```

**Use case**: Ask Claude to review a specific function and check it against your standards.

**Expected response**: Claude provides:
- Clear explanation of function behavior
- Naming suggestions
- Feedback on whether it matches your patterns
- Suggestions for improvement

---

## Sample Comment 4: Test Coverage Request

```
@claude The new endpoint is missing tests. Can you suggest what test cases should be added?
```

**Use case**: Ask Claude to help with test coverage.

**Expected response**: Claude suggests:
- Happy path test (valid input)
- Validation error test (invalid input)
- Auth test (missing or invalid token)
- Edge cases (empty query, special characters, etc.)

---

## Sample Comment 5: Explanation / Learning

```
@claude Can you explain how this authentication middleware works? Is there a better way to implement it?
```

**Use case**: Learn from Claude. Useful for onboarding or reviewing unfamiliar code.

**Expected response**: Claude explains:
- How the middleware works step-by-step
- Why it's implemented that way
- Potential improvements
- Links to best practices

---

## Sample Comment 6: Refactoring Suggestion

```
@claude This route handler is getting long. Can you suggest how to refactor it into smaller functions?
```

**Use case**: Ask Claude to help with code organization.

**Expected response**: Claude provides:
- Identified "fat" sections
- Suggested function extraction
- Example refactored code
- Benefits of the refactoring

---

## How to Use in Demo

1. **Pre-demo**: Create a PR with a deliberate issue (missing validation, hardcoded secret, incomplete tests)
2. **Add a comment**: Use one of the above templates
3. **Wait 1-2 minutes**: Claude processes the comment
4. **Show the response**: Point out the analysis and suggestions

If Claude responds while you're demoing, great—you can show live. If not, have a pre-recorded response ready.

---

## Response Time Expectations

| Comment Complexity | Time |
| --- | --- |
| Simple (e.g., "Review this") | 30-60 sec |
| Moderate (e.g., "Add rate limiting") | 60-90 sec |
| Complex (e.g., "Refactor this") | 90-120 sec |

Network latency and PR size may vary. If it's taking longer than 2 min, show a pre-recorded response and mention "Claude's working async in the background."
