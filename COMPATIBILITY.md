# Browser compatibility

Annex A, O3 asks for the application to be checked in Chrome and Firefox at the
CORE level. Both runs below are real: the whole CORE flow was driven through
each browser twice, once at a phone width and once at a desktop width, against
the production bundle (`npm run build` then `npm run preview`).

- **Chrome 156.0.8078.76** — the installed Google Chrome, not bundled Chromium.
- **Firefox 142.0.1** — Gecko, so the two engines are genuinely different.
- **Widths:** 375 × 812 (the width O3 names) and 1440 × 900.
- **Date:** 31 October 2026, re-run against the Sign up work.
- **Method:** `docs/compat/README.md` records the script and how to re-run it.

> **This matrix went stale once, and that is worth recording.** The first run
> was made at commit `f424cb7`. A later accessibility fix moved the product
> card's title from `h3` to `h2`, and the script addressed that link as
> `article h3 a` — so from that commit until this one, the suite failed at
> step 2 and every step after it cascaded. The application was fine; the
> measurement was not. The selector now addresses the link by where it goes
> (`article a[href^="/products/"]`), which no heading change can break. A
> check nobody re-runs is not a check, and a brittle selector is how it goes
> quiet without telling you.

Safari and Edge are FULL-level additions in O3 and were not tested. Edge is
installed on this machine but shares Chrome's engine, so it would not add a
third result.

## The matrix

Every row was asserted, not eyeballed: each one waits for a specific element or
URL and fails if it does not arrive. ✓ means the assertion passed and the
document did not scroll sideways at that width.

| # | What was checked | Chrome 375 | Chrome 1440 | Firefox 375 | Firefox 1440 |
| --- | --- | :-: | :-: | :-: | :-: |
| 0 | Landing shows every category and a sheet of real product photographs | ✓ | ✓ | ✓ | ✓ |
| 1 | Catalog loads and renders exactly 12 product cards | ✓ | ✓ | ✓ | ✓ |
| 2 | A card opens `/products/:id` | ✓ | ✓ | ✓ | ✓ |
| 3 | Add to cart moves the header badge to 1 | ✓ | ✓ | ✓ | ✓ |
| 4 | Cart shows the line and a currency-formatted total | ✓ | ✓ | ✓ | ✓ |
| 5 | A guest opening `/checkout` is sent to `/login` | ✓ | ✓ | ✓ | ✓ |
| 6 | Empty login shows "Username is required" and "Password is required" | ✓ | ✓ | ✓ | ✓ |
| 7 | Sign up is reachable from login and refuses mismatched passwords | ✓ | ✓ | ✓ | ✓ |
| 8 | A completed sign up returns to `/checkout` | ✓ | ✓ | ✓ | ✓ |
| 9 | A claimed username is refused the wrong password | ✓ | ✓ | ✓ | ✓ |
| 10 | An unregistered username still signs in (A1.6, CORE) | ✓ | ✓ | ✓ | ✓ |
| 11 | A valid login returns to `/checkout` | ✓ | ✓ | ✓ | ✓ |
| 12 | Checkout refuses `not-an-email` with the exact message | ✓ | ✓ | ✓ | ✓ |
| 13 | A valid order confirms and clears the cart badge | ✓ | ✓ | ✓ | ✓ |
| 14 | `/nope` shows "Page not found" | ✓ | ✓ | ✓ | ✓ |
| 15 | `/products/abc` shows "Page not found" | ✓ | ✓ | ✓ | ✓ |
| 16 | `/products/999999` shows "Page not found" | ✓ | ✓ | ✓ | ✓ |
| 17 | `/products/5` opens from a direct visit (SPA rewrite) | ✓ | ✓ | ✓ | ✓ |
| — | No horizontal scroll after every step above | ✓ | ✓ | ✓ | ✓ |

**72 of 72 assertions passed** — 18 steps × 2 widths × 2 browsers. No layout or
behavioural difference was found between the two engines, at either width.

Rows 9 and 10 are the pair that matters most. Sign up would be meaningless if
the password it set were never checked (row 9), and CORE would be broken if
signing up became a precondition for logging in (row 10) — A1.6 fixes that any
non-empty username signs in, and the CORE Measurable Outcome for P1 depends on
it. Both are asserted on every run so neither can regress unnoticed.

Screenshots of the catalogue in each browser at each width are in
`docs/compat/`:

| | 375px | 1440px |
| --- | --- | --- |
| Chrome | `chrome-mobile-catalog.png` | `chrome-desktop-catalog.png` |
| Firefox | `firefox-mobile-catalog.png` | `firefox-desktop-catalog.png` |

## The one difference, and why it is not a defect

Chrome's console logs one error per run; Firefox's logs none:

```
Failed to load resource: the server responded with a status of 404 ()
  https://dummyjson.com/products/999999
```

That request is row 12 doing its job. `fetchProductById` asks DummyJSON for a
product that does not exist, DummyJSON answers 404, and the function returns
`null` so the page can show "Page not found" rather than an error. Chrome
reports every failed HTTP response in the console whether or not the page
handles it; Firefox does not. Nothing is thrown, nothing is unhandled, and the
user-facing result is identical in both browsers.

Confirmed by listening for failing responses directly: loading the catalogue,
a real product, the cart, login and checkout produces no failing request in
either browser. The only 404 in the whole suite is the one above, which the
application asks for on purpose.

## What was not covered

- Safari (no macOS or iOS device available) and Edge — both FULL in O3.
- Real phone hardware; 375 × 812 is an emulated viewport.
- Assistive-technology testing beyond the semantics already in the markup
  (labels tied to inputs, `role="status"` on the loading, error and empty
  states, visible focus rings). A full keyboard and screen-reader audit is the
  FULL-level a11y item in O3.
