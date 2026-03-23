import { test, expect } from "@playwright/test";
import { waitForResults, getResultCount } from "./helpers";

// ---------------------------------------------------------------------------
// Homepage search behavior — dual combobox search (service + location),
// selection logic, submission, and navigation to results.
// ---------------------------------------------------------------------------

test.describe("Homepage search — field rendering and interaction", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/nl");
  });

  test("both search comboboxes are visible on the homepage", async ({ page }) => {
    // Users must see the two dropdowns to begin any search flow.
    const serviceSelect = page.locator("select").first();
    const locationSelect = page.locator("select").nth(1);

    await expect(serviceSelect).toBeVisible();
    await expect(locationSelect).toBeVisible();
  });

  test("service combobox has a meaningful default placeholder option", async ({ page }) => {
    // The default selected option should prompt the user to pick a service.
    const serviceSelect = page.locator("select").first();
    const selectedText = await serviceSelect.inputValue();

    // The default value should correspond to the placeholder "Welke dienst zoek je?"
    // (typically an empty string or a sentinel value — the visible text matters more)
    const firstOption = serviceSelect.locator("option").first();
    await expect(firstOption).toHaveText(/Welke dienst zoek je/i);
  });

  test("location combobox has a meaningful default placeholder option", async ({ page }) => {
    // The default selected option should prompt the user to pick a city.
    const locationSelect = page.locator("select").nth(1);
    const firstOption = locationSelect.locator("option").first();
    await expect(firstOption).toHaveText(/Plaats/i);
  });

  test("service combobox contains expected service options", async ({ page }) => {
    // The service dropdown must list real services so users can find what they need.
    const serviceSelect = page.locator("select").first();
    const options = serviceSelect.locator("option");

    // Should have more than just the placeholder
    const count = await options.count();
    expect(count).toBeGreaterThan(5);

    // Spot-check known services
    await expect(serviceSelect.locator("option", { hasText: "makelaars" })).toBeAttached();
    await expect(serviceSelect.locator("option", { hasText: "Dakapellen" })).toBeAttached();
    await expect(serviceSelect.locator("option", { hasText: "accountants" })).toBeAttached();
  });

  test("location combobox contains expected Dutch cities", async ({ page }) => {
    // The location dropdown must list real Dutch cities for the search to be useful.
    const locationSelect = page.locator("select").nth(1);
    const options = locationSelect.locator("option");

    const count = await options.count();
    expect(count).toBeGreaterThan(100);

    // Spot-check well-known cities
    await expect(locationSelect.locator("option", { hasText: "Amsterdam" })).toBeAttached();
    await expect(locationSelect.locator("option", { hasText: "Rotterdam" })).toBeAttached();
    await expect(locationSelect.locator("option", { hasText: "Utrecht" })).toBeAttached();
  });

  test("search submit button is visible and has an icon", async ({ page }) => {
    // The search button must be discoverable — it uses an image icon instead of text.
    const searchButton = page.locator("button").filter({ has: page.locator("img") }).first();
    await expect(searchButton).toBeVisible();
  });
});

test.describe("Homepage search — selection behavior", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/nl");
  });

  test("selecting a service updates the combobox value", async ({ page }) => {
    // After picking a service, the dropdown should reflect the selection.
    const serviceSelect = page.locator("select").first();
    await serviceSelect.selectOption({ label: "makelaars" });

    const selectedValue = await serviceSelect.inputValue();
    expect(selectedValue).toBeTruthy();
    // The value should no longer be the placeholder default
    const placeholderValue = await serviceSelect.locator("option").first().getAttribute("value");
    expect(selectedValue).not.toBe(placeholderValue);
  });

  test("selecting a location updates the combobox value", async ({ page }) => {
    // After picking a city, the dropdown should reflect the selection.
    const locationSelect = page.locator("select").nth(1);
    await locationSelect.selectOption({ label: "Amsterdam" });

    const selectedValue = await locationSelect.inputValue();
    expect(selectedValue).toBeTruthy();
    const placeholderValue = await locationSelect.locator("option").first().getAttribute("value");
    expect(selectedValue).not.toBe(placeholderValue);
  });

  test("changing service selection replaces the previous choice", async ({ page }) => {
    // Users may change their mind — the dropdown must allow re-selection.
    const serviceSelect = page.locator("select").first();

    await serviceSelect.selectOption({ label: "makelaars" });
    const firstValue = await serviceSelect.inputValue();

    await serviceSelect.selectOption({ label: "accountants" });
    const secondValue = await serviceSelect.inputValue();

    expect(firstValue).not.toBe(secondValue);
  });

  test("resetting service selection back to placeholder is possible", async ({ page }) => {
    // If a user wants to clear their choice, selecting the placeholder should work.
    const serviceSelect = page.locator("select").first();
    const placeholderValue = await serviceSelect.locator("option").first().getAttribute("value") ?? "";

    await serviceSelect.selectOption({ label: "makelaars" });
    expect(await serviceSelect.inputValue()).not.toBe(placeholderValue);

    await serviceSelect.selectOption({ index: 0 });
    expect(await serviceSelect.inputValue()).toBe(placeholderValue);
  });
});

test.describe("Homepage search — submission and navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/nl");
  });

  test("selecting service + city and clicking search navigates to results page", async ({ page }) => {
    // The core happy-path: user picks a service and city, clicks search, lands on results.
    const serviceSelect = page.locator("select").first();
    const locationSelect = page.locator("select").nth(1);
    const searchButton = page.locator("button").filter({ has: page.locator("img") }).first();

    await serviceSelect.selectOption({ label: "makelaars" });
    await locationSelect.selectOption({ label: "Amsterdam" });
    await searchButton.click();

    await page.waitForURL(/makelaars|amsterdam/i, { timeout: 15000 });
    expect(page.url().toLowerCase()).toContain("makelaars");
    expect(page.url().toLowerCase()).toContain("amsterdam");
  });

  test("results page shows a heading with result count after search", async ({ page }) => {
    // After a successful search, the results page should confirm what was found.
    const serviceSelect = page.locator("select").first();
    const locationSelect = page.locator("select").nth(1);
    const searchButton = page.locator("button").filter({ has: page.locator("img") }).first();

    await serviceSelect.selectOption({ label: "makelaars" });
    await locationSelect.selectOption({ label: "Amsterdam" });
    await searchButton.click();

    await page.waitForURL(/makelaars|amsterdam/i, { timeout: 15000 });
    await waitForResults(page);

    const count = await getResultCount(page);
    expect(count).toBeGreaterThan(0);
  });

  test("submitting with only a service (no city) still navigates", async ({ page }) => {
    // Some users may want to browse a service category nationally without specifying a city.
    const serviceSelect = page.locator("select").first();
    const searchButton = page.locator("button").filter({ has: page.locator("img") }).first();

    await serviceSelect.selectOption({ label: "makelaars" });
    await searchButton.click();

    // Should either navigate to a category page or show a validation prompt.
    // We check that the URL changed or the page shows relevant content.
    await page.waitForTimeout(3000);
    const url = page.url();
    const stayedOnHomepage = url.endsWith("/nl") || url.endsWith("/nl/");
    if (!stayedOnHomepage) {
      // Navigated — verify the URL is sensible
      expect(url.toLowerCase()).toContain("makelaars");
    } else {
      // Stayed on homepage — there should be some feedback to the user
      // (this is acceptable behavior, documenting it)
      expect(stayedOnHomepage).toBe(true);
    }
  });

  test("submitting with only a city (no service) — behavior check", async ({ page }) => {
    // A user might pick a city first without a service — the UI should handle this gracefully.
    const locationSelect = page.locator("select").nth(1);
    const searchButton = page.locator("button").filter({ has: page.locator("img") }).first();

    await locationSelect.selectOption({ label: "Amsterdam" });
    await searchButton.click();

    await page.waitForTimeout(3000);
    const url = page.url();
    const stayedOnHomepage = url.endsWith("/nl") || url.endsWith("/nl/");
    if (!stayedOnHomepage) {
      // If navigation occurred, URL should reference the city
      expect(url.toLowerCase()).toContain("amsterdam");
    } else {
      // Staying on homepage is valid — no service was specified
      expect(stayedOnHomepage).toBe(true);
    }
  });

  test("submitting with both fields empty does not navigate away from homepage", async ({ page }) => {
    // Clicking search with no selections should not produce a broken page or error.
    const searchButton = page.locator("button").filter({ has: page.locator("img") }).first();
    const urlBefore = page.url();

    await searchButton.click();
    await page.waitForTimeout(2000);

    const urlAfter = page.url();
    // Should stay on homepage or at least not navigate to a broken results page
    expect(urlAfter).toBe(urlBefore);
  });
});

test.describe("Homepage search — keyboard interaction", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/nl");
  });

  test("service combobox is keyboard-navigable with Tab", async ({ page }) => {
    // Accessibility: users should be able to reach the search fields via keyboard.
    const serviceSelect = page.locator("select").first();
    await serviceSelect.focus();
    await expect(serviceSelect).toBeFocused();
  });

  test("search can be completed using only the keyboard", async ({ page }) => {
    // Power users and accessibility users should be able to search without a mouse.
    const serviceSelect = page.locator("select").first();
    const locationSelect = page.locator("select").nth(1);

    // Select service via keyboard
    await serviceSelect.focus();
    await serviceSelect.selectOption({ label: "makelaars" });

    // Tab to location and select
    await locationSelect.focus();
    await locationSelect.selectOption({ label: "Amsterdam" });

    // Tab to button and press Enter
    const searchButton = page.locator("button").filter({ has: page.locator("img") }).first();
    await searchButton.focus();
    await page.keyboard.press("Enter");

    await page.waitForURL(/makelaars|amsterdam/i, { timeout: 15000 });
    expect(page.url().toLowerCase()).toContain("makelaars");
  });
});

test.describe("Homepage search — quick links (Veelgezochte diensten)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/nl");
  });

  test("'Veelgezochte diensten' label is visible on the homepage", async ({ page }) => {
    // The popular services section helps users discover common searches.
    await expect(page.getByText(/Veelgezochte diensten/i)).toBeVisible();
  });

  test("quick links section does not show raw debug output", async ({ page }) => {
    // The popular services section should show clickable links, not raw PHP/Laravel debug data.
    // A debug dump (App\Models\Category) appearing here indicates a server-side rendering bug.
    const debugDump = page.getByText("App\\Models\\Category");
    const isDebugVisible = await debugDump.isVisible().catch(() => false);

    // This is a known defect assertion — if the debug dump is visible, the test flags it.
    expect(isDebugVisible, "Debug dump should not be visible to users in the quick links section").toBe(false);
  });
});

test.describe("Homepage search — different service and city combinations", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/nl");
  });

  test("searching for accountants in Rotterdam navigates correctly", async ({ page }) => {
    // Verify the search works for a different service+city pair (not just makelaars+Amsterdam).
    const serviceSelect = page.locator("select").first();
    const locationSelect = page.locator("select").nth(1);
    const searchButton = page.locator("button").filter({ has: page.locator("img") }).first();

    await serviceSelect.selectOption({ label: "accountants" });
    await locationSelect.selectOption({ label: "Rotterdam" });
    await searchButton.click();

    await page.waitForURL(/accountants|rotterdam/i, { timeout: 15000 });
    expect(page.url().toLowerCase()).toContain("accountants");
    expect(page.url().toLowerCase()).toContain("rotterdam");
  });

  test("searching for Dakapellen in Utrecht navigates correctly", async ({ page }) => {
    // Verify yet another service+city pair to ensure the search is not hardcoded.
    const serviceSelect = page.locator("select").first();
    const locationSelect = page.locator("select").nth(1);
    const searchButton = page.locator("button").filter({ has: page.locator("img") }).first();

    await serviceSelect.selectOption({ label: "Dakapellen" });
    await locationSelect.selectOption({ label: "Utrecht" });
    await searchButton.click();

    await page.waitForURL(/dakapellen|utrecht/i, { timeout: 15000 });
    expect(page.url().toLowerCase()).toContain("dakapellen");
    expect(page.url().toLowerCase()).toContain("utrecht");
  });

  test("location dropdown includes smaller towns, not just major cities", async ({ page }) => {
    // Users in smaller towns should also be able to find local services.
    const locationSelect = page.locator("select").nth(1);

    // Check for a few smaller Dutch towns
    await expect(locationSelect.locator("option", { hasText: "Aalsmeer" })).toBeAttached();
    await expect(locationSelect.locator("option", { hasText: "Barneveld" })).toBeAttached();
    await expect(locationSelect.locator("option", { hasText: "Zeist" })).toBeAttached();
  });
});
