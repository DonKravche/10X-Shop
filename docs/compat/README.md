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

Twenty-one steps — the landing page, the catalogue in both of its states, one
department, the paged catalogue, a product, the cart, the checkout guard, login
validation, sign up and its two account rules, the order, the three Not-found
cases, the navigation at each width and a direct visit to a deep URL — plus a
horizontal-scroll measurement after each one, in Chrome and Firefox, at
375 × 812 and 1440 × 900.

The steps wait for a named element or URL and throw if it does not arrive, so a
pass means the behaviour happened, not that the page merely loaded.

**Selectors address behaviour, not markup.** The product link is found by where
it points, `article a[href^="/products/"]`, not by the heading level it happens
to sit in. An earlier version used `article h3 a` and went quiet the moment an
accessibility fix changed that heading to `h2`.

**Each wait names what that state actually renders.** The same lesson caught the
script a second time when `/catalog` became a page of departments: the final
screenshot block still waited for an `article` there, and because it sat outside
`step()`'s try/catch it threw and took the entire run down — no results file at
all, in either browser. Waits on the departments view now look for
`a[href^="/catalog?category="]`, and only the views that render cards wait for
`article`.

**A step may assert different things at different widths.** The navigation
step is the only one that does: below 768px it opens the menu and looks inside
it, above it asserts that no menu button exists and the bar carries the links.
Every other step is written to pass at both widths, and the helper that signs
out opens the menu first when there is one, which is also what a shopper on a
phone does.

**Expected failures are named, not ignored.** The suite asks DummyJSON for
`/products/999999` on purpose, so that one URL is allowed to 404. Every other
response of status 400 or worse fails the run, in both engines — see the last
section of `COMPATIBILITY.md`.

## Screenshots

Both of the catalogue's states are captured: `-catalog` is the departments a
shopper lands on, `-department` is `/catalog?category=laptops` inside one.

| File | Browser | Width |
| --- | --- | --- |
| `chrome-mobile-catalog.png` | Chrome 156 | 375px |
| `chrome-desktop-catalog.png` | Chrome 156 | 1440px |
| `chrome-mobile-department.png` | Chrome 156 | 375px |
| `chrome-desktop-department.png` | Chrome 156 | 1440px |
| `firefox-mobile-catalog.png` | Firefox 142 | 375px |
| `firefox-desktop-catalog.png` | Firefox 142 | 1440px |
| `firefox-mobile-department.png` | Firefox 142 | 375px |
| `firefox-desktop-department.png` | Firefox 142 | 1440px |
