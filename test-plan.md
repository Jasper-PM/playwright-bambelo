# Bambelo NL — Functional Test Plan
**Focus:** Search logic, filters, and navigation flows

---

## 1. Homepage Search (7 tests)

| # | Test | Verifies | Steps | Expected |
|---|------|----------|-------|----------|
| 1.1 | Search bar visibility | Both comboboxes render | Load homepage | Service + Location fields visible |
| 1.2 | Service field autocomplete | Typing triggers suggestions | Type "makelaar" in service field | Dropdown with suggestions appears |
| 1.3 | Location field autocomplete | Typing triggers city suggestions | Type "Amsterdam" in location field | Dropdown with city suggestions appears |
| 1.4 | Full search flow | Search navigates to results | Select service + city, click search | Navigate to results page |
| 1.5 | Quick link navigation | Popular service links work | Click "makelaars" quick link | Navigate to makelaars category |
| 1.6 | Empty search blocked | Can't search without input | Click search with empty fields | Stay on homepage |
| 1.7 | Popular service cards | Grid cards are clickable | Click "makelaars" card | Navigate to category page |

## 2. Homepage Category Tabs (6 tests)

| # | Test | Verifies | Steps | Expected |
|---|------|----------|-------|----------|
| 2.1 | Default tab selected | Wonen & Vastgoed is default | Load homepage | Tab is selected, shows 5 services |
| 2.2 | Verbouw & Renovatie tab | Tab switch shows correct services | Click tab | badkamers, keukens, etc. visible |
| 2.3 | Installaties & Duurzaam tab | Tab switch works | Click tab | cv-installateurs, zonnepanelen visible |
| 2.4 | Tuin & Buiten tab | Tab switch works | Click tab | hoveniers visible |
| 2.5 | Diensten & Overig tab | Tab switch works | Click tab | verhuizen, accountants visible |
| 2.6 | Tab service link navigation | Links within tabs work | Click service in active tab | Navigate to category page |

## 3. Category Page — Location Search (4 tests)

| # | Test | Verifies | Steps | Expected |
|---|------|----------|-------|----------|
| 3.1 | Location search visible | Search bar renders | Load category page | Plaats combobox visible |
| 3.2 | Location autocomplete | City suggestions appear | Type "Rotterdam" | Dropdown with suggestions |
| 3.3 | Location search navigates | Selecting city goes to results | Search for Amsterdam, submit | Navigate to city results |
| 3.4 | Popular location links | Quick links work | Click "Amsterdam" | Navigate to /makelaars/amsterdam |

## 4. Category Page — Region Accordion (6 tests)

| # | Test | Verifies | Steps | Expected |
|---|------|----------|-------|----------|
| 4.1 | Region search filters provinces | Typing filters the list | Type "Friesland" | Only Friesland visible, Drenthe hidden |
| 4.2 | Clear search restores all | Wissen button resets | Type, then click Wissen | All provinces visible again |
| 4.3 | First province expanded | Drenthe expanded by default | Load page | Drenthe aria-expanded=true |
| 4.4 | Expanding a province | Click expands accordion | Click Flevoland | Shows city links |
| 4.5 | City link navigation | City links work | Click Assen in Drenthe | Navigate to /makelaars/assen |
| 4.6 | Province city count | Count label is correct | Load page | "17 Steden" shown for Drenthe |

## 5. City Results — Filter Sidebar (2 tests)

| # | Test | Verifies | Steps | Expected |
|---|------|----------|-------|----------|
| 5.1 | All filter sections visible | Sidebar renders completely | Load results page | Filters, Afstandsfilter, Categorieën, Locaties visible |
| 5.2 | Result count heading correct | Shows city name + count | Load /makelaars/amsterdam | "De X beste Makelaars in Amsterdam" |

## 6. City Results — Distance Filter (3 tests)

| # | Test | Verifies | Steps | Expected |
|---|------|----------|-------|----------|
| 6.1 | Slider visible with range | 0-50Km range shown | Load results page | Slider + 0Km/50Km labels visible |
| 6.2 | Apply refreshes results | Toepassen triggers update | Move slider, click Toepassen | Results refresh |
| 6.3 | Clear resets distance | Wissen resets slider | Apply then click Wissen | Slider back to default |

## 7. City Results — Category Filter (5 tests)

| # | Test | Verifies | Steps | Expected |
|---|------|----------|-------|----------|
| 7.1 | Current category pre-checked | makelaars checked on makelaars page | Load page | Checkbox is checked |
| 7.2 | Parent category expanded | Wonen & Vastgoed expanded | Load page | Subcategories visible |
| 7.3 | Expanding other category | Click expands subcategories | Click Verbouw & Renovatie | Shows badkamers, keukens, etc. |
| 7.4 | Adding subcategory | Checking updates results | Check Taxateurs | Results refresh with combined set |
| 7.5 | Unchecking current category | Removing filter updates results | Uncheck makelaars | Results change |

## 8. City Results — Location Filter (5 tests)

| # | Test | Verifies | Steps | Expected |
|---|------|----------|-------|----------|
| 8.1 | Current city pre-checked | Amsterdam checked | Load /makelaars/amsterdam | Checkbox checked |
| 8.2 | Counts displayed | Result counts shown | Load page | "1705" next to Amsterdam |
| 8.3 | Adding city increases results | Checking adds results | Check Rotterdam | Count >= initial count |
| 8.4 | Alle steden shows all | All cities checkbox works | Check Alle steden | Count >= initial count |
| 8.5 | Switching city updates results | Uncheck one, check another | Uncheck Amsterdam, check Rotterdam | Results update |

## 9. City Results — Clear All Filters (1 test)

| # | Test | Verifies | Steps | Expected |
|---|------|----------|-------|----------|
| 9.1 | Alle filters wissen resets | All filters clear at once | Apply filters, click button | All filters reset |

## 10. City Results — Sort (4 tests)

| # | Test | Verifies | Steps | Expected |
|---|------|----------|-------|----------|
| 10.1 | Sort dropdown visible | Dropdown renders | Load results | Combobox visible |
| 10.2 | Sort by Relevantie | Sorting works | Select option | Results refresh |
| 10.3 | Sort by Beoordeling Hoog→Laag | Sorting works | Select option | Results refresh |
| 10.4 | Sort by Meest beoordeeld | Sorting works | Select option | Results refresh |

## 11. Filter Combinations (4 tests)

| # | Test | Verifies | Steps | Expected |
|---|------|----------|-------|----------|
| 11.1 | Distance + location | Combined filters work | Set distance + add city | Results reflect both |
| 11.2 | Category + location | Combined filters work | Add category + add city | Results reflect both |
| 11.3 | All three filter types | Triple combination | Distance + category + location | Results reflect all |
| 11.4 | Clear all after multiple | Reset works after combinations | Apply all, click clear all | All filters reset |

## 12. Filter Edge Cases (3 tests)

| # | Test | Verifies | Steps | Expected |
|---|------|----------|-------|----------|
| 12.1 | Rapid filter toggling | No race conditions | Toggle checkbox 4 times rapidly | Page remains functional |
| 12.2 | Multiple cities selected | Additive location filtering | Check 3+ cities | Count reflects all selected |
| 12.3 | Different category URL | Correct pre-selection via URL | Navigate to /taxateurs/amsterdam | Taxateurs checked, Amsterdam checked |

## 13. Cross-Category Consistency (4 tests)

| # | Test | Verifies | Steps | Expected |
|---|------|----------|-------|----------|
| 13.1-4 | taxateurs/badkamers/cv-installateurs/hoveniers Amsterdam | All categories have filters | Load each page | Filters, sort, results all present |

## 14. End-to-End Flows (4 tests)

| # | Test | Verifies | Steps | Expected |
|---|------|----------|-------|----------|
| 14.1 | Homepage → category → city | Full navigation flow | Click service → click city | Land on results with filters |
| 14.2 | Change category via filter | In-page category switch | Uncheck makelaars, check badkamers | Results update |
| 14.3 | Bekijk alles link | Full results page | Click Bekijk alles | Navigate to /all URL |
| 14.4 | Breadcrumb navigation | Back-navigation works | Click breadcrumb links | Navigate correctly |

## 15. Navigation Elements (2 tests)

| # | Test | Verifies | Steps | Expected |
|---|------|----------|-------|----------|
| 15.1 | Servicecategorieën dropdown | Nav dropdown opens | Click menu item | Dropdown with categories visible |
| 15.2 | Country selector | Dropdown opens | Click Nederland button | Country options appear |

---

**Total: 60 functional tests**
**Focus areas:** 38 filter/search tests, 12 navigation tests, 10 flow/combination tests
