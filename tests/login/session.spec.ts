import { test } from '../../fixtures/LoginTest.Fixture';
import { validUser } from '../../test-data/credentials';
import { FlashMessages } from '../../test-data/messages';

test.describe('Session - additional scenarios', { tag: '@additional' }, () => {
  test('TC-12: logout ends the session', async ({ loginPage, secureAreaPage }) => {
    await loginPage.goto();
    await loginPage.login(validUser);
    await secureAreaPage.expectLoaded();

    await secureAreaPage.logout();

    await loginPage.flash.expectMessage('success', FlashMessages.logoutSuccess);
    await loginPage.expectLoaded();
    await secureAreaPage.expectAccessDenied();
  });

  test('TC-13: secure area is not accessible without logging in', async ({
    loginPage,
    secureAreaPage,
  }) => {
    await secureAreaPage.expectAccessDenied();
    await loginPage.expectLoaded();
  });
});
