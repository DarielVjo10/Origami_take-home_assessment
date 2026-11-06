import { expect, type Locator, type Page } from '@playwright/test';
import { FlashMessage } from './components/FlashMessage';
import { FlashMessages } from '../test-data/messages';

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
    await this.page.goto('/secure', { waitUntil: 'domcontentloaded' });
  }

  // Ends the session by clicking the Logout link.
  async logout(): Promise<void> {
    await this.logoutLink.click();
  }

  // Asserts the user is on /secure with the heading and Logout link visible.
  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/secure$/);
    await expect(this.heading).toBeVisible();
    await expect(this.logoutLink).toBeVisible();
  }

  // Proves there is no session: opening /secure must redirect to /login with the "must login" error.
  async expectAccessDenied(): Promise<void> {
    await this.goto();
    await expect(this.page).toHaveURL(/\/login$/);
    await this.flash.expectMessage('error', FlashMessages.authenticationRequired);
  }
}