# Bambelo Site Structure (NL scope)

**Base URL:** `https://bambelo.rejoicesoftware.in/nl`
**Basic Auth:** Set via `BASIC_AUTH_USER` and `BASIC_AUTH_PASS` env vars (see `.env.example`)

---

## Page Types

### 1. Homepage (`/nl`)
- **Search bar** with two comboboxes:
  - "Welke dienst zoek je?" (service type) — combobox with text input
  - "Plaats" (location) — combobox with text input
  - Search button (icon only)
- **Popular services quick links:** Dakapellen, accountants, makelaars
- **Popular services grid:** makelaars (2964), Dakapellen (1188), Kozijnen (709), Schilders (1008), Warmtepomp (718), Zonnepanelen (407)
- **Service category tabs** ("Alle diensten"):
  - Wonen & Vastgoed (selected by default): makelaars, Taxateurs, Notarissen, Aankoopmakelaars, Verkoopmakelaars
  - Verbouw & Renovatie: badkamers, keukens, dakapellen, kozijnen, isolatie, schilders, glaszetter
  - Installaties & Duurzaam: cv-installateurs, airco-installateurs, warmtepomp, zonnepanelen, thuisbatterij, zonwering
  - Tuin & Buiten: hoveniers, boomverzorgers, hekwerkspecialist
  - Diensten & Overig: verhuizen, rijscholen, accountants, boekhouder
- **Location links:** Amsterdam, Rotterdam, Den Haag, Utrecht, Eindhoven, Tilburg, Groningen, Almere Stad, Breda, Nijmegen, Enschede, Haarlem + "Bekijk alles"
- **Testimonials carousel** with Previous/Next buttons, 7 dot tabs
- **Country selector** in nav: Nederland (dropdown button)
- **Trustpilot badge:** Trustscore 4.8 | 5.2k reviews

### 2. Category Page (`/nl/wonen-vastgoed/makelaars` or `/nl/general-category/{id}/{slug}`)
- **Location search bar:** "Plaats" combobox + search button
- **Popular location quick links:** Amsterdam, Rotterdam, Den Haag, Utrecht, Eindhoven + "Bekijk alle locaties"
- **Breadcrumb:** Bambelo > makelaars
- **Informational content** with CTA "Vind een makelaars"
- **How-to steps** (3 numbered steps)
- **Pricing section**
- **Region accordion** ("Populaire regio's"):
  - Search box: "Zoek regio's of steden..."
  - Clear button ("Wissen")
  - Expandable province sections (Drenthe 17, Flevoland 7, Friesland 27, Gelderland 70, Groningen 18, Limburg 38, North Brabant 90, North Holland 55, Overijssel 26, South Holland 95, Utrecht 35, Zeeland 12)
  - Each province expands to show city links
- **Related services** links (e.g., Taxateurs, Notarissen, Aankoopmakelaars, Verkoopmakelaars)
- **FAQ accordion** (5 questions, expandable)

### 3. City Results Page (`/nl/makelaars/amsterdam`)
- **Title:** "Vind de beste makelaar in Amsterdam"
- **Search bar** at top (location input)
- **Popular location links**
- **Breadcrumb:** Bambelo > makelaars > makelaars Amsterdam

#### Filters sidebar:
- **Distance filter:**
  - Slider: 0Km to 50Km
  - "Toepassen" (Apply) button
  - "Wissen" (Clear) button
- **Category filter** (collapsible tree):
  - Wonen & Vastgoed (expanded, ▼ arrow):
    - makelaars (checked by default since we're on makelaars page)
    - Taxateurs
    - Notarissen
    - Aankoopmakelaars
    - Verkoopmakelaars
  - Verbouw & Renovatie (collapsed, ▶ arrow)
  - Installaties & Duurzaam (collapsed, ▶ arrow)
  - Tuin & Buiten (collapsed, ▶ arrow)
  - Diensten & Overig (collapsed, ▶ arrow)
- **"Alle filters wissen"** (Clear all filters) button
- **Location filter** (checkboxes with counts):
  - Alle steden (All cities)
  - Amsterdam (1705) — checked by default
  - Rotterdam (1157)
  - Den Haag (1067)
  - Utrecht (833)
  - Eindhoven (691)
  - Tilburg (556)
  - Groningen (665)
  - Almere Stad (69)
  - Breda (557)
  - Nijmegen (448)
  - Enschede (456)
  - Haarlem (482)
  - Arnhem (508)
  - Zaanstad (12)
  - Amersfoort (416)
  - Apeldoorn (475)
  - 's-Hertogenbosch (49)
  - Hoofddorp (148)
  - Maastricht (341)
  - "Meer steden >>" (0)
  - "Toon meer" expand link

#### Results area:
- **Result count heading:** "De 114 beste Makelaars in Amsterdam"
- **Sort dropdown** ("Sorteren op"):
  - Relevantie
  - Beoordeling
  - Beoordeling: Hoog naar Laag
  - Beoordeling: Laag naar Hoog
  - Meest beoordeeld
- **Loading state:** "Laden..." / "Resultaten bijwerken..."
- **"Bekijk alles"** link → `/nl/makelaars/amsterdam/all`
- **Result cards** (loaded dynamically)

#### Below results:
- **SEO content** about the service in the city
- **Nearby cities** links (e.g., Diemen, Amstelveen, Zaandam, etc.)
- **FAQ accordion** (6 questions)

### 4. Contact Page (`/nl/contact`)
- Contact form (not yet explored in detail)

### 5. Legal Pages
- `/nl/privacy-policy`
- `/nl/cookie-policy`
- `/nl/terms`

---

## Common Elements (all pages)

### Navigation bar:
- Logo (links to /nl)
- "Servicecategorieën" (dropdown, javascript:void(0))
- "Over Bambelo" (dropdown, javascript:void(0))
- "Meld u aan als professional" → external (partners.bambelo.com)
- Country selector button: "Nederland"

### Footer:
- Logo + Trustpilot badge
- Navigation: Home, Over ons, Hoe het werkt, Carrière bij Bambelo, Meld u aan als professional, Contact
- Ontdekken: Diensten per stad, Word partner, Help
- Country links: België, Belgique, España, France, Italia, Nederland
- Legal: © 2026 Bamboo BV | Privacybeleid | Cookiebeleid | Algemene voorwaarden

---

## URL Patterns

| Pattern | Example | Description |
|---------|---------|-------------|
| `/nl` | Homepage | Main landing page |
| `/nl/{group}/{slug}` | `/nl/wonen-vastgoed/makelaars` | Category page (friendly URL) |
| `/nl/general-category/{id}/{slug}` | `/nl/general-category/1/makelaars` | Category page (ID-based URL) |
| `/nl/{slug}/{city}` | `/nl/makelaars/amsterdam` | City results page |
| `/nl/{slug}/{city}/all` | `/nl/makelaars/amsterdam/all` | All results for city |
| `/nl/location/{city}` | `/nl/location/amsterdam` | City landing page |
| `/nl/locations` | All locations overview | |
| `/nl/contact` | Contact page | |
| `/nl/service-provider/{slug}` | `/nl/service-provider/taxateurs` | Service provider page |
| `/nl/service-category-listing` | Service category listing | |
| `/nl/local-category` | Local category page | |
| `/nl/privacy-policy` | Privacy policy | |
| `/nl/cookie-policy` | Cookie policy | |
| `/nl/terms` | Terms and conditions | |
