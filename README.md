OrigamiRisk_LoginAutomation

This is my solution to the SDET take-home assessment. It's a small Playwright + TypeScript project that tests the login page at https://the-internet.herokuapp.com/login.

The assessment asked for three test cases: one successful login and two failed ones. Those are all here. I also added a few extra cases that I think are worth covering on any login form. More on that below.

What you need
Node.js 20 or newer (I used 22, which is also what CI uses)
An internet connection, because the tests run against the live site
Getting started

Clone the repo, then install the dependencies and the Playwright browsers:

bash
npm ci
npx playwright install

Then run everything:

bash
npm test

That runs the full suite on Chromium, Firefox and WebKit. To open the HTML report afterwards:

bash
npm run report

If you're on Windows PowerShell 5, && doesn't work between commands, so run them one per line like above.

Other ways to run it

These are the scripts I ended up using the most:

bash
npm run test:chromium # everything, but only on Chromium (faster)
npm run test:mandatory # only the 3 test cases from the assessment
npm run test:headed # watch the browser while the tests run
npm run test:debug # step through a test with the Playwright Inspector

You can also target a single file or a single test by name:

bash
npx playwright test tests/login/login.mandatory.spec.ts
npx playwright test -g "TC-02"

And for code quality:

bash
npm run typecheck # TypeScript
npm run lint # ESLint
npm run format:check # Prettier (use `npm run format` to fix)
How the project is organized
text
tests/login/ the actual test files
pages/ page objects (one per page)
pages/components/ pieces of UI that appear on more than one page
fixtures/ makes the page objects available inside every test
test-data/ credentials and the messages the app is expected to show
playwright.config.ts browsers, timeouts, reporting, etc.

The idea is simple. The test files read like the test case: open the page, log in, check what happens. They don't know anything about selectors. All of that lives in the page objects (Login.Page.ts and SecureArea.Page.ts), so if the site's HTML changes, there's only one place to fix.

The green/red message banner shows up on both the login page and the secure area, so instead of writing the same code twice I made it a small component (FlashMessage.ts) that both pages use. It checks the text and also whether it's a success or an error message.

I used a Playwright fixture (LoginTest.Fixture.ts) so tests can just ask for loginPage or secureAreaPage instead of creating them every time.

The test cases
Required by the assessment
TC-01, valid login: log in with tomsmith / SuperSecretPassword!. The user should land on /secure, see the Secure Area page and the message "You logged into a secure area!".
TC-02, invalid username: wrong username with the correct password. The app should show "Your username is invalid!", and the user should stay on /login without getting logged in.
TC-03, invalid password: correct username with a wrong password. Same as above, but the message is "Your password is invalid!".

For the two negative cases, I don't just check the error message. I also check that the URL is still /login, that the login form is still there, and that the Logout link never appears. That last one is how I confirm no session was created.

Extra cases I added

Before writing these, I tried each one manually on the real site to see what actually happens. I didn't want to assume.

Empty username, empty password, and both empty
Username with spaces around it: the site does not trim the input, so this fails with "Your username is invalid!"
Username in uppercase: rejected, so usernames are case-sensitive
Password with different casing: also rejected, as it should be
The password field hides what you type
Pressing Enter submits the form (not everyone clicks the button)
Logging out actually ends the session: after logout, going to /secure sends you back to the login page
Going straight to /secure without logging in redirects to /login with "You must login to view the secure area!"

The six "rejected login" cases share the same steps and only the input changes, so they're written as one test that loops over a list of inputs instead of six copy-pasted tests.

In total there are 13 tests. Running them on 3 browsers gives 39 runs.

Some decisions worth mentioning

Locators. I used getByRole and getByLabel wherever I could, because they find elements the way a user would, by their label or visible name. They also tend to survive HTML changes better than CSS selectors. The only exception is the message banner. It has no role or label on this site, so I used its #flash id, which is stable.

No hard waits. There isn't a single waitForTimeout in the project. Playwright already waits for elements, and assertions like toHaveURL and toBeVisible retry until they pass or time out.

Independent tests. Every test starts with a fresh browser context, so no cookies or sessions leak between tests. They can run in any order and in parallel.

When something fails. I don't catch errors inside tests, because that would just hide failures. Instead, a failing test saves a trace, a screenshot and a video in test-results/, so it's easy to see what went wrong. You can open the trace with npx playwright show-trace <path-to-trace.zip>. On CI, tests get 2 retries to absorb network hiccups. Locally they get none, so flaky behavior shows up right away.

Credentials. The valid credentials are the public demo ones printed on the login page itself, so I kept them in test-data/credentials.ts. They can be overridden with the LOGIN_USERNAME and LOGIN_PASSWORD environment variables. The base URL can be changed with BASE_URL. On a real project, these would come from CI secrets, not from the code.

Keeping it small. I left out things like a base page class, a utils folder or extra libraries. For a project this size they would only add layers without adding value.

CI

There's a GitHub Actions workflow in .github/workflows/playwright.yml. On every push or pull request to main, it checks types, lint and formatting, then runs the tests on all three browsers and uploads the HTML report as an artifact.

If I had more time
Save the logged-in session (storageState) so future tests of pages behind the login don't have to go through the login form every time
Add accessibility checks with axe-core and some visual comparison tests
Test things like account lockout after several failed attempts, or very long and special-character inputs. I'd want to know the expected behavior first, though, since this demo site doesn't define it.
