# EmailJS Dashboard Setup — Going Green Advocacy 2 (NYC Council)

The site resolves the recipient via **Photon** geocoding + **bundled NYC Council district polygons** (`data/nycc.geojson`) and a **static roster** (`data/council-members.json`). No Civic or lookup API keys are required.

**Staging:** add **`city.goinggreen.earth`** to EmailJS **Account → Security → Allowed domains**.

Constituent-facing Council inboxes typically use **`district{N}@council.nyc.gov`** (verify on [council.nyc.gov/districts/](https://council.nyc.gov/districts/)).

## Template parameters

- `to_email` – Council member email (single address)
- `to_name`, `legislator_names` – member name
- `from_name`, `from_email`, `reply_to`
- `message` – advocacy body from the form preview
- `bcc_email` (optional, via Secrets)

Follow the EmailJS dashboard steps in your previous workflow: create Service, Template with `{{to_email}}` and `{{message}}`, then inject IDs via **`build.js`** (`npm run build`) using `.env` or GitHub Actions secrets (`EMAILJS_*`, optional `SUPABASE_*`).

## Testing

Use `?test=1` in the URL and set `TEST_EMAIL` in `index.html` to receive sends yourself.

## Updating member data

See **README.md** — `data/council-members.json` is updated manually when membership or district contact emails change.
