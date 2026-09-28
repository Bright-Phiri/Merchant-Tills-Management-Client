import { test, expect } from '@playwright/test'

// Demonstration prices live exclusively in test fixtures, never in the product.
const taxpayer = {
  id: 1,
  tin: '1000123456',
  name: 'Mango Tree Trading',
  email_address: 'accounts@example.com',
}
const plans = [
  { id: 1, name: 'Monthly', days: 30, amount: '15000', currency: 'MWK' },
  { id: 2, name: 'Quarterly', days: 90, amount: '40000', currency: 'MWK' },
  { id: 3, name: 'Annual', days: 365, amount: '150000', currency: 'MWK' },
]
const overview = {
  taxpayer,
  current_date: '2026-09-17',
  subscription: { start_date: '2026-09-01', end_date: '2026-09-30' },
  status: 'active',
  remaining_days: 14,
  terminal_count: 2,
  terminals: [
    { terminal_id: 'POS-001', terminal_label: 'Main store', blocked: false },
    { terminal_id: 'POS-002', terminal_label: 'City store', blocked: false },
  ],
  pending_orders: [],
}
const order = {
  reference: 'SUB1234567890',
  provider: 'onekhusa',
  status: 'pending',
  amount: '40000',
  currency: 'MWK',
  days: 90,
  checkout_url: null,
  payment_account: '11005533',
  payment_expires_at: '2099-09-17T14:15:00Z',
  paid_at: null,
}
async function mockApi(
  page,
  { signedIn = true, catalog = plans, account = overview, verified = order } = {},
) {
  if (signedIn)
    await page.addInitScript((data) => {
      if (!sessionStorage.getItem('taxpayer-session'))
        sessionStorage.setItem(
          'taxpayer-session',
          JSON.stringify({ token: 'customer-token', taxpayer: data }),
        )
    }, taxpayer)
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname.replace('/api/v1/', '')
    let data
    if (path === 'taxpayers/login') data = { taxpayer, token: 'customer-token', role: 'Taxpayer' }
    else if (path === 'billing/plans') data = catalog
    else if (path === 'billing/overview') data = account
    else if (path === 'billing/history') data = { payments: [], total: 0, total_pages: 0 }
    else if (path === 'billing/checkouts') data = order
    else if (path.endsWith('/verify')) data = verified
    else if (path.startsWith('billing/checkouts/')) data = order
    else return route.fulfill({ status: 404, json: { message: 'Missing mock' } })
    await route.fulfill({ json: { success: true, data } })
  })
}

test('customer login preserves checkout destination and cannot enter staff workspace', async ({
  page,
}) => {
  await mockApi(page, { signedIn: false })
  await page.goto('/portal/checkout/2')
  await expect(page).toHaveURL(/portal\/login\?redirect=/)
  await page.getByLabel('Taxpayer identification').fill(taxpayer.tin)
  await page.getByLabel('Password', { exact: true }).fill('correct-password')
  await page.getByRole('button', { name: 'Sign in to your account' }).click()
  await expect(page.getByRole('heading', { name: 'Make it official.' })).toBeVisible()
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/sign-in$/)
})

test('plans are real API values and desktop layout has no overflow', async ({ page }, testInfo) => {
  await mockApi(page)
  await page.goto('/portal/plans')
  await expect(page.getByRole('heading', { name: 'Keep your business moving.' })).toBeVisible()
  await expect(page.locator('.portal-plan')).toHaveCount(3)
  await expect(page.locator('.portal-plan.featured')).toContainText('Annual')
  await expect(page.locator('.portal-plan').nth(1)).toContainText('MK 40,000')
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBeTruthy()
  await page.screenshot({ path: testInfo.outputPath('plans-desktop.png'), fullPage: true })
})

test('review explains required consent and sends only plan plus idempotency key', async ({
  page,
}, testInfo) => {
  await mockApi(page)
  await page.goto('/portal/checkout/2')
  const continueButton = page.getByRole('button', { name: 'Continue to payment' })
  await expect(continueButton).toBeEnabled()
  await continueButton.click()
  await expect(page.getByRole('alert')).toContainText('Confirm the one-time payment terms')
  await expect(page.getByRole('checkbox')).toBeFocused()
  await expect(page.locator('.portal-summary')).toContainText('29 Dec 2026')
  await page.screenshot({ path: testInfo.outputPath('checkout-desktop.png'), fullPage: true })
  await page.getByRole('checkbox').check()
  await expect(page.getByRole('alert')).toHaveCount(0)
  const requestPromise = page.waitForRequest(
    (req) => req.url().endsWith('/billing/checkouts') && req.method() === 'POST',
  )
  await page.getByRole('button', { name: 'Continue to payment' }).click()
  const request = await requestPromise
  expect(request.postDataJSON()).toEqual({ plan_id: 2 })
  expect(request.headers()['idempotency-key']).toBeTruthy()
  expect(request.headers().authorization).toBe('Bearer customer-token')
  await expect(page).toHaveURL(/\/portal\/payment\?tx_ref=SUB1234567890/)
  await expect(page.getByText('11005533')).toBeVisible()
  await expect(page.getByText('Send exactly')).toContainText('MK 40,000')
})

test('ambiguous checkout retries retain the same key after reload', async ({ page }) => {
  await mockApi(page)
  const keys = []
  await page.route('**/billing/checkouts', async (route) => {
    keys.push(route.request().headers()['idempotency-key'])
    await route.fulfill({ status: 503, json: { error: 'Provider unavailable' } })
  })
  await page.goto('/portal/checkout/2')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Continue to payment' }).click()
  await expect(page.getByRole('alert')).toContainText('could not confirm')
  await page.reload()
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Continue to payment' }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  expect(keys).toHaveLength(2)
  expect(keys[0]).toBe(keys[1])
})

test('return URL success parameter cannot falsely confirm payment', async ({ page }) => {
  await mockApi(page)
  await page.goto('/portal/payment?tx_ref=SUB1234567890&status=success')
  await expect(page.getByRole('heading', { name: 'Waiting for confirmation.' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'You’re all set.' })).toHaveCount(0)
  await expect(page.getByText('11005533')).toBeVisible()
})

test('verified payment clears retry key and displays confirmation', async ({ page }, testInfo) => {
  await mockApi(page, { verified: { ...order, status: 'paid' } })
  await page.addInitScript(() =>
    sessionStorage.setItem(
      'checkout:1000123456:2',
      JSON.stringify({ key: 'test-key', reference: 'SUB1234567890' }),
    ),
  )
  await page.goto('/portal/payment?tx_ref=SUB1234567890')
  await expect(page.getByRole('heading', { name: 'You’re all set.' })).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => sessionStorage.getItem('checkout:1000123456:2')))
    .toBeNull()
  await page.screenshot({ path: testInfo.outputPath('payment-confirmed.png'), fullPage: true })
})

test('empty plans and network failures have actionable states', async ({ page }) => {
  await mockApi(page, { catalog: [] })
  await page.goto('/portal/plans')
  await expect(page.getByRole('heading', { name: 'Your plans are on their way' })).toBeVisible()
  await page.route('**/billing/plans', (route) => route.abort())
  await page.reload()
  await expect(page.getByRole('alert')).toContainText('We couldn’t load this page')
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible()
})

test('API expiry preserves the payment reference through login', async ({ page }) => {
  await mockApi(page)
  await page.route('**/billing/checkouts/**', (route) =>
    route.fulfill({ status: 401, json: { message: 'Expired' } }),
  )
  await page.goto('/portal/payment?tx_ref=SUB1234567890')
  await expect(page).toHaveURL(/portal\/login.*SUB1234567890/)
  await expect(page.getByText('Your session ended.')).toBeVisible()
})

test('mobile plans and checkout fit the viewport and navigation works', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mockApi(page)
  await page.goto('/portal/plans')
  await expect(page.locator('.portal-plan')).toHaveCount(3)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBeTruthy()
  await page.screenshot({ path: testInfo.outputPath('plans-mobile.png'), fullPage: true })
  await page.getByRole('button', { name: 'Toggle navigation' }).click()
  await page.getByRole('link', { name: 'Overview', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'A clear view of what’s next.' })).toBeVisible()
  await page.goto('/portal/checkout/2')
  await expect(page.getByRole('heading', { name: 'Your order summary' })).toBeVisible()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBeTruthy()
  await page.screenshot({ path: testInfo.outputPath('checkout-mobile.png'), fullPage: true })
})

test('administrative hold prevents checkout and customer history is accessible', async ({
  page,
}) => {
  await mockApi(page, { account: { ...overview, status: 'blocked' } })
  await page.goto('/portal/checkout/2')
  await page.getByRole('checkbox').check()
  await expect(page.getByRole('button', { name: 'Continue to payment' })).toBeDisabled()
  await page.goto('/portal/payments')
  await expect(page.getByRole('heading', { name: 'A fresh start.' })).toBeVisible()
})

test('price changes stop automatic redirection and require reviewing the order', async ({
  page,
}) => {
  await mockApi(page)
  await page.route('**/billing/checkouts', (route) =>
    route.fulfill({ json: { data: { ...order, amount: '45000' } } }),
  )
  await page.goto('/portal/checkout/2')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Continue to payment' }).click()
  await expect(page.getByRole('alert')).toContainText('plan has changed')
  await expect(page).toHaveURL(/\/portal\/checkout\/2$/)
  await expect(page.getByRole('button', { name: 'View payment status' })).toBeVisible()
})

test('mobile navigation supports escape and hidden links cannot receive focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mockApi(page)
  await page.goto('/portal/plans')
  await expect(page.locator('.portal-sidebar')).toHaveAttribute('inert', '')
  await page.getByRole('button', { name: 'Toggle navigation' }).click()
  await expect(page.locator('.portal-main')).toHaveAttribute('inert', '')
  await page.keyboard.press('Escape')
  await expect(page.locator('.portal-sidebar')).toHaveAttribute('inert', '')
  await expect(page.getByRole('button', { name: 'Toggle navigation' })).toBeFocused()
})
