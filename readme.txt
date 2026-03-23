# Scout — AI-Powered Playwright Test Generator
### Claude Code Prompt + Setup Instructions

---

## What is this?

**Scout** is a CLI tool you build with Claude Code that:
1. Takes any website URL as input
2. Crawls it with a real browser (Playwright/Chromium)
3. Sends the crawl results to an LLM via OpenRouter
4. Outputs a human-readable test plan + a ready-to-run Playwright `.spec.ts` file

No specs. No team knowledge. No prior access to the site. Just a URL.

---

## Prerequisites

- Node.js 18+
- Claude Code installed (`npm install -g @anthropic-ai/claude-code`)
- An [OpenRouter](https://openrouter.ai) API key (`OPENROUTER_API_KEY`)

---

## How to use this file

1. Open your terminal
2. Run: `claude`
3. Paste the entire prompt below (everything inside the prompt block)
4. When asked about API keys, say: use `OPENROUTER_API_KEY` as an environment variable
5. Let Claude Code build the project
6. Run: `npx scout https://your-website.com`

---

## The Prompt (paste this into Claude Code)

```
I want to build a CLI tool called `scout` that automatically generates Playwright test suites for any website URL — no specs, no prior knowledge of the site required.

## What it does

1. Accept a URL as input (CLI argument)
2. Use Playwright to crawl the site as a real browser would:
   - Visit the URL
   - Map all navigation links, forms, buttons, modals, CTAs
   - Follow internal links up to 2 levels deep
   - Screenshot key pages
   - Detect interactive elements (forms, dropdowns, accordions, carousels)
3. Feed the crawl output to an LLM via OpenRouter with a prompt that says: "You are a QA engineer. Based on this site map and element inventory, write a comprehensive Playwright test suite that tests what a real user would expect to work."
4. Output two files:
   - `test-plan.md` — human-readable list of all test cases with rationale
   - `tests/generated.spec.ts` — ready-to-run Playwright TypeScript test file

## Tech stack
- Node.js + TypeScript
- Playwright (for crawling AND as the test framework in output)
- OpenRouter API (fetch-based, no SDK needed)
- Commander.js for CLI

## CLI usage
```
npx scout https://example.com
npx scout https://example.com --model google/gemini-2.5-pro
```

## Crawl strategy
- Use Playwright in headless mode with a real Chromium browser
- Respect a 10 second timeout per page
- Collect for each page:
  - Page title and URL
  - All <a> href values (internal only)
  - All <form> elements with their fields, types, labels, and action
  - All <button> and <input type="submit"> text
  - Any elements with role="dialog", role="navigation", role="search"
  - H1 and H2 headings
- Store crawl output as structured JSON

## LLM call strategy
- All LLM calls go through OpenRouter: https://openrouter.ai/api/v1/chat/completions
- Use the OpenAI-compatible chat completions format
- Default model: anthropic/claude-sonnet-4 (overridable via --model flag)
- Auth: OPENROUTER_API_KEY env var
- Include OpenRouter-recommended headers:
  - HTTP-Referer: https://github.com/scout-cli
  - X-Title: scout

Example call:
```ts
const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "HTTP-Referer": "https://github.com/scout-cli",
    "X-Title": "scout",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: options.model ?? "anthropic/claude-sonnet-4",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify(crawlOutput) }
    ]
  })
});
```

- Add a --model CLI flag so you can swap models without touching code

## LLM system prompt to use
"You are a senior QA engineer doing exploratory testing on a website you've never seen before. You have no access to specs or the dev team. Based purely on the site structure provided as JSON, infer what a real user expects to work and write Playwright tests for it. Focus on: navigation correctness, form validation and submission, interactive element behavior, and key user flows. Write realistic assertions, not just 'element exists' checks. Output ONLY a valid TypeScript Playwright spec file with no markdown fences or explanation."

## Generated test quality requirements
- Tests must use page.goto(), page.fill(), page.click(), expect(page)
- Include at least one test per discovered form
- Include navigation smoke tests for all top-level links
- Group tests in describe blocks by feature area
- Add comments explaining WHY each test exists
- Tests should be runnable with `npx playwright test` with zero modification

## Project structure to generate
```
scout/
  src/
    crawler.ts        # Playwright crawl logic
    analyze.ts        # OpenRouter API call + prompt
    writer.ts         # File output logic
    index.ts          # CLI entry point
  tests/
    generated.spec.ts   # Output here
  test-plan.md          # Output here
  package.json
  tsconfig.json
  playwright.config.ts
  README.md
```

## Error handling
- If a page returns 4xx/5xx, log it and continue crawling
- If the LLM returns malformed output, retry once with "respond only with valid TypeScript, no markdown fences"
- Show progress in terminal: "Crawling... Found X pages, Y forms, Z interactive elements"
- If OPENROUTER_API_KEY is not set, exit with a clear error message

Start by scaffolding the full project structure, then implement each module one by one. Use OPENROUTER_API_KEY as the environment variable for the API key.
```

---

## Running Scout

```bash
# Set your API key
export OPENROUTER_API_KEY=your-openrouter-api-key

# Basic usage
npx scout https://bambelo.rejoicesoftware.in/nl

# Website basic auth: set BASIC_AUTH_USER and BASIC_AUTH_PASS env vars (see .env.example)

# Use a different model
npx scout https://bambelo.rejoicesoftware.in/nl --model google/gemini-2.5-pro
npx scout https://bambelo.rejoicesoftware.in/nl --model openai/gpt-4o

# Run the generated tests
npx playwright test
```

---

## Output files

| File | Description |
|---|---|
| `test-plan.md` | Human-readable list of all test cases with rationale — share with your team |
| `tests/generated.spec.ts` | Ready-to-run Playwright TypeScript test suite |

---

## Swapping models via OpenRouter

| Model string | Best for |
|---|---|
| `anthropic/claude-sonnet-4` | Default — best reasoning about UI intent |
| `google/gemini-2.5-pro` | Good alternative, fast |
| `openai/gpt-4o` | Solid fallback |
| `meta-llama/llama-3.3-70b-instruct` | Free tier option |

---

## Why OpenRouter instead of direct API?

- **One API key** for all providers — no juggling multiple keys
- **Swap models** with a flag, not a code change
- **Single cost dashboard** — see spend across Claude, GPT, Gemini in one place
- **Automatic fallback** if a provider is down
- **No SDK dependency** — just a standard `fetch` call

---

*Generated with Claude — paste the prompt above into Claude Code to build Scout.*
