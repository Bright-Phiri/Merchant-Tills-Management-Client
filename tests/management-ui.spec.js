import { test, expect } from '@playwright/test'

const staffSession = {
  token: 'staff-token',
  user_id: 1,
  user_name: 'Aki Phiri',
  email: 'staff@example.com',
  secret: null,
  isUserLoggedIn: true,
  permissions: {
    taxpayers: ['read', 'update'],
    terminals: ['read'],
    subscriptions: ['read'],
    subscription_plans: ['read', 'create', 'update', 'destroy'],
    payments: ['read'],
    users: ['read'],
    logs: ['read'],
  },
}

async function signInStaff(page) {
  await page.addInitScript((session) => {
    localStorage.setItem('auth', JSON.stringify(session))
  }, staffSession)
}

test('staff sign in matches the management workspace and authenticates', async ({
  page,
}, testInfo) => {
  await page.route('**/api/v1/authentication/login', (route) =>
    route.fulfill({
      json: {
        data: {
          user: { id: 1, user_name: 'Aki Phiri', email_address: 'staff@example.com' },
          token: 'staff-token',
          permissions: staffSession.permissions,
        },
      },
    }),
  )
  await page.goto('/sign-in')

  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible()
  await expect(page.getByText('Control every terminal.')).toBeVisible()
  await page.getByLabel('Email address or username').fill('aki')
  await page.getByLabel('Password', { exact: true }).fill('correct-password')
  await page.screenshot({ path: testInfo.outputPath('staff-sign-in.png'), fullPage: true })
  await page.getByRole('button', { name: 'Sign in to management' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
})

test('staff sign in fits a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/sign-in')

  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign in to management' })).toBeVisible()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBeTruthy()
})

test('management dashboard uses the shared visual system without overflow', async ({
  page,
}, testInfo) => {
  await signInStaff(page)
  await page.goto('/dashboard')

  await expect(page.getByRole('heading', { name: 'Your operation, at a glance.' })).toBeVisible()
  await expect(page.getByText('T-Control')).toBeVisible()
  await expect(page.locator('.brand-name small')).toHaveText('MANAGEMENT')
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBeTruthy()
  await page.screenshot({ path: testInfo.outputPath('management-dashboard.png'), fullPage: true })
})

test('management navigation starts closed and remains usable on mobile', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await signInStaff(page)
  await page.goto('/dashboard')

  await expect(page.getByRole('heading', { name: 'Your operation, at a glance.' })).toBeVisible()
  await expect(page.locator('.gmail-drawer')).not.toHaveClass(/v-navigation-drawer--active/)
  await page.getByRole('button', { name: 'Toggle management navigation' }).click()
  await expect(page.locator('.brand-name small')).toHaveText('MANAGEMENT')
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBeTruthy()
  await page.screenshot({ path: testInfo.outputPath('management-mobile.png'), fullPage: true })
})

test('management data pages inherit the same table and control styling', async ({
  page,
}, testInfo) => {
  await signInStaff(page)
  await page.route('**/api/v1/taxpayers**', (route) =>
    route.fulfill({
      json: {
        data: {
          taxpayers: [
            {
              id: 1,
              tin: '31166954',
              name: 'HABM Enterprises',
              email_address: 'accounts@example.com',
              phone_number: '0999000000',
              terminals_count: 2,
              license_type: 'subscription',
            },
          ],
          total: 1,
        },
      },
    }),
  )
  await page.goto('/clients')

  await expect(page.locator('.v-card-title > span', { hasText: 'Clients' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'HABM Enterprises' })).toBeVisible()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBeTruthy()
  await page.screenshot({ path: testInfo.outputPath('management-clients.png'), fullPage: true })
})

test('administrators consume plan management endpoints', async ({ page }) => {
  await signInStaff(page)
  const plans = [
    {
      id: 1,
      name: 'Monthly',
      billing_period: 'monthly',
      days: 30,
      amount: '15000.0',
      currency: 'MWK',
      active: true,
      description: 'Monthly terminal access',
    },
  ]
  let createRequest
  await page.route('**/api/v1/subscription_plans**', async (route) => {
    if (route.request().method() === 'POST') {
      createRequest = route.request().postDataJSON()
      return route.fulfill({
        status: 201,
        json: { data: { id: 2, ...createRequest.subscription_plan } },
      })
    }
    await route.fulfill({ json: { data: plans } })
  })

  await page.goto('/subscription-plans')
  await expect(page.getByRole('heading', { name: 'Subscription plans' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Monthly', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Add plan' }).click()
  const planDialog = page.getByRole('dialog')
  await page.getByLabel('Plan name').fill('Quarterly Plus')
  await planDialog.getByRole('combobox').click()
  await page.getByRole('option', { name: 'Quarterly' }).click()
  await page.getByLabel('Price (MWK)').fill('42000')
  await page.getByLabel('Description').fill('Three months of access')
  await page.getByRole('button', { name: 'Save plan' }).click()

  await expect
    .poll(() => createRequest)
    .toMatchObject({
      subscription_plan: {
        name: 'Quarterly Plus',
        billing_period: 'quarterly',
        amount: 42000,
        description: 'Three months of access',
        active: true,
      },
    })
})

test('administrators consume the customer license type endpoint', async ({ page }) => {
  await signInStaff(page)
  let updateRequest
  const client = {
    id: 1,
    tin: '31166954',
    name: 'HABM Enterprises',
    email_address: 'accounts@example.com',
    phone_number: '0999000000',
    terminals_count: 2,
    license_type: 'subscription',
  }
  await page.route('**/api/v1/taxpayers**', async (route) => {
    if (route.request().method() === 'PATCH') {
      updateRequest = route.request().postDataJSON()
      return route.fulfill({ json: { data: { ...client, license_type: 'once_off' } } })
    }
    await route.fulfill({ json: { data: { taxpayers: [client], total: 1 } } })
  })

  await page.goto('/clients')
  await page.getByRole('button', { name: 'License Type' }).click()
  await page.getByRole('dialog').getByRole('combobox').click()
  await page.getByRole('option', { name: 'Once-Off' }).click()
  await page.getByRole('button', { name: 'Save license type' }).click()

  await expect.poll(() => updateRequest).toEqual({ license_type: 'once_off' })
  await expect(page.getByRole('cell', { name: 'Once-Off' })).toBeVisible()
})

test('manual assignment loads the customer profile and submits the selected plan', async ({
  page,
}) => {
  await signInStaff(page)
  let assignmentRequest
  await page.route('**/api/v1/subscription_plans', (route) =>
    route.fulfill({
      json: {
        data: [
          {
            id: 7,
            name: 'Quarterly',
            billing_period: 'quarterly',
            days: 90,
            amount: '40000.0',
            currency: 'MWK',
            active: true,
            description: 'Three months',
          },
        ],
      },
    }),
  )
  await page.route('**/api/v1/taxpayers/1', (route) =>
    route.fulfill({
      json: {
        data: {
          id: 1,
          tin: '31166954',
          name: 'HABM Enterprises',
          license_type: 'subscription',
          subscription: null,
        },
      },
    }),
  )
  await page.route('**/api/v1/taxpayers/1/subscriptions', async (route) => {
    assignmentRequest = route.request().postDataJSON()
    await route.fulfill({ status: 201, json: { message: 'Subscription created', data: {} } })
  })
  await page.goto('/new-subscription/1')
  await expect(page.getByText('HABM Enterprises')).toBeVisible()
  const assignmentComboboxes = page.getByRole('combobox')
  await assignmentComboboxes.nth(0).click()
  await page.getByRole('option', { name: 'Quarterly' }).click()
  await assignmentComboboxes.nth(1).click()
  await page.getByRole('option', { name: 'CASH' }).click()
  await page.getByRole('button', { name: 'Create subscription' }).click()

  await expect
    .poll(() => assignmentRequest)
    .toMatchObject({
      subscription: { access_type: 'fixed_term', plan_id: 7 },
      payment: { amount: '40000.0', payment_method: 'CASH' },
    })
})
