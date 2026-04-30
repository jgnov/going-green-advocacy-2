# Change Brief: Replace Google Civic API with NYC Open Data + Static Lookup

## Background

The Google Civic Information API's Representatives endpoint — the one used in `lookupLegislators()` to resolve a Council member from an address — was shut down on April 30, 2025. The current implementation will fail silently (or hit demo mode) for all real users. This brief covers the targeted fix.

---

## What's Broken

The `lookupLegislators()` function currently calls:
```
GET https://www.googleapis.com/civicinfo/v2/representatives
  ?address=...&levels=locality&roles=legislatorLowerBody&key=...
```
This endpoint no longer exists. It needs to be replaced entirely.

---

## Replacement Approach: Point-in-Polygon + Static Member Data

Replace the dead API call with a two-step client-side lookup:

1. **Geocode the address** — already working via Photon, no change needed
2. **Point-in-polygon** — use the user's lat/lng to find their Council district number from a bundled GeoJSON file
3. **Static lookup** — resolve the Council member name and email from a bundled JSON file keyed by district number

No new API keys required. No external runtime dependencies beyond Photon (which is unchanged).

---

## Data Files to Bundle

### 1. District Boundaries — `data/nycc.geojson`

Download the current NYC Council district boundaries (clipped to shoreline) from NYC Open Data:

**Source:** NYC Department of City Planning via NYC Open Data  
**Dataset:** "City Council Districts"  
**Direct download URL:** `https://data.cityofnewyork.us/api/geospatial/yusd-j4xi?method=export&type=GeoJSON`

The relevant property on each feature is `CounDist` (integer, 1–51).

Commit this file to the repo as `data/nycc.geojson`. It is ~500KB and does not need to be fetched at runtime.

### 2. Member Roster — `data/council-members.json`

Create a static JSON file mapping district numbers to member data. Structure:

```json
{
  "1": {
    "name": "Christopher Marte",
    "email": "marte@council.nyc.gov"
  },
  "2": {
    "name": "Harvey Epstein",
    "email": "epstein@council.nyc.gov"
  },
  ...
}
```

**Email pattern:** All NYC Council member emails follow the format `lastname@council.nyc.gov` (lowercase). Verify each entry against the current member list at `https://council.nyc.gov/districts/`.

**Note on the 2025 elections:** All 51 seats were on the ballot in November 2025. The new term began January 2026. Populate the roster with the current 2026 members — do not use any pre-2025 list.

Commit this file to the repo as `data/council-members.json`. This file will need to be manually updated when membership changes (next scheduled cycle is 2029).

---

## Code Changes

### Dependencies

Add **Turf.js** for the point-in-polygon check. Load from CDN in `index.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/@turf/turf@6/turf.min.js"></script>
```

### Replace `lookupLegislators()`

Remove all Google Civic API logic. Replace with:

```javascript
async function lookupLegislators(address) {
  // Step 1: Geocode (unchanged — Photon)
  const geoRes = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=1`);
  const geoData = await geoRes.json();
  const [lng, lat] = geoData.features[0].geometry.coordinates;

  // Step 2: Load district boundaries and find district
  const [boundaryRes, rosterRes] = await Promise.all([
    fetch('data/nycc.geojson'),
    fetch('data/council-members.json')
  ]);
  const boundaries = await boundaryRes.json();
  const roster = await rosterRes.json();

  const point = turf.point([lng, lat]);
  const match = boundaries.features.find(f =>
    turf.booleanPointInPolygon(point, f)
  );

  if (!match) throw new Error('Address not found within NYC Council districts');

  const districtNum = String(match.properties.CounDist);
  const member = roster[districtNum];

  if (!member) throw new Error(`No member data found for district ${districtNum}`);

  return {
    name: member.name,
    email: member.email,
    district: districtNum
  };
}
```

### Update UI Rendering

The function now returns a single member object (not an array). Update any downstream rendering or EmailJS recipient logic accordingly — there is only one recipient per lookup.

---

## Remove

- `GOOGLE_CIVIC_API_KEY` from `.env.example`, `build.js`, and `.github/workflows/deploy.yml`
- Any placeholder injection logic for the Civic API key
- Any jurisdiction/chamber filtering logic referencing the old API response shape

---

## Demo Mode

Update demo mode to trigger when `data/council-members.json` fails to load or when the point-in-polygon returns no match. Show a clearly fake member (e.g., District 99, `test@council.nyc.gov`) so testers can tell they're in demo mode.

---

## Maintenance Note (add to repo README)

Add a note:

> **Keeping member data current:** `data/council-members.json` is a static file and must be updated manually when Council membership changes. The next scheduled election cycle is November 2029, but special elections can occur at any time. Check `https://council.nyc.gov/districts/` periodically and after any special election to verify accuracy.
