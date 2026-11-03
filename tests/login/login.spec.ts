import { expect, test } from '../../fixtures/LoginTest.Fixture';
import { invalidPassword, invalidUsername, validUser } from '../../test-data/credentials';
import { FlashMessages } from '../../test-data/messages';

test.describe('Login - mandatory scenarios', { tag: '@mandatory' }, () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('TC-01: valid credentials redirect the user to the secure area', async ({
    loginPage,
    secureAreaPage,
  }) => {
    await loginPage.login(validUser);

    await secureAreaPage.expectLoaded();
    await secureAreaPage.flash.expectMessage('success', FlashMessages.loginSuccess);
  });

  test('TC-02: invalid username shows an error and stays on the login page', async ({
    loginPage,
    secureAreaPage,
  }) => {
    await loginPage.login({ username: invalidUsername, password: validUser.password });

    await loginPage.flash.expectMessage('error', FlashMessages.invalidUsername);
    await loginPage.expectLoaded();
    await expect(secureAreaPage.logoutLink).toBeHidden();
  });

  test('TC-03: invalid password shows an error and stays on the login page', async ({
    loginPage,
    secureAreaPage,
  }) => {
    await loginPage.login({ username: validUser.username, password: invalidPassword });

    await loginPage.flash.expectMessage('error', FlashMessages.invalidPassword);
    await loginPage.expectLoaded();
    await expect(secureAreaPage.logoutLink).toBeHidden();
  });
});
