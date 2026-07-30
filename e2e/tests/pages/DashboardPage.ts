import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export class DashboardPage extends BasePage {
  // Utilizing resilient locators based on text content
  readonly totalClientsCard = this.page.locator('text=Total Clients');
  readonly totalInvoicesCard = this.page.locator('text=Total Invoices');

  async goto() {
    await this.navigate('/dashboard');
  }

  async verifyDashboardMetricsVisible() {
    await expect(this.totalClientsCard).toBeVisible();
    await expect(this.totalInvoicesCard).toBeVisible();
  }
}
