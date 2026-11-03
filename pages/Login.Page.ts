import { expect, type Locator, type Page } from '@playwright/test';
import { FlashMessage } from './components/FlashMessage';
import type { Credentials } from '../test-data/credentials';

export class LoginPage {
  readonly heading: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly flash: FlashMessage;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Login Page' });
    this.usernameInput = page.getByLabel('Username');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.flash = new FlashMessage(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async fillCredentials({ username, password }: Credentials): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  async login(credentials: Credentials): Promise<void> {
    await this.fillCredentials(credentials);
    await this.loginButton.click();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/login$/);
    await expect(this.heading).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }
}
