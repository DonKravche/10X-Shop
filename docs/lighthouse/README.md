# Lighthouse

Annex A, O1 asks for a Lighthouse report at the CORE level and for the targets
to be met at FULL. Both runs here are real, full HTML reports — open
`before.report.html` and `after.report.html` in a browser.

## How these were run

```bash
npm run build
npm run preview                    # http://localhost:4173

npx lighthouse@12.8.2 http://localhost:4173/ \
  --chrome-flags="--headless=new" \
  --form-factor=mobile --screenEmulation.mobile \
  --output=html --output=json --output-path=docs/lighthouse/after
```

- **Lighthouse 12.8.2**, Chrome 156, mobile preset — the preset O1 names.
- **Against the production bundle** served by `npm run preview`, not the dev
  server, so the figures reflect what is shipped.
- **Not against the deployment**, because the site is not deployed yet. O1 asks
  for the deployed site in an incognito window; this is the closest honest
  measurement available and must be re-run once the live URL exists. Over
  localhost the network is effectively instantaneous, so the three timing
  metrics are optimistic — treat Performance as an upper bound, not a result.

`before` is the run that found the problem; `after` is the same audit once it
was fixed. Nothing else changed between them.

## Results

| Metric | Before | After | Target (O1) | What changed |
| --- | --- | --- | --- | --- |
| Performance | 90 | 90 | ≥ 85 | — |
| Accessibility | 98 | **100** | ≥ 90 | `heading-order` fixed |
| Best Practices | 100 | 100 | ≥ 90 | — |
| SEO | 92 | 92 | not a target | — |
| Cumulative Layout Shift | 0 | 0 | < 0.1 | — |
| Largest Contentful Paint | 2.9 s | 2.9 s | — | — |
| First Contentful Paint | 2.5 s | 2.5 s | — | — |
| Total Blocking Time | 0 ms | 0 ms | — | — |
| Speed Index | 4.2 s | 4.2 s | — | — |

All four O1 targets are met.

CLS is a flat 0 because every image on the page carries explicit `width` and
`height`, so the grid reserves each card's space before the picture arrives.

## The one audit still failing

**`robots-txt` is not valid.** `vercel.json` rewrites every path to
`/index.html` so that `/products/5` survives a direct visit, and `vite preview`
does the same locally. A request for `/robots.txt` therefore returns the
application's HTML, which is not a valid robots file.

It affects only the SEO category, which O1 does not set a target for, and the
fix — a real `public/robots.txt` — is not something the specification asks for,
so it has not been added. It is recorded here rather than silently ignored.

## What is not measured here

The timings come from a local server. First Contentful Paint of 2.5 s and
Speed Index of 4.2 s are dominated by the DummyJSON request and by Lighthouse's
simulated mobile throttling, not by the bundle: Total Blocking Time is 0 ms and
the JavaScript is 88.78 kB gzipped against the 250 kB orientation in O1. Real
figures need the deployment.
