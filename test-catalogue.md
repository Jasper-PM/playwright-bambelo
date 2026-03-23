# Bambelo NL — Complete Test Catalogue (249 tests)

**Target:** https://bambelo.rejoicesoftware.in/nl
**Scope:** Black-box functional testing — search, filters, navigation, UI states, cross-category consistency
**Runner:** `npx playwright test --workers=3`

---

## 1. search-logic.spec.ts (22 tests)
**Owner:** Analyst 1
**What it tests:** The homepage dual-combobox search — service type + location selection, autocomplete, form submission, and navigation to results.

| # | Test | What it verifies |
|---|------|-----------------|
| 1 | Both search comboboxes are visible | The search bar renders with service and location fields |
| 2 | Service combobox has a meaningful placeholder | Users can tell what to type in the service field |
| 3 | Location combobox has a meaningful placeholder | Users can tell what to type in the location field |
| 4 | Service combobox contains expected service options | Dropdown shows real services like makelaars, badkamers |
| 5 | Location combobox contains expected Dutch cities | Dropdown shows cities like Amsterdam, Rotterdam |
| 6 | Search submit button is visible with icon | The search button is findable and clickable |
| 7 | Selecting a service updates the combobox value | The UI reflects the user's choice |
| 8 | Selecting a location updates the combobox value | The UI reflects the user's city choice |
| 9 | Changing service selection replaces previous choice | Switching between services works without stale state |
| 10 | Resetting service selection back to placeholder | Users can clear their choice |
| 11 | Service + city search navigates to results page | The primary happy path works end-to-end |
| 12 | Results page shows heading with result count | After search, users see "De X beste Y in Z" |
| 13 | Submitting with only a service (no city) | Tests partial input — does the site handle gracefully? |
| 14 | Submitting with only a city (no service) | Tests partial input in the other direction |
| 15 | Empty submission does not navigate away | Prevents broken empty searches |
| 16 | Service combobox is keyboard-navigable with Tab | Accessibility — keyboard users can reach the field |
| 17 | Full search via keyboard only | Accessibility — entire flow works without a mouse |
| 18 | "Veelgezochte diensten" label is visible | Popular services section renders |
| 19 | Quick links don't show raw debug output | **Bug detection** — catches Laravel model dump leak |
| 20 | Accountants + Rotterdam search navigates correctly | Cross-service/city combination works |
| 21 | Dakapellen + Utrecht search navigates correctly | Another service/city combination |
| 22 | Location dropdown includes smaller towns | Not just major cities — tests completeness of data |

---

## 2. navigation-flows.spec.ts (22 tests)
**Owner:** Analyst 2
**What it tests:** User journeys across pages — breadcrumbs, internal links, tab navigation, URL patterns, footer links, and full end-to-end flows.

| # | Test | What it verifies |
|---|------|-----------------|
| 1 | Click service in tab → category page with correct H1 | Homepage tabs lead to real category pages |
| 2 | Switching tabs shows different services | Each tab renders its own category group |
| 3 | Location link on homepage navigates to city results | Location shortcuts work |
| 4 | "Bekijk alles" location link navigates away | All-locations link works |
| 5 | Category page loads via `/wonen-vastgoed/makelaars` | Friendly URL pattern works |
| 6 | Category page loads via `/general-category/1/makelaars` | ID-based URL pattern works (both patterns = same content) |
| 7 | Popular city link on category page navigates | Quick city links on category pages work |
| 8 | "Bekijk alle locaties" link works | Full location listing is accessible |
| 9 | Related services links navigate correctly | Sibling category links (e.g., Taxateurs from makelaars page) |
| 10 | Breadcrumb shows correct hierarchy | Bambelo > makelaars > makelaars Amsterdam |
| 11 | Breadcrumb "makelaars" goes back to category | Mid-breadcrumb navigation works |
| 12 | Breadcrumb "Bambelo" goes back to homepage | Root breadcrumb navigation works |
| 13 | "Bekijk alles" on results → `/makelaars/amsterdam/all` | Full results page is accessible |
| 14 | Nearby cities links navigate to valid pages | City cross-links at bottom of results work |
| 15 | Footer Contact link → `/contact` | Contact page is reachable |
| 16 | Footer Privacybeleid link loads | Legal page accessible |
| 17 | Footer Cookiebeleid link loads | Legal page accessible |
| 18 | Footer Algemene voorwaarden link loads | Legal page accessible |
| 19 | Logo from category page → homepage | Logo navigation works from category |
| 20 | Logo from city results → homepage | Logo navigation works from results |
| 21 | "Meld u aan als professional" → external site | External link points to partners.bambelo.com |
| 22 | Full journey: homepage → tab → service → city → breadcrumb back | Complete end-to-end user flow |

---

## 3. category-structure.spec.ts (23 tests)
**Owner:** Analyst 3
**What it tests:** Service category page structure — all 5 category groups load, region accordion behavior, province/city relationships, related services, and FAQ.

| # | Test | What it verifies |
|---|------|-----------------|
| 1-5 | Each category group has a working page | Makelaars, Badkamers, CV-installateurs, Hoveniers, Verhuizen all load |
| 6 | H1 contains the service name | Page heading matches the category |
| 7 | Breadcrumb present with correct hierarchy | Navigation breadcrumb renders |
| 8 | Location search bar is present | Users can search for a city on category pages |
| 9 | Region section renders all 12 provinces | Complete province list: Drenthe through Zeeland |
| 10 | Drenthe is expanded by default | First accordion item starts open |
| 11 | Province city count labels show numbers | "17 Steden" etc. are displayed |
| 12 | Clicking collapsed province expands it | Accordion expand behavior works |
| 13 | City links in expanded province have valid hrefs | Links are real, not broken |
| 14 | Multiple provinces can be expanded simultaneously | Tests if accordion is exclusive or multi-open |
| 15 | Region search filters to "Friesland" only | Typing filters the province list |
| 16 | Wissen button restores all provinces | Clear button undoes the search filter |
| 17 | Gibberish search shows empty state | No results when typing nonsense |
| 18 | Related services shows sibling category links | e.g., Taxateurs, Notarissen shown on makelaars page |
| 19 | Related services links navigate to valid pages | Links aren't broken/404 |
| 20 | FAQ section has expandable questions | FAQ accordion renders |
| 21 | Clicking FAQ question reveals the answer | Expand behavior works |
| 22 | Clicking again collapses the FAQ | Collapse behavior works |
| 23 | Popular cities (Amsterdam, Rotterdam) present as links | Location quick links render |

---

## 4. filter-logic.spec.ts (20 tests)
**Owner:** Data Scientist 1
**What it tests:** Whether filter checkboxes actually change results — category toggling, location toggling, clear-all behavior, and filter state persistence.

| # | Test | What it verifies |
|---|------|-----------------|
| 1 | Default state: makelaars checked, count > 0 | Page loads with correct defaults |
| 2 | Checking Taxateurs changes result count | Adding a category filter has an effect |
| 3 | Unchecking makelaars updates results | Removing a category filter has an effect |
| 4 | Re-checking makelaars restores original count | Filter is reversible (no stuck state) |
| 5 | Expanding Verbouw & Renovatie reveals subcategories | Collapsed category groups can be opened |
| 6 | Checking subcategory from another group gives combined results | Cross-group filtering works |
| 7 | Unchecking all categories handles gracefully | No crash when no category selected |
| 8 | Checking parent toggles all children | Parent checkbox behavior is logical |
| 9 | Amsterdam is checked by default | Location default matches the URL city |
| 10 | Checking Rotterdam increases or maintains count | Adding a city is additive |
| 11 | Switching from Amsterdam to Rotterdam updates count | Single-city swap works |
| 12 | "Alle steden" count >= single city count | All-cities is superset |
| 13 | Unchecking "Alle steden" reverts count | All-cities toggle is reversible |
| 14 | All visible city counts > 0 | No ghost entries with zero results |
| 15 | "Alle filters wissen" resets both categories and locations | Clear-all actually clears everything |
| 16 | Result count after clearing matches original | Clean state = default state |
| 17 | Filter checkboxes persist after scrolling | No state loss on scroll |
| 18 | Result count stable after scrolling | No phantom re-renders |
| 19 | Adding category + city produces count >= category-only | Combined filters are additive |
| 20 | Heading always contains a valid numeric count | No NaN, no empty, no broken heading |

---

## 5. sort-and-counts.spec.ts (17 tests)
**Owner:** Data Scientist 2
**What it tests:** Sort dropdown behavior and result count consistency — sort doesn't change count, counts are real numbers, "Bekijk alles" has more results than filtered view.

| # | Test | What it verifies |
|---|------|-----------------|
| 1 | Default page shows results with positive count | Results exist on page load |
| 2 | Sort dropdown is visible | UI element renders |
| 3 | Sort dropdown has all expected options | Relevantie, Beoordeling, Hoog→Laag, Laag→Hoog, Meest beoordeeld |
| 4 | Sorting by Relevantie keeps count the same | Sort reorders, doesn't filter |
| 5 | Sorting by Hoog naar Laag keeps count | Sort reorders, doesn't filter |
| 6 | Sorting by Laag naar Hoog keeps count | Sort reorders, doesn't filter |
| 7 | Sorting by Meest beoordeeld keeps count | Sort reorders, doesn't filter |
| 8 | After sorting, result cards still visible | Results didn't vanish |
| 9 | Cards visible after every sort option | All sort modes produce visible results |
| 10 | Back-and-forth sorting doesn't break page | Rapid sort changes are safe |
| 11 | Count is a positive integer (not 0 or NaN) | Data integrity of heading |
| 12 | Heading matches "De N beste X in Y" pattern | Well-formed heading text |
| 13 | Amsterdam count is reasonable (> 50) | Plausibility check |
| 14 | "Bekijk alles" page count >= filtered count | Full page has at least as many results |
| 15 | Adding Rotterdam increases count | Location filter is additive |
| 16 | Combined count doesn't exceed total listings | No double-counting bug |
| 17 | Sort selection persists after filter change | Sort doesn't reset when location changes |

---

## 6. distance-and-locations.spec.ts (19 tests)
**Owner:** Data Scientist 3
**What it tests:** Distance slider logic and location filter data consistency — slider affects results, counts are plausible, multi-city selection is monotonically non-decreasing.

| # | Test | What it verifies |
|---|------|-----------------|
| 1 | Slider visible with 0Km / 50Km labels | Distance filter UI renders |
| 2 | Moving slider + Toepassen updates results | Distance filter actually does something |
| 3 | Slider at minimum may decrease results | Narrower distance = fewer results |
| 4 | Slider at maximum >= minimum results | Wider distance = more or equal results |
| 5 | Wissen resets slider and results | Distance clear button works |
| 6 | Distance filter doesn't change location checkboxes | Filters are independent |
| 7 | Distance + location work together | No conflict between the two filter types |
| 8 | All visible city counts are positive integers | No zero or negative counts |
| 9 | Amsterdam count > 100 | Plausibility — Amsterdam is a large city |
| 10 | Amsterdam + Rotterdam >= Amsterdam alone | Adding a city is additive |
| 11 | 3 cities >= 2 cities (monotonic) | Each added city keeps count non-decreasing |
| 12 | "Alle steden" >= any individual city | All-cities is a superset |
| 13 | Unchecking all cities handles gracefully | No crash with zero locations selected |
| 14 | "Toon meer" reveals more cities with counts | Expand shows additional data |
| 15 | Small cities have fewer results than large cities | Zaanstad (12) < Amsterdam (1705) |
| 16 | Heading count is reasonable after toggling | No wild numbers after filter changes |
| 17 | Uncheck Amsterdam from multi-select leaves only Den Haag | Precise city deselection works |
| 18 | Rapid toggling produces no NaN or negative | Stress test: no bad data |
| 19 | "Alle steden" → single city is consistent | Switching from all to one works cleanly |

---

## 7. filter-edge-cases.spec.ts (17 tests)
**Owner:** QA Engineer 1
**What it tests:** Breaking filters — rapid toggling, extreme combinations, clear-all after complex state, browser back behavior, boundary conditions.

| # | Test | What it verifies |
|---|------|-----------------|
| 1 | Rapidly toggle Rotterdam 5 times | No race condition or crash from fast clicks |
| 2 | Rapidly switch sort options 3 times | Sort UI handles rapid changes |
| 3 | Click "Alle filters wissen" twice rapidly | Double-click on clear doesn't break state |
| 4 | Rapidly expand/collapse category groups | Accordion handles fast toggling |
| 5 | Check ALL visible location checkboxes | Max-selection doesn't crash |
| 6 | Expand all 5 category groups | All groups open simultaneously |
| 7 | Check one subcategory from each of 5 groups | Multi-group combination works |
| 8 | Distance + 3 cities + 2 categories + sort | All filter types combined |
| 9 | Apply max filters then clear all | Reset from complex state |
| 10 | Uncheck ALL location checkboxes | Zero locations selected — graceful handling |
| 11 | Uncheck ALL categories | Zero categories selected — graceful handling |
| 12 | Set distance to 0Km and apply | Minimum boundary condition |
| 13 | Apply filters → breadcrumb away → browser back | Filter state after back-navigation |
| 14 | Apply filters → click nearby city link | New page shouldn't inherit old filters |
| 15 | Category + sort + location → heading coherent | Complex state keeps heading logical |
| 16 | "Alle filters wissen" resets sort dropdown | Clear-all also resets sort |
| 17 | Filter changes don't bleed across pages | Navigate away, verify clean state elsewhere |

---

## 8. ui-states.spec.ts (26 tests)
**Owner:** QA Engineer 2
**What it tests:** UI component states — carousel, accordion expand/collapse, loading indicators, "Toon meer" expand, FAQ behavior, interactive elements.

| # | Test | What it verifies |
|---|------|-----------------|
| 1 | Carousel Previous/Next buttons visible | Testimonials carousel renders controls |
| 2 | Seven dot indicators in tablist | Carousel has the right number of slides |
| 3 | Clicking Next advances active dot | Carousel navigation works forward |
| 4 | Clicking Previous goes back | Carousel navigation works backward |
| 5 | Clicking a dot directly switches slide | Direct slide selection works |
| 6 | Carousel wraps or stops at boundary | End-of-carousel behavior is handled |
| 7 | FAQ shows five question buttons | Category page FAQ renders all questions |
| 8 | Clicking FAQ question expands answer | FAQ expand works |
| 9 | Clicking again collapses answer | FAQ collapse works |
| 10 | Multiple FAQs can be open simultaneously | Tests exclusive vs multi-open behavior |
| 11 | FAQ answers contain non-empty text | Answers aren't blank |
| 12 | First province expanded by default | Region accordion default state |
| 13 | Other provinces collapsed by default | Only first is open |
| 14 | Expanding province shows city links | Accordion content renders |
| 15 | Collapsed provinces hide city links | Content is actually hidden |
| 16 | Province buttons have accessible names | Accessibility: screen reader friendly |
| 17 | Filter change shows loading indicator | User sees feedback during updates |
| 18 | After loading, results heading visible | Not stuck in loading state |
| 19 | Loading disappears within reasonable time | No infinite spinner |
| 20 | "Toon meer" reveals additional cities | Location list expansion works |
| 21 | Category group expand toggles visibility | Filter accordion works |
| 22 | Collapse hides subcategories | Filter accordion collapse works |
| 23 | Country selector button clickable | Nav dropdown opens |
| 24 | "Bekijk alle locaties" link functional | Link navigates correctly |
| 25 | City results FAQ shows six questions | Different FAQ count on results page |
| 26 | City results FAQ expand/collapse works | FAQ works on results page too |

---

## 9. cross-category-consistency.spec.ts (83 tests)
**Owner:** QA Engineer 3
**What it tests:** Structural consistency across 5 service categories — every category page and city results page should have the same UI structure, filters, nav, footer, and Trustpilot badge.

### Category pages (30 tests — 6 checks x 5 categories)

| Check | Tested across | What it verifies |
|-------|--------------|-----------------|
| HTTP 200 | makelaars, badkamers, cv-installateurs, hoveniers, accountants | Page loads without error |
| H1 contains service name | all 5 | Heading is dynamic, not hardcoded |
| Breadcrumb with "Bambelo" link | all 5 | Navigation hierarchy present |
| Location search combobox | all 5 | Search bar renders on every category |
| Region accordion with provinces | all 5 | Province list present everywhere |
| FAQ section | all 5 | FAQ renders on every category |

### City results pages (35 tests — 7 checks x 5 categories)

| Check | Tested across | What it verifies |
|-------|--------------|-----------------|
| Result count heading | all 5 Amsterdam pages | Results load for every service type |
| Filter sidebar "Filters" label | all 5 | Filter UI renders everywhere |
| Distance slider (Afstandsfilter) | all 5 | Distance filter present for all services |
| Category checkboxes | all 5 | Category filter present everywhere |
| Location checkboxes with Amsterdam checked | all 5 | Default location matches URL |
| Sort dropdown with all 5 options | all 5 | Sort UI is consistent |
| Result count > 0 | all 5 | Every category has real data |

### Navigation consistency (9 tests — 3 page types x 3 checks)

| Check | Tested on | What it verifies |
|-------|----------|-----------------|
| Nav bar has all expected links | homepage, category, results | Navigation is identical everywhere |
| Footer has all expected links | homepage, category, results | Footer is identical everywhere |
| Trustpilot badge appears | homepage, category, results | Trust badge renders everywhere |

### Logo and data integrity (9 tests)

| Check | What it verifies |
|-------|-----------------|
| Logo → homepage from 3 page types | Logo navigation works everywhere |
| Each category shows different Amsterdam result count | Data is real, not cloned across categories |
| Breadcrumb shows correct service name (x5) | Breadcrumbs are dynamic per service |

---

## Summary

| File | Role | Tests | Focus area |
|------|------|------:|------------|
| search-logic | Analyst 1 | 22 | Homepage search UX |
| navigation-flows | Analyst 2 | 22 | Cross-page user journeys |
| category-structure | Analyst 3 | 23 | Category page structure |
| filter-logic | DS 1 | 20 | Filter cause-and-effect |
| sort-and-counts | DS 2 | 17 | Sort + count consistency |
| distance-and-locations | DS 3 | 19 | Distance slider + location data |
| filter-edge-cases | QA 1 | 17 | Breaking filters |
| ui-states | QA 2 | 26 | UI component states |
| cross-category-consistency | QA 3 | 83 | Structural consistency |
| **Total** | | **249** | |
