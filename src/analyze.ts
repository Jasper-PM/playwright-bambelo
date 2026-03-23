import { CrawlResult } from "./crawler";

const SYSTEM_PROMPT = `You are a senior QA engineer doing exploratory testing on a website you've never seen before. You have no access to specs or the dev team. Based purely on the site structure provided as JSON, infer what a real user expects to work and write Playwright tests for it. Focus on: navigation correctness, form validation and submission, interactive element behavior, and key user flows. Write realistic assertions, not just 'element exists' checks. Output ONLY a valid TypeScript Playwright spec file with no markdown fences or explanation.`;

const TEST_PLAN_SYSTEM_PROMPT = `You are a senior QA engineer. Based on the site structure provided as JSON, write a comprehensive test plan in Markdown format. For each test case, include: the test name, what it verifies, steps, and expected results. Group test cases by feature area. Output ONLY valid Markdown with no code fences wrapping the entire output.`;

export interface AnalyzeOptions {
  model?: string;
}

export interface AnalyzeResult {
  testPlan: string;
  specFile: string;
}

export async function analyze(
  crawlResult: CrawlResult,
  options: AnalyzeOptions = {}
): Promise<AnalyzeResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("Error: OPENROUTER_API_KEY environment variable is not set.");
    console.error("Get your key at https://openrouter.ai and set it:");
    console.error("  export OPENROUTER_API_KEY=your-key-here");
    process.exit(1);
  }

  const model = options.model ?? "anthropic/claude-sonnet-4";
  const crawlJson = JSON.stringify(crawlResult, null, 2);

  console.log(`\n🤖 Generating test plan using ${model}...`);
  const testPlan = await callLLM(apiKey, model, TEST_PLAN_SYSTEM_PROMPT, crawlJson);

  console.log(`🤖 Generating Playwright spec using ${model}...`);
  const specFile = await callLLM(apiKey, model, SYSTEM_PROMPT, crawlJson);

  return { testPlan, specFile };
}

async function callLLM(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userContent: string,
  isRetry = false
): Promise<string> {
  const messages: { role: string; content: string }[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent },
  ];

  if (isRetry) {
    messages.push({
      role: "user",
      content: "Respond only with valid TypeScript, no markdown fences.",
    });
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://github.com/scout-cli",
      "X-Title": "scout",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${body}`);
  }

  const data: any = await response.json();
  const content: string = data.choices?.[0]?.message?.content ?? "";

  if (!content.trim()) {
    throw new Error("LLM returned empty response");
  }

  // Strip markdown fences if present
  let cleaned = content.trim();
  cleaned = cleaned.replace(/^```(?:typescript|ts|markdown|md)?\n?/i, "");
  cleaned = cleaned.replace(/\n?```$/i, "");

  // Retry once if the spec output looks malformed (no import statement for spec calls)
  if (
    !isRetry &&
    systemPrompt === SYSTEM_PROMPT &&
    !cleaned.includes("import") &&
    !cleaned.includes("test(")
  ) {
    console.log("  ⚠ LLM output looks malformed, retrying...");
    return callLLM(apiKey, model, systemPrompt, userContent, true);
  }

  return cleaned;
}
