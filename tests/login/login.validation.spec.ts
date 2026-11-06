import { expect, test } from '../../fixtures/LoginTest.Fixture';
import { validUser } from '../../test-data/credentials';
import { FlashMessages } from '../../test-data/messages';

const rejectedLogins = [
  {
    id: 'TC-04',
    title: 'both fields are empty',
    credentials: { username: '', password: '' },
    expectedError: FlashMessages.invalidUsername,
  },
  {
    id: 'TC-05',
    title: 'username is empty',
    credentials: { username: '', password: validUser.password },
    expectedError: FlashMessages.invalidUsername,
  },
  {
    id: 'TC-06',
    title: 'password is empty',
    credentials: { username: validUser.username, password: '' },
    expectedError: FlashMessages.invalidPassword,
  },
  {
    id: 'TC-07',
    title: 'username has leading and trailing spaces',
    credentials: { username: ` ${validUser.username} `, password: validUser.password },
    expectedError: FlashMessages.invalidUsername,
  },
  {
    id: 'TC-08',
    title: 'username has different letter case',
    credentials: { username: validUser.username.toUpperCase(), password: validUser.password },
    expectedError: FlashMessages.invalidUsername,
  },
  {
    id: 'TC-09',
    title: 'password has different letter case',
    credentials: { username: validUser.username, password: validUser.password.toLowerCase() },
    expectedError: FlashMessages.invalidPassword,
  },
];

test.describe('Login - additional scenarios', { tag: '@additional' }, () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  for (const { id, title, credentials, expectedError } of rejectedLogins) {
    test(`${id}: login is rejected when ${title}`, async ({ loginPage, secureAreaPage }) => {
      await loginPage.login(credentials);

      await loginPage.flash.expectMessage('error', expectedError);
      await loginPage.expectLoaded();
      await secureAreaPage.expectAccessDenied();
    });
  }

  test('TC-10: password input is masked', async ({ loginPage }) => {
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });

  test('TC-11: form can be submitted with the Enter key', async ({ loginPage, secureAreaPage }) => {
    await loginPage.fillCredentials(validUser);
    await loginPage.passwordInput.press('Enter');

    await secureAreaPage.expectLoaded();
    await secureAreaPage.flash.expectMessage('success', FlashMessages.loginSuccess);
  });
});
