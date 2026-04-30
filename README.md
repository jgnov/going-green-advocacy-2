# Going Green Advocacy 2 — NYC Council (city.goinggreen.earth)

Static single-page outreach site: Photon geocodes the address, **`data/nycc.geojson`** (NYC DCP council districts from [NYC Open Data](https://data.cityofnewyork.us/)) resolves the council district via point-in-polygon ([Turf.js](https://turfjs.org/)), and **`data/council-members.json`** maps each district (1–51) to display name plus public inbox email (`district{N}@council.nyc.gov`). No Google Civic API or lookup API keys are required—only EmailJS (and optionally Supabase) secrets for deploy.

```bash
cp .env.example .env   # fill in EmailJS_* (optional Supabase_*)
npm ci && npm run build
npm run preview        # serves dist/
```

Deploy: push to **`main`**; GitHub Actions builds **`dist/`** (including **`dist/data/`**) to Pages.

---

## Keeping member data current

The file **`data/council-members.json`** is maintained by hand whenever Council membership or district contact routing changes (special elections included). Spot-check **`https://council.nyc.gov/districts/`** after elections; the **next general Council election is November 2029**, while boundaries in **`nycc.geojson`** rarely change—re-fetch from NYC Open Data if DCP publishes a new release.
