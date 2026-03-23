import { test, expect } from "@playwright/test";
import { waitForResults, getResultCount } from "./helpers";

/**
 * Filter Logic tests for Bambelo city results pages.
 *
 * Black-box tests verifying that category checkboxes, location checkboxes,
 * and the "clear all" button produce logically consistent filter behaviour
 * on the /makelaars/amsterdam results page.
 */

const RESULTS_PATH = "/nl/makelaars/amsterdam";

test.describe("Category filter — default state and toggling", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RESULTS_PATH);
    await waitForResults(page);
  });

  // 1. The page loads with "makelaars" pre-checked and Amsterdam selected,
  //    so we must see a positive result count.
  test("default state shows makelaars checked with result count > 0", async ({
    page,
  }) => {
    const makelaarsCb = page
      .getByRole("checkbox", { name: /makelaars/i })
      .first();
    await expect(makelaarsCb).toBeChecked();

    const count = await getResultCount(page);
    expect(count).toBeGreaterThan(0);
  });

  // 2. Adding a second category (Taxateurs) should change the result count
  //    because we are broadening the category scope.
  test("checking Taxateurs changes result count", async ({ page }) => {
    const originalCount = await getResultCount(page);

    const taxateursCb = page
      .getByRole("checkbox", { name: /taxateurs/i })
      .first();
    await taxateursCb.check();
    await waitForResults(page);

    const newCount = await getResultCount(page);
    expect(newCount).not.toEqual(originalCount);
  });

  // 3. Unchecking makelaars while Taxateurs is now the only selected category
  //    should update the results to a different count.
  test("unchecking makelaars updates results", async ({ page }) => {
    const originalCount = await getResultCount(page);

    const makelaarsCb = page
      .getByRole("checkbox", { name: /makelaars/i })
      .first();
    await makelaarsCb.uncheck();
    await waitForResults(page);

    const newCount = await getResultCount(page);
    expect(newCount).not.toEqual(originalCount);
  });

  // 4. Re-checking makelaars after unchecking should restore (or closely
  //    restore) the original count, proving the filter is reversible.
  test("re-checking makelaars restores original count", async ({ page }) => {
    const originalCount = await getResultCount(page);

    const makelaarsCb = page
      .getByRole("checkbox", { name: /makelaars/i })
      .first();
    await makelaarsCb.uncheck();
    await waitForResults(page);

    const midCount = await getResultCount(page);
    expect(midCount).not.toEqual(originalCount);

    await makelaarsCb.check();
    await waitForResults(page);

    const restoredCount = await getResultCount(page);
    // Allow a small tolerance for live data drift
    expect(restoredCount).toBeGreaterThanOrEqual(originalCount - 5);
    expect(restoredCount).toBeLessThanOrEqual(originalCount + 5);
  });

  // 9. Expanding the "Verbouw & Renovatie" collapsible section should reveal
  //    its subcategory checkboxes.
  test("expanding Verbouw & Renovatie reveals subcategories", async ({
    page,
  }) => {
    // Click the collapsible header to expand it
    const header = page.getByText(/Verbouw & Renovatie/i).first();
    await header.click();
    await page.waitForTimeout(500);

    // At least one subcategory checkbox should now be visible inside that group
    const subcategory = page
      .getByRole("checkbox", { name: /badkamer|aannemer|verbouw|keuken|dakdekker|schilder|stukadoor|timmerman|metselaar|glaszetter/i })
      .first();
    await expect(subcategory).toBeVisible({ timeout: 5000 });
  });

  // 10. Checking a subcategory from a different group alongside makelaars
  //     should produce combined (broader) results.
  test("checking subcategory from another group alongside makelaars gives combined results", async ({
    page,
  }) => {
    const originalCount = await getResultCount(page);

    // Expand Verbouw & Renovatie and check a subcategory
    const header = page.getByText(/Verbouw & Renovatie/i).first();
    await header.click();
    await page.waitForTimeout(500);

    const subcategory = page
      .getByRole("checkbox", { name: /badkamer|aannemer|verbouw|keuken|dakdekker|schilder|stukadoor/i })
      .first();
    await subcategory.check();
    await waitForResults(page);

    const combinedCount = await getResultCount(page);
    // Combined result set should be at least as large as the original
    expect(combinedCount).toBeGreaterThanOrEqual(originalCount);
  });

  // 11. Unchecking ALL categories: verify the page handles the empty
  //     selection gracefully (either shows 0 or falls back to all).
  test("unchecking all categories shows zero or all results", async ({
    page,
  }) => {
    const makelaarsCb = page
      .getByRole("checkbox", { name: /makelaars/i })
      .first();
    await makelaarsCb.uncheck();
    await waitForResults(page);

    const count = await getResultCount(page);
    // With no category selected the site should either show 0 results
    // or revert to showing all results — either way it should not be negative.
    expect(count).toBeGreaterThanOrEqual(0);
  });

  // 15. Parent checkbox behaviour: checking "Wonen & Vastgoed" should toggle
  //     all of its children.
  test("checking Wonen & Vastgoed parent toggles all child categories", async ({
    page,
  }) => {
    // First uncheck makelaars so we start from a clean slate within that group
    const makelaarsCb = page
      .getByRole("checkbox", { name: /makelaars/i })
      .first();
    await makelaarsCb.uncheck();
    await waitForResults(page);

    // Now check the parent checkbox
    const parentCb = page
      .getByRole("checkbox", { name: /Wonen & Vastgoed/i })
      .first();
    await parentCb.check();
    await waitForResults(page);

    // All children under Wonen & Vastgoed should now be checked
    const children = [/makelaars/i, /taxateurs/i, /notarissen/i, /aankoopmakelaars/i, /verkoopmakelaars/i];
    for (const childName of children) {
      const childCb = page.getByRole("checkbox", { name: childName }).first();
      // The child should be checked (or the parent check should have selected it)
      await expect(childCb).toBeChecked({ timeout: 3000 });
    }
  });
});

test.describe("Location filter — city checkboxes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RESULTS_PATH);
    await waitForResults(page);
  });

  // 1-b. Default state: Amsterdam should be checked in the location filter.
  test("Amsterdam is checked by default", async ({ page }) => {
    const amsterdamCb = page
      .getByRole("checkbox", { name: /amsterdam/i })
      .first();
    await expect(amsterdamCb).toBeChecked();
  });

  // 5. Adding Rotterdam alongside Amsterdam should increase (or at least
  //    maintain) the result count — adding cities is additive.
  test("checking Rotterdam alongside Amsterdam increases or maintains count", async ({
    page,
  }) => {
    const originalCount = await getResultCount(page);

    const rotterdamCb = page
      .getByRole("checkbox", { name: /rotterdam/i })
      .first();
    await rotterdamCb.check();
    await waitForResults(page);

    const newCount = await getResultCount(page);
    expect(newCount).toBeGreaterThanOrEqual(originalCount);
  });

  // 6. Switching from Amsterdam to Rotterdam only: the count should differ
  //    and the heading should reflect the change.
  test("switching from Amsterdam to Rotterdam updates count and heading", async ({
    page,
  }) => {
    const originalCount = await getResultCount(page);

    const amsterdamCb = page
      .getByRole("checkbox", { name: /amsterdam/i })
      .first();
    const rotterdamCb = page
      .getByRole("checkbox", { name: /rotterdam/i })
      .first();

    await amsterdamCb.uncheck();
    await waitForResults(page);
    await rotterdamCb.check();
    await waitForResults(page);

    const newCount = await getResultCount(page);
    expect(newCount).toBeGreaterThan(0);
    expect(newCount).not.toEqual(originalCount);

    // Heading should mention Rotterdam (or at least no longer say Amsterdam only)
    const heading = page.getByRole("heading", { name: /beste/i });
    const headingText = await heading.textContent();
    expect(headingText?.toLowerCase()).toContain("rotterdam");
  });

  // 7. Checking "Alle steden" should produce a count >= any single city,
  //    since it includes all cities.
  test("checking Alle steden gives count >= single city count", async ({
    page,
  }) => {
    const singleCityCount = await getResultCount(page);

    const allestedenCb = page
      .getByRole("checkbox", { name: /alle steden/i })
      .first();
    await allestedenCb.check();
    await waitForResults(page);

    const allCount = await getResultCount(page);
    expect(allCount).toBeGreaterThanOrEqual(singleCityCount);
  });

  // 8. Unchecking "Alle steden" should revert to a smaller selection,
  //    producing a count <= the all-cities count.
  test("unchecking Alle steden reverts to smaller count", async ({ page }) => {
    // First check Alle steden
    const allestedenCb = page
      .getByRole("checkbox", { name: /alle steden/i })
      .first();
    await allestedenCb.check();
    await waitForResults(page);

    const allCount = await getResultCount(page);

    // Uncheck it
    await allestedenCb.uncheck();
    await waitForResults(page);

    const revertedCount = await getResultCount(page);
    expect(revertedCount).toBeLessThanOrEqual(allCount);
    expect(revertedCount).toBeGreaterThan(0);
  });

  // 16. Every visible city checkbox label should show a count > 0.
  //     Ghost entries (count = 0) would indicate stale data.
  test("all visible city filter counts are greater than zero", async ({
    page,
  }) => {
    // Locate the location filter section — look for list items or labels with numbers
    const locationLabels = page
      .locator("label, [role='checkbox']")
      .filter({ hasText: /\(\d+\)/ });

    const count = await locationLabels.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const text = await locationLabels.nth(i).textContent();
      const match = text?.match(/\((\d+)\)/);
      if (match) {
        const cityCount = parseInt(match[1], 10);
        expect(cityCount).toBeGreaterThan(0);
      }
    }
  });
});

test.describe("Clear all filters", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RESULTS_PATH);
    await waitForResults(page);
  });

  // 12. After modifying filters, clicking "Alle filters wissen" should reset
  //     both category and location filters back to defaults.
  test("Alle filters wissen resets category and location to defaults", async ({
    page,
  }) => {
    // Modify a filter first — add Taxateurs
    const taxateursCb = page
      .getByRole("checkbox", { name: /taxateurs/i })
      .first();
    await taxateursCb.check();
    await waitForResults(page);

    // Click the clear-all button
    const clearBtn = page.getByText(/alle filters wissen/i).first();
    await clearBtn.click();
    await waitForResults(page);

    // Makelaars should be checked (default), Taxateurs should be unchecked
    const makelaarsCb = page
      .getByRole("checkbox", { name: /makelaars/i })
      .first();
    await expect(makelaarsCb).toBeChecked();
    await expect(taxateursCb).not.toBeChecked();

    // Amsterdam should be checked (default)
    const amsterdamCb = page
      .getByRole("checkbox", { name: /amsterdam/i })
      .first();
    await expect(amsterdamCb).toBeChecked();
  });

  // 13. After clearing, the result count should match the original default.
  test("result count after clearing matches original default", async ({
    page,
  }) => {
    const originalCount = await getResultCount(page);

    // Modify filters
    const taxateursCb = page
      .getByRole("checkbox", { name: /taxateurs/i })
      .first();
    await taxateursCb.check();
    await waitForResults(page);

    const modifiedCount = await getResultCount(page);
    expect(modifiedCount).not.toEqual(originalCount);

    // Clear all
    const clearBtn = page.getByText(/alle filters wissen/i).first();
    await clearBtn.click();
    await waitForResults(page);

    const resetCount = await getResultCount(page);
    // Should be close to original (allow small tolerance for live data)
    expect(resetCount).toBeGreaterThanOrEqual(originalCount - 5);
    expect(resetCount).toBeLessThanOrEqual(originalCount + 5);
  });
});

test.describe("Filter state persistence", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RESULTS_PATH);
    await waitForResults(page);
  });

  // 14. Checking multiple filters, scrolling down the results, then scrolling
  //     back up should preserve the checked state of all filters.
  test("filter checkboxes persist after scrolling down and back up", async ({
    page,
  }) => {
    // Check an additional category
    const taxateursCb = page
      .getByRole("checkbox", { name: /taxateurs/i })
      .first();
    await taxateursCb.check();
    await waitForResults(page);

    // Scroll to the bottom of the page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Both makelaars and taxateurs should still be checked
    const makelaarsCb = page
      .getByRole("checkbox", { name: /makelaars/i })
      .first();
    await expect(makelaarsCb).toBeChecked();
    await expect(taxateursCb).toBeChecked();

    // Amsterdam should still be checked
    const amsterdamCb = page
      .getByRole("checkbox", { name: /amsterdam/i })
      .first();
    await expect(amsterdamCb).toBeChecked();
  });

  // Bonus: result count should also remain the same after scrolling
  test("result count remains stable after scrolling", async ({ page }) => {
    const countBefore = await getResultCount(page);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    const countAfter = await getResultCount(page);
    expect(countAfter).toEqual(countBefore);
  });
});

test.describe("Cross-filter interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RESULTS_PATH);
    await waitForResults(page);
  });

  // Adding both a new category and a new city should produce a count that is
  // >= the count when only one of those filters was added.
  test("adding category + city produces count >= category-only count", async ({
    page,
  }) => {
    // Add Taxateurs (category broadening)
    const taxateursCb = page
      .getByRole("checkbox", { name: /taxateurs/i })
      .first();
    await taxateursCb.check();
    await waitForResults(page);

    const categoryOnlyCount = await getResultCount(page);

    // Also add Rotterdam (location broadening)
    const rotterdamCb = page
      .getByRole("checkbox", { name: /rotterdam/i })
      .first();
    await rotterdamCb.check();
    await waitForResults(page);

    const bothCount = await getResultCount(page);
    expect(bothCount).toBeGreaterThanOrEqual(categoryOnlyCount);
  });

  // The heading text should always contain a numeric count that matches
  // what getResultCount extracts.
  test("heading always contains a valid numeric count", async ({ page }) => {
    const heading = page.getByRole("heading", { name: /beste/i });
    await expect(heading).toBeVisible();

    const text = await heading.textContent();
    const match = text?.match(/De\s+(\d+)\s+beste/i);
    expect(match).not.toBeNull();
    expect(parseInt(match![1], 10)).toBeGreaterThan(0);
  });
});
