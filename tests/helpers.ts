import { Page, expect } from "@playwright/test";

export const BASE_URL = "https://bambelo.rejoicesoftware.in/nl";

export const AUTH = {
  username: process.env.BASIC_AUTH_USER || "",
  password: process.env.BASIC_AUTH_PASS || "",
};

/**
 * Wait for the results loading indicator to disappear,
 * meaning results have finished updating.
 */
export async function waitForResults(page: Page, timeout = 15000): Promise<void> {
  // Wait for any loading indicator to appear and then disappear
  const loader = page.getByText(/Laden|Resultaten bijwerken|Loading/i);
  try {
    await loader.waitFor({ state: "visible", timeout: 3000 });
    await loader.waitFor({ state: "hidden", timeout });
  } catch {
    // Loader may not appear if results load instantly — that's fine
  }
  // Extra settle time for DOM updates
  await page.waitForTimeout(500);
}

/**
 * Parse the result count from the heading like "De 114 beste Makelaars in Amsterdam"
 * Returns the number, or -1 if not found.
 */
export async function getResultCount(page: Page): Promise<number> {
  const heading = page.getByRole("heading", { name: /beste/i });
  await expect(heading).toBeVisible({ timeout: 15000 });
  const text = await heading.textContent();
  const match = text?.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : -1;
}

/**
 * Navigate to a city results page for a given service and city.
 * Uses relative URL so it works with the baseURL in playwright.config.ts
 */
export async function goToCityResults(
  page: Page,
  service: string,
  city: string
): Promise<void> {
  await page.goto(`/nl/${service}/${city}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("h2", { timeout: 20000 });
  await waitForResults(page);
}

/**
 * Navigate to a category page for a given group and slug.
 * Uses relative URL so it works with the baseURL in playwright.config.ts
 */
export async function goToCategory(
  page: Page,
  group: string,
  slug: string
): Promise<void> {
  await page.goto(`/nl/${group}/${slug}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("h1", { timeout: 20000 });
}
