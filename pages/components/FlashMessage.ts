import { expect, type Locator, type Page } from '@playwright/test';

export class FlashMessage {
  readonly root: Locator;

  constructor(page: Page) {
    this.root = page.locator('#flash');
  }

  async expectMessage(type: 'success' | 'error', text: string): Promise<void> {
    await expect(this.root).toHaveClass(new RegExp(`\\b${type}\\b`));
    await expect(this.root).toContainText(text);
  }
}
