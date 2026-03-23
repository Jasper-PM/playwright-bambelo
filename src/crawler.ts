import { chromium, Browser, Page } from "playwright";

export interface PageData {
  url: string;
  title: string;
  headings: { h1: string[]; h2: string[] };
  links: string[];
  forms: FormData[];
  buttons: string[];
  interactiveElements: InteractiveElement[];
  screenshotPath?: string;
}

export interface FormData {
  action: string;
  method: string;
  fields: { name: string; type: string; label: string; required: boolean }[];
}

export interface InteractiveElement {
  role: string;
  text: string;
  tag: string;
}

export interface CrawlResult {
  baseUrl: string;
  pages: PageData[];
  totalPages: number;
  totalForms: number;
  totalInteractiveElements: number;
}

export interface CrawlOptions {
  maxDepth?: number;
  timeout?: number;
  auth?: { username: string; password: string };
  pathPrefix?: string;
  maxPagesPerPattern?: number;
}

export async function crawl(
  url: string,
  options: CrawlOptions = {}
): Promise<CrawlResult> {
  const maxDepth = options.maxDepth ?? 2;
  const timeout = options.timeout ?? 10000;
  const pathPrefix = options.pathPrefix ?? null;
  const maxPagesPerPattern = options.maxPagesPerPattern ?? 2;
  const visited = new Set<string>();
  const pages: PageData[] = [];
  const baseOrigin = new URL(url).origin;

  // Track how many pages we've visited per URL pattern to avoid crawling
  // hundreds of templated pages (e.g., /nl/taxateurs/amsterdam, /nl/taxateurs/rotterdam)
  const patternCounts = new Map<string, number>();

  const browser: Browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...(options.auth
      ? { httpCredentials: { username: options.auth.username, password: options.auth.password } }
      : {}),
  });

  try {
    await crawlPage(context, url, 0);
  } finally {
    await browser.close();
  }

  function getUrlPattern(u: string): string {
    // Generalize city/id-specific URLs into patterns
    // e.g., /nl/taxateurs/amsterdam -> /nl/taxateurs/*
    // e.g., /nl/general-category/1/makelaars -> /nl/general-category/*/makelaars
    const path = new URL(u).pathname;
    const segments = path.split("/").filter(Boolean);
    if (segments.length >= 3) {
      // Replace the last segment (city name) with wildcard
      return segments.slice(0, -1).join("/") + "/*";
    }
    return path;
  }

  function isAllowedUrl(u: string): boolean {
    try {
      const parsed = new URL(u);
      // Must be same origin
      if (parsed.origin !== baseOrigin) return false;
      // Must match path prefix if set (e.g., /nl)
      if (pathPrefix && !parsed.pathname.startsWith(pathPrefix)) return false;
      // Skip country-switch links
      if (parsed.search.includes("country=")) return false;
      return true;
    } catch {
      return false;
    }
  }

  function isUnderPatternLimit(u: string): boolean {
    const pattern = getUrlPattern(u);
    const count = patternCounts.get(pattern) ?? 0;
    return count < maxPagesPerPattern;
  }

  function trackPattern(u: string): void {
    const pattern = getUrlPattern(u);
    patternCounts.set(pattern, (patternCounts.get(pattern) ?? 0) + 1);
  }

  async function crawlPage(ctx: typeof context, pageUrl: string, depth: number) {
    const normalized = normalizeUrl(pageUrl);
    if (visited.has(normalized) || depth > maxDepth) return;
    if (!isAllowedUrl(pageUrl)) return;
    if (depth > 0 && !isUnderPatternLimit(pageUrl)) return;
    visited.add(normalized);
    trackPattern(pageUrl);

    const page: Page = await ctx.newPage();
    try {
      const response = await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout });
      const status = response?.status() ?? 0;

      if (status >= 400) {
        console.log(`  ⚠ ${pageUrl} returned ${status}, skipping`);
        return;
      }

      await page.waitForTimeout(1000); // let JS settle

      const pageData = await extractPageData(page, pageUrl);

      // Screenshot
      const screenshotName = `screenshot-${pages.length}.png`;
      try {
        await page.screenshot({ path: screenshotName, fullPage: false });
        pageData.screenshotPath = screenshotName;
      } catch {
        // screenshot failure is non-critical
      }

      pages.push(pageData);

      const formCount = pages.reduce((s, p) => s + p.forms.length, 0);
      const interactiveCount = pages.reduce((s, p) => s + p.interactiveElements.length, 0);
      console.log(
        `  Crawling... Found ${pages.length} pages, ${formCount} forms, ${interactiveCount} interactive elements`
      );

      // Follow internal links (filter to allowed URLs)
      if (depth < maxDepth) {
        const allowedLinks = pageData.links.filter(
          (link) => isAllowedUrl(link) && !visited.has(normalizeUrl(link))
        );
        for (const link of allowedLinks) {
          await crawlPage(ctx, link, depth + 1);
        }
      }
    } catch (err: any) {
      console.log(`  ⚠ Error crawling ${pageUrl}: ${err.message}`);
    } finally {
      await page.close();
    }
  }

  function normalizeUrl(u: string): string {
    try {
      const parsed = new URL(u);
      parsed.hash = "";
      // Remove trailing slash for consistency
      return parsed.toString().replace(/\/$/, "");
    } catch {
      return u;
    }
  }

  async function extractPageData(page: Page, pageUrl: string): Promise<PageData> {
    return page.evaluate((origin: string) => {
      const h1s = Array.from(document.querySelectorAll("h1")).map((el) => el.textContent?.trim() || "");
      const h2s = Array.from(document.querySelectorAll("h2")).map((el) => el.textContent?.trim() || "");

      // Internal links only
      const links = Array.from(document.querySelectorAll("a[href]"))
        .map((a) => (a as HTMLAnchorElement).href)
        .filter((href) => {
          try {
            return new URL(href).origin === origin && !href.includes("#");
          } catch {
            return false;
          }
        })
        .filter((v, i, arr) => arr.indexOf(v) === i);

      // Forms
      const forms = Array.from(document.querySelectorAll("form")).map((form) => {
        const fields = Array.from(form.querySelectorAll("input, select, textarea")).map((el) => {
          const input = el as HTMLInputElement;
          const label =
            el.getAttribute("aria-label") ||
            el.getAttribute("placeholder") ||
            document.querySelector(`label[for="${el.id}"]`)?.textContent?.trim() ||
            "";
          return {
            name: input.name || input.id || "",
            type: input.type || el.tagName.toLowerCase(),
            label,
            required: input.required || input.getAttribute("aria-required") === "true",
          };
        });
        return {
          action: form.action || "",
          method: (form.method || "get").toUpperCase(),
          fields,
        };
      });

      // Buttons
      const buttons = Array.from(document.querySelectorAll('button, input[type="submit"]'))
        .map((el) => el.textContent?.trim() || (el as HTMLInputElement).value || "")
        .filter(Boolean);

      // Interactive elements (dialog, navigation, search)
      const roles = ["dialog", "navigation", "search"];
      const interactiveElements = roles.flatMap((role) =>
        Array.from(document.querySelectorAll(`[role="${role}"]`)).map((el) => ({
          role,
          text: el.textContent?.trim().slice(0, 100) || "",
          tag: el.tagName.toLowerCase(),
        }))
      );

      return {
        url: window.location.href,
        title: document.title,
        headings: { h1: h1s, h2: h2s },
        links,
        forms,
        buttons,
        interactiveElements,
      };
    }, baseOrigin);
  }

  const totalForms = pages.reduce((s, p) => s + p.forms.length, 0);
  const totalInteractive = pages.reduce((s, p) => s + p.interactiveElements.length, 0);

  return {
    baseUrl: url,
    pages,
    totalPages: pages.length,
    totalForms: totalForms,
    totalInteractiveElements: totalInteractive,
  };
}
