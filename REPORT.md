# 10X Shop — Final report

**Author:** Dongi · **Date:** 24 October 2026
**Repository:** https://github.com/DonKravche/10X-Shop

---

## 1. Planned vs delivered

The PRD's project rules 1 and 2 require that only CORE is built in the first
stage and that FULL/BONUS is not started without a further instruction. This
report covers the CORE stage.

### By module

| Module | CORE requirement | Status |
| --- | --- | --- |
| **React** | Function components, props + children, `useState`/`useEffect`, `map()` with stable keys, controlled Login and Checkout, Router, Context, cart with immutable updates | **Done** |
| **TypeScript** | `strict: true`, typed props/state/API, `tsc --noEmit` at 0, no `any` | **Done** |
| **Tailwind CSS** | v4 integration, utility-first styling, Flex/Grid, mobile-first responsive, hover/focus/disabled | **Done** |
| **Optimization** | Responsive pages, Error Boundary, DEBUG-LOG, basic error handling | **Done** |
| **Practical project** | README, PLAN.md, REPORT.md, real Git history, deploy | **Done except deploy** |

### By page

| Page | Requirement | Status |
| --- | --- | --- |
| P0 Global | Layout, Router, Header, 404, checkout guard, loading/error/empty | Done |
| P1 Login | Controlled form, required validation, Context update, redirect | Done |
| P2 Catalog | `GET /products`, typed data, ProductCard/Grid, navigation, Add to cart | Done |
| P3 Product | `useParams`, `GET /products/:id`, details, stock states, Add to cart | Done |
| P4 Cart | Add/change quantity/remove/total, immutable updates | Done |
| P5 Checkout | Four controlled fields, validation, local order confirmation | Done |
| P6 Orders | FULL only | Not started (by rule 2) |
| P7 Profile | FULL only | Not started (by rule 2) |

### Against the 28 steps

Steps 1–8, 10–16 and 19–23 and 25 are complete. Step 24 (deploy) is prepared
but not executed. Steps 9, 17, 18, 26 and 27 are FULL and were not started.

### Not delivered, and why

- **Deploy (step 24).** The build is verified and `vercel.json` carries the SPA
  rewrite, but publishing needs a Vercel account I cannot authenticate to. See
  §4.
- **Everything marked FULL.** Search, debounce, category filter, sorting,
  pagination, URL-as-state, reviews, related products, promo codes, the orders
  and profile pages, dark mode, Formik + Yup, `useReducer`, generics, the
  `ApiClient`/`ApiError` classes, lazy routes and Lighthouse targets. Rule 2
  forbids starting these without instruction, so they were not started. None
  of them is blocked by a design decision made here; the notes in §5 record
  where each would attach.

---

## 2. Metrics

| Metric | Value |
| --- | --- |
| Commits (excluding the initial commit) | 15 |
| Days with commits | 1 (24 October) |
| Source files in `src/` | 39 (38 TypeScript + `index.css`) |
| Lines of TypeScript/TSX | 2,177 |
| Components | 17 |
| `npm run typecheck` | 0 errors |
| `npm run lint` | 0 errors, 0 warnings |
| `npm run build` | succeeds |
| Bundle, JS | 281.3 kB raw / **85.7 kB gzip** |
| Bundle, CSS | 17.3 kB raw / 4.3 kB gzip |
| Occurrences of `any` | 0 (`no-explicit-any` set to error) |
| Horizontal scroll at 375px | none on any CORE page |
| Documented bugs in DEBUG-LOG.md | 6 |

The gzipped JS bundle is 85.7 kB against the 250 kB orientation in O1, with no
code splitting applied — route-level splitting is a FULL item and was not
needed to stay inside the budget.

Lighthouse before/after figures are **not** included: O1 lists them as FULL and
they are meant to be measured against the deployed site, which does not exist
yet.

### Honest note on the Git history

All 15 commits fall on one day. The PRD's FULL guidance suggests 40+ commits
across 15+ days; the CORE requirement is only a real, meaningful history, which
this is — each commit is one step of the documented sequence, with the
verification done for it recorded in the message. But it does not evidence work
spread over three weeks, and I am not going to present it as though it does.

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

1. **Deploy to Vercel and put the URL in the README.** `npm run build` then
   `npx vercel --prod`. Afterwards confirm that `/products/5` opens from a cold
   visit — `vercel.json` already rewrites every path to `/index.html`, and the
   same behaviour was verified locally against the production bundle with
   `npm run preview`.
2. **Spread the Git history** over the remaining days if further work happens,
   rather than retrofitting dates.
3. **Decide on FULL.** Nothing in CORE blocks any of it.

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
