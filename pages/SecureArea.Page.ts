import { expect, type Locator, type Page } from '@playwright/test';
import { FlashMessage } from './components/FlashMessage';

export class SecureAreaPage {
  readonly heading: Locator;
  readonly logoutLink: Locator;
  readonly flash: FlashMessage;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Secure Area', level: 2 });
    this.logoutLink = page.getByRole('link', { name: 'Logout' });
    this.flash = new FlashMessage(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/secure');
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/secure$/);
    await expect(this.heading).toBeVisible();
    await expect(this.logoutLink).toBeVisible();
  }
}
