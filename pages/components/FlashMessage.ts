import { expect, type Locator, type Page } from '@playwright/test';

export type FlashType = 'success' | 'error';

// The green/red notification banner shared by the login and secure area pages.
export class FlashMessage {
  readonly root: Locator;

  // Locates the banner by its #flash id, since it has no role or accessible name.
  constructor(page: Page) {
    this.root = page.locator('#flash');
  }

  // Asserts the banner is visible, has the given type (success/error) and contains the text.
  async expectMessage(type: FlashType, text: string): Promise<void> {
    await expect(this.root).toBeVisible();
    await expect(this.root).toHaveClass(new RegExp(`\\b${type}\\b`));
    await expect(this.root).toContainText(text);
  }
}