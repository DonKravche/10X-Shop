import { chromium, firefox } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = 'http://localhost:4173'
const SHOT_DIR = process.argv[2]
mkdirSync(SHOT_DIR, { recursive: true })

// Step 19 asks DummyJSON for a product that does not exist, so its 404 is
// the assertion, not a defect. Chrome echoes every failed response into the
// console (Firefox does not), so the URL is named here and judged by the
// response listener rather than by the console text, which carries no URL.
const EXPECTED_404 = 'dummyjson.com/products/999999'

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'desktop', width: 1440, height: 900 },
]

/** True when the document scrolls sideways - what O3 forbids. */
async function overflows(page) {
  return page.evaluate(() => {
    const d = document.documentElement
    return d.scrollWidth > d.clientWidth
  })
}

async function run(engine, name, launchOptions = {}) {
  const browser = await engine.launch(launchOptions)
  const results = []

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    })
    const page = await context.newPage()
    const consoleErrors = []
    const failedRequests = []
    page.on('response', (r) => {
      if (r.status() >= 400 && !r.url().includes(EXPECTED_404)) {
        failedRequests.push(r.status() + ' ' + r.url())
      }
    })
    page.on('console', (m) => {
      if (m.type() !== 'error') return
      // The generic 'Failed to load resource' line names no URL, so it
      // cannot be judged here; the response listener above decides whether
      // the request behind it was one this script asked for.
      if (/Failed to load resource/.test(m.text())) return
      consoleErrors.push(m.text())
    })
    page.on('pageerror', (e) => consoleErrors.push(String(e)))

    const step = async (label, fn) => {
      try {
        await fn()
        results.push({
          viewport: vp.name,
          step: label,
          ok: true,
          overflow: await overflows(page),
        })
      } catch (error) {
        results.push({
          viewport: vp.name,
          step: label,
          ok: false,
          overflow: null,
          error: String(error).split('\n')[0],
        })
      }
    }

    // 0. The landing page loads real stock from DummyJSON.
    await step('landing shows the stock and the category sheet', async () => {
      await page.goto(BASE, { waitUntil: 'networkidle' })
      // Every category, each linking into the filtered catalogue. Counting
      // them proves the one storefront request landed and was grouped.
      await page.waitForFunction(
        () => document.querySelectorAll('a[href^="/catalog?category="]').length >= 20,
        { timeout: 20000 },
      )
      // The sheet is the shop's real product photography, not placeholders.
      const frames = await page.locator('a[href^="/products/"] img').count()
      if (frames < 24) throw new Error(`expected a sheet, got ${frames} frames`)
    })

    // 1a. The catalogue opens on its departments, not on a grid of 194.
    await step('catalog opens on the departments', async () => {
      await page.goto(`${BASE}/catalog`, { waitUntil: 'networkidle' })
      await page.waitForSelector('a[href^="/catalog?category="]', { timeout: 20000 })
      const departments = await page.locator('a[href^="/catalog?category="]').count()
      if (departments < 20) throw new Error(`expected every department, got ${departments}`)
      if ((await page.locator('article').count()) !== 0) {
        throw new Error('products shown before a department was chosen')
      }
    })

    // 1b. Opening one shows its products, as ProductCards from the API.
    await step('a department shows its products', async () => {
      await page.locator('a[href="/catalog?category=laptops"]').click()
      await page.waitForSelector('article', { timeout: 20000 })
      const cards = await page.locator('article').count()
      if (cards === 0) throw new Error('no products in the department')
    })

    // 1c. Asking for the whole catalogue still pages twelve at a time.
    await step('the whole catalogue pages twelve at a time', async () => {
      await page.goto(`${BASE}/catalog?page=1&sort=title-asc`, {
        waitUntil: 'networkidle',
      })
      await page.waitForSelector('article', { timeout: 20000 })
      const cards = await page.locator('article').count()
      if (cards !== 12) throw new Error(`expected 12 cards, got ${cards}`)
    })

    // 2. A card opens the product page.
    await step('card opens product details', async () => {
      // Addressed by where the link goes, not by the heading level it sits
      // in: an earlier accessibility fix moved the card title from h3 to h2
      // and silently broke a selector written as `article h3 a`.
      await page.locator('article a[href^="/products/"]').first().click()
      await page.waitForURL(/\/products\/\d+$/, { timeout: 20000 })
      await page.waitForSelector('h1', { timeout: 20000 })
    })

    // 3. Add to cart updates the header badge.
    await step('add to cart updates the badge', async () => {
      // `.first()` because the related-products block carries its own Add to
      // cart buttons; the product's own is the first in document order.
      await page.getByRole('button', { name: 'Add to cart' }).first().click()
      // The count lives in the link's accessible name, so this asserts what a
      // screen reader is told rather than which span happens to be first.
      await page.waitForFunction(
        () =>
          document
            .querySelector('a[href="/cart"]')
            ?.getAttribute('aria-label') === 'Cart, 1 items',
        { timeout: 10000 },
      )
    })

    // 4. The cart shows the line and a total.
    await step('cart shows the line and the total', async () => {
      await page.goto(`${BASE}/cart`, { waitUntil: 'networkidle' })
      await page.waitForSelector('li img', { timeout: 20000 })
      const total = await page.locator('dd').last().innerText()
      if (!/^\$[\d,]+\.\d{2}$/.test(total.trim())) {
        throw new Error(`total not formatted: ${total}`)
      }
    })

    // 5. A guest is bounced from checkout to login.
    await step('guest is redirected from checkout to login', async () => {
      await page.goto(`${BASE}/checkout`, { waitUntil: 'networkidle' })
      await page.waitForURL(/\/login$/, { timeout: 20000 })
    })

    // 6. Empty fields are refused with the exact messages.
    await step('login refuses empty fields', async () => {
      await page.getByRole('button', { name: 'Log In' }).click()
      await page.waitForSelector('text=Username is required', { timeout: 10000 })
      await page.waitForSelector('text=Password is required', { timeout: 10000 })
    })

    // 7a. Sign up (P1.1, FULL) is reachable from login and validates.
    await step('sign up is reachable from login and validates', async () => {
      await page.getByRole('link', { name: 'Create one' }).click()
      await page.waitForURL(/\/signup$/, { timeout: 20000 })
      await page.fill('#username', 'xb-user')
      await page.fill('#password', 'secret123')
      await page.fill('#confirmPassword', 'secret999')
      await page.getByRole('button', { name: 'Create account' }).click()
      await page.waitForSelector('text=Passwords do not match', { timeout: 10000 })
    })

    // 7b. A completed sign up returns to the page the guard interrupted.
    await step('sign up returns to checkout', async () => {
      await page.fill('#confirmPassword', 'secret123')
      await page.getByRole('button', { name: 'Create account' }).click()
      await page.waitForURL(/\/checkout$/, { timeout: 20000 })
      await page.waitForSelector('#fullName', { timeout: 20000 })
    })

    /**
     * Signs out and walks into the guard again, so the login page is reached
     * the way a shopper reaches it and still carries /checkout as its
     * destination. Going straight to /login would drop that state and the
     * later steps would land on the catalogue instead.
     */
    /**
     * Below 768px every destination and control lives behind the menu
     * button, so reaching one starts by opening it - which is what a shopper
     * on a phone does too. Above it the button does not exist and this is a
     * no-op. `getByRole` ignores what is hidden from the accessibility tree,
     * so only the copy on screen is ever matched.
     */
    const openMenuIfCollapsed = async () => {
      const button = page.getByRole('button', { name: 'Open menu' })
      if (await button.isVisible()) await button.click()
    }

    const signOutAndReturnToGuard = async () => {
      await openMenuIfCollapsed()
      await page.getByRole('button', { name: 'Log out' }).click()
      await page.goto(`${BASE}/checkout`, { waitUntil: 'networkidle' })
      await page.waitForURL(/\/login$/, { timeout: 20000 })
    }

    // 7c. The password chosen at sign up is the one that is required.
    await step('a claimed username needs its own password', async () => {
      await signOutAndReturnToGuard()
      await page.fill('#username', 'xb-user')
      await page.fill('#password', 'wrongpass')
      await page.getByRole('button', { name: 'Log In' }).click()
      await page.waitForSelector('text=Incorrect password', { timeout: 10000 })
    })

    // 7d. CORE rule A1.6: any other non-empty username still signs in.
    await step('an unregistered username still signs in (A1.6)', async () => {
      await page.fill('#username', 'never-signed-up')
      await page.fill('#password', 'secret123')
      await page.getByRole('button', { name: 'Log In' }).click()
      await page.waitForURL(/\/checkout$/, { timeout: 20000 })
      await signOutAndReturnToGuard()
    })

    // 7. A valid login returns to checkout.
    await step('login returns to checkout', async () => {
      await page.fill('#username', 'dongi')
      await page.fill('#password', 'secret123')
      await page.getByRole('button', { name: 'Log In' }).click()
      await page.waitForURL(/\/checkout$/, { timeout: 20000 })
      await page.waitForSelector('#fullName', { timeout: 20000 })
    })

    // 8. Checkout validates before it will place an order.
    await step('checkout refuses an invalid email', async () => {
      await page.fill('#fullName', 'Dongi Kravche')
      await page.fill('#email', 'not-an-email')
      await page.fill('#address', 'Rustaveli Avenue 12')
      await page.fill('#city', 'Tbilisi')
      await page.getByRole('button', { name: 'Place order' }).click()
      await page.waitForSelector('text=Please enter a valid email address', {
        timeout: 10000,
      })
    })

    // 9. A valid order confirms and empties the cart.
    await step('order confirms and empties the cart', async () => {
      await page.fill('#email', 'dongi@example.com')
      await page.getByRole('button', { name: 'Place order' }).click()
      await page.waitForSelector('text=Thank you! Your order has been placed.', {
        timeout: 10000,
      })
      const cartName = await page
        .locator('a[href="/cart"]')
        .getAttribute('aria-label')
      if (cartName !== 'Cart, empty') {
        throw new Error(`cart not emptied by the order: ${cartName}`)
      }
    })

    // 10. An unknown route and a malformed id both show Not found.
    await step('unknown route shows Not found', async () => {
      await page.goto(`${BASE}/nope`, { waitUntil: 'networkidle' })
      await page.waitForSelector('text=Page not found', { timeout: 20000 })
    })
    await step('malformed product id shows Not found', async () => {
      await page.goto(`${BASE}/products/abc`, { waitUntil: 'networkidle' })
      await page.waitForSelector('text=Page not found', { timeout: 20000 })
    })
    await step('unknown product id shows Not found', async () => {
      await page.goto(`${BASE}/products/999999`, { waitUntil: 'networkidle' })
      await page.waitForSelector('text=Page not found', { timeout: 20000 })
    })

    // 10b. The navigation suits the width: a row on a desktop, one button
    // on a phone, with everything behind it.
    await step('the navigation fits the width it is given', async () => {
      await page.goto(`${BASE}/catalog`, { waitUntil: 'networkidle' })
      const menuButton = page.getByRole('button', { name: 'Open menu' })

      if (vp.width < 768) {
        if (!(await menuButton.isVisible())) throw new Error('no menu button')
        await menuButton.click()
        // Every destination is in the panel, not only some of them.
        // Which account destinations exist depends on who is signed in, and
        // by this point in the run that is a signed-in shopper, so the pair
        // is asserted as "whichever the bar would have shown" rather than by
        // naming /login, which only a guest has.
        for (const href of ['/catalog', '/cart']) {
          await page.waitForSelector(`#main-menu a[href="${href}"]`, {
            timeout: 10000,
          })
        }
        const account = await page
          .locator('#main-menu a[href="/profile"], #main-menu a[href="/login"]')
          .count()
        if (account === 0) throw new Error('no way to the account in the menu')
        await page.keyboard.press('Escape')
        await page.waitForSelector('#main-menu', {
          state: 'detached',
          timeout: 10000,
        })
        return
      }

      if (await menuButton.isVisible()) {
        throw new Error('the menu button leaked onto a wide screen')
      }
      if (!(await page.locator('header a[href="/cart"]').first().isVisible())) {
        throw new Error('the cart is not in the bar')
      }
    })

    // 10c. The landing page's closing word has to fit its frame at every
    // width. It is sized in container units because the frame stops growing
    // at the container's max-width while the viewport does not; sized in vw
    // it reached 142% of its frame at 2344px and the clip ate "SE".
    await step('the closing word fits its frame past the container cap', async () => {
      await page.goto(BASE, { waitUntil: 'networkidle' })
      await page.waitForSelector('a[href^="/catalog?category="]', { timeout: 20000 })

      // Wider than any viewport in the matrix, because that is the only place
      // this can go wrong: below the cap the frame and the viewport agree.
      for (const width of [vp.width, 1920, 2560]) {
        await page.setViewportSize({ width, height: 800 })

        const fit = await page.evaluate(() => {
          const word = [...document.querySelectorAll('p')].find(
            (p) => p.textContent.trim() === 'BROWSE',
          )
          if (!word) return null

          // A Range, not scrollWidth. The element clips its overflow, and a
          // clipped element's scrollWidth is not dependable: measuring the
          // original bug it reported the true 1985px at 2560 but clamped to
          // exactly the frame width at 1440, which would have read as a
          // perfect fit. A Range measures the text itself either way.
          const range = document.createRange()
          range.selectNodeContents(word)

          const frame = word.parentElement
          const style = getComputedStyle(frame)
          return {
            text: Math.round(range.getBoundingClientRect().width),
            box: Math.round(
              frame.clientWidth -
                parseFloat(style.paddingLeft) -
                parseFloat(style.paddingRight),
            ),
          }
        })

        if (fit === null) throw new Error('the closing word is not on the page')
        if (fit.text > fit.box) {
          throw new Error(
            width + 'px: the word is ' + fit.text + 'px in a ' + fit.box + 'px frame',
          )
        }
      }

      await page.setViewportSize({ width: vp.width, height: vp.height })
    })

    // 11. A direct visit to a deep URL works (the SPA rewrite).
    await step('deep URL survives a direct visit', async () => {
      await page.goto(`${BASE}/products/5`, { waitUntil: 'networkidle' })
      await page.waitForSelector('h1', { timeout: 20000 })
    })

    // Both of the catalogue's states are worth a picture: the departments a
    // shopper lands on, and the products inside one of them. This waits for
    // what each state actually renders - waiting for `article` on the
    // departments view is what made this script throw outside `step()` and
    // take the whole run down with it.
    await page.goto(`${BASE}/catalog`, { waitUntil: 'networkidle' })
    await page.waitForSelector('a[href^="/catalog?category="]', {
      timeout: 20000,
    })
    await page.screenshot({
      path: `${SHOT_DIR}/${name}-${vp.name}-catalog.png`,
      fullPage: false,
    })

    await page.goto(`${BASE}/catalog?category=laptops`, {
      waitUntil: 'networkidle',
    })
    await page.waitForSelector('article', { timeout: 20000 })
    await page.screenshot({
      path: `${SHOT_DIR}/${name}-${vp.name}-department.png`,
      fullPage: false,
    })

    const noise = [...consoleErrors, ...failedRequests]
    results.push({
      viewport: vp.name,
      step: 'no console errors or unexpected failed requests',
      ok: noise.length === 0,
      overflow: null,
      error: noise.length ? noise.join(' | ') : undefined,
    })

    await context.close()
  }

  await browser.close()
  return results
}

// Real Google Chrome, not bundled Chromium, so the matrix names a browser a
// visitor actually uses.
const chromeResults = await run(chromium, 'chrome', { channel: 'chrome' })
const firefoxResults = await run(firefox, 'firefox')

console.log(
  JSON.stringify({ chrome: chromeResults, firefox: firefoxResults }, null, 2),
)
