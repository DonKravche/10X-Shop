# Cross-browser evidence

Screenshots and the script behind the matrix in `COMPATIBILITY.md`.

## Re-running the check

Playwright is **not** a project dependency: PRD rule 8 rules out adding
libraries that CORE does not need, and this is a one-off verification tool, not
part of the application. Install it outside the project:

```bash
# 1. Serve the production bundle
npm run build
npm run preview          # http://localhost:4173

# 2. In a scratch folder somewhere else
npm init -y
npm install playwright
npx playwright install firefox        # Chrome is used from the system install

# 3. Run the suite, pointing it at this folder for the screenshots
node /path/to/10X-Shop/docs/compat/cross-browser-check.mjs /path/to/10X-Shop/docs/compat
```

It prints one JSON object with a row per assertion per browser per viewport,
each carrying `ok` and `overflow`. The run is green when every `ok` is `true`
and every `overflow` is `false`.

## What it asserts

Eighteen steps — the landing page, catalogue, product, cart, the checkout guard, login
validation, sign up and its two account rules, the order, the three Not-found
cases and a direct visit to a deep URL — plus a horizontal-scroll measurement
after each one, in Chrome and Firefox, at 375 × 812 and 1440 × 900.

The steps wait for a named element or URL and throw if it does not arrive, so a
pass means the behaviour happened, not that the page merely loaded.

**Selectors address behaviour, not markup.** The product link is found by where
it points, `article a[href^="/products/"]`, not by the heading level it happens
to sit in. An earlier version used `article h3 a` and went quiet the moment an
accessibility fix changed that heading to `h2`.

## Screenshots

| File | Browser | Width |
| --- | --- | --- |
| `chrome-mobile-catalog.png` | Chrome 156 | 375px |
| `chrome-desktop-catalog.png` | Chrome 156 | 1440px |
| `firefox-mobile-catalog.png` | Firefox 142 | 375px |
| `firefox-desktop-catalog.png` | Firefox 142 | 1440px |
