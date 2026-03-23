import { test, expect } from "@playwright/test";
import { waitForResults, getResultCount, goToCityResults, goToCategory } from "./helpers";

/**
 * Cross-Category Consistency Tests
 *
 * A comparison platform must present every service category with the same UI
 * structure. If one category is missing a filter sidebar or has a broken
 * breadcrumb, users lose trust and may abandon the site. These tests verify
 * that the page skeleton is identical regardless of which service you browse.
 */

// Representative service from each of the 5 top-level category groups
const CATEGORIES = [
  { group: "wonen-vastgoed", slug: "makelaars", label: "Makelaars", city: "amsterdam" },
  { group: "verbouw-renovatie", slug: "badkamers", label: "Badkamers", city: "amsterdam" },
  { group: "installaties-duurzaam", slug: "cv-installateurs", label: "CV-installateurs", city: "amsterdam" },
  { group: "tuin-buiten", slug: "hoveniers", label: "Hoveniers", city: "amsterdam" },
  { group: "diensten-overig", slug: "accountants", label: "Accountants", city: "amsterdam" },
];

// Expected nav links present on every page
const NAV_ITEMS = [
  /Servicecategorieën/i,
  /Over Bambelo/i,
  /Meld u aan als professional/i,
  /Nederland/i,
];

// Expected footer links present on every page
const FOOTER_LINKS = [
  /^Home$/i,
  /Over ons/i,
  /Hoe het werkt/i,
  /^Contact$/i,
  /Privacybeleid/i,
  /Cookiebeleid/i,
  /Algemene voorwaarden/i,
];

// ============================================================================
// Category page consistency — every category must share the same structure
// ============================================================================

test.describe("Category pages — structural consistency across all 5 groups", () => {
  // Consistency matters because users switching between categories should never
  // encounter a different layout or missing elements — it signals a broken page.

  for (const cat of CATEGORIES) {
    test(`${cat.label} category page loads with HTTP 200 (no error page)`, async ({ page }) => {
      const response = await page.goto(`/nl/${cat.group}/${cat.slug}`);
      expect(response?.status()).toBe(200);
      // Confirm it is not an error/404 page by checking for a real H1
      const heading = page.getByRole("heading", { level: 1 });
      await expect(heading).toBeVisible({ timeout: 15000 });
    });
  }

  for (const cat of CATEGORIES) {
    test(`${cat.label} category page H1 contains the service name`, async ({ page }) => {
      await goToCategory(page, cat.group, cat.slug);
      const heading = page.getByRole("heading", { level: 1 });
      await expect(heading).toBeVisible();
      // The slug with hyphens replaced should appear in the heading text
      const keyword = cat.slug.replace(/-/g, " ").split(" ")[0];
      await expect(heading).toContainText(new RegExp(keyword, "i"));
    });
  }

  for (const cat of CATEGORIES) {
    test(`${cat.label} category page has a breadcrumb with "Bambelo" link`, async ({ page }) => {
      await goToCategory(page, cat.group, cat.slug);
      // Breadcrumbs let users orient themselves; every category must have one
      const bambeloLink = page.getByRole("link", { name: /^Bambelo$/i }).first();
      await expect(bambeloLink).toBeVisible({ timeout: 10000 });
    });
  }

  for (const cat of CATEGORIES) {
    test(`${cat.label} category page has a location search combobox`, async ({ page }) => {
      await goToCategory(page, cat.group, cat.slug);
      // The search input is how users narrow to their city — must be present everywhere
      const searchInput = page.getByPlaceholder(/plaats|locatie|stad|zoek/i).first();
      await expect(searchInput).toBeVisible({ timeout: 10000 });
    });
  }

  for (const cat of CATEGORIES) {
    test(`${cat.label} category page has a region accordion with province buttons`, async ({ page }) => {
      await goToCategory(page, cat.group, cat.slug);
      // Province accordion is the primary browse mechanism; must exist on all categories
      const provinces = ["Drenthe", "Flevoland", "Friesland", "Gelderland"];
      for (const province of provinces) {
        await expect(
          page.getByText(province, { exact: false }).first()
        ).toBeVisible({ timeout: 10000 });
      }
    });
  }

  for (const cat of CATEGORIES) {
    test(`${cat.label} category page has an FAQ section`, async ({ page }) => {
      await goToCategory(page, cat.group, cat.slug);
      // FAQ sections build trust and aid SEO — every category should have one
      const faqHeading = page.getByText(/veelgestelde vragen|faq/i).first();
      await expect(faqHeading).toBeVisible({ timeout: 10000 });
    });
  }
});

// ============================================================================
// City results page consistency — Amsterdam results for every service
// ============================================================================

test.describe("City results pages — structural consistency across all 5 services", () => {
  // If one service's results page is missing filters or sorting, users comparing
  // across services will notice the inconsistency and lose confidence.

  for (const cat of CATEGORIES) {
    test(`${cat.label} Amsterdam page loads with a result count heading`, async ({ page }) => {
      await page.goto(`/nl/${cat.slug}/${cat.city}`);
      await waitForResults(page);
      const heading = page.getByRole("heading", { name: /beste/i });
      await expect(heading).toBeVisible({ timeout: 15000 });
    });
  }

  for (const cat of CATEGORIES) {
    test(`${cat.label} Amsterdam page has the filter sidebar with "Filters" label`, async ({ page }) => {
      await page.goto(`/nl/${cat.slug}/${cat.city}`);
      await waitForResults(page);
      // The sidebar groups all filter controls — its label must be consistent
      const filtersLabel = page.getByText(/^Filters$/i).first();
      await expect(filtersLabel).toBeVisible({ timeout: 10000 });
    });
  }

  for (const cat of CATEGORIES) {
    test(`${cat.label} Amsterdam page has the distance slider (Afstandsfilter)`, async ({ page }) => {
      await page.goto(`/nl/${cat.slug}/${cat.city}`);
      await waitForResults(page);
      // Distance filter lets users control the search radius — must exist on every results page
      const distanceFilter = page.getByText(/Afstandsfilter/i).first();
      await expect(distanceFilter).toBeVisible({ timeout: 10000 });
    });
  }

  for (const cat of CATEGORIES) {
    test(`${cat.label} Amsterdam page has category checkboxes`, async ({ page }) => {
      await page.goto(`/nl/${cat.slug}/${cat.city}`);
      await waitForResults(page);
      // Category checkboxes let users refine by sub-service — at least one must be present
      const categoriesLabel = page.getByText(/Categorieën/i).first();
      await expect(categoriesLabel).toBeVisible({ timeout: 10000 });
      // There should be at least one checkbox in the filter area
      const checkboxes = page.getByRole("checkbox");
      const count = await checkboxes.count();
      expect(count).toBeGreaterThan(0);
    });
  }

  for (const cat of CATEGORIES) {
    test(`${cat.label} Amsterdam page has location checkboxes with Amsterdam checked`, async ({ page }) => {
      await page.goto(`/nl/${cat.slug}/${cat.city}`);
      await waitForResults(page);
      // The current city should be pre-checked in the location filter
      const locationsLabel = page.getByText(/Locaties/i).first();
      await expect(locationsLabel).toBeVisible({ timeout: 10000 });
      const amsterdamCheckbox = page.getByRole("checkbox", { name: /Amsterdam/i }).first();
      await expect(amsterdamCheckbox).toBeVisible({ timeout: 5000 });
      await expect(amsterdamCheckbox).toBeChecked();
    });
  }

  for (const cat of CATEGORIES) {
    test(`${cat.label} Amsterdam page has the sort dropdown with all 5 options`, async ({ page }) => {
      await page.goto(`/nl/${cat.slug}/${cat.city}`);
      await waitForResults(page);
      // Sort dropdown must offer the same options across all services for a consistent UX
      const sortDropdown = page.getByRole("combobox").first()
        .or(page.locator("select").first());
      await expect(sortDropdown).toBeVisible({ timeout: 10000 });
      const options = sortDropdown.locator("option");
      const optionCount = await options.count();
      expect(optionCount).toBe(5);
    });
  }

  for (const cat of CATEGORIES) {
    test(`${cat.label} Amsterdam page has result count > 0`, async ({ page }) => {
      await page.goto(`/nl/${cat.slug}/${cat.city}`);
      await waitForResults(page);
      // A zero-result page for Amsterdam would indicate a data or routing problem
      const count = await getResultCount(page);
      expect(count).toBeGreaterThan(0);
    });
  }
});

// ============================================================================
// Navigation consistency — nav, footer, and trust elements across page types
// ============================================================================

test.describe("Navigation bar consistency across page types", () => {
  // The nav bar is the user's primary orientation tool. If it differs between
  // the homepage, a category page, and a results page, users may think they
  // have left the site or landed on a broken page.

  const pageTypes = [
    { name: "homepage", url: "/nl" },
    { name: "category page (makelaars)", url: "/nl/wonen-vastgoed/makelaars" },
    { name: "city results page (makelaars/amsterdam)", url: "/nl/makelaars/amsterdam" },
  ];

  for (const pageType of pageTypes) {
    test(`nav bar on ${pageType.name} has all expected links`, async ({ page }) => {
      await page.goto(pageType.url);
      await page.waitForLoadState("domcontentloaded");
      // Logo must be present
      const logo = page.locator("header").getByRole("link").first()
        .or(page.getByRole("link", { name: /bambelo/i }).first());
      await expect(logo).toBeVisible({ timeout: 10000 });
      // Check each expected nav item
      for (const navPattern of NAV_ITEMS) {
        const navItem = page.getByText(navPattern).first()
          .or(page.getByRole("link", { name: navPattern }).first());
        await expect(navItem).toBeVisible({ timeout: 10000 });
      }
    });
  }
});

test.describe("Footer consistency across page types", () => {
  // Legal and informational footer links are required on every page. Missing
  // links could mean a broken template or deployment issue.

  const pageTypes = [
    { name: "homepage", url: "/nl" },
    { name: "category page (badkamers)", url: "/nl/verbouw-renovatie/badkamers" },
    { name: "city results page (hoveniers/amsterdam)", url: "/nl/hoveniers/amsterdam" },
  ];

  for (const pageType of pageTypes) {
    test(`footer on ${pageType.name} has all expected links`, async ({ page }) => {
      await page.goto(pageType.url);
      await page.waitForLoadState("domcontentloaded");
      for (const linkPattern of FOOTER_LINKS) {
        const footerLink = page.getByRole("link", { name: linkPattern }).first();
        await expect(footerLink).toBeVisible({ timeout: 10000 });
      }
    });
  }
});

test.describe("Trustpilot badge consistency across page types", () => {
  // The Trustpilot badge builds credibility. If it is missing on some pages
  // but not others, users on those pages get less social proof, hurting conversions.

  const pageTypes = [
    { name: "homepage", url: "/nl" },
    { name: "category page (cv-installateurs)", url: "/nl/installaties-duurzaam/cv-installateurs" },
    { name: "city results page (accountants/amsterdam)", url: "/nl/accountants/amsterdam" },
  ];

  for (const pageType of pageTypes) {
    test(`Trustpilot badge with "Trustscore 4.8" appears on ${pageType.name}`, async ({ page }) => {
      await page.goto(pageType.url);
      await page.waitForLoadState("domcontentloaded");
      const trustpilot = page.getByText(/Trustscore\s*4\.8/i).first();
      await expect(trustpilot).toBeVisible({ timeout: 10000 });
    });
  }
});

test.describe("Logo links to homepage from every page type", () => {
  // The logo is a universal "home" button. If it is broken or points to the
  // wrong URL on any page, users lose their escape hatch.

  const pageTypes = [
    { name: "homepage", url: "/nl" },
    { name: "category page (hoveniers)", url: "/nl/tuin-buiten/hoveniers" },
    { name: "city results page (badkamers/amsterdam)", url: "/nl/badkamers/amsterdam" },
  ];

  for (const pageType of pageTypes) {
    test(`logo on ${pageType.name} links to the homepage`, async ({ page }) => {
      await page.goto(pageType.url);
      await page.waitForLoadState("domcontentloaded");
      const logo = page.getByRole("link", { name: /bambelo/i }).first()
        .or(page.locator("header a").first());
      const href = await logo.getAttribute("href");
      // The logo href should point to the homepage (root or /nl)
      expect(href).toMatch(/^\/?$|\/nl\/?$/);
    });
  }
});

// ============================================================================
// Cross-category data integrity — results are service-specific, not cloned
// ============================================================================

test.describe("Cross-category data integrity", () => {
  // If every service's Amsterdam page shows the exact same result count, it
  // likely means a single dataset is being reused. Each service should have
  // its own providers, so counts must differ for at least some categories.

  test("each category's Amsterdam page shows a different result count (not all identical)", async ({ page }) => {
    const counts: number[] = [];
    for (const cat of CATEGORIES) {
      await page.goto(`/nl/${cat.slug}/${cat.city}`);
      await waitForResults(page);
      const count = await getResultCount(page);
      counts.push(count);
    }
    // Not all counts should be the same — at least 2 distinct values expected
    const uniqueCounts = new Set(counts);
    expect(uniqueCounts.size).toBeGreaterThanOrEqual(2);
  });

  for (const cat of CATEGORIES) {
    test(`breadcrumb on ${cat.label} Amsterdam page shows correct service name`, async ({ page }) => {
      // Breadcrumbs must reflect the actual service, not a hardcoded label.
      // This catches template bugs where the breadcrumb text is static.
      await page.goto(`/nl/${cat.slug}/${cat.city}`);
      await waitForResults(page);
      const keyword = cat.slug.replace(/-/g, " ").split(" ")[0];
      const breadcrumbLink = page.getByRole("link", { name: new RegExp(keyword, "i") }).first();
      await expect(breadcrumbLink).toBeVisible({ timeout: 10000 });
    });
  }
});
