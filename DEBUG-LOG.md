# Debug log

Real bugs from building 10X Shop, in the order I hit them. Each one follows the
format Annex A (O2) asks for: symptom, reproduction, tool, root cause, fix and
what I took from it.

Repository: https://github.com/DonKravche/10X-Shop

---

## 1. `npm run lint` crashed: cannot find package `@eslint/js`

**Symptom.** Lint died before checking a single file:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@eslint/js'
imported from D:\10X Shop\10X-Shop\eslint.config.js
```

`npm install` had reported no error at all.

**Reproduction.** Install with `"@eslint/js": "^10.13.0"` in `devDependencies`,
then run `npm run lint`.

**Tool.** `npm view @eslint/js dist-tags`, then `npm ls @eslint/js`.

**Root cause.** I had assumed `@eslint/js` is versioned in lockstep with
`eslint`, so when I upgraded ESLint to 10.13.0 I gave `@eslint/js` the same
range. It is a separate package whose latest release was 10.0.1, so `^10.13.0`
matched nothing. `npm ls` showed the dependency tree as `(empty)` — npm had
quietly skipped it rather than failing the install.

**Fix.** Pin the range to the version that actually exists, `^10.0.1`.
Commit [`b7b16dc`](https://github.com/DonKravche/10X-Shop/commit/b7b16dc).

**What I learned.** A companion package does not have to track its host's
version number. And an install that prints no error is not proof that
everything was installed — `npm ls <pkg>` answers that question directly.

---

## 2. ESLint rejected the react-hooks config: "plugins as an array of strings"

**Symptom.**

```
A config object has a "plugins" key defined as an array of strings.
Flat config requires "plugins" to be an object
```

**Reproduction.** Put `reactHooks.configs['recommended-latest']` into the
`extends` of a flat `eslint.config.js` and run `npm run lint`.

**Tool.** Node, inspecting what the plugin actually exports:

```js
import rh from 'eslint-plugin-react-hooks'
console.log(Object.keys(rh.configs))              // recommended, recommended-latest, flat
console.log(Array.isArray(rh.configs['recommended-latest'].plugins))  // true
```

**Root cause.** eslint-plugin-react-hooks v7 ships both config styles. The
top-level `configs['recommended-latest']` is the legacy eslintrc shape, where
`plugins` is an array of names; the flat-config equivalent lives one level down
at `configs.flat['recommended-latest']`. The names are nearly identical, so the
wrong one is easy to reach for.

**Fix.** Use `reactHooks.configs.flat['recommended-latest']`.
Commit [`b7b16dc`](https://github.com/DonKravche/10X-Shop/commit/b7b16dc).

**What I learned.** When a config object is rejected for its shape, print the
object instead of re-reading the documentation. Thirty seconds in a REPL beat
guessing at the right export name.

---

## 3. `react-hooks/set-state-in-effect` on the catalogue

**Symptom.** Lint failed on code that worked:

```
30 |     setStatus('loading')
   |     ^^^^^^^^^ Avoid calling setState() directly within an effect
                                     react-hooks/set-state-in-effect
```

**Reproduction.** Call `setStatus('loading')` synchronously in the body of the
catalogue's mount effect, then run `npm run lint`.

**Tool.** ESLint, via `npm run lint`.

**Root cause.** The call was genuinely pointless. `status` is initialised to
`'loading'` by `useState`, and the effect has an empty dependency array, so it
runs exactly once — at a moment when the state is already `'loading'`. Setting
it again schedules a render that changes nothing. The rule exists because a
synchronous `setState` in an effect is normally a sign that the value should
have been derived during render instead.

**Fix.** Delete the line and let the initial state stand.
Commit [`8b2c3d6`](https://github.com/DonKravche/10X-Shop/commit/8b2c3d6).

**What I learned.** The lint rule was not being pedantic — it pointed at a
render I was paying for and getting nothing from.

---

## 4. The same rule on the product page, hiding a real design problem

**Symptom.** The same `set-state-in-effect` error, this time on:

```tsx
useEffect(() => {
  if (!hasValidId) {
    setStatus('not-found')   // <- flagged
    return
  }
  ...
}, [numericId, hasValidId])
```

**Reproduction.** Open `/products/abc` with the id validated inside the effect.

**Tool.** ESLint first; then React DevTools' Components panel, which showed the
page mounting with `status: 'loading'` and only then flipping to `'not-found'`
— one wasted render on every bad URL.

**Root cause.** Whether `abc` is a valid product id is knowable during render
from `useParams`. Deciding it inside an effect meant storing a conclusion in
state that could simply have been computed, so the component rendered a loading
state for something that was never going to load.

**Fix.** Split the component. `ProductPage` validates the id and returns
`<NotFoundPage />` immediately for a bad one; `ProductDetails` holds the hooks
and only ever mounts with a valid id. Keying it by the id also made the gallery
selection and quantity reset for free when moving between products.
Commit [`1f8bd91`](https://github.com/DonKravche/10X-Shop/commit/1f8bd91).

**What I learned.** "If you can calculate it during render, do not put it in
state." The lint error was a symptom; the actual bug was an extra render and a
component doing two jobs. The fix made the code shorter.

**Verified after the fix** in the browser's Network panel: `/products/abc` now
issues **zero** requests to dummyjson.com, where before it rendered, then
decided, then settled.

---

## 5. Tap targets smaller than 44px that looked fine

**Symptom.** Nothing visible. Every page looked correct at 375px and had no
horizontal scroll.

**Reproduction.** In the console on any page:

```js
[...document.querySelectorAll('button:not([disabled]), a')]
  .map(e => ({ t: e.innerText.trim(), h: e.getBoundingClientRect().height }))
  .filter(x => x.h < 44)
```

**Tool.** The browser console, measuring rather than looking.

**Root cause.** I had set `min-h-11` (44px) on the shared `Button` component
but written the standalone links as plain `inline-block` text. The logo
measured 28px tall and the two "Back to catalog" links about 20px — under the
44px O3 requires, and awkward to hit with a thumb, but completely invisible on
a desktop screen with a mouse.

**Fix.** Make those links `inline-flex min-h-11 items-center`.
Commit [`2711653`](https://github.com/DonKravche/10X-Shop/commit/2711653).

**What I learned.** Some requirements cannot be checked by looking at a
screenshot. The footer's "DummyJSON" link is still 18px and stays that way on
purpose — it sits inline inside a sentence, the case WCAG 2.5.8 exempts,
because padding it would break the paragraph's line spacing. Knowing which
exceptions are legitimate matters as much as finding the violations.

---

## 6. A verification command that could not fail

**Symptom.** My check command printed `LINT OK` on a run where ESLint had
reported `✖ 1 problem (1 error)` directly above it.

**Reproduction.**

```bash
npm run lint 2>&1 | tail -8 && echo "LINT OK"
```

**Tool.** Reading the output properly instead of trusting the last line.

**Root cause.** A shell pipeline exits with the status of its **last** command.
`tail` always succeeds, so `$?` was 0 no matter what ESLint did, and `&&` always
fired. I had built a green light that physically could not turn red.

**Fix.** `set -o pipefail` before the chain, so the pipeline reports the first
failure. No source change — this was a flaw in how I was verifying, not in the
application.

**What I learned.** This was the most useful bug of the project, because it
undermined every check I had run. A test you have never seen fail is not a test
yet. After fixing it I re-ran the full typecheck/lint/build chain to confirm
the earlier passes had been real — they had, but I had no right to assume so.

---

## 7. "Add to cart" lied about what it had added

**Symptom.** Clicking "Add to cart" twice in quick succession on
`/products/1` put two units in the cart — the header badge went to `2` — while
the inline message under the button read "Your cart already holds all the
stock we have."

**Reproduction.** In the browser console on the product page:

```js
const btn = [...document.querySelectorAll('button')]
  .find(b => b.textContent.trim() === 'Add to cart')
btn.click(); btn.click()
```

Badge: `2`. Message: the cart is full. Clicking slowly, one click at a time,
never showed it — which is why I had not caught this by hand.

**Tool.** Playwright against the production build, reading the badge and the
`role="status"` message in the same snapshot so the two could be compared.

**Root cause.** `addItem` returned how many units it had added, but computed
that number *inside* the `setItems(current => ...)` updater:

```ts
let added = 0
setItems((current) => { added = ...; return next })
return added          // read before the updater had necessarily run
```

A state updater does not run when you call `setItems`; it runs during the next
render. The code only ever worked because of a React optimisation: when a
component has no update already pending, React evaluates the updater eagerly
to see whether it can skip the re-render. The first click gets that fast path.
The second click, fired while the first update is still pending, does not — so
`added` was still `0` and the component reported the cart as full.

**Fix.** Stop reading a value out of an updater. `CartProvider` now keeps a
`useRef` holding the latest items and a single `commit()` that writes the ref
and the state together; every cart operation reads `itemsRef.current`, which is
correct within one event, and returns its result directly. The updates stay
immutable — `map`, `filter` and spread still build a new array every time.

**Verification.** Three rapid clicks: badge `3`, message "Added 1 to your
cart." each time. Three hundred clicks on a product with 99 in stock: the line
stops at exactly `99` and only then says the cart holds all the stock.

**What I learned.** `setState` schedules; it does not execute. Anything a
handler needs to know *now* has to be computed before the call, not harvested
out of the updater afterwards. The bug was invisible to manual clicking because
the React fast path hides it whenever the queue happens to be empty — a feature
that worked right up until a user was quick.

---

## 8. A test suite that had stopped testing

**Symptom.** The cross-browser suite, green at 52 of 52 the day before,
reported twelve failures across both browsers:

```
X mobile  / card opens product details :: TimeoutError: locator.click
X mobile  / add to cart updates the badge
     :: strict mode violation: getByRole('button', { name: 'Add to cart' })
        resolved to 12 elements
X mobile  / cart shows the line and the total :: TimeoutError
... nine more
```

**Reproduction.** Run `docs/compat/cross-browser-check.mjs` at any commit from
`c2d3fa4` onwards.

**Tool.** Reading the failures in order instead of the loudest one. The second
line is the tell: twelve "Add to cart" buttons means the run is still on the
catalogue, so the step that was meant to leave it never did. That points at
step 2, and everything after it is a consequence, not a separate fault.

**Root cause.** Mine, from two commits earlier. `c2d3fa4` moved the product
card's title from `<h3>` to `<h2>` to fix Lighthouse's heading-order audit.
The script addressed that link as `article h3 a`. The selector matched
nothing, the click timed out, and the eleven steps after it failed because the
run was never on the page they expected.

The application was correct throughout. Only the measurement was broken — and
`COMPATIBILITY.md` went on claiming 52 of 52 from a run made before the change.

**Fix.** Address the link by where it goes, not by the markup it sits in:

```js
await page.locator('article a[href^="/products/"]').first().click()
```

No heading change can break that. Commit
[`e0aca06`](https://github.com/DonKravche/10X-Shop/commit/e0aca06), which also
records the stale window in `COMPATIBILITY.md` rather than quietly re-running
and reporting green.

**What I learned.** Two things, and the second is the uncomfortable one.

A selector should name what the element *does*, not how it is currently
marked up, or a correct refactor will break the test and the test will look
like the truth.

And a check only counts from the last time it was run. I fixed an
accessibility issue, verified it with Lighthouse, and never re-ran the suite
that the same change had broken — so for two commits the repository carried a
document asserting a result that could no longer be reproduced. That is the
same failure as entry 6 wearing different clothes: entry 6 was a check that
could not fail, this was a check that was not run. Both end with a green light
that means nothing.

---

## 9. "Price: low to high" produced visibly unsorted prices

**Symptom.** `/?sort=price-asc` returned twelve products whose displayed
prices went $0.71, $0.98, $0.84, $1.29 — the third one lower than the second.

**Reproduction.** Open the catalogue, choose "Price: low to high", read the
figures on the cards.

**Tool.** `curl` against the endpoint, printing both prices side by side:

```
list 0.79   disc 0.71
list 0.99   disc 0.98
list 0.99   disc 0.84
list 1.29   disc 1.29
```

**Root cause.** Not the API. DummyJSON honours `sortBy=price` exactly — the
**list** prices are perfectly ascending. The cards show the **discounted**
price, and those two orders are different: two products both listed at $0.99
display as $0.98 and $0.84 because their discounts differ, and they arrive in
list order.

I had assumed "the sort is broken" and was about to write it up as the
endpoint ignoring the parameter, which P2.6 anticipates. The `curl` output is
what showed that the server was right and the display was the problem.

**Fix.** Re-sort the page client-side by the figure actually on screen,
`discountedPrice(price, discountPercentage)`, for the two price sorts only —
rating and title are displayed exactly as they are sorted, so they need
nothing. Commit [`(this change)`](https://github.com/DonKravche/10X-Shop).

**Why this is a compromise, not a solution.** It orders the twelve products on
the page by what the shopper can read, which makes the control behave as the
label promises. It cannot order the other 182: the server already chose *which*
twelve to send, using the other price, so page 2 can begin lower than page 1
ended. Sorting the whole catalogue correctly would mean fetching all 194
products, and O1 is explicit that they are never loaded at once. The right fix
belongs on a server that can sort by the price it displays.

**What I learned.** "The API is broken" is the most expensive assumption
available, and it is the first one that comes to mind. Thirty seconds of
`curl` moved the bug from their side to mine. Also: a derived value shown to a
user has to be the value you sort by, or the sort is a lie however correct the
request was.

---

## 10. Placing an order sent the customer to the empty cart

**Symptom.** "Place order" wrote the order correctly and then landed on
`/cart` showing "Your cart is empty." instead of the order's page. The order
existed in `shop_orders`; the customer just never saw it.

**Reproduction.** Fill the checkout form and submit. The end-to-end suite
caught it as `waitForURL(/\/orders\/\d+$/)` timing out with the browser
sitting on `/cart`.

**Tool.** The test, and then reading `handleSubmit` in order of what React
does rather than in order of what I wrote.

**Root cause.** Two navigations raced and the wrong one won:

```ts
orderStorage.set([order.toJSON(), ...previous])
clear()                                     // cart becomes empty
navigate(`/orders/${order.id}`, ...)        // ...but this runs after a render
```

`clear()` empties the cart, which re-renders CheckoutPage, which hits its own
guard at the top:

```ts
if (items.length === 0) {
  return <Navigate to="/cart" replace state={{ from: 'checkout-empty' }} />
}
```

That guard exists for a real case - opening checkout with nothing in the cart -
but it cannot tell "you have not added anything" from "you have just bought
it all". The CORE version had been immune by accident: it kept the
confirmation on the same page and the guard read
`items.length === 0 && placedOrder === null`. Moving the confirmation to the
order's own page removed `placedOrder` and with it the thing that had been
holding the guard off.

**Fix.** Say which case it is, explicitly:

```ts
if (items.length === 0 && !hasPlaced) { ... }
```

`setHasPlaced(true)` runs before `clear()`, so the guard knows the cart is
empty because the order succeeded. Commit
[`4aeb570`](https://github.com/DonKravche/10X-Shop/commit/4aeb570).

**What I learned.** A guard that tests a *symptom* instead of a *reason* will
eventually fire on the wrong one. "The cart is empty" was never the real
condition; "the customer has nothing to check out" was, and those two
coincided right up until emptying the cart became something checkout did on
purpose. The condition that made it safe was deleted two commits earlier as
part of an unrelated refactor, with nothing to say it mattered.

---

## 11. An order page whose own figures did not add up

**Symptom.** The order detail page showed three numbers that contradict each
other:

```
Subtotal    $34.25
Discount    -$3.43
Total       $40.82
```

34.25 − 3.43 is 30.82, not 40.82. Every individual figure was right; the
screen as a whole was wrong by exactly $10.

**Reproduction.** Place any order whose total after discount is under $100, so
shipping is charged, then open it from `/orders`.

**Tool.** The design review's own checklist, which asks in writing: *do the
numbers add up, and do the copies of a fact agree?* I had tested that the cart
total equalled the order total — and it did — so every assertion I had written
passed while the page still lied.

**Root cause.** `Cart.total()` is `subtotal − discount + shipping`, and
`OrderModel.create` stored `subtotal`, `discount` and `total` but not the
shipping. The totals panel then rendered the three fields it had. The $10 was
not missing from the arithmetic, only from the page, so the reader was shown
two operands and a result that needed a third.

A1.5's `Order` interface lists `shippingCost` and I had dropped it as unused
while trimming the model to what was really implemented — which was the right
instinct applied to the wrong field, because the detail page was about to
need it.

**Fix.** Store `shippingCost` (A1.5's name; `shipping` was already the
address) and show the row whether it is free or charged. Orders written before
the change are repaired on read rather than dropped: the value is recoverable
exactly, because the total was always subtotal − discount + shipping. Commit
[`edab5df`](https://github.com/DonKravche/10X-Shop/commit/edab5df).

**Verification.** A real order, end to end: cart reads 8.94 − 0.89 + 10 =
18.05 and shows 18.05; the order shows the same four figures and the same
total.

**What I learned.** Testing that two screens agree is not the same as testing
that either one is right — both can be consistently wrong, and mine were. The
question that found this was not "does the code work" but "would a reader with
a calculator believe this page", and no assertion I had written was asking it.
It is also a lesson about trimming a model to what is "really used": that is
correct, but the check has to be what the *screens* need, not what the code
currently compiles without.

---

## Checking the error boundary

Not a bug, but worth recording since the boundary is otherwise invisible.
To confirm it works I temporarily added `throw new Error('probe')` to
`CartPage`'s render, loaded `/cart`, and saw the "Something went wrong."
fallback with the header and footer still in place; clicking Catalog cleared it
because the boundary is keyed by pathname. The probe was then removed and the
file confirmed byte-identical to its committed version with `git diff`.
