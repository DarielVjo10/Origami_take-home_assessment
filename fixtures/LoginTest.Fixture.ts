import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/Login.Page';
import { SecureAreaPage } from '../pages/SecureArea.Page';

interface PageFixtures {
  loginPage: LoginPage;
  secureAreaPage: SecureAreaPage;
}

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  secureAreaPage: async ({ page }, use) => {
    await use(new SecureAreaPage(page));
  },
});

export { expect } from '@playwright/test';
