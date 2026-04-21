# Smeltwaarde / Melt Value

Precious metal melt-value calculator for South African coins — Krugerrands, ZAR Pond, pre-decimal silver, and more.

Live:
- **[smeltwaarde.co.za](https://smeltwaarde.co.za/)** (Afrikaans)
- **[meltvalue.co.za](https://meltvalue.co.za/)** (English)

Both sites are served from a single S3 bucket and a single build — see [Infrastructure](#infrastructure).

## Features

- Live gold and silver spot prices in ZAR (from [goldprice.org](https://goldprice.org), polled every 30–60 s)
- Live USD/ZAR exchange rate
- Pre-decimal and post-decimal SA silver coins; Krugerrand and ZAR Pond gold coins; scrap metal input
- Mintage quantity reference (Munt Hoeveelhede)
- Fully bilingual (Afrikaans / English) via Host-header routing — no client-side language switcher needed
- GA4 analytics with debounced quantity-change events

## Tech stack

**Front-end**
- React 19 + Vite 7
- `react-router-dom` v7 (`/silver`, `/gold`, `/muntHoeveelhede`)
- Plain CSS (no framework)
- `react-helmet` for per-route meta tags
- `react-photo-view` + `yet-another-react-lightbox`

**Back-end / data**
- No server. Client fetches prices directly from public endpoints.

## Infrastructure

Single SPA build → two domains → two languages, from one S3 bucket.

```
                    ┌─────────────────────┐
   smeltwaarde.co.za│                     │
   ────────────────▶│  CloudFront         │
                    │  + Viewer-Request   │──┐
   meltvalue.co.za  │    Function         │  │
   ────────────────▶│                     │  │
                    └─────────────────────┘  │
                                             ▼
                              ┌────────────────────────────┐
                              │  S3 bucket (af-south-1)    │
                              │  ├─ index.html    (af)     │
                              │  ├─ index-en.html (en)     │
                              │  └─ assets/*               │
                              └────────────────────────────┘
```

- **[`scripts/cf-function-lang-router.js`](scripts/cf-function-lang-router.js)** — CloudFront Function (viewer-request). Inspects the `Host` header and rewrites the URI to `/index.html` or `/index-en.html` accordingly. Also handles SPA client-side routes by rewriting non-asset paths to the correct language index.
- **[`scripts/generate-en-index.cjs`](scripts/generate-en-index.cjs)** — post-build script that generates `dist/index-en.html` from `dist/index.html`, rewriting title, meta tags, OG/Twitter cards, and JSON-LD structured data for the English domain.
- **[`scripts/deploy_s3.sh`](scripts/deploy_s3.sh)** — zero-argument deploy: build, generate EN index, `aws s3 sync --delete`.

The result: one React codebase, one build artifact, two localized sites with proper per-language SEO and social-preview metadata.

## Running locally

```bash
git clone https://github.com/ambrovw/smeltwaarde.git
cd smeltwaarde
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # production build → dist/
npm run lint
```

No configuration needed for local dev — prices are fetched from public endpoints.

## Self-hosting your own instance

If you want to fork and deploy your own copy (whether under different domains or for a different set of coins), here's what to change.

### 1. Analytics ID (required)

`index.html` contains a hardcoded GA4 measurement ID. **Replace it or remove the gtag block entirely** — otherwise your visits will be logged to the original site's analytics.

```
# in index.html — search for:
G-BWGJV426YF
```

### 2. Domain names (required for bilingual hosting)

The dual-language setup is tied to specific hostnames. If you want the same Afrikaans/English split under your own domains, update:

- `index.html` — `og:url`, `hreflang` alternate links, JSON-LD `url` / `sameAs`, and the inline `isEn = location.hostname === ...` check
- `scripts/cf-function-lang-router.js` — the English-domain check: `host === 'meltvalue.co.za'`
- `scripts/generate-en-index.cjs` — domain strings in the replacement pairs
- `public/sitemap.xml` and `public/robots.txt` — any URLs

If you only want a single-language site, it's simpler: drop the `generate-en-index.cjs` step and the CloudFront function, and serve `index.html` directly.

### 3. S3 deploy target (required for deploying)

The deploy script reads from environment variables:

```bash
BUCKET=my-bucket \
AWS_PROFILE=my-profile \
AWS_REGION=eu-west-1 \
  ./scripts/deploy_s3.sh
```

Or edit the defaults in [`scripts/deploy_s3.sh`](scripts/deploy_s3.sh).

### 4. AWS infrastructure (one-time setup)

You'll need:
- An S3 bucket configured for static website hosting (or a private bucket behind CloudFront with OAC)
- A CloudFront distribution with the bucket as origin
- A CloudFront Function (viewer-request type) published with the contents of `scripts/cf-function-lang-router.js`, and attached to the distribution
- DNS records pointing your domain(s) at CloudFront
- ACM certificate(s) in `us-east-1` for any custom domains

AWS CLI profile with permissions to `s3:PutObject` / `s3:DeleteObject` on the bucket.

### 5. Coin data (if repurposing)

The calculators are South Africa–specific. If you're adapting this for a different country or coin set, the relevant data is in:
- `src/coinData.js` — silver coins
- `src/goldCoinData.js` — gold coins
- `src/muntHoeveelhedeData.js` — mintage quantities
- `src/i18n/translations.js` — UI strings

## License

[MIT](LICENSE) © Abraham van Wyk
