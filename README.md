# Smeltwaarde / Melt Value

Precious metal melt-value calculator and coin-trading site for South African coins — Krugerrands, ZAR Pond, pre-decimal silver, and more.

Live:
- **[smeltwaarde.co.za](https://smeltwaarde.co.za/)** (Afrikaans)
- **[meltvalue.co.za](https://meltvalue.co.za/)** (English)

Both sites are served from a single S3 bucket and a single build — see [Infrastructure](#infrastructure).

## Features

- Live gold and silver spot prices in ZAR (from [goldprice.org](https://goldprice.org), polled every 30–60 s), with per-coin and total melt values updating in place
- Pre-decimal and post-decimal SA silver coins; Krugerrand and ZAR Pond gold coins; scrap metal input
- **Shareable calculations** — coin quantities and premium encode into the URL (`?deel=…`), so a stack can be sent over WhatsApp and opens live-priced for the recipient
- **Koop/Verkoop page** — published buy/sell rates per coin category, relative to live melt value
- **Sell-your-coins flow** — the calculator's Verkoop button opens a contact form prefilled with a breakdown of the selected coins plus the share link
- Serverless contact form with layered abuse protection, delivering to Discord in real time
- Mintage quantity reference (Munt Hoeveelhede)
- Fully bilingual (Afrikaans / English): Host-header routing picks the language per domain, with an in-app toggle
- GA4 analytics with custom events (calculation activity, shares, sell-flow clicks)

## Engineering notes

The parts of this repo that are more interesting than a typical brochure SPA:

- **One build, two localized sites.** A CloudFront viewer-request function inspects the `Host` header and rewrites to `index.html` (af) or `index-en.html` (en); a post-build script generates the English index with rewritten meta/OG/JSON-LD. Per-language SEO and social cards without duplicating the codebase.
- **URL-encoded application state.** Calculator state serializes into a compact query string (`?deel=1-0-5_11-2-12.5&premie=-3`) — shareable, bookmarkable, no backend. Shared views deliberately never persist to the viewer's localStorage, so opening someone else's link can't clobber your own saved coins.
- **Serverless contact pipeline** ([`backend/contact-form/`](backend/contact-form/)) — a SAM-managed Lambda behind a public Function URL. Defense-in-depth against abuse: honeypot field, minimum human fill-time check, per-container rate limiting, reserved concurrency cap, and CORS scoped to the production domains. Notifications go to Discord webhooks (split channels for inquiries vs. click events), with rough IP geolocation attached server-side.
- **A real QA environment** — `qa.smeltwaarde.co.za` mirrors production (own S3 bucket + CloudFront distribution, same cert and language routing) with `X-Robots-Tag: noindex` and a blanket robots.txt so it never leaks into search. One-command deploy with cache invalidation.
- **AI-assisted development** — built and maintained with Claude Code as a daily pair-programmer.

## Tech stack

**Front-end**
- React 19 + Vite 7
- `react-router-dom` v7 (`/silver`, `/gold`, `/muntHoeveelhede`, `/koopVerkoop`)
- Plain CSS (no framework)
- `react-helmet` for per-route meta tags

**Back-end**
- AWS Lambda (Node.js 20) behind a Function URL, defined and deployed with AWS SAM — see [`backend/contact-form/template.yaml`](backend/contact-form/template.yaml)
- No other server: prices are fetched client-side from public endpoints

## Infrastructure

Single SPA build → two domains → two languages, from one S3 bucket. A separate QA distribution serves the same layout from its own bucket.

```
   smeltwaarde.co.za ──┐
                       │  ┌─────────────────────┐      ┌────────────────────────────┐
   meltvalue.co.za  ───┼─▶│ CloudFront          │─────▶│  S3 bucket (af-south-1)    │
                       │  │ + viewer-request fn │      │  ├─ index.html    (af)     │
                       │  └─────────────────────┘      │  ├─ index-en.html (en)     │
                       │                               │  └─ assets/*               │
                       │                               └────────────────────────────┘
   qa.smeltwaarde.co.za ──▶ (own CloudFront + bucket, X-Robots-Tag: noindex)

   Contact form / event pings ──▶ Lambda Function URL (eu-west-1) ──▶ Discord webhooks
```

- **[`scripts/cf-function-lang-router.js`](scripts/cf-function-lang-router.js)** — CloudFront Function (viewer-request). Inspects the `Host` header and rewrites the URI to `/index.html` or `/index-en.html` accordingly. Also handles SPA client-side routes by rewriting non-asset paths to the correct language index.
- **[`scripts/generate-en-index.cjs`](scripts/generate-en-index.cjs)** — post-build script that generates `dist/index-en.html` from `dist/index.html`, rewriting title, meta tags, OG/Twitter cards, and JSON-LD structured data for the English domain.
- **[`scripts/deploy_s3.sh`](scripts/deploy_s3.sh)** — zero-argument production deploy: build, generate EN index, `aws s3 sync --delete`.
- **[`scripts/deploy_qa.sh`](scripts/deploy_qa.sh)** — QA deploy: same, plus a noindex robots.txt overwrite and CloudFront invalidation.
- **[`backend/contact-form/`](backend/contact-form/)** — SAM stack for the contact/notification Lambda; `sam deploy` from that directory is the entire backend release process.

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

### 2. Contact form endpoint (required)

The contact form and click notifications post to a Lambda Function URL owned by this site (`src/notify.js`). Deploy your own from [`backend/contact-form/`](backend/contact-form/) (set your own Discord webhooks in `template.yaml`) and update the endpoint constant — or strip the form and `notify.js` calls entirely.

### 3. Domain names (required for bilingual hosting)

The dual-language setup is tied to specific hostnames. If you want the same Afrikaans/English split under your own domains, update:

- `index.html` — `og:url`, `hreflang` alternate links, JSON-LD `url` / `sameAs`, and the inline `isEn = location.hostname === ...` check
- `scripts/cf-function-lang-router.js` — the English-domain check: `host === 'meltvalue.co.za'`
- `scripts/generate-en-index.cjs` — domain strings in the replacement pairs
- `public/sitemap.xml` and `public/robots.txt` — any URLs

If you only want a single-language site, it's simpler: drop the `generate-en-index.cjs` step and the CloudFront function, and serve `index.html` directly.

### 4. S3 deploy target (required for deploying)

The deploy scripts read from environment variables:

```bash
BUCKET=my-bucket \
AWS_PROFILE=my-profile \
AWS_REGION=eu-west-1 \
  ./scripts/deploy_s3.sh
```

Or edit the defaults in [`scripts/deploy_s3.sh`](scripts/deploy_s3.sh).

### 5. AWS infrastructure (one-time setup)

You'll need:
- An S3 bucket configured for static website hosting (or a private bucket behind CloudFront with OAC)
- A CloudFront distribution with the bucket as origin
- A CloudFront Function (viewer-request type) published with the contents of `scripts/cf-function-lang-router.js`, and attached to the distribution
- DNS records pointing your domain(s) at CloudFront
- ACM certificate(s) in `us-east-1` for any custom domains

AWS CLI profile with permissions to `s3:PutObject` / `s3:DeleteObject` on the bucket.

### 6. Coin data & rates (if repurposing)

The calculators are South Africa–specific. If you're adapting this for a different country or coin set, the relevant data is in:
- `src/coinData.js` — silver coins
- `src/goldCoinData.js` — gold coins
- `src/koopVerkoopData.js` — buy/sell rate card
- `src/muntHoeveelhedeData.js` — mintage quantities
- `src/i18n/translations.js` — UI strings

## License

[MIT](LICENSE) © Abraham van Wyk
