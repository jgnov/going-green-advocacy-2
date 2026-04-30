# City Council Advocacy Site — Cursor Build Brief

## Overview

Build a second advocacy site, nearly identical to the existing state legislative site (`jgnov/rorgny-advocacy`), but focused on helping NYC residents contact their City Council member about the city budget.

---

## URLs

| Environment | URL |
|---|---|
| Testing / staging | `https://city.goinggreen.earth` |
| Production (future) | `https://advocacy.reachoutandreadnyc.org/city` |

The production URL is for reference only — do not configure it now. The site should be built so that switching base URLs requires no code changes (all paths should be relative).

---

## Source Reference

Base all work on the existing repo at `jgnov/rorgny-advocacy`. This new site should live in a **new, separate repo** (suggested name: `jgnov/rorgny-advocacy-city`) with its own GitHub Pages deployment and GitHub Secrets.

---

## What Stays the Same

- Single-page HTML structure (`index.html`)
- Photon geocoding for address → lat/lng (`https://photon.komoot.io/api/?q=...&limit=1`)
- EmailJS integration for sending messages
- `build.js` pattern for injecting API keys from `.env` into placeholders
- GitHub Actions deploy workflow (`.github/workflows/deploy.yml`)
- `.env.example` pattern for documenting required secrets
- Demo mode fallback when API keys are missing/placeholder
- Overall visual design and layout

---

## What Changes

### 1. Legislator Lookup: Replace Open States with Google Civic Information API

The existing site uses Open States (`v3.openstates.org/people.geo`) to look up NY State Assembly and Senate members. **Replace this entirely** with the Google Civic Information API, which natively supports city council lookup.

**New API call:**
```
GET https://www.googleapis.com/civicinfo/v2/representatives
  ?address={full_address}
  &levels=locality
  &roles=legislatorLowerBody
  &key={GOOGLE_CIVIC_API_KEY}
```

**Response parsing:**
- The response returns `offices` and `officials` arrays
- Filter for offices where `levels` includes `"locality"` and `roles` includes `"legislatorLowerBody"` — this targets NYC Council
- Match officials to offices using the `officialIndices` array on each office object
- Extract: `name`, `party`, and email from `officials[i].emails[0]` if present

**Email fallback:**
If no email is returned by the API, derive it using the pattern:
```
firstname.lastname@council.nyc.gov
```
(lowercase, handle hyphens by removing them; handle particles like "de la" by concatenating without spaces)

**No jurisdiction filtering needed** — unlike Open States, scoping to `levels=locality` and `roles=legislatorLowerBody` with a NYC address will return only the relevant City Council member.

**API key secret name:** `GOOGLE_CIVIC_API_KEY` (same key as the state site if already configured; just add to this repo's secrets)

### 2. Remove Open States References

- Remove `OPEN_STATES_API_KEY` from `.env.example`, `build.js`, and the deploy workflow
- Remove any Open States-specific jurisdiction filtering or chamber-mapping logic

### 3. UI / Copy Changes

Replace all state-legislature-specific language with city-focused language throughout `index.html`. Key substitutions:

| State site language | City site language |
|---|---|
| "NY State Assembly Member" / "NY State Senator" | "NYC Council Member" |
| "state budget" | "city budget" |
| "Albany" | "City Hall" |
| "state legislators" | "your City Council member" |
| Any reference to two legislators (Assembly + Senate) | Single legislator (one Council member per district) |

**Note on single vs. dual recipients:** The state site emails two legislators (one Assembly, one Senate). Each NYC address maps to exactly **one** City Council member. Simplify the UI and email logic accordingly — remove any dual-recipient logic.

**Email template (suggested):**
Update the pre-filled email body to focus on the city budget and early childhood literacy funding. The tone and structure should mirror the state site's template but reference:
- The NYC budget process and Council's role in it
- Funding for early childhood programs (the Reach Out and Read mission)
- A direct ask for the Council member to prioritize / protect relevant budget lines

The exact copy can be finalized later — use placeholder text that makes the intent clear for now.

### 4. Demo Mode

Keep demo mode behavior identical: if `GOOGLE_CIVIC_API_KEY` is missing or a placeholder, show a fake Council member name and email so the UI is testable without a live key.

---

## Environment / Secrets Summary

| Secret name | Purpose |
|---|---|
| `GOOGLE_CIVIC_API_KEY` | Google Civic Information API |
| `EMAILJS_SERVICE_ID` | EmailJS service |
| `EMAILJS_TEMPLATE_ID` | EmailJS template |
| `EMAILJS_PUBLIC_KEY` | EmailJS public key |

All injected via `build.js` at deploy time using the same pattern as the state site.

---

## Deployment

- Host on **GitHub Pages** from the new repo
- Custom domain: `city.goinggreen.earth` — configure via a `CNAME` file in the repo root and a CNAME DNS record at GoDaddy pointing to `jgnov.github.io`
- HTTPS should be enforced (GitHub Pages handles this automatically for custom domains once DNS propagates)

---

## Out of Scope for Now

- The production URL (`advocacy.reachoutandreadnyc.org/city`) — no config needed yet
- Any changes to the state site
- Backend or server-side components — this remains a fully client-side static site

---

## Open Questions for Josh Before Starting

1. **EmailJS template** — should this use the same EmailJS template as the state site, or create a new one with city-specific subject/body defaults?
2. **Branding / header** — same Reach Out and Read logo and color scheme, or any city-specific variation?
3. **Pre-filled email copy** — do you want to draft the city budget email body, or should Cursor generate a placeholder?
