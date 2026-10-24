# 10X Shop — Project Plan

**Author:** Dongi · **Course:** 10X Front-end graduation project
**Window:** 17 October – 6 November 2026 · **Plan written:** 24 October 2026
**Repository:** https://github.com/DonKravche/10X-Shop

> Note on timing: this plan is committed at the start of my implementation work
> on 24 October. The dates below are the real ones; nothing is backdated.

---

## 1. Goal and scope

Build **10X Shop**, a single-page online store on React 19 + TypeScript (strict)
+ Tailwind CSS v4, sourcing products from the public DummyJSON API.

The PRD's project rules 1 and 2 are binding: **only CORE is implemented in the
first stage**, and FULL/BONUS features are not started without an explicit
instruction. The table below is therefore split accordingly.

| Module | CORE — committed to | FULL — not started without instruction |
| --- | --- | --- |
| React | Function components, props + `children`, `useState`/`useEffect`, `map()` with stable keys, controlled Login and Checkout forms, React Router, Context, cart with immutable updates | Custom hooks, full reducer architecture, advanced routing/UX, Formik + Yup |
| TypeScript | `strict: true`, typed props/state/API, `tsc --noEmit` at 0 errors, no `any` | Generics, `ApiClient`, `ApiError`, OOP classes, type guards, discriminated unions, utility types |
| Tailwind CSS | v4 integration, utility-first styling, Flex/Grid, mobile-first responsive, hover/focus/disabled states | `@theme` tokens, dark mode, custom variants and utilities |
| Optimization | Responsive pages, Error Boundary, DEBUG-LOG.md, basic error handling | Lazy routes/images, Lighthouse before/after, cross-browser matrix |
| Practical project | README.md (EN), PLAN.md, REPORT.md, real Git history, deploy | Issues/Projects board, 8+ PRs, weekly progress notes, demo video |

**Out of scope entirely** (PRD rules 6 and 7, Annex A1.6): real authentication,
any auth API, JWT or tokens; real payment; `POST /carts/add`; bank card fields.
Login is a local React Context simulation; checkout is a controlled form plus a
local order simulation.

### CORE routes

| Route | Page | Access |
| --- | --- | --- |
| `/` | Catalog | public |
| `/products/:id` | Product details | public |
| `/cart` | Cart | public |
| `/login` | Login | public |
| `/checkout` | Checkout | guarded — guests are sent to `/login` |
| `*` | 404 Not found | public |

`/orders`, `/orders/:id` and `/profile` are FULL and are not routed yet.

---

## 2. Work breakdown

Estimates are in hours. "Step" refers to the PRD's 28-step list.

### Epic A — Setup and foundation (week 1, steps 1-3) · 6 h

| # | Task | Est. | Definition of Done |
| --- | --- | --- | --- |
| A1 | Vite + React + TS scaffold, strict `tsconfig`, scripts | 2 h | `npm run typecheck`, `lint` and `build` all pass |
| A2 | Tailwind CSS v4 integration | 1 h | A utility class demonstrably changes the UI; build succeeds |
| A3 | ESLint with `no-explicit-any: error` and react-hooks rules | 1 h | A deliberate `any` fails `npm run lint` |
| A4 | PLAN.md and repository setup | 1 h | This file, committed before feature code |
| A5 | Domain types: `Product`, `ProductsResponse`, `CartItem`, `CartState`, login and checkout form values | 1 h | All live in `src/types/`; `Product` is declared exactly once |

### Epic B — Layout, routing and auth (week 1, steps 4-6) · 7 h

| # | Task | Est. | Definition of Done |
| --- | --- | --- | --- |
| B1 | `Layout` (Header + `<Outlet />` + Footer), `ScrollToTop` | 2 h | Header is written once; active link is marked; route change scrolls to top |
| B2 | `AppRoutes` with all six CORE routes | 1 h | Every route renders; navigation causes no full page reload |
| B3 | `NotFound` page | 0.5 h | `*`, an unknown product id and a non-numeric id all show it |
| B4 | `AuthContext` with `login`/`logout` | 1.5 h | `isLoggedIn` and `username` live in Context; logout does not clear the cart |
| B5 | Login page: controlled form + validation | 1.5 h | Required username; password 6+ chars; exact error texts; submit does not reload |
| B6 | `ProtectedRoute` guard for `/checkout` | 0.5 h | A guest is redirected to `/login` and returns to `/checkout` after signing in |

### Epic C — Catalog (week 1, steps 7-8) · 5 h

| # | Task | Est. | Definition of Done |
| --- | --- | --- | --- |
| C1 | `GET /products` in `useEffect`, typed | 2 h | 12 products load; the response is typed, not cast |
| C2 | Loading / error / empty states | 1 h | Each state renders a clear message; a failed request never blanks the app |
| C3 | `ProductCard` + `ProductGrid` | 2 h | `map()` with `key={product.id}`; responsive 1 / 2-3 / 4 columns; card links to details |

### Epic D — Product details (week 2, steps 10-11) · 5 h

| # | Task | Est. | Definition of Done |
| --- | --- | --- | --- |
| D1 | `useParams` + `GET /products/:id`, with `id` in the effect's deps | 2 h | Changing the id refetches; a 404 shows Not found; the app never crashes |
| D2 | Gallery thumbnails and quantity stepper via `useState` | 1.5 h | Thumbnail click swaps the main image; quantity is clamped to 1...stock |
| D3 | Stock states and Add to cart | 1.5 h | `In stock` / `Only N left!` / `Out of stock`; the button disables at zero stock |

### Epic E — Cart (week 2, steps 12-13) · 5 h

| # | Task | Est. | Definition of Done |
| --- | --- | --- | --- |
| E1 | `CartContext`: `addItem`, `removeItem`, `setQuantity`, `clear`, all immutable | 2.5 h | No state object is mutated; the header badge and the cart page always agree |
| E2 | Cart page: line items, stepper, remove, totals | 2 h | Quantity and removal update the total without a reload |
| E3 | Empty cart state | 0.5 h | "Your cart is empty." plus a link back to the catalog |

### Epic F — Checkout (week 2, steps 14-15) · 4 h

| # | Task | Est. | Definition of Done |
| --- | --- | --- | --- |
| F1 | Controlled form: full name, email, address, city | 2 h | `value`/`onChange` from state; `onSubmit` calls `preventDefault()` |
| F2 | Validation with the exact documented error texts | 1 h | An empty or invalid form cannot place an order |
| F3 | Local order confirmation + cart cleared | 1 h | "Thank you! Your order has been placed." with the total; the badge resets to 0 |

### Epic G — Quality (week 3, steps 19-23) · 6 h

| # | Task | Est. | Definition of Done |
| --- | --- | --- | --- |
| G1 | Responsive pass at 375 px and desktop | 2 h | No horizontal scroll on any CORE page; tap targets 44 px or larger |
| G2 | hover / focus / disabled states | 1 h | Every button and field shows all three |
| G3 | Error Boundary | 1 h | A thrown render error shows the fallback instead of a blank page |
| G4 | Happy-path run-through and debugging | 1 h | Catalog to Product to Cart to Login to Checkout to confirmation works end to end |
| G5 | Final `typecheck` + `lint` + production `build` | 1 h | All three clean |

### Epic H — Documentation and delivery (week 3, steps 24-25, 28) · 5 h

| # | Task | Est. | Definition of Done |
| --- | --- | --- | --- |
| H1 | README.md in English | 1.5 h | About, Features, Tech stack, Architecture, How to run, Scripts, Live demo |
| H2 | DEBUG-LOG.md with 3+ real bugs | 1.5 h | Each entry: symptom, reproduction, tool, root cause, fix, lesson, with real commits |
| H3 | REPORT.md | 1 h | Planned vs delivered, what was left out and why |
| H4 | Deploy to Vercel + SPA refresh check | 1 h | Live link in the README; `/products/5` survives a hard refresh |

**Total CORE estimate: 43 h.**

---

## 3. Risks

| # | Risk | Likelihood | Mitigation |
| --- | --- | --- | --- |
| 1 | DummyJSON is down or rate-limited during development or the defence | Medium | Every fetch has an explicit error state with a readable message and a retry path, so the app degrades instead of breaking. If it is down at defence time, demonstrate against a locally saved JSON response. |
| 2 | A stale response overwrites a newer one when the product id changes quickly | Medium | Put `id` in the effect's dependency array and ignore a resolved response whose request is no longer current, via an `ignore` flag in the effect cleanup. |
| 3 | SPA deep links 404 after deploy (`/products/5` refreshed directly) | High without config | `vercel.json` rewrites every path to `/index.html`; verified on the live URL as part of H4, not assumed. |
| 4 | Scope creep from FULL features eating CORE time | Medium | PRD rules 1-2 enforced literally: no FULL work starts until CORE is complete and signed off. |
| 5 | `strict` TypeScript errors discovered late, close to the deadline | Medium | `npm run typecheck` is run after every epic rather than once at the end. |
| 6 | Not being able to explain the code at the defence | Medium | No pattern is used that I cannot justify; architectural choices are recorded in REPORT.md and DEBUG-LOG.md as I go. |

---

## 4. Schedule

| Week | Dates | Epics |
| --- | --- | --- |
| 1 | 17-23 Oct | A, B, C |
| 2 | 24-30 Oct | D, E, F |
| 3 | 31 Oct - 6 Nov | G, H |

Submission deadline: **6 November 2026, 23:59** (Georgian time).
Theory test: 5 November. Defence: 7-8 November.
