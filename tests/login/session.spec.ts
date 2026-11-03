import { test } from '../../fixtures/LoginTest.Fixture';
import { validUser } from '../../test-data/credentials';
import { FlashMessages } from '../../test-data/messages';

test.describe('Session - additional scenarios', { tag: '@additional' }, () => {
  test('logout ends the session', async ({ loginPage, secureAreaPage }) => {
    await loginPage.goto();
    await loginPage.login(validUser);
    await secureAreaPage.expectLoaded();

    await secureAreaPage.logout();

    await loginPage.expectLoaded();
    await loginPage.flash.expectMessage('success', FlashMessages.logoutSuccess);

    await secureAreaPage.goto();

    await loginPage.expectLoaded();
  });

  test('secure area is not accessible without logging in', async ({
    loginPage,
    secureAreaPage,
  }) => {
    await secureAreaPage.goto();

    await loginPage.expectLoaded();
    await loginPage.flash.expectMessage('error', FlashMessages.authenticationRequired);
  });
});
