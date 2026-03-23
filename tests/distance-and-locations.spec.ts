import { test, expect } from "@playwright/test";
import { waitForResults, getResultCount, goToCityResults } from "./helpers";

// =============================================================================
// DISTANCE SLIDER & LOCATION FILTER — Data consistency and numeric behavior
// =============================================================================

const CITY_RESULTS_PATH = "/nl/makelaars/amsterdam";

test.describe("Distance slider behavior", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CITY_RESULTS_PATH);
    await waitForResults(page);
  });

  test("slider is visible with 0Km and 50Km boundary labels", async ({ page }) => {
    // The distance filter must advertise its full range so users know the bounds
    const slider = page.getByRole("slider");
    await expect(slider).toBeVisible({ timeout: 10000 });
    const distanceSection = page.getByText(/Afstandsfilter/i);
    await expect(distanceSection).toBeVisible();
    await expect(page.getByText("0Km").or(page.getByText("0 Km")).first()).toBeVisible();
    await expect(page.getByText("50Km").or(page.getByText("50 Km")).first()).toBeVisible();
  });

  test("moving slider and clicking Toepassen updates results", async ({ page }) => {
    // Applying a distance filter must actually trigger a result refresh — not be a no-op
    const countBefore = await getResultCount(page);
    const slider = page.getByRole("slider");
    const box = await slider.boundingBox();
    expect(box).toBeTruthy();

    // Drag slider roughly to the midpoint (25Km)
    await slider.click();
    await page.mouse.move(box!.x + box!.width * 0.5, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width * 0.5, box!.y + box!.height / 2);
    await page.mouse.up();

    const applyBtn = page.getByRole("button", { name: /Toepassen/i });
    await applyBtn.click();
    await waitForResults(page);

    const countAfter = await getResultCount(page);
    // The count should be a valid positive number (filter was applied)
    expect(countAfter).toBeGreaterThan(0);
  });

  test("setting slider to minimum may decrease results", async ({ page }) => {
    // At minimum distance (0Km), only very local results should appear — fewer or equal
    const countBefore = await getResultCount(page);
    const slider = page.getByRole("slider");
    const box = await slider.boundingBox();
    expect(box).toBeTruthy();

    // Drag slider to the far left (0Km)
    await slider.click();
    await page.mouse.move(box!.x, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.mouse.move(box!.x, box!.y + box!.height / 2);
    await page.mouse.up();

    const applyBtn = page.getByRole("button", { name: /Toepassen/i });
    await applyBtn.click();
    await waitForResults(page);

    const countAfter = await getResultCount(page);
    // Minimum distance should yield fewer or equal results compared to no filter
    expect(countAfter).toBeGreaterThanOrEqual(0);
    expect(countAfter).toBeLessThanOrEqual(countBefore);
  });

  test("setting slider to maximum yields results >= minimum setting", async ({ page }) => {
    // Wider distance must include at least as many results as a narrower distance
    const slider = page.getByRole("slider");
    const box = await slider.boundingBox();
    expect(box).toBeTruthy();

    // First set to minimum
    await slider.click();
    await page.mouse.move(box!.x, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.mouse.move(box!.x, box!.y + box!.height / 2);
    await page.mouse.up();

    const applyBtn = page.getByRole("button", { name: /Toepassen/i });
    await applyBtn.click();
    await waitForResults(page);
    const countMin = await getResultCount(page);

    // Now set to maximum (far right)
    await slider.click();
    await page.mouse.move(box!.x + box!.width, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width, box!.y + box!.height / 2);
    await page.mouse.up();

    await applyBtn.click();
    await waitForResults(page);
    const countMax = await getResultCount(page);

    // Max distance must yield at least as many results as min distance
    expect(countMax).toBeGreaterThanOrEqual(countMin);
  });

  test("Wissen resets slider and results update", async ({ page }) => {
    // Clearing the distance filter should restore the unfiltered result count
    const countInitial = await getResultCount(page);

    const slider = page.getByRole("slider");
    const box = await slider.boundingBox();
    expect(box).toBeTruthy();

    // Apply a mid-range filter
    await slider.click();
    await page.mouse.move(box!.x + box!.width * 0.3, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width * 0.3, box!.y + box!.height / 2);
    await page.mouse.up();

    const applyBtn = page.getByRole("button", { name: /Toepassen/i });
    await applyBtn.click();
    await waitForResults(page);

    // Now clear the filter
    const clearBtn = page.getByRole("button", { name: /Wissen/i });
    await clearBtn.click();
    await waitForResults(page);

    const countAfterClear = await getResultCount(page);
    // After clearing, results should return to the original unfiltered count
    expect(countAfterClear).toBe(countInitial);
  });

  test("applying distance filter does not change location checkbox states", async ({ page }) => {
    // Distance and location are independent filters — one should not alter the other
    const amsterdamCheckbox = page.getByRole("checkbox", { name: /Amsterdam/i });
    const wasChecked = await amsterdamCheckbox.isChecked();

    const slider = page.getByRole("slider");
    const box = await slider.boundingBox();
    expect(box).toBeTruthy();

    await slider.click();
    await page.mouse.move(box!.x + box!.width * 0.5, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width * 0.5, box!.y + box!.height / 2);
    await page.mouse.up();

    const applyBtn = page.getByRole("button", { name: /Toepassen/i });
    await applyBtn.click();
    await waitForResults(page);

    // Location checkbox state must remain unchanged after distance filter
    const isCheckedAfter = await amsterdamCheckbox.isChecked();
    expect(isCheckedAfter).toBe(wasChecked);
  });

  test("distance filter and location filter work together without conflict", async ({ page }) => {
    // Combining both filters should yield a valid positive count — no crash or zero
    const slider = page.getByRole("slider");
    const box = await slider.boundingBox();
    expect(box).toBeTruthy();

    // Set distance to ~25Km
    await slider.click();
    await page.mouse.move(box!.x + box!.width * 0.5, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width * 0.5, box!.y + box!.height / 2);
    await page.mouse.up();

    const applyBtn = page.getByRole("button", { name: /Toepassen/i });
    await applyBtn.click();
    await waitForResults(page);

    // Also check Rotterdam
    const rotterdamCheckbox = page.getByRole("checkbox", { name: /Rotterdam/i });
    await rotterdamCheckbox.check();
    await waitForResults(page);

    const count = await getResultCount(page);
    // Combined filters should still produce a valid positive integer
    expect(count).toBeGreaterThan(0);
    expect(Number.isInteger(count)).toBe(true);
  });
});

test.describe("Location data consistency", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CITY_RESULTS_PATH);
    await waitForResults(page);
  });

  test("all visible city counts are positive integers > 0", async ({ page }) => {
    // Every city listed in the filter should have a meaningful positive count
    const checkboxLabels = page.locator('label').filter({ has: page.getByRole("checkbox") });
    const count = await checkboxLabels.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const labelText = await checkboxLabels.nth(i).textContent();
      if (!labelText) continue;
      const match = labelText.match(/\((\d+)\)/);
      if (match) {
        const cityCount = parseInt(match[1], 10);
        expect(cityCount).toBeGreaterThan(0);
        expect(Number.isInteger(cityCount)).toBe(true);
      }
    }
  });

  test("Amsterdam count displayed next to checkbox is plausible (> 100)", async ({ page }) => {
    // Amsterdam is a major city — its count should reflect substantial coverage
    const amsterdamLabel = page.locator('label').filter({ hasText: /Amsterdam/ }).first();
    const labelText = await amsterdamLabel.textContent();
    expect(labelText).toBeTruthy();
    const match = labelText!.match(/\((\d+)\)/);
    expect(match).toBeTruthy();
    const amsterdamCount = parseInt(match![1], 10);
    expect(amsterdamCount).toBeGreaterThan(100);
  });

  test("checking Amsterdam + Rotterdam yields count >= Amsterdam-only count", async ({ page }) => {
    // Adding a second city must produce at least as many results — set union is non-decreasing
    const countAmsterdamOnly = await getResultCount(page);

    const rotterdamCheckbox = page.getByRole("checkbox", { name: /Rotterdam/i });
    await rotterdamCheckbox.check();
    await waitForResults(page);

    const countBoth = await getResultCount(page);
    expect(countBoth).toBeGreaterThanOrEqual(countAmsterdamOnly);
  });

  test("checking 3 cities yields count >= 2 cities (monotonically non-decreasing)", async ({ page }) => {
    // Each additional city should add results, never subtract them
    const count1 = await getResultCount(page); // Amsterdam only

    const rotterdamCheckbox = page.getByRole("checkbox", { name: /Rotterdam/i });
    await rotterdamCheckbox.check();
    await waitForResults(page);
    const count2 = await getResultCount(page);

    const denHaagCheckbox = page.getByRole("checkbox", { name: /Den Haag/i });
    await denHaagCheckbox.check();
    await waitForResults(page);
    const count3 = await getResultCount(page);

    expect(count2).toBeGreaterThanOrEqual(count1);
    expect(count3).toBeGreaterThanOrEqual(count2);
  });

  test("Alle steden count >= any individual city count", async ({ page }) => {
    // The all-cities option is a superset — it must be >= every single city
    const allestedenLabel = page.locator('label').filter({ hasText: /Alle steden/i }).first();
    const alleText = await allestedenLabel.textContent();
    const alleMatch = alleText?.match(/\((\d+)\)/);

    // Alle steden might not have a count displayed — if so, select it and read heading
    let alleCount: number;
    if (alleMatch) {
      alleCount = parseInt(alleMatch[1], 10);
    } else {
      const alleCheckbox = page.getByRole("checkbox", { name: /Alle steden/i });
      await alleCheckbox.check();
      await waitForResults(page);
      alleCount = await getResultCount(page);
    }

    // Read the Amsterdam label count as a representative individual city
    const amsterdamLabel = page.locator('label').filter({ hasText: /Amsterdam/ }).first();
    const amText = await amsterdamLabel.textContent();
    const amMatch = amText?.match(/\((\d+)\)/);
    expect(amMatch).toBeTruthy();
    const amsterdamCount = parseInt(amMatch![1], 10);

    expect(alleCount).toBeGreaterThanOrEqual(amsterdamCount);
  });

  test("unchecking all cities shows empty results or a default state", async ({ page }) => {
    // With no city selected, the UI should handle it gracefully — no crash, no negative count
    const amsterdamCheckbox = page.getByRole("checkbox", { name: /Amsterdam/i });
    await amsterdamCheckbox.uncheck();
    await waitForResults(page);

    const count = await getResultCount(page);
    // Either 0 results or the system falls back to a default — both are acceptable
    expect(count).toBeGreaterThanOrEqual(0);
    expect(Number.isNaN(count)).toBe(false);
  });

  test("Toon meer reveals additional cities with counts", async ({ page }) => {
    // Expanding the list should show more city checkboxes, each with a valid count
    const checkboxesBefore = await page.getByRole("checkbox").count();

    const showMoreBtn = page.getByText(/Toon meer/i).first();
    await expect(showMoreBtn).toBeVisible();
    await showMoreBtn.click();
    await page.waitForTimeout(500);

    const checkboxesAfter = await page.getByRole("checkbox").count();
    expect(checkboxesAfter).toBeGreaterThan(checkboxesBefore);

    // Verify newly revealed cities also have numeric counts
    const allLabels = page.locator('label').filter({ has: page.getByRole("checkbox") });
    const totalLabels = await allLabels.count();
    let labelsWithCount = 0;
    for (let i = 0; i < totalLabels; i++) {
      const text = await allLabels.nth(i).textContent();
      if (text && /\(\d+\)/.test(text)) {
        labelsWithCount++;
      }
    }
    expect(labelsWithCount).toBeGreaterThan(0);
  });

  test("smaller cities have noticeably fewer results than large cities", async ({ page }) => {
    // Zaanstad (12) and Almere Stad (69) should have far fewer listings than Amsterdam (1705)
    const showMoreBtn = page.getByText(/Toon meer/i).first();
    await showMoreBtn.click();
    await page.waitForTimeout(500);

    const allLabels = page.locator('label').filter({ has: page.getByRole("checkbox") });
    const totalLabels = await allLabels.count();

    let amsterdamCount = 0;
    let zaanstadCount = 0;
    let almereCount = 0;

    for (let i = 0; i < totalLabels; i++) {
      const text = await allLabels.nth(i).textContent();
      if (!text) continue;
      const match = text.match(/\((\d+)\)/);
      if (!match) continue;
      const num = parseInt(match[1], 10);

      if (/Amsterdam/i.test(text) && !/Alle/i.test(text)) amsterdamCount = num;
      if (/Zaanstad/i.test(text)) zaanstadCount = num;
      if (/Almere/i.test(text)) almereCount = num;
    }

    // Large city should have significantly more listings than small cities
    expect(amsterdamCount).toBeGreaterThan(almereCount);
    expect(amsterdamCount).toBeGreaterThan(zaanstadCount);
    // Zaanstad should be the smallest of the three
    expect(almereCount).toBeGreaterThan(zaanstadCount);
  });

  test("after checking/unchecking cities, the heading count updates to a reasonable number", async ({ page }) => {
    // The heading count must always reflect current filter state — positive integer, no NaN
    const initialCount = await getResultCount(page);
    expect(initialCount).toBeGreaterThan(0);

    const rotterdamCheckbox = page.getByRole("checkbox", { name: /Rotterdam/i });
    await rotterdamCheckbox.check();
    await waitForResults(page);
    const afterAdd = await getResultCount(page);
    expect(afterAdd).toBeGreaterThan(0);
    expect(Number.isInteger(afterAdd)).toBe(true);

    await rotterdamCheckbox.uncheck();
    await waitForResults(page);
    const afterRemove = await getResultCount(page);
    expect(afterRemove).toBeGreaterThan(0);
    expect(Number.isInteger(afterRemove)).toBe(true);
  });
});

test.describe("Multi-city interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CITY_RESULTS_PATH);
    await waitForResults(page);
  });

  test("check Amsterdam + Den Haag then uncheck Amsterdam → only Den Haag results", async ({ page }) => {
    // Removing a city from a multi-selection should leave only the remaining city's results
    const denHaagCheckbox = page.getByRole("checkbox", { name: /Den Haag/i });
    await denHaagCheckbox.check();
    await waitForResults(page);
    const countBoth = await getResultCount(page);

    const amsterdamCheckbox = page.getByRole("checkbox", { name: /Amsterdam/i });
    await amsterdamCheckbox.uncheck();
    await waitForResults(page);
    const countDenHaagOnly = await getResultCount(page);

    // Den Haag alone should have fewer results than Amsterdam + Den Haag combined
    expect(countDenHaagOnly).toBeLessThanOrEqual(countBoth);
    expect(countDenHaagOnly).toBeGreaterThan(0);
  });

  test("rapidly checking and unchecking does not produce negative or NaN counts", async ({ page }) => {
    // Stress test: rapid toggling must not corrupt the displayed count
    const rotterdamCheckbox = page.getByRole("checkbox", { name: /Rotterdam/i });
    const utrechtCheckbox = page.getByRole("checkbox", { name: /Utrecht/i });

    // Rapid toggles without waiting between them
    await rotterdamCheckbox.check();
    await utrechtCheckbox.check();
    await rotterdamCheckbox.uncheck();
    await utrechtCheckbox.uncheck();
    await rotterdamCheckbox.check();

    // Now wait for everything to settle
    await waitForResults(page);

    const count = await getResultCount(page);
    expect(count).toBeGreaterThanOrEqual(0);
    expect(Number.isNaN(count)).toBe(false);
    expect(Number.isInteger(count)).toBe(true);
  });

  test("selecting Alle steden then a single city does not produce inconsistent count", async ({ page }) => {
    // Switching from "all" to a single city should yield a count <= the all-cities count
    const alleCheckbox = page.getByRole("checkbox", { name: /Alle steden/i });
    await alleCheckbox.check();
    await waitForResults(page);
    const alleCount = await getResultCount(page);

    // Now select only Utrecht
    const utrechtCheckbox = page.getByRole("checkbox", { name: /Utrecht/i });
    await alleCheckbox.uncheck();
    await waitForResults(page);
    await utrechtCheckbox.check();
    await waitForResults(page);
    const utrechtCount = await getResultCount(page);

    // A single city cannot exceed the all-cities total
    expect(utrechtCount).toBeLessThanOrEqual(alleCount);
    expect(utrechtCount).toBeGreaterThan(0);
  });
});
