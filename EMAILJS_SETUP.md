# EmailJS Dashboard Setup — Going Green Advocacy 2 (NYC Council)

This guide configures EmailJS for the city council advocacy site. Messages go to **one** NYC Council Member email address resolved via Google Civic Information API (`to_email` is a single address, not comma-separated).

**Staging domain:** add `city.goinggreen.earth` to EmailJS allowed domains (Account → Security). Consider creating a **dedicated EmailJS template** for this site with a NYC budget–oriented subject line so it stays distinct from the state campaign.

## Prerequisites

The site integrates the EmailJS SDK and sends these template parameters:

- `to_email` – NYC Council Member email (single recipient)
- `to_name` – Council member display name
- `from_name` – sender full name
- `from_email` – sender email
- `message` – full advocacy email body
- `legislator_names` – same as `to_name` (field name unchanged for backward compatibility with templates)
- `reply_to` – sender email so the Council office can reply
- `bcc_email` – optional BCC of every outbound message

Lookup uses **Photon** (geocoding) + **Google Civic Information API**; see `.env.example` (`GOOGLE_CIVIC_API_KEY`).

---

## Step 1: Create an Account and Get Your Public Key

1. Sign up at [dashboard.emailjs.com](https://dashboard.emailjs.com)
2. Go to **Account** > **API Keys**
3. Copy your **Public Key** → `EMAILJS_PUBLIC_KEY` in `.env` / GitHub Secrets

---

## Step 2: Add an Email Service

1. Go to [Email Services](https://dashboard.emailjs.com/admin)
2. **Add New Service** (personal or transactional provider)
3. Note **Service ID** → `EMAILJS_SERVICE_ID`

---

## Step 3: Create an Email Template

| Field | Value |
|-------|-------|
| **Subject** | e.g. `Constituent message: NYC budget & childhood literacy` (or `{{from_name}}`) |
| **To Email** | `{{to_email}}` |
| **From Name** | `{{from_name}}` |
| **From Email** | Default service email or `{{from_email}}` |
| **Reply-To** | `{{reply_to}}` |
| **Bcc** | `{{bcc_email}}` (optional — set `EMAILJS_BCC_EMAIL` in Secrets) |

**Content:**

```
{{message}}
```

Disable EmailJS footer/signature clutter in the template editor.

Save → copy **Template ID** → `EMAILJS_TEMPLATE_ID`

---

## Step 3b (Optional): Admin Email Alert Template

Create a second template wired to `EMAILJS_ADMIN_TEMPLATE_ID`; body can reference `sender_name`, `sender_email`, `legislators` (Council member name), `recipient_emails`, `date`.

---

## Step 3c (Optional): BCC Yourself

Add `bcc_email` to the main template; set `EMAILJS_BCC_EMAIL` in Secrets.

---

## Step 4: CONFIG / build injection

Secrets are injected at build time (`build.js`). Locally copy `.env.example` → `.env` and run `npm run build`.

GitHub Actions needs: `GOOGLE_CIVIC_API_KEY`, `EMAILJS_PUBLIC_KEY`, `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, plus optional admin/BCC/Supabase secrets.

Remove obsolete **`OPEN_STATES_API_KEY`** from repo Actions secrets if still present.

---

## Step 5 (Optional): Restrict Domains

**Account → Security:** allow **`https://city.goinggreen.earth`** (add `http://` only if needed before HTTPS propagates).

---

## Testing

1. Build with real `.env`, or rely on injected Secrets after deploy.
2. Set `TEST_EMAIL` in `index.html`, open with `?test=1`.
3. Verify NYC address → Council lookup → click **Send email to your Council Member** — message should arrive at `TEST_EMAIL`, not at the Council address.

Google Cloud: enable **Google Civic Information API** for the API key’s project.

---

## Notes

- EmailJS free tier ~1 req/s; admin notification waits ~1.2s after main send.
