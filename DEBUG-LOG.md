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

## Checking the error boundary

Not a bug, but worth recording since the boundary is otherwise invisible.
To confirm it works I temporarily added `throw new Error('probe')` to
`CartPage`'s render, loaded `/cart`, and saw the "Something went wrong."
fallback with the header and footer still in place; clicking Catalog cleared it
because the boundary is keyed by pathname. The probe was then removed and the
file confirmed byte-identical to its committed version with `git diff`.
