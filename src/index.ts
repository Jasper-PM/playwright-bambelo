#!/usr/bin/env node

import { Command } from "commander";
import { crawl } from "./crawler";
import { analyze } from "./analyze";
import { writeTestPlan, writeSpecFile } from "./writer";

const program = new Command();

program
  .name("scout")
  .description("AI-powered Playwright test generator — give it a URL, get a test suite")
  .version("1.0.0")
  .argument("<url>", "Website URL to generate tests for")
  .option("--model <model>", "OpenRouter model to use", "anthropic/claude-sonnet-4")
  .option("--depth <number>", "Max crawl depth", "2")
  .option("--auth <user:pass>", "HTTP basic auth credentials (user:pass)")
  .option("--path-prefix <prefix>", "Only crawl URLs under this path prefix (e.g., /nl)")
  .option("--max-per-pattern <number>", "Max pages to crawl per URL pattern", "2")
  .action(async (url: string, opts: { model: string; depth: string; auth?: string; pathPrefix?: string; maxPerPattern: string }) => {
    // Validate API key early
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("❌ Error: OPENROUTER_API_KEY environment variable is not set.");
      console.error("   Get your key at https://openrouter.ai and set it:");
      console.error("   export OPENROUTER_API_KEY=your-key-here");
      process.exit(1);
    }

    // Parse auth if provided
    let auth: { username: string; password: string } | undefined;
    if (opts.auth) {
      const [username, ...rest] = opts.auth.split(":");
      auth = { username, password: rest.join(":") };
    }

    console.log(`\n🔍 Scout — AI-Powered Playwright Test Generator`);
    console.log(`   Target: ${url}`);
    console.log(`   Model:  ${opts.model}`);
    console.log(`   Depth:  ${opts.depth}\n`);

    // Step 1: Crawl
    console.log("📡 Crawling website...");
    const crawlResult = await crawl(url, {
      maxDepth: parseInt(opts.depth, 10),
      auth,
      pathPrefix: opts.pathPrefix,
      maxPagesPerPattern: parseInt(opts.maxPerPattern, 10),
    });

    console.log(`\n✅ Crawl complete:`);
    console.log(`   ${crawlResult.totalPages} pages`);
    console.log(`   ${crawlResult.totalForms} forms`);
    console.log(`   ${crawlResult.totalInteractiveElements} interactive elements\n`);

    // Step 2: Analyze with LLM
    const result = await analyze(crawlResult, { model: opts.model });

    // Step 3: Write output files
    const outputDir = process.cwd();
    const planPath = writeTestPlan(result.testPlan, outputDir);
    const specPath = writeSpecFile(result.specFile, outputDir);

    console.log(`\n✅ Done! Generated files:`);
    console.log(`   📋 Test plan: ${planPath}`);
    console.log(`   🧪 Spec file: ${specPath}`);
    console.log(`\n   Run tests with: npx playwright test`);
  });

program.parse();
