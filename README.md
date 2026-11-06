# OrigamiRisk_LoginAutomation

This is my solution to the SDET take-home assessment. It's a small **Playwright + TypeScript** project that tests the login page at <https://the-internet.herokuapp.com/login>.

The assessment asked for three test cases: one successful login and two failed ones. Those are all here. I also added some extra cases that I think any login form should cover (see [Extra cases](#extra-cases-i-added-additional)).

## What you need

- **Node.js 20 or newer.** I used 22, which is also what CI uses (see `.nvmrc`).
- **An internet connection**, because the tests run against the live site.

## Getting started

Clone the repo, then install the dependencies and the Playwright browsers:

```bash
npm ci
npx playwright install
```

Then run everything:

```bash
npm test
```

That runs the full suite on Chromium, Firefox and WebKit. To open the HTML report afterwards:

```bash
npm run report
```

> On Windows PowerShell 5, `&&` doesn't work between commands, so run them one per line as shown above.

### Other ways to run it

| Command                  | What it does                                      |
| ------------------------ | ------------------------------------------------- |
| `npm run test:chromium`  | Whole suite, Chromium only (faster)               |
| `npm run test:mandatory` | Only the 3 test cases required by the assessment  |
| `npm run test:headed`    | Watch the browser while the tests run             |
| `npm run test:debug`     | Step through a test with the Playwright Inspector |
| `npm run report`         | Open the last HTML report                         |

You can also target a single file or a single test by its ID:

```bash
npx playwright test tests/login/login.spec.ts
npx playwright test -g "TC-02"
```

### Code quality

```bash
npm run typecheck     # TypeScript
npm run lint          # ESLint (including eslint-plugin-playwright rules)
npm run format:check  # Prettier (use `npm run format` to fix)
```

### Configuration

| Variable         | Default                              | Purpose                |
| ---------------- | ------------------------------------ | ---------------------- |
| `BASE_URL`       | `https://the-internet.herokuapp.com` | Environment under test |
| `LOGIN_USERNAME` | `tomsmith`                           | Valid username         |
| `LOGIN_PASSWORD` | `SuperSecretPassword!`               | Valid password         |

## How the project is organized

```text
tests/login/          test files (spec files)
pages/                page objects (one per page)
pages/components/     UI pieces that appear on more than one page
fixtures/             makes the page objects available in every test
test-data/            credentials and the messages the app is expected to show
playwright.config.ts  browsers, timeouts, retries, reporting
```

The test files read like the test cases: open the page, log in, check what happens. They don't know anything about selectors. Those live in the page objects (`Login.Page.ts` and `SecureArea.Page.ts`), so if the site's HTML changes, there's only one place to fix.

The green/red message banner shows up on both the login page and the secure area, so instead of writing the same code twice I made it a small component (`FlashMessage.ts`) that both pages use. It checks the text and whether the banner is a success or an error.

A Playwright fixture (`LoginTest.Fixture.ts`) lets tests ask for `loginPage` or `secureAreaPage` directly instead of creating them every time.

## The test cases

### Required by the assessment (`@mandatory`)

| ID    | Scenario         | Expected result                                                                    |
| ----- | ---------------- | ---------------------------------------------------------------------------------- |
| TC-01 | Valid login      | Lands on `/secure`, sees the Secure Area page and "You logged into a secure area!" |
| TC-02 | Invalid username | "Your username is invalid!", stays on `/login`, no session is created              |
| TC-03 | Invalid password | "Your password is invalid!", stays on `/login`, no session is created              |

For the negative cases I don't stop at the error message. I also check that:

1. The URL is still `/login` and the form is still there.
2. **No session was created.** The test then requests `/secure` and expects to be bounced back to `/login` with "You must login to view the secure area!". Checking that the Logout link is missing wouldn't prove anything, because that link never exists on the login page anyway.

The error message is asserted **before** the URL on purpose. The URL is already `/login` before the form is submitted, so checking it first would pass immediately without waiting for the server's answer. The flash message only appears after the response, so it acts as the synchronization point.

### Extra cases I added (`@additional`)

Before writing these, I tried each one by hand on the real site to see what actually happens instead of assuming.

| ID    | Scenario                              | Observed behavior                       |
| ----- | ------------------------------------- | --------------------------------------- |
| TC-04 | Both fields empty                     | "Your username is invalid!"             |
| TC-05 | Username empty                        | "Your username is invalid!"             |
| TC-06 | Password empty                        | "Your password is invalid!"             |
| TC-07 | Username with leading/trailing spaces | Rejected, the input is not trimmed      |
| TC-08 | Username in uppercase                 | Rejected, usernames are case-sensitive  |
| TC-09 | Password with different casing        | Rejected                                |
| TC-10 | Password field                        | Input is masked (`type="password"`)     |
| TC-11 | Press Enter instead of clicking Login | Form submits and logs in                |
| TC-12 | Logout                                | Session ends; `/secure` is denied again |
| TC-13 | Open `/secure` without logging in     | Redirected to `/login` with an error    |

TC-04 to TC-09 share the same steps and only the input changes, so they're one data-driven test that loops over a list of inputs instead of six copy-pasted tests.

In total there are **13 tests**; on 3 browsers that's **39 runs**.

## Design decisions

- **Locators.** I used `getByRole` and `getByLabel` wherever I could, because they find elements the way a user does, by label or visible name, and they survive HTML changes better than CSS selectors. The only exception is the message banner: it has no role or label on this site, so I used its stable `#flash` id.
- **No hard waits.** There's no `waitForTimeout` anywhere. Playwright waits for elements on its own, and web-first assertions like `toHaveURL` and `toBeVisible` retry until they pass or time out.
- **Independent tests.** Every test gets a fresh browser context, so no cookies or sessions leak between tests. They can run in any order and in parallel (`fullyParallel: true`).
- **When something fails.** I don't catch errors inside tests, because that would hide failures. A failing test keeps a trace, a screenshot and a video in `test-results/`. Open the trace with `npx playwright show-trace <path-to-trace.zip>`. On CI, tests get 2 retries to absorb network hiccups; locally they get none, so flaky behavior shows up right away.
- **Credentials.** The valid credentials are the public demo ones printed on the login page, so they live in `test-data/credentials.ts`, overridable with environment variables. On a real project they would come from CI secrets, not from the code.
- **Keeping it small.** I left out a base page class, a utils folder and extra libraries. For a project this size they'd add layers without adding value.

## CI

`.github/workflows/playwright.yml` runs on every push and pull request to `main`. It checks types, lint and formatting, then runs the tests on all three browsers. Failures are annotated inline on the PR, and the HTML report (plus traces and videos on failure) is uploaded as an artifact.

## Observations about the application

- The app returns **different messages for an invalid username and an invalid password**. My tests assert this because the assessment asks for it, but in a real product it's a **user-enumeration** risk: an attacker can confirm which usernames exist. I'd raise it with the team and suggest a generic "Invalid username or password" message.
- Usernames are not trimmed, so a user who pastes their username with a trailing space can't log in. Probably intended here, but worth confirming on a real product.

## If I had more time

- Save the logged-in session (`storageState`) so tests of pages behind the login don't have to go through the form every time.
- Add accessibility checks with `@axe-core/playwright` and some visual comparison tests.
- Test account lockout after repeated failures, and very long or special-character inputs. I'd want the expected behavior defined first, since this demo site doesn't specify it.
- Split the CI run into a matrix job per browser so the browsers run in parallel.
