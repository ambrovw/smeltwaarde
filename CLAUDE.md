# Smeltwaarde

Precious metal melt-value calculator for South African coins. Live site: https://smeltwaarde.co.za/

## Tech Stack

- **Framework:** React 19 + Vite 7
- **Routing:** react-router-dom v7
- **Styling:** Plain CSS (no framework), organized in `src/styles/`
- **Language:** Afrikaans UI throughout — all user-facing text must be in Afrikaans

## Project Structure

```
src/
  App.jsx              # Router setup: /silver, /gold, /muntHoeveelhede
  main.jsx             # Entry point
  coinData.js          # Silver coin definitions (weight, purity, era)
  goldCoinData.js      # Gold coin definitions (Krugerrands, ZAR Pond, scrap)
  muntHoeveelhedeData.js  # Mintage quantity data
  hooks/
    useSilverPrice.js  # Fetches ZAR silver price from goldprice.org (30s interval)
    useGoldPrice.js    # Fetches ZAR gold price from goldprice.org (60s interval)
  components/
    NavHeader.jsx      # Top nav bar (Silwer, Goud, Munt Hoeveelhede)
    MetalTabs.jsx      # Tab container for silver/gold calculators
    SilverCalculator.jsx
    GoldCalculator.jsx
    MuntHoeveelhede.jsx
  styles/
    base/              # base.css, theme.css
    components/        # Per-component CSS files
```

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build to `dist/`
- `npm run lint` — ESLint
- `./scripts/deploy_s3.sh` — Build and deploy to S3 (profile: ambro, region: af-south-1)

## Key Patterns

- **Price data:** Both hooks fetch from `https://data-asg.goldprice.org/dbXRates/ZAR` and convert troy oz to grams
- **Coin data format:** `{ name, era, purity, weight, quantity }` — purity is a decimal (0.925 = 92.5%), weight in grams
- **Analytics:** Google Analytics (gtag) with custom events for navigation

## Infrastructure

- **Hosting:** S3 static site (bucket: `smeltwaarde.ncah.co.za`, region: af-south-1)
- **Source control:** AWS CodeCommit (af-south-1)
