---
name: e2e-browser-testing
description: >-
  Headless browser verification, end-to-end user journey testing, and visual layout validation using Playwright.
  Use when validating interactive UI flows, form submissions, multi-step wizards, responsive layouts, or full-stack integrations.
  Catches visual clipping, hidden modals, broken network requests, and browser console exceptions.
---

# E2E Browser Testing & Visual Verification Protocol

## Core Principle
> **Unit tests prove logic; browser tests prove user reality.**
> A button can have 100% unit test coverage, but if it is rendered with `opacity-0` or obscured behind a modal overlay (`z-index`), the user is blocked.

---

## 1. End-to-End User Journey Verification

1. **Test Real Critical Paths:**
   * Focus E2E tests on core revenue and conversion journeys:
     - Authentication: Sign up, login, session persistence across reload, logout.
     - Core Workflow: Create record, edit record, filter list, delete record.
     - Checkout / Billing: Form completion, Stripe webhook triggering, receipt screen.
2. **Assert Computed Visibility (Not Just DOM Presence):**
   * **Rule:** Always assert that an element is visible, actionable, and enabled:
     ```typescript
     // ❌ Weak: Passes even if element is hidden with display:none
     expect(await page.$('#submit-btn')).not.toBeNull();

     // ✅ Strong: Asserts bounding box, zero opacity, and un-obscured z-index
     await expect(page.getByRole('button', { name: 'Save Lead' })).toBeVisible();
     await expect(page.getByRole('button', { name: 'Save Lead' })).toBeEnabled();
     ```

---

## 2. Browser Console & Network Health Auditing

1. **Console Error Trapping:**
   * Listen for uncaught runtime exceptions during the test run:
     ```typescript
     page.on('console', (msg) => {
       if (msg.type() === 'error') {
         console.error(`Browser Error: ${msg.text()}`);
       }
     });
     page.on('pageerror', (exception) => {
       throw new Error(`Uncaught Client Exception: ${exception.message}`);
     });
     ```
2. **Failed Network Request Detection:**
   * Assert zero unintended 4xx or 5xx API responses or failed asset loads (fonts, CSS, scripts).

---

## 3. Responsive Layout & Viewport Verification

1. **Multi-Viewport Checks:**
   * Test layouts across three standard breakpoints:
     - **Desktop:** `1280 x 800` (comfortable tabular density)
     - **Tablet:** `768 x 1024` (collapsible sidebar)
     - **Mobile:** `375 x 667` (drawer/bottom-sheet navigation, 44px min touch targets)
2. **Inspect Clipping & Overflow:**
   * Verify that horizontal scrollbars do not accidentally appear on the `<body>` element on mobile viewports (`overflow-x: hidden`).

---

## 4. Token & Speed Optimization for E2E Runs

1. **Run Targeted Headless Tests:**
   * Never execute full heavy E2E suites on every turn.
   * Run *only* the specific spec file relevant to the active feature:
     ```bash
     npx playwright test tests/e2e/lead-creation.spec.ts --reporter=line
     ```
2. **Failure-Only Screenshots:**
   * Configure Playwright to capture screenshots and trace files *only on failure*:
     ```typescript
     // playwright.config.ts
     use: {
       screenshot: 'only-on-failure',
       trace: 'retain-on-failure',
     }
     ```
   * Avoid dumping megabytes of binary image data into the chat context.

---

## E2E Quality Checklist

Before declaring an interactive feature complete:
- [ ] Does the complete user flow work from entry to completion?
- [ ] Are all elements tested using `toBeVisible()` and accessible role queries (`getByRole`)?
- [ ] Is the browser console free of unhandled exceptions and CORS errors?
- [ ] Have mobile viewports (`375px`) been tested for horizontal overflow?
- [ ] Are network requests verified for successful HTTP status codes?
