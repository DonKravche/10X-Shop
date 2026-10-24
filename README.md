# 10X Shop

A single-page online store built with React 19, TypeScript in strict mode and
Tailwind CSS v4, with products from the public [DummyJSON](https://dummyjson.com)
API. You can browse a catalogue, open a product, build a cart that survives a
reload, sign in and place an order.

Login and checkout are deliberate local simulations: there is no authentication
server, no token and no payment. Nothing you type is sent anywhere.

**Live demo:** _not deployed yet — see "Deploying" below._

---

## Features

### Implemented (CORE)

- **Catalog** (`/`) — 12 products from `GET /products`, rendered as typed
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

### Not implemented (FULL / BONUS)

Deliberately out of scope for this stage, per the project rules that CORE is
built first and FULL is not started without instruction:

search and debounce, category filter, sorting, pagination, URL-as-state,
reviews, related products, promo codes, the orders pages, the profile page,
dark mode and the theme switch, Formik + Yup, `useReducer`, generics and the
`ApiClient`/`ApiError` classes, lazy routes and Lighthouse reporting.

---

## Tech stack

| Area | Choice |
| --- | --- |
| Build | Vite 8 |
| UI | React 19, React Router 7 |
| Language | TypeScript 6, `strict: true` |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` |
| Data | DummyJSON products API over `fetch` |
| Quality | ESLint 10 + typescript-eslint + eslint-plugin-react-hooks |

No UI component library, no state management library and no HTTP client: React
Context and `fetch` cover everything CORE needs.

---

## Architecture

```
src/
  api/         products.api.ts       typed fetch calls to DummyJSON
  types/       product, user, cart, checkout   domain models, declared once
  context/     AuthContext, CartContext        shared login and cart state
  components/
    layout/    Layout, Header, Footer, ScrollToTop
    product/   ProductCard, ProductGrid, ProductGallery, ProductPrice, StockBadge
    cart/      CartItemRow
    ui/        Button, Container, FormField, PageHeader, QuantityStepper, StateMessage
    ErrorBoundary.tsx
  pages/       Catalog, Product, Cart, Login, Checkout, NotFound
  routes/      AppRoutes, ProtectedRoute
  utils/       format.ts (prices), validation.ts (form rules)
```

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

There is no account system. **Any** non-empty username with a password of at
least 6 characters signs you in — for example `dongi` / `secret123`. The
username is kept in React Context for the session and is not stored or
transmitted. Refreshing the page signs you out, which is expected: session
persistence is not part of this stage.

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
Front-end graduation project; see `PLAN.md` for the plan, `REPORT.md` for what
was delivered against it and `DEBUG-LOG.md` for the debugging record.
