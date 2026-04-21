# Smeltwaarde / Melt Value

Precious metal melt-value calculator for South African coins — Krugerrands, ZAR Pond, pre-decimal silver, and more.

Live:
- **[smeltwaarde.co.za](https://smeltwaarde.co.za/)** (Afrikaans)
- **[meltvalue.co.za](https://meltvalue.co.za/)** (English)

Both sites are served from a single S3 bucket and a single build — see [Infrastructure](#infrastructure) below.

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

The interesting part. Single SPA build → two domains → two languages, from one S3 bucket.

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
npm install
npm run dev       # dev server
npm run build     # production build → dist/
npm run lint
```

## Deploying

```bash
./scripts/deploy_s3.sh
```

Requires the `ambro` AWS profile (or edit the script). Invalidation of the CloudFront distribution is handled separately.
