# Week 3 — FULL functionality, quality and delivery

**31 October 2026** · Annex A, D2 (FULL)

## Done

Built on instruction after CORE was complete, in the order the Annex lists:

- **P1.1** Sign up: local accounts, the password kept only as a SHA-256
  digest, duplicate names refused — without changing the CORE rule that any
  other username still signs in.
- **T4/T2** `ApiClient`, `ApiError`, `AsyncState<T>`, `StorageService<T>`,
  `STORAGE_KEYS` as const.
- **P2.4–P2.8** Search with a 400 ms debounce, category filter, five sort
  choices, pagination, and the URL as the one source of truth.
- **P2.2** Skeletons, Retry and `AbortController`.
- **P3.4/P3.5** Reviews with a live average, related products, tabs.
- **P4.2–P4.4** `useReducer` with a discriminated union, the `Cart` class,
  promo code `10X10`.
- **P6** Orders, the detail page, the status simulation and Reorder.
- **P7** Profile, the edit form, Clear local data.
- **P0.4 / TW5 / TW6** Design tokens in `@theme` and dark mode.
- **P1 FULL** Formik + Yup on Login.
- **O1** Route-level code splitting.

## Blockers

Two real bugs, both found by the end-to-end suite rather than by clicking:

1. Placing an order redirected to the empty cart, because clearing the cart
   re-rendered checkout into its own guard (`DEBUG-LOG` entry 10).
2. `/orders` bounced to the login page on every reload, because the session
   was deliberately not persisted. Orders are guarded and outlive the tab, so
   the session is now stored — P0.2 allows that, it just does not require it.

One finding that was not a bug: "Price: low to high" looked unsorted. The API
sorts by list price while the cards show the discounted price (entry 9).

## Hours

Roughly 20.

## Outstanding

**Deploy.** It is the one CORE requirement still open and needs an interactive
Vercel login. Everything else is ready: `vercel.json` carries the SPA rewrite
and a direct visit to a deep URL is asserted in both browsers.
