import { expect, test } from '../../fixtures/LoginTest.Fixture';
import { validUser } from '../../test-data/credentials';
import { FlashMessages } from '../../test-data/messages';

const rejectedLogins = [
  {
    title: 'both fields are empty',
    credentials: { username: '', password: '' },
    expectedError: FlashMessages.invalidUsername,
  },
  {
    title: 'username is empty',
    credentials: { username: '', password: validUser.password },
    expectedError: FlashMessages.invalidUsername,
  },
  {
    title: 'password is empty',
    credentials: { username: validUser.username, password: '' },
    expectedError: FlashMessages.invalidPassword,
  },
  {
    title: 'username has leading and trailing spaces',
    credentials: { username: ` ${validUser.username} `, password: validUser.password },
    expectedError: FlashMessages.invalidUsername,
  },
  {
    title: 'username has different letter case',
    credentials: { username: validUser.username.toUpperCase(), password: validUser.password },
    expectedError: FlashMessages.invalidUsername,
  },
  {
    title: 'password has different letter case',
    credentials: { username: validUser.username, password: validUser.password.toLowerCase() },
    expectedError: FlashMessages.invalidPassword,
  },
];

test.describe('Login - additional scenarios', { tag: '@additional' }, () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  for (const { title, credentials, expectedError } of rejectedLogins) {
    test(`login is rejected when ${title}`, async ({ loginPage, secureAreaPage }) => {
      await loginPage.login(credentials);

      await loginPage.flash.expectMessage('error', expectedError);
      await loginPage.expectLoaded();
      await expect(secureAreaPage.logoutLink).toBeHidden();
    });
  }

  test('password input is masked', async ({ loginPage }) => {
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });

  test('form can be submitted with the Enter key', async ({ loginPage, secureAreaPage }) => {
    await loginPage.fillCredentials(validUser);
    await loginPage.passwordInput.press('Enter');

    await secureAreaPage.expectLoaded();
  });
});
