# One application, two workspaces

Keep the Vue application and deployment shared. Give staff and merchants separate entry points, navigation, authentication state and API clients. Staff continue using `/sign-in` and the current back office. Merchants enter at `/portal/login` and use TIN/password authentication. A customer session never authorizes a staff route, and staff credentials are never attached to customer billing requests.

This avoids maintaining two frontends while keeping the customer experience focused. Both workspaces share an origin, so this is not a browser-origin isolation boundary. The Rails API enforces ownership of customer data and checkout orders; route guards provide navigation, not security. A separate domain/application would be appropriate if separate deployment teams or stronger browser isolation become necessary.

## Pages

| Route | Purpose |
| --- | --- |
| `/portal/login` | Customer TIN/password sign-in; preserves the checkout return destination |
| `/portal` | Subscription status, registered terminals, pending payments |
| `/portal/plans` | Live plan catalog, actual daily rates, current subscription and renewal FAQs |
| `/portal/checkout/:planId` | Business details, duration, expected expiry, amount and hosted checkout |
| `/portal/payment?tx_ref=...` | Server-verified payment status, bounded polling and existing-checkout recovery |
| `/portal/payments` | Paginated payment history for the authenticated taxpayer |

The visual system uses navy navigation, warm neutral surfaces and teal actions. Plan recommendations reflect the actual lowest daily rate; no invented savings or popularity claims are shown. All registered terminals have the same plan features; customers choose a prepaid duration. Prices are always supplied by the API. Demo prices and business details exist only in browser test fixtures.

Keyboard users get visible focus indicators, labelled inputs, a skip link, keyboard-accessible FAQs and a mobile menu that makes hidden content inert. Reduced motion is respected. Plan and checkout layouts stack on narrow screens. Loading, unavailable plans, connection errors, account blocks, pending payment and confirmed payment are distinct states.

## Running locally

```powershell
npm ci
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173/portal/login`. Run Rails on port 3000 in the backend repository. The customer account must already have been registered through terminal activation, and its account email must have delivered its password. Customer password recovery still goes through the POS provider; the existing staff recovery endpoint is not used for customer accounts.

The backend Puma configuration now skips its embedded Solid Queue supervisor on Windows, where `fork` is unavailable. Run `bundle exec rails billing:reconcile` manually during local testing; the Linux production scheduler remains enabled.

To use another API, put this in `.env.local` and restart Vite:

```text
VITE_API_BASE_URL=https://your-api.example/api/v1/
```

No provider secrets or POS API keys belong in the frontend. Configure PayChangu in the backend, including:

```text
PAYCHANGU_CALLBACK_URL=https://your-client.example/portal/payment
PAYCHANGU_RETURN_URL=https://your-client.example/portal/payment
```

PayChangu appends `tx_ref`. A `status=success` parameter is not proof of payment. Production hosting must serve `index.html` for client routes, including `/portal/payment`, and use HTTPS. Configure Rails CORS for the deployed client origin.

The backend now provides `GET billing/overview` and `GET billing/history?page=1`, scoped to the authenticated taxpayer. No new database migration is required for these two endpoints. Overview shows up to 100 terminals and the latest 10 pending orders; history is paginated at 15 payments per page.

## Payment behavior

- Review displays the real plan price and a projected expiry using the API's current date. An early renewal preserves remaining days. The actual date is determined when payment is verified.
- Customers explicitly confirm the one-time purchase before continuing to PayChangu. Administrative holds disable checkout and explain how to resolve them.
- The purchase key and returned reference are saved in session storage for the account and plan. Reloads and ambiguous retries retain the same key. Known orders go to their status page instead of starting another payment. Completed keys are cleared after verified success.
- If the returned amount or duration differs from the reviewed plan, automatic navigation stops and the customer must review the existing order.
- The confirmation page polls at most four times, six seconds apart. Further checking is manual. A pending order can resume its validated PayChangu URL. A provider outage never displays a false failure or success.
- Auth tokens use separate staff and customer stores. Customer state is in session storage, and no customer password is persisted. API 401 responses clear customer authentication and preserve the return destination through sign-in.
- Live merchant checkout still needs PayChangu credentials, configured plans, a public webhook and sandbox validation. Browser tests mock the provider and API; they do not move money.

## Verification

```powershell
npm run build
npx playwright install chromium
npm run test:e2e
```

Tests cover sign-in separation, API-driven prices, mobile overflow/navigation, checkout consent, purchase-key reuse after reload, untrusted redirect status, verified confirmation, expired sessions and empty/error states. Screenshots are saved under `test-results/` for desktop/mobile review. Run `bundle exec rails test test/integration/self_service_billing_test.rb` in the backend to verify server ownership and settlement behavior.
