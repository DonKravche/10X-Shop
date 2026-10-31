import { chromium, firefox } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = 'http://localhost:4173'
const SHOT_DIR = process.argv[2]
mkdirSync(SHOT_DIR, { recursive: true })

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
    page.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(m.text())
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

    // 1. Catalog loads from DummyJSON and renders cards.
    await step('catalog loads 12 products', async () => {
      await page.goto(BASE, { waitUntil: 'networkidle' })
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
      await page.waitForFunction(
        () => {
          const b = document.querySelector('a[href="/cart"] span')
          return b && b.textContent.trim() === '1'
        },
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
    const signOutAndReturnToGuard = async () => {
      await page.locator('header button', { hasText: 'Log out' }).click()
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
      const badge = await page.locator('a[href="/cart"] span').count()
      if (badge !== 0) throw new Error('cart badge still visible after the order')
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

    // 11. A direct visit to a deep URL works (the SPA rewrite).
    await step('deep URL survives a direct visit', async () => {
      await page.goto(`${BASE}/products/5`, { waitUntil: 'networkidle' })
      await page.waitForSelector('h1', { timeout: 20000 })
    })

    await page.goto(BASE, { waitUntil: 'networkidle' })
    await page.waitForSelector('article', { timeout: 20000 })
    await page.screenshot({
      path: `${SHOT_DIR}/${name}-${vp.name}-catalog.png`,
      fullPage: false,
    })

    results.push({
      viewport: vp.name,
      step: 'console errors',
      ok: consoleErrors.length === 0,
      overflow: null,
      error: consoleErrors.length ? consoleErrors.join(' | ') : undefined,
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
