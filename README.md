# Playwright Automation Framework — SauceDemo & Simple Books API

![Playwright Tests](https://github.com/issa-aleisawi/playwright-automation/actions/workflows/playwright.yml/badge.svg)

## 2. Project Description

An enterprise-grade test automation framework built with **Playwright + TypeScript**, covering end-to-end UI testing of [SauceDemo](https://www.saucedemo.com/) and full CRUD API testing of the [Simple Books API](https://simple-books-api.click). The framework uses the Page Object Model with custom fixtures, data-driven execution from external JSON, one-time global authentication via storage state, and runs cross-browser (Chrome & Firefox) both locally and in GitHub Actions CI with Slack notifications.

## 3. Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20.x (LTS) |
| npm | ≥ 10.x (bundled with Node 20) |

Verify with: `node -v` and `npm -v`

## 4. Setup & Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/issa-aleisawi/playwright-automation.git
   cd playwright-automation
   ```
2. Install dependencies:
   ```bash
   npm ci
   ```
3. Install browsers:
   ```bash
   npx playwright install --with-deps chrome firefox
   ```

## 5. Running Tests

| Goal | Command |
|------|---------|
| All tests (UI + API) | `npx playwright test` |
| UI tests only | `npm run test:ui` |
| API tests only | `npm run test:api` |
| Both UI & API explicitly | `npx playwright test tests/ui tests/api` |
| Headed mode (visible browser) | `npm run test:headed` |
| Chrome only | `npm run test:chrome` |
| Firefox only | `npm run test:firefox` |

## 6. Architecture & Structure

```
playwright-automation/
├── src/
│   ├── pages/          # Page Object Model classes — locators + page actions
│   │                   #   (LoginPage, ProductsPage, CartPage, CheckoutPage)
│   ├── api/            # BooksApiClient — wraps all Simple Books API endpoints
│   ├── fixtures/       # Custom Playwright fixtures injecting page objects into tests
│   ├── data/           # External JSON test data (data-driven execution)
│   └── utils/          # RandomGenerator + global setup (logging + one-time auth) / teardown
├── tests/
│   ├── ui/             # UI specs (TC_UI_001 … TC_UI_004) — intent + assertions only
│   └── api/            # API specs (TC_API_001 … TC_API_004)
├── reports/            # Generated HTML report (git-ignored)
├── storageState.json   # Auth session saved by globalSetup (generated, git-ignored)
├── playwright.config.ts# Projects (chrome / firefox / api), reporters, global hooks
└── .github/workflows/  # CI pipeline (push to main + daily 3AM Amman schedule + Slack alerts)
```

**Architectural pattern:** Page Object Model + fixture-based dependency injection.
Tests never contain selectors or raw HTTP calls — they declare the page objects /
API client they need and express *intent*. All implementation detail lives in
`src/`, so a UI or endpoint change is fixed in exactly one place. The API layer
mirrors the same philosophy (a "Service Object Model") for consistency.

## 7. Test Scenarios

### UI Test Cases

| TC ID | Module | Test Name | Verification |
|-------|--------|-----------|--------------|
| TC_UI_001 | Login | Valid Login | Successful navigation to Products page |
| TC_UI_002 | Login | Data-Driven Invalid Login (3 scenarios from JSON) | Correct validation error per scenario |
| TC_UI_003 | Products | Sort Z→A verification | Displayed order matches independent reverse-alphabetical sort |
| TC_UI_004 | Checkout | End-to-end checkout | Two most expensive products found dynamically; Item total mathematically verified; order confirmation asserted |

### API Test Cases

| TC ID | Module | Test Name | Verification |
|-------|--------|-----------|--------------|
| TC_API_001 | Auth | POST create order with dynamic Bearer token | 201 Created + valid orderId returned |
| TC_API_002 | Orders | GET newly created order | 200 OK + payload matches submitted bookId/customerName |
| TC_API_003 | Orders | PATCH customer name | 204 No Content + follow-up GET confirms persistence |
| TC_API_004 | Orders | DELETE order | 204 No Content + follow-up GET returns 404 |

## 8. Viewing Reports

After any test run, an HTML report is generated at `reports/html-report/`. To open it:

```bash
npm run report
```

This starts a local server and opens the interactive report in your browser, where you can drill into each test, view steps, screenshots, videos, and traces (captured automatically on failure). In CI, the same report is uploaded as a downloadable artifact.

## 9. CI/CD

The GitHub Actions workflow (`.github/workflows/playwright.yml`) has **two triggers**:

1. **Push to `main`** — runs automatically whenever code is merged to the main branch.
2. **Daily schedule** — cron `0 0 * * *` (00:00 UTC = **3:00 AM Amman time, UTC+3**).

Pipeline steps: checkout → Node 20 setup → `npm ci` → install Chrome & Firefox →
run the full suite headlessly → upload the HTML report as an artifact named
`playwright-html-report` (uploaded even on failure) → send a Slack notification
with the pass/fail status and a link to the run.

**Slack notifications:** on completion, the pipeline reads the test step's outcome
and posts a formatted summary (✅/❌, repo, branch, trigger type, report link) to a
Slack channel via an Incoming Webhook. The webhook URL is stored as an encrypted
repository secret named `SLACK_WEBHOOK_URL` (Settings → Secrets and variables →
Actions). If the secret is not configured, the step skips gracefully instead of
failing the build.

**Viewing artifacts:** GitHub repo → *Actions* tab → select a run → *Artifacts* section at the bottom → download `playwright-html-report`, unzip, and open `index.html`.

## 10. Bonus Features Implemented

### Global Authentication (Storage State)

`src/utils/globalSetup.ts` performs the SauceDemo login **once**, headlessly,
before the suite runs, and saves the session cookies to `storageState.json`.
The checkout test (TC_UI_004) loads this state via `test.use({ storageState })`
and navigates directly to the Products page — no UI login steps. This removes
redundant login repetition (already covered by TC_UI_001/002), speeds up the
suite, and reduces flakiness. The state file is git-ignored, as session data
should never be committed.

### Pipeline Slack Notifications

The CI workflow parses the test step outcome (`steps.tests.outcome`) and sends
a formatted pass/fail summary to Slack after every run — including failed runs,
via `if: always()`. See Section 9 for configuration details.