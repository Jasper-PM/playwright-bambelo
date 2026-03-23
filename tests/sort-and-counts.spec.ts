import { test, expect } from "@playwright/test";
import { waitForResults, getResultCount } from "./helpers";

const CITY_PATH = "/nl/makelaars/amsterdam";
const ALL_PATH = "/nl/makelaars/amsterdam/all";

const SORT_OPTIONS = [
  "Sorteren op",
  "Relevantie",
  "Beoordeling",
  "Beoordeling: Hoog naar Laag",
  "Beoordeling: Laag naar Hoog",
  "Meest beoordeeld",
];

// ============================================================
// SORTING BEHAVIOR
// ============================================================

test.describe("Sort dropdown — visibility and options", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CITY_PATH);
    await waitForResults(page);
  });

  test("default page shows results with a positive count in heading", async ({ page }) => {
    // DATA CONSISTENCY: The heading must contain a real count > 0, proving results loaded.
    const count = await getResultCount(page);
    expect(count).toBeGreaterThan(0);
    expect(Number.isNaN(count)).toBe(false);
  });

  test("sort dropdown is visible on the results page", async ({ page }) => {
    // DATA CONSISTENCY: Sort control must be accessible for users to reorder results.
    const sortDropdown = page.getByRole("combobox", { name: /sort by/i });
    await expect(sortDropdown).toBeVisible();
  });

  test("sort dropdown contains all expected options", async ({ page }) => {
    // DATA CONSISTENCY: All documented sort options must be present in the dropdown.
    const sortDropdown = page.getByRole("combobox", { name: /sort by/i });
    await sortDropdown.click();

    for (const option of SORT_OPTIONS) {
      await expect(
        page.getByRole("option", { name: option }).or(page.locator(`option:has-text("${option}")`)).first()
      ).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("Sort selection — result count stability", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CITY_PATH);
    await waitForResults(page);
  });

  test("selecting 'Relevantie' keeps the result count the same", async ({ page }) => {
    // DATA CONSISTENCY: Sorting by relevance must not filter results — count should stay stable.
    const countBefore = await getResultCount(page);
    const sortDropdown = page.getByRole("combobox", { name: /sort by/i });
    await sortDropdown.selectOption({ label: "Relevantie" });
    await waitForResults(page);
    const countAfter = await getResultCount(page);
    expect(countAfter).toBe(countBefore);
  });

  test("selecting 'Beoordeling: Hoog naar Laag' keeps the result count the same", async ({ page }) => {
    // DATA CONSISTENCY: Sorting high-to-low must not change the total number of results.
    const countBefore = await getResultCount(page);
    const sortDropdown = page.getByRole("combobox", { name: /sort by/i });
    await sortDropdown.selectOption({ label: "Beoordeling: Hoog naar Laag" });
    await waitForResults(page);
    const countAfter = await getResultCount(page);
    expect(countAfter).toBe(countBefore);
  });

  test("selecting 'Beoordeling: Laag naar Hoog' keeps the result count the same", async ({ page }) => {
    // DATA CONSISTENCY: Sorting low-to-high must not change the total number of results.
    const countBefore = await getResultCount(page);
    const sortDropdown = page.getByRole("combobox", { name: /sort by/i });
    await sortDropdown.selectOption({ label: "Beoordeling: Laag naar Hoog" });
    await waitForResults(page);
    const countAfter = await getResultCount(page);
    expect(countAfter).toBe(countBefore);
  });

  test("selecting 'Meest beoordeeld' keeps the result count the same", async ({ page }) => {
    // DATA CONSISTENCY: Sorting by most reviewed must not filter out any results.
    const countBefore = await getResultCount(page);
    const sortDropdown = page.getByRole("combobox", { name: /sort by/i });
    await sortDropdown.selectOption({ label: "Meest beoordeeld" });
    await waitForResults(page);
    const countAfter = await getResultCount(page);
    expect(countAfter).toBe(countBefore);
  });
});

test.describe("Sort selection — result cards remain visible", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CITY_PATH);
    await waitForResults(page);
  });

  test("after sorting, at least one result card is still visible", async ({ page }) => {
    // DATA CONSISTENCY: Sorting must not cause all result cards to vanish from the DOM.
    const sortDropdown = page.getByRole("combobox", { name: /sort by/i });
    await sortDropdown.selectOption({ label: "Beoordeling: Hoog naar Laag" });
    await waitForResults(page);

    const cards = page.locator("[class*='card'], [class*='result'], [class*='listing'], article").first();
    await expect(cards).toBeVisible({ timeout: 10000 });
  });

  test("result cards are visible after each sort option change", async ({ page }) => {
    // DATA CONSISTENCY: Every sort option must produce visible result cards, not a blank page.
    const sortDropdown = page.getByRole("combobox", { name: /sort by/i });
    const sortLabels = [
      "Relevantie",
      "Beoordeling: Hoog naar Laag",
      "Beoordeling: Laag naar Hoog",
      "Meest beoordeeld",
    ];

    for (const label of sortLabels) {
      await sortDropdown.selectOption({ label });
      await waitForResults(page);
      const cards = page.locator("[class*='card'], [class*='result'], [class*='listing'], article").first();
      await expect(cards).toBeVisible({ timeout: 10000 });
    }
  });

  test("switching sort options back and forth does not break the page", async ({ page }) => {
    // DATA CONSISTENCY: Toggling sort repeatedly must not crash or empty the results.
    const sortDropdown = page.getByRole("combobox", { name: /sort by/i });

    await sortDropdown.selectOption({ label: "Beoordeling: Hoog naar Laag" });
    await waitForResults(page);
    const countA = await getResultCount(page);

    await sortDropdown.selectOption({ label: "Beoordeling: Laag naar Hoog" });
    await waitForResults(page);
    const countB = await getResultCount(page);

    await sortDropdown.selectOption({ label: "Beoordeling: Hoog naar Laag" });
    await waitForResults(page);
    const countC = await getResultCount(page);

    expect(countA).toBe(countB);
    expect(countB).toBe(countC);
    expect(countC).toBeGreaterThan(0);
  });
});

// ============================================================
// HEADING COUNT CONSISTENCY
// ============================================================

test.describe("Heading count — format and value checks", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CITY_PATH);
    await waitForResults(page);
  });

  test("result count in heading is a positive integer, not 0 or NaN", async ({ page }) => {
    // DATA CONSISTENCY: The count must be a real positive number, never 0 or a parsing artefact.
    const count = await getResultCount(page);
    expect(Number.isNaN(count)).toBe(false);
    expect(count).toBeGreaterThan(0);
    expect(Number.isInteger(count)).toBe(true);
  });

  test("heading text matches pattern 'De N beste X in Y'", async ({ page }) => {
    // DATA CONSISTENCY: The heading must be well-formed with the expected Dutch template.
    const heading = page.getByRole("heading", { name: /beste/i });
    await expect(heading).toBeVisible();
    const text = await heading.textContent();
    expect(text).toMatch(/De\s+\d+\s+beste\s+\w+\s+in\s+\w+/i);
  });

  test("Amsterdam heading count is reasonable (> 50)", async ({ page }) => {
    // DATA CONSISTENCY: We know there are 1705 Amsterdam listings in the location filter,
    // so the filtered result heading should still show a substantial number (> 50).
    const count = await getResultCount(page);
    expect(count).toBeGreaterThan(50);
  });
});

// ============================================================
// "BEKIJK ALLES" PAGE COUNT
// ============================================================

test.describe("Bekijk alles — count comparison", () => {
  test("'Bekijk alles' page count is >= the filtered city page count", async ({ page }) => {
    // DATA CONSISTENCY: The "all" page must show at least as many results as the filtered page.
    await page.goto(CITY_PATH);
    await waitForResults(page);
    const filteredCount = await getResultCount(page);

    await page.goto(ALL_PATH);
    await waitForResults(page);
    const allCount = await getResultCount(page);

    expect(allCount).toBeGreaterThanOrEqual(filteredCount);
  });
});

// ============================================================
// LOCATION FILTER + COUNT INTERACTION
// ============================================================

test.describe("Location filter — additive count behavior", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CITY_PATH);
    await waitForResults(page);
  });

  test("checking Rotterdam alongside Amsterdam increases the count", async ({ page }) => {
    // DATA CONSISTENCY: Adding a second city filter should increase the total count,
    // since Rotterdam has its own set of listings.
    const amsterdamCount = await getResultCount(page);

    const rotterdamCheckbox = page.getByRole("checkbox", { name: /Rotterdam/i })
      .or(page.getByLabel(/Rotterdam/i))
      .or(page.locator("label").filter({ hasText: /Rotterdam/i }));
    await rotterdamCheckbox.first().click();
    await waitForResults(page);

    const combinedCount = await getResultCount(page);
    expect(combinedCount).toBeGreaterThan(amsterdamCount);
  });

  test("combined Amsterdam + Rotterdam count does not exceed total listings", async ({ page }) => {
    // DATA CONSISTENCY: The sum after adding Rotterdam must be <= the total "Alle steden" count,
    // which is the upper bound of all listings across all cities.
    const rotterdamCheckbox = page.getByRole("checkbox", { name: /Rotterdam/i })
      .or(page.getByLabel(/Rotterdam/i))
      .or(page.locator("label").filter({ hasText: /Rotterdam/i }));
    await rotterdamCheckbox.first().click();
    await waitForResults(page);

    const combinedCount = await getResultCount(page);

    // Navigate to the "all" page which represents all cities
    await page.goto(ALL_PATH);
    await waitForResults(page);
    const totalCount = await getResultCount(page);

    expect(combinedCount).toBeLessThanOrEqual(totalCount);
  });
});

// ============================================================
// SORT + FILTER INTERACTION
// ============================================================

test.describe("Sort persistence after filter change", () => {
  test("sort selection persists after changing a location filter", async ({ page }) => {
    // DATA CONSISTENCY: Applying a location filter must not reset the user's chosen sort order.
    await page.goto(CITY_PATH);
    await waitForResults(page);

    const sortDropdown = page.getByRole("combobox", { name: /sort by/i });
    await sortDropdown.selectOption({ label: "Beoordeling: Hoog naar Laag" });
    await waitForResults(page);

    // Now toggle a location filter
    const rotterdamCheckbox = page.getByRole("checkbox", { name: /Rotterdam/i })
      .or(page.getByLabel(/Rotterdam/i))
      .or(page.locator("label").filter({ hasText: /Rotterdam/i }));
    await rotterdamCheckbox.first().click();
    await waitForResults(page);

    // Verify the sort dropdown still shows the previously selected value
    await expect(sortDropdown).toHaveValue(/hoog naar laag/i);
  });
});
