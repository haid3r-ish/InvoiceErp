import { Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(path: string) {
    await this.page.goto(path);
  }

  /**
   * Helper to interact with Ant Design DatePickers
   * Attempts keyboard entry first, falls back to clicking the cell
   */
  async selectDate(placeholder: string, dateYYYYMMDD: string) {
    const input = this.page.locator(`input[placeholder="${placeholder}"]`);
    
    // Try keyboard entry
    await input.click();
    await input.fill(dateYYYYMMDD);
    await input.press('Enter');
    
    // Fallback pseudo-code (if needed):
    // const cell = this.page.locator('.ant-picker-dropdown').locator(`td[title="${dateYYYYMMDD}"]`);
    // if (await cell.isVisible()) {
    //   await cell.click();
    // }
  }
}
