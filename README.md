# IndexPath — Index Fund Calculator

Standalone Next.js site for the keyword **index fund calculator**.

## Features

- Interactive DCA / lump-sum projector (contributions, frequency, years)
- Fund presets: VOO, IVV, SPY, VTI, VXUS, VEA, VWO, QQQ, BND, VT
- Expense ratio drag, DRIP yield, inflation-adjusted balance, contribution step-up
- Fund data table + methodology / S&P historical returns page
- SEO-focused home FAQ for “index fund calculator”

## Develop

```bash
cd /Users/ebrahim/Downloads/index-fund-calculator
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data notes

Fund expense ratios, yields, and AUM in `src/data/funds.ts` are curated
approximations for education. S&P annual returns live in
`src/data/benchmarks.ts`. Update periodically from issuer / index sources.
