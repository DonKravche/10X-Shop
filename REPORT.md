# 10X Shop — Final report

**Author:** Dongi · **Date:** 24 October 2026, revised 31 October 2026
**Repository:** https://github.com/DonKravche/10X-Shop

---

## 1. Planned vs delivered

The PRD's project rules 1 and 2 require that only CORE is built in the first
stage and that FULL/BONUS is not started without a further instruction. CORE
was built first and is complete apart from the deploy.

**FULL has since been built on instruction**, in the order Annex A lists it.
The request came after a fair question about the CORE login - a visitor meets a
page headed "Log in" with no way to discover that any credentials work - and
then widened to the rest of FULL. What remains unstarted is listed below with
its reason.

### By module

| Module | CORE requirement | Status |
| --- | --- | --- |
| **React** | Function components, props + children, `useState`/`useEffect`, `map()` with stable keys, controlled Login and Checkout, Router, Context, cart with immutable updates | **Done** |
| **React (FULL)** | Custom hooks (`useDebounce`, `useNow`), `useReducer` with a discriminated union, Formik + Yup on Login, toasts, advanced routes | **Done** |
| **TypeScript** | `strict: true`, typed props/state/API, `tsc --noEmit` at 0, no `any` | **Done** |
| **TypeScript (FULL)** | Generics (`ApiClient.get<T>`, `StorageService<T>`, `AsyncState<T>`, `AuthResult<Field>`), `ApiError`, OOP (`Cart`, `OrderModel`), type guards, literal + discriminated unions, `as const` keys | **Done** |
| **Tailwind CSS** | v4 integration, utility-first styling, Flex/Grid, mobile-first responsive, hover/focus/disabled | **Done** |
| **Tailwind CSS (FULL/BONUS)** | Seven design tokens in `@theme` (TW5), dark mode through a custom variant (TW6) | **Done** |
| **Optimization** | Responsive pages, Error Boundary, DEBUG-LOG, basic error handling, Lighthouse report, Chrome + Firefox check | **Done** |
| **Optimization (FULL)** | Route-level code splitting, debounce + AbortController, memoised totals and derived lists | **Done** |
| **Practical project** | README, PLAN.md, REPORT.md, real Git history, deploy | **Done except deploy** |
| **Practical project (FULL)** | Three weekly progress notes in `docs/progress/` | **Done**; Issues/Projects, PR flow and the demo video are not |

### By page

| Page | Requirement | Status |
| --- | --- | --- |
| P0 Global | Layout, Router, Header, 404, checkout guard, loading/error/empty | Done |
| Landing (not in Annex A) | The shop as its own mail-order catalogue: cover, issue figures, two scrollable runs, departments | Added on instruction |
| P1 Login | Controlled form, required validation, Context update, redirect | Done |
| P1.1 Sign Up | FULL — local accounts, hashed password, duplicate names refused | Done on instruction |
| P2 Catalog | `GET /products`, typed data, ProductCard/Grid, navigation, Add to cart | Done; opens on departments (deviation 2) |
| P2.2-P2.8 Catalog FULL | Skeletons, Retry, AbortController, search + debounce, category, sort, pagination, URL-as-state | Done |
| P3 Product | `useParams`, `GET /products/:id`, details, stock states, Add to cart | Done |
| P3.4-P3.5 Product FULL | Tabs, reviews with a live average, related products | Done |
| P4 Cart | Add/change quantity/remove/total, immutable updates | Done |
| P4.2-P4.4 Cart FULL | `useReducer` + discriminated union, `Cart` class, promo code `10X10` | Done |
| P5 Checkout | Four controlled fields, validation, local order confirmation | Done |
| P6 Orders | FULL - list, detail, status simulation, Reorder | Done |
| P7 Profile | FULL - details form, order count, theme, Clear local data | Done |

### Against the 28 steps

All twenty-eight except step 24. Steps 1–23 and 25–28 are complete, including
the four that are FULL: 9 (search, category, sort, pagination, URL state),
17 (reviews, related products, promo code, the cart's reducer), 18
(Orders/Profile, custom hooks, Formik + Yup) and 26–27 (lazy loading, the
Lighthouse report, the cross-browser matrix, `@theme`, generics, OOP).

Step 24, deploy, is prepared but not executed — it is the one requirement of
any level still open.

### Two deliberate deviations from Annex A1.2

Both were asked for, both touch how a shopper reaches the products, and both
are recorded here rather than left for a reader to discover.

#### 1. `/` is a landing page; the catalogue is at `/catalog`

A1.2's route map puts the catalogue at `/`, and this moves it.

What was done to keep the CORE outcomes intact:

- **`/` still loads real products from DummyJSON on open.** The landing page
  makes the same kind of request the catalogue does and shows 48 real product
  photographs and all 24 categories with live counts, so the Measurable
  Outcome that opening the site proves the API works is still satisfied from
  the first screen.
- **Every link whose words say "catalog" goes to `/catalog`**, and P1.3's
  fallback after sign-in — "otherwise the catalogue" — points there too.
- **`/catalog` is still the full P2 page**: the same request, the same
  `ProductGrid`, the same toolbar, twelve to a page and the URL as state. What
  changed is only which of its two states opens first — see the next deviation.
- The cross-browser suite asserts both, so neither can regress unnoticed.

Putting the catalogue back at `/` is a two-line change in `AppRoutes.tsx` if
an examiner would rather have the route map followed literally.

#### 2. `/catalog` opens on its departments, not on products

P2's CORE Measurable Outcome is that opening the catalogue shows a grid of
products fetched from the API. `/catalog` now opens on all 24 departments
instead, each a card with its own photograph and live count; the products
appear once one is chosen. This was asked for in those words — leave only
"browse by department" on the catalogue page, and show each category's products
when a shopper navigates into it.

It is a real deviation and worth naming plainly: a reader following A1.2 and
P2.1 expects `/catalog` to render cards, and on first load it does not.

What was done to keep the CORE outcome intact:

- **`/catalog` still calls the products endpoint on open.** The departments
  view is built from the same `fetchStorefront()` request, and the count on
  each card is real API data, so the page still proves the fetch works before
  a single product is shown.
- **Products are one click away, and nothing about them changed.** A department
  renders the same `ProductGrid` of the same `ProductCard`s, with the toolbar,
  the sort, the pagination and the URL as state all intact.
- **The grid of twelve is still reachable directly and still asserted.**
  `/catalog?page=1&sort=title-asc` returns exactly twelve cards, and the
  cross-browser matrix checks that on every run (row 1c) alongside the two new
  department rows — so the restructure cannot quietly become a loss of P2.
- **Search still spans the whole catalogue.** Typing in the search field — on
  the departments view or in the toolbar — queries every product, not one
  department, so the departments are an entry point rather than a wall.

The condition is one expression in `CatalogPage.tsx`:

```tsx
const showingDepartments = !hasFilters && params.page === 1
```

Inverting it restores A1.2's behaviour exactly, with no other change.

### Not delivered, and why

- **Deploy (step 24).** The build is verified and `vercel.json` carries the SPA
  rewrite, but publishing needs a Vercel account I cannot authenticate to. See
  §4.
- **Password recovery**, the other half of P1.1. With no server and no email
  there is nothing to recover a password *through*, so the form could only
  pretend. It is the one FULL item left undone by choice rather than by time.
- **The FULL half of O3:** Safari and Edge, and a full keyboard and
  screen-reader audit. `COMPATIBILITY.md` says what each would cover; Edge is
  installed here but shares Chrome's engine, so it would not add a third
  result.
- **The FULL half of D.** GitHub Issues and Projects, the twenty issues, the
  milestones, the eight pull requests and the demo video. The three weekly
  progress notes are done; the rest is process evidence that cannot honestly
  be manufactured after the fact, for the same reason the commit dates cannot.
- **The BONUS list.** Infinite scroll, a price-range filter, a wishlist, a
  grid/list toggle, search history, order cancellation and invoice PDFs — all
  listed as Out of Scope by their own sections of Annex A.

---

## 2. Metrics

| Metric | Value |
| --- | --- |
| Commits (excluding the initial commit) | 47 at the time of writing — verify with `git rev-list --count HEAD` |
| Days with commits | 2 (24 and 31 October) |
| Source files in `src/` | 71 (70 TypeScript + `index.css`) |
| Lines of TypeScript/TSX | 5,145 |
| Components | 26 |
| `npm run typecheck` | 0 errors |
| `npm run lint` | 0 errors, 0 warnings |
| `npm run build` | succeeds |
| Bundle, JS (entry chunk) | 241.2 kB raw / **75.1 kB gzip**, split across 14 route chunks |
| Bundle, CSS | 24.0 kB raw / 5.7 kB gzip |
| Occurrences of `any` | 0 (`no-explicit-any` set to error) |
| Horizontal scroll at 375px | none, measured on all six screens in two browsers |
| Cross-browser assertions passing | 68 of 68 (Chrome 156, Firefox 142) |
| End-to-end assertions passing | 40 of 40 across four suites |
| Documented bugs in DEBUG-LOG.md | 11 |

The entry chunk is 75.1 kB gzipped against the 250 kB orientation in O1.
Route-level splitting (O1) put each page in its own chunk, which matters most
for Formik and Yup: they weigh 79.8 kB and are only downloaded by someone who
actually opens the login page.

### Lighthouse

Mobile preset, Lighthouse 12.8.2, against the production bundle served by
`npm run preview`. Full reports in `docs/lighthouse/`; the method and the
caveats are in `docs/lighthouse/README.md`.

| Metric | Before | After | Target (O1) | What changed |
| --- | --- | --- | --- | --- |
| Performance | 90 | 90 | ≥ 85 | — |
| Accessibility | 98 | **100** | ≥ 90 | `heading-order`: product-card and cart-line titles went from `h3` to `h2`, so the heading order no longer skips a level under the page `h1` |
| Best Practices | 100 | 100 | ≥ 90 | — |
| Cumulative Layout Shift | 0 | 0 | < 0.1 | — |
| SEO | 92 | 92 | not a target | — |

All four targets are met. Two honest qualifications: these were measured
against **localhost, not the deployment**, so the timing metrics are optimistic
and must be re-run on the live URL; and one audit, `robots-txt`, still fails
because the SPA rewrite returns `index.html` for every path. That affects only
SEO, which O1 sets no target for, and the fix is not something the
specification asks for.

### Cross-browser

`COMPATIBILITY.md` carries the matrix. Seventeen steps — catalogue, product,
add to cart, cart totals, the checkout guard, login validation, sign up and its
two account rules, a placed order, the three Not-found cases and a direct visit
to a deep URL — driven through Chrome 156 and Firefox 142 at 375 × 812 and
1440 × 900, with a horizontal-scroll measurement after every step. 68 of 68
assertions pass and the two engines showed no layout or behavioural difference.

The suite was also broken for two commits without anyone noticing, which is
recorded in `COMPATIBILITY.md` and as entry 8 of `DEBUG-LOG.md` rather than
quietly fixed. The accessibility fix that moved a card title from `h3` to `h2`
broke a selector written as `article h3 a`; the application was correct
throughout, but the document went on asserting a result that could no longer
be reproduced. Selectors now address behaviour, not markup.

### Honest note on the Git history

The commits fall on two days, 24 and 31 October. The PRD's FULL guidance
suggests 40+ commits across 15+ days; the CORE requirement is only a real,
meaningful history, which this is — each commit is one step of the documented
sequence, with the verification done for it recorded in the message. But two
days do not evidence work spread over three weeks, and I am not going to
present it as though they do.

One thing worth recording because it looked like data loss: on 31 October the
GitHub repository appeared to contain nothing but the initial commit, and the
history looked deleted. It was not. All seventeen commits were sitting on the
local `main`, which had never been pushed — `git log origin/main` showed one
commit, `git log main` showed eighteen. `git push origin main` was a clean
fast-forward and restored the whole history. Nothing was ever lost; it had
simply never left the machine. The lesson is that a commit is not a backup, and
`git status` says so in its second line if you read it.

---

## 3. The three hardest problems

### Deciding what the specification actually required

Annex A contradicts itself in places. The P5.2 validation table still lists
phone, postal code, country, card number, expiry and CVC from a schema that was
withdrawn, while the same table's cells and the section heading state that CORE
checkout is exactly full name, email, address and city. P6.3 shows a payment
method on an order while `types/order.ts` says no payment method exists.

PRD rule 3 settles it: where a detailed example and a CORE/FULL definition
disagree, the definition wins. So checkout has four fields and the application
holds no payment data of any kind. The harder part was noticing the conflicts
rather than implementing whichever version I read last — several of these are
easy to miss because the leftover rows look authoritative.

### Keeping the money honest

Three screens quote a price and two of them add prices up. The risk is the
cart's total disagreeing with the sum of the lines the customer can see,
usually from rounding the unrounded total separately from the rounded lines.

I made `discountedPrice()` the single place a discount is applied, rounded
there to two decimals, and built every total from that same rounded figure.
Then I verified it rather than assuming: with three lines in the cart, each
line total equalled unit price × quantity, and the summary equalled the sum of
the displayed lines at $319.88. Increasing a quantity moved the total by
exactly one unit price, removing a line by exactly that line's total, and the
confirmation's "Total paid" matched the summary shown before submitting.

### A verification habit that was quietly broken

My check command was `npm run lint | tail -8 && echo "LINT OK"`. A pipeline
exits with the status of its last command, and `tail` always succeeds — so
`LINT OK` printed even on a run where ESLint reported an error immediately
above it. I had a green light that could not turn red, and it had been that way
for several steps.

`set -o pipefail` fixed it, and I re-ran the whole chain to confirm the earlier
passes had been genuine. They had been, but the point is that I had no basis
for believing so at the time. This is written up as entry 6 in DEBUG-LOG.md
because it was the most instructive failure of the project.

---

## 4. Outstanding work

1. **Deploy to Vercel and put the URL in the README.** This is the one CORE
   requirement still open. `npm run build` then `npx vercel --prod`; publishing
   needs an interactive login to a Vercel account, which is why it has not been
   done from here. Afterwards confirm that `/products/5` opens from a cold
   visit — `vercel.json` already rewrites every path to `/index.html`, and the
   behaviour was verified against the production bundle locally and in both
   browsers (row 13 of `COMPATIBILITY.md`).
2. **Re-run Lighthouse against the live URL**, in an incognito window, and
   replace the figures in §2. The current ones come from localhost, where the
   network is effectively free, so the timing metrics are optimistic.
3. **Spread the Git history** over the remaining days if further work happens,
   rather than retrofitting dates.
4. **Decide on FULL.** Nothing in CORE blocks any of it.

---

## 5. What I would do differently

**Fix the verification command first.** Everything else in this report rests on
checks that run correctly. I built the habit of running typecheck, lint and
build after each step, which was right, but I did not check that the harness
could report failure — so for several steps I was reading a light that was
painted green. The first thing I would do on the next project is make a check
fail on purpose and confirm I see it.

**Read the whole specification before writing types.** I wrote `Product` with a
`reviews` field because Annex A1.5 shows one, then removed it on noticing that
reviews are FULL and that rule 4 requires types to describe data the
application actually uses. The same applied to `CartState.promoCode` and to the
`signal` parameter I had put on the API functions for an `AbortController` that
P2.2 brackets as FULL. Each was a small edit, but all three came from writing
code against a sample rather than against the requirement.

**Write the architecture note earlier.** The layering only became obviously
correct once I ran a dependency graph over `src/` and could see there were no
import cycles and that `types/` and `utils/` import nothing from `components/`
or `context/`. That is a property worth checking continuously, not at the end.

---

## 6. AI use

I used Claude throughout, as the PRD permits, and the division of labour was
roughly this.

**What I delegated.** Scaffolding and configuration; translating the Annex's
requirements into components; writing the repetitive parts — Tailwind class
strings, the form field wiring, the documentation prose; and driving the
browser to check behaviour I would otherwise have clicked through by hand.

**What I rejected or corrected.** The Vite 9 template now ships oxlint and
omits `"strict"`, which would have quietly failed two explicit requirements, so
both were replaced. The first pass at the product page put id validation inside
an effect; ESLint caught it and the component was restructured. An early
`Product` type copied the Annex's sample including FULL-only fields, which had
to be cut back to what is really used. And the broken verification command came
out of accepting a convenient shell idiom without testing it.

**What stayed mine.** The scope decision — holding to CORE only, rather than
building the more interesting FULL features — and the resolution of each
specification conflict in §3. Those are judgement calls against the project
rules, and they are the ones I would be asked to defend.

**The honest summary.** The AI made this much faster and caught things I would
have missed, but every claim in this report is backed by a check I actually
ran, and the ones I could not run — the deploy, the Lighthouse scores — are
listed as outstanding rather than estimated.
