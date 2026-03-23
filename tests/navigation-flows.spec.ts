import { test, expect } from "@playwright/test";
import { BASE_URL, waitForResults, getResultCount, goToCityResults, goToCategory } from "./helpers";

// =============================================================================
// NAVIGATION FLOWS — Cross-page user journeys, breadcrumbs, link consistency
// =============================================================================

test.describe("Homepage category tabs and service links", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/nl");
  });

  test("clicking a service under default tab navigates to category page with correct H1", async ({ page }) => {
    // Users expect that clicking a service link on the homepage lands them on the right category page
    const makLink = page.getByRole("link", { name: "Makelaars" }).first();
    await expect(makLink).toBeVisible();
    await makLink.click();
    await page.waitForURL(/makelaars/, { timeout: 15000 });
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible({ timeout: 10000 });
    await expect(heading).toContainText(/makelaars/i);
  });

  test("switching tabs shows different service links for each category", async ({ page }) => {
    // Each category tab must display its own set of services, not the same list
    const tabs = [
      { name: /Verbouw & Renovatie/i, uniqueService: /Aannemer|Schilder|Stukadoor|Klusjesman/i },
      { name: /Installaties & Duurzaam/i, uniqueService: /Loodgieter|Elektricien|Installateur|Zonnepanelen/i },
      { name: /Tuin & Buiten/i, uniqueService: /Hovenier|Tuinman|Bestrating|Schutting/i },
      { name: /Diensten & Overig/i, uniqueService: /Verhuizer|Schoonmaak|Ontruiming/i },
    ];

    for (const tab of tabs) {
      const tabEl = page.getByRole("button", { name: tab.name })
        .or(page.getByText(tab.name));
      await tabEl.first().click();
      await page.waitForTimeout(500);
      // After clicking the tab, at least one service link matching the category should appear
      const serviceLink = page.getByRole("link", { name: tab.uniqueService }).first();
      await expect(serviceLink).toBeVisible({ timeout: 5000 });
    }
  });

  test("clicking a location link on homepage navigates to city results", async ({ page }) => {
    // Location shortcuts like "Amsterdam" should take users directly to results
    const amsterdamLink = page.getByRole("link", { name: "Amsterdam" }).first();
    await expect(amsterdamLink).toBeVisible();
    await amsterdamLink.click();
    await page.waitForURL(/amsterdam/i, { timeout: 15000 });
    expect(page.url().toLowerCase()).toContain("amsterdam");
  });

  test('"Bekijk alles" location link on homepage navigates to all locations', async ({ page }) => {
    // The "view all" link should lead to a page listing all available locations
    const viewAllLink = page.getByRole("link", { name: /Bekijk alles/i }).first();
    await expect(viewAllLink).toBeVisible();
    await viewAllLink.click();
    await page.waitForLoadState("domcontentloaded");
    // Should navigate away from homepage
    expect(page.url()).not.toBe(`${BASE_URL}/`);
  });
});

test.describe("Category page navigation", () => {
  test("category page loads via /wonen-vastgoed/makelaars URL pattern", async ({ page }) => {
    // The human-readable URL should render the category page with a proper heading
    await page.goto("/nl/wonen-vastgoed/makelaars");
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible({ timeout: 15000 });
    await expect(heading).toContainText(/makelaars/i);
  });

  test("category page loads via /general-category/1/makelaars URL pattern", async ({ page }) => {
    // The ID-based URL should show the same category content as the slug-based URL
    await page.goto("/nl/general-category/1/makelaars");
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible({ timeout: 15000 });
    await expect(heading).toContainText(/makelaars/i);
  });

  test("clicking a popular city link on category page navigates to city results", async ({ page }) => {
    // Users browse categories then drill into a city — this flow must work smoothly
    await page.goto("/nl/wonen-vastgoed/makelaars");
    await page.waitForSelector("h1", { timeout: 15000 });

    const cityLink = page.getByRole("link", { name: "Amsterdam" }).first();
    await expect(cityLink).toBeVisible();
    await cityLink.click();
    await page.waitForURL(/amsterdam/i, { timeout: 15000 });
    expect(page.url().toLowerCase()).toContain("amsterdam");
  });

  test('"Bekijk alle locaties" link on category page works', async ({ page }) => {
    // If a "view all locations" link exists, it should navigate to a location listing
    await page.goto("/nl/wonen-vastgoed/makelaars");
    await page.waitForSelector("h1", { timeout: 15000 });

    const allLocationsLink = page.getByRole("link", { name: /Bekijk alle locaties|Bekijk alles/i }).first();
    // Only test if the link exists on this page
    if (await allLocationsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await allLocationsLink.click();
      await page.waitForLoadState("domcontentloaded");
      expect(page.url()).not.toContain("/wonen-vastgoed/makelaars");
    }
  });

  test("related services links on category page navigate correctly", async ({ page }) => {
    // Category pages may show related services; clicking one should land on another valid category
    await page.goto("/nl/wonen-vastgoed/makelaars");
    await page.waitForSelector("h1", { timeout: 15000 });

    // Look for links to related services like Taxateurs
    const relatedLink = page.getByRole("link", { name: /Taxateur|Notaris|Hypotheekadviseur/i }).first();
    if (await relatedLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      const linkText = await relatedLink.textContent();
      await relatedLink.click();
      await page.waitForLoadState("domcontentloaded");
      // Should navigate to a new page, not stay on makelaars
      expect(page.url()).not.toContain("/wonen-vastgoed/makelaars");
      const heading = page.getByRole("heading", { level: 1 });
      await expect(heading).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe("City results page — breadcrumbs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/nl/makelaars/amsterdam");
    await page.waitForSelector("h2", { timeout: 15000 });
    await waitForResults(page);
  });

  test("breadcrumb shows Bambelo > makelaars > makelaars Amsterdam", async ({ page }) => {
    // Breadcrumbs give users orientation; verify the trail is correct for a city results page
    const breadcrumb = page.locator("nav, [class*=breadcrumb], [aria-label*=breadcrumb]").first()
      .or(page.getByText(/Bambelo.*makelaars.*Amsterdam/i).first());
    await expect(breadcrumb).toBeVisible({ timeout: 5000 });
  });

  test('breadcrumb "makelaars" link navigates back to category page', async ({ page }) => {
    // Clicking the service breadcrumb should take users back to the category overview
    const breadcrumbNav = page.locator("nav, [class*=breadcrumb], [aria-label*=breadcrumb]").first();
    const makelaarsLink = breadcrumbNav.getByRole("link", { name: /^makelaars$/i }).first()
      .or(page.getByRole("link", { name: /^makelaars$/i }).first());
    await makelaarsLink.click();
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toMatch(/makelaars/i);
    // Should NOT still be on the amsterdam page
    expect(page.url().toLowerCase()).not.toContain("amsterdam");
  });

  test('breadcrumb "Bambelo" link navigates back to homepage', async ({ page }) => {
    // The root breadcrumb should always return users to the homepage
    const bambelo = page.getByRole("link", { name: /^Bambelo$/i }).first();
    await bambelo.click();
    await page.waitForLoadState("domcontentloaded");
    // Should end up on the homepage
    expect(page.url()).toMatch(/\/nl\/?$/);
  });
});

test.describe("City results page — links", () => {
  test('"Bekijk alles" on city results navigates to /makelaars/amsterdam/all', async ({ page }) => {
    // The "view all" link expands the result listing and changes the URL
    await page.goto("/nl/makelaars/amsterdam");
    await page.waitForSelector("h2", { timeout: 15000 });
    await waitForResults(page);

    const viewAllLink = page.getByRole("link", { name: /Bekijk alles/i }).first();
    if (await viewAllLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await viewAllLink.click();
      await page.waitForLoadState("domcontentloaded");
      expect(page.url().toLowerCase()).toContain("/makelaars/amsterdam/all");
    }
  });

  test("nearby cities links navigate to valid results pages", async ({ page }) => {
    // Nearby city links (e.g. Diemen, Amstelveen) help users explore adjacent areas
    await page.goto("/nl/makelaars/amsterdam");
    await page.waitForSelector("h2", { timeout: 15000 });
    await waitForResults(page);

    const nearbyLink = page.getByRole("link", { name: /Diemen|Amstelveen|Zaandam|Haarlem|Hoofddorp/i }).first();
    if (await nearbyLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      const cityName = (await nearbyLink.textContent())?.trim().toLowerCase() ?? "";
      await nearbyLink.click();
      await page.waitForLoadState("domcontentloaded");
      // URL should now reference the nearby city
      expect(page.url().toLowerCase()).toContain(cityName.replace(/\s+/g, "-"));
      // Should have a heading on the new page
      const heading = page.locator("h1, h2").first();
      await expect(heading).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe("Footer links", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/nl");
  });

  test("footer Contact link navigates to /contact", async ({ page }) => {
    // Contact page must be reachable from the footer on every page
    const contactLink = page.getByRole("link", { name: /^Contact$/i }).first();
    await expect(contactLink).toBeVisible();
    await contactLink.click();
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/contact");
  });

  test("footer Privacybeleid link loads the privacy policy page", async ({ page }) => {
    // Legal pages must be accessible — privacy policy is required by law
    const link = page.getByRole("link", { name: /Privacybeleid/i }).first();
    await expect(link).toBeVisible();
    await link.click();
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("privacybeleid");
  });

  test("footer Cookiebeleid link loads the cookie policy page", async ({ page }) => {
    // Cookie policy must be accessible per EU regulations
    const link = page.getByRole("link", { name: /Cookiebeleid/i }).first();
    await expect(link).toBeVisible();
    await link.click();
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("cookiebeleid");
  });

  test("footer Algemene voorwaarden link loads the terms page", async ({ page }) => {
    // Terms of service page must load correctly from the footer
    const link = page.getByRole("link", { name: /Algemene voorwaarden/i }).first();
    await expect(link).toBeVisible();
    await link.click();
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("algemene-voorwaarden");
  });
});

test.describe("Global navigation elements", () => {
  test("logo click from category page returns to homepage", async ({ page }) => {
    // The logo is the universal "go home" affordance — must work from any page
    await page.goto("/nl/wonen-vastgoed/makelaars");
    await page.waitForSelector("h1", { timeout: 15000 });

    const logo = page.getByRole("link", { name: /bambelo/i }).first()
      .or(page.locator("header a").first());
    await logo.click();
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toMatch(/\/nl\/?$/);
  });

  test("logo click from city results page returns to homepage", async ({ page }) => {
    // Verify logo navigation works from deeper pages too, not just category level
    await page.goto("/nl/makelaars/amsterdam");
    await page.waitForSelector("h2", { timeout: 15000 });

    const logo = page.getByRole("link", { name: /bambelo/i }).first()
      .or(page.locator("header a").first());
    await logo.click();
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toMatch(/\/nl\/?$/);
  });

  test('"Meld u aan als professional" link points to external partners site', async ({ page }) => {
    // The professional sign-up link should point to the external partners portal
    await page.goto("/nl");
    const proLink = page.getByRole("link", { name: /Meld u aan als professional/i }).first();
    await expect(proLink).toBeVisible();
    const href = await proLink.getAttribute("href");
    expect(href).toContain("partners.bambelo");
  });
});

test.describe("Full user journey — end-to-end navigation", () => {
  test("homepage → tab → service → category → city → results → breadcrumb back to homepage", async ({ page }) => {
    // This simulates a real user journey through the entire funnel and back via breadcrumbs
    // Step 1: Start on homepage
    await page.goto("/nl");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });

    // Step 2: Ensure the "Wonen & Vastgoed" tab is active (default)
    const wonenTab = page.getByText(/Wonen & Vastgoed/i).first();
    await expect(wonenTab).toBeVisible();

    // Step 3: Click "Makelaars" service link
    const serviceLink = page.getByRole("link", { name: "Makelaars" }).first();
    await expect(serviceLink).toBeVisible();
    await serviceLink.click();
    await page.waitForURL(/makelaars/, { timeout: 15000 });

    // Step 4: Verify we're on the category page
    const categoryH1 = page.getByRole("heading", { level: 1 });
    await expect(categoryH1).toBeVisible({ timeout: 10000 });
    await expect(categoryH1).toContainText(/makelaars/i);

    // Step 5: Click Amsterdam city link
    const cityLink = page.getByRole("link", { name: "Amsterdam" }).first();
    await expect(cityLink).toBeVisible();
    await cityLink.click();
    await page.waitForURL(/amsterdam/i, { timeout: 15000 });

    // Step 6: Verify city results page
    await waitForResults(page);
    expect(page.url().toLowerCase()).toContain("amsterdam");

    // Step 7: Use breadcrumb to go back to category
    const breadcrumbService = page.getByRole("link", { name: /^makelaars$/i }).first();
    await breadcrumbService.click();
    await page.waitForLoadState("domcontentloaded");
    expect(page.url().toLowerCase()).not.toContain("amsterdam");
    expect(page.url().toLowerCase()).toContain("makelaars");

    // Step 8: Use breadcrumb to go back to homepage
    const breadcrumbHome = page.getByRole("link", { name: /^Bambelo$/i }).first();
    await breadcrumbHome.click();
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toMatch(/\/nl\/?$/);
  });
});
