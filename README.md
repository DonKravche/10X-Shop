# 10X Shop

A single-page online store built with React 19, TypeScript in strict mode and
Tailwind CSS v4, with products from the public [DummyJSON](https://dummyjson.com)
API. You can browse a catalogue, open a product, build a cart that survives a
reload, sign in and place an order.

Login and checkout are deliberate local simulations: there is no authentication
server, no token and no payment. Nothing you type is sent anywhere.

**Live demo:** https://10-x-shop-psi.vercel.app/

---

## Features

### Implemented (CORE)

- **Landing** (`/`) — the shop as a mail-order catalogue: a cover over a field of its own stock, the issue in real figures, two scrollable runs of goods (deepest reductions, best rated) and every department with a picture and a count.
- **Catalog** (`/catalog`) — 12 products from `GET /products`, rendered as typed
  product cards with loading, error and empty states.
- **Product details** (`/products/:id`) — image gallery, price, rating, stock
  state, description and a quantity stepper. An unknown or non-numeric id
  shows the Not found page.
- **Cart** (`/cart`) — change quantities, remove lines, clear the cart, see the
  total. Persisted to `localStorage` under `shop_cart`.
- **Login** (`/login`) — a controlled form with required-field validation that
  records a username in React Context.
- **Checkout** (`/checkout`) — four controlled shipping fields with validation,
  an order summary, and a local order confirmation that empties the cart.
  Guests are redirected to the login page and returned here afterwards.
- **404** (`*`) — one Not found page for unknown routes, unknown products and
  malformed product ids.
- Responsive from 375px to desktop, hover/focus/disabled states throughout, and
  an error boundary so a render failure never leaves a blank page.
- Verified in Chrome 156 and Firefox 142 at 375px and 1440px — 68 of 68
  assertions, no horizontal scroll anywhere (`COMPATIBILITY.md`), and a
  Lighthouse mobile audit at 90 performance / 100 accessibility / 100 best
  practices / 0 CLS (`docs/lighthouse/`).

### Implemented (FULL)

- **Catalog toolbar** — search with a 400 ms debounce, a category filter, five
  sort choices and pagination, with `?q`, `?category`, `?sort` and `?page`
  living in the URL. Refresh, Back, Forward and a shared link all work because
  the URL is the only state there is.
- **Skeletons, Retry and request cancellation** — an in-flight request is
  aborted the moment its answer stops being wanted.
- **Reviews** (`/products/:id`) — write one, watch the average move, and it
  survives a reload. Local reviews sit above the API's.
- **Related products** — four more from the same category, rendered through
  the same `ProductCard` the catalogue uses.
- **Promo codes** — `10X10` takes 10% off, in any case, and survives a reload.
- **Orders** (`/orders`, `/orders/:id`) — history, an item table, a status
  that moves Processing → Shipped → Delivered on its own, and Reorder.
- **Profile** (`/profile`) — edit your details, see your order count, clear the
  local data, switch the theme.
- **Sign up** (`/signup`) — claims a username in this browser. The password is
  kept only as a SHA-256 digest, never in plain text, and a claimed username is
  then held to it. Any *other* username still signs in, because A1.6 requires
  that and CORE depends on it.
- **Dark mode** — seven design tokens in `@theme`, redefined once under
  `[data-theme="dark"]`. Remembered in `shop_theme`.
- **Formik + Yup** on the login form, and **route-level code splitting** so a
  visitor who only browses never downloads Orders, Profile or Formik.


### Not implemented (FULL / BONUS)

Deliberately out of scope for this stage, per the project rules that CORE is
built first and FULL is not started without instruction:

infinite scroll, a price-range filter, a wishlist, a grid/list toggle, search
history, password recovery (the other half of P1.1), order cancellation,
invoice PDFs, Safari and Edge testing, and a full keyboard and screen-reader
audit.

---

## Tech stack

| Area | Choice |
| --- | --- |
| Build | Vite 8 |
| UI | React 19, React Router 7 |
| Language | TypeScript 6, `strict: true` |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` |
| Data | DummyJSON products API over `fetch`, through a generic `ApiClient` |
| Forms | Controlled React inputs; Formik + Yup on the login form |
| Quality | ESLint 10 + typescript-eslint + eslint-plugin-react-hooks |

No UI component library, no state-management library and no HTTP client:
Context, `useReducer` and `fetch` cover everything. Formik and Yup are the one
addition, and the Annex names them.

---

## Architecture

```
src/
  api/         ApiClient (generic get<T>), ApiError, products.api.ts
  types/       product, user, cart, checkout, order, api, theme
  models/      Cart, Order, StorageService<T>, storage.ts (keys + instances)
  context/     Auth, Cart (+ cart.reducer), Theme, Toast
  hooks/       useDebounce, useNow
  components/
    layout/    Layout, Header, HeaderSearch, Footer, ScrollToTop
    catalog/   CatalogToolbar, CategoryCard
    product/   ProductCard, ProductGrid, ProductGallery, ProductPrice,
               StockBadge, ProductCardSkeleton, StarRating, Review{List,Form}
    cart/      CartItemRow, CartSummary, PromoForm
    order/     OrderStatusBadge
    ui/        Button, Container, FormField, PageHeader, Pagination,
               QuantityStepper, StateMessage, icons
    ErrorBoundary.tsx
  pages/       Landing, Catalog, Product, Cart, Login, SignUp, Checkout,
               Orders, OrderDetail, Profile, NotFound
  routes/      AppRoutes (lazy), ProtectedRoute
  utils/       format (prices, dates), validation (form rules),
               password (digests), url (catalogue paths)
```

**Where the layers sit.** `types/` and `models/` import nothing from React.
`models/` is the business logic — `Cart` answers every money question and
`Order` owns the status rule — so both could be tested without a browser.
`context/` holds the shared state and is the only place that writes to
storage. `components/` are presentational and report events through callback
props. Nothing imports upwards, and there are no cycles.

**How data flows.** A page requests data in a `useEffect` through a typed
function in `api/`, and holds the result plus a `loading | success | error`
status in `useState`; the three states are rendered conditionally, so a slow or
failing request is always visible rather than silent. Shared state lives in two
contexts — `AuthContext` for the signed-in username and `CartContext` for the
cart — and everything else is local to the component that owns it. Cart updates
are immutable: `addItem` merges with `map()`, `removeItem` uses `filter()`, and
each changed line is a new object, so React always sees a new reference and
re-renders. Presentational components take data as props and report events back
through callback props, so a card knows how to display a product but not what
adding one to the cart means.

One rule holds the prices together: `discountedPrice()` in `utils/format.ts` is
the only place a discount is applied, so the catalogue card, the product page,
the cart line, the cart total and the order confirmation can never disagree.

---

## How to run

Requires Node 20.19+ or 22.12+ (built on Node 24).

```bash
npm install
npm run dev        # http://localhost:5173
```

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Type-check the project and build to `dist/` |
| `npm run preview` | Serve the built bundle locally |
| `npm run typecheck` | `tsc --noEmit` — must report 0 errors |
| `npm run lint` | ESLint, including `no-explicit-any: error` |

---

## Test account

There is no server and no real account system. **Any** non-empty username with
a password of at least 6 characters signs you in — for example
`emilys` / `emilyspass`. Nothing is sent anywhere.

If you go through **Sign up** instead, the username is claimed in this
browser's `localStorage` and from then on it needs the password you chose —
so you can see a login actually refuse you. Everything else still signs in
freely, which is what Annex A1.6 requires of this demo.

The signed-in session itself lives in React Context, so refreshing signs you
out. That is expected: session persistence is explicitly not part of CORE
(P0.2). Claimed accounts do survive a reload.

---

## Deploying

The repository is configured for Vercel. `vercel.json` rewrites every path to
`/index.html`, which is what lets `/products/5` survive a direct visit or a hard
refresh instead of returning a 404.

```bash
npm run build
npx vercel --prod
```

After deploying, put the live URL at the top of this file and confirm that
`/products/5` opens directly.

---

## Credits

Product data, images and ratings come from [DummyJSON](https://dummyjson.com).
Typeface: [Geist](https://fonts.google.com/specimen/Geist). Built as the 10X
Front-end graduation project.

| Document | What is in it |
| --- | --- |
| `PLAN.md` | The plan: scope, work breakdown, risks, schedule |
| `REPORT.md` | What was delivered against it, with metrics |
| `DEBUG-LOG.md` | Ten real bugs: symptom, tool, root cause, fix |
| `COMPATIBILITY.md` | The Chrome and Firefox matrix, 52 assertions |
| `docs/lighthouse/` | Two full Lighthouse reports, before and after |
| `docs/compat/` | Screenshots and the script behind the matrix |
| `docs/progress/` | The three weekly progress notes |
