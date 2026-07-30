import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export class InvoicePage extends BasePage {
  readonly clientSelect = this.page.locator('.ant-select-selector').first();
  readonly addItemBtn = this.page.getByRole('button', { name: /add item/i });
  readonly itemNameInput = this.page.locator('input[name="itemName"]');
  readonly itemQtyInput = this.page.locator('input[name="quantity"]');
  readonly itemPriceInput = this.page.locator('input[name="price"]');
  readonly saveBtn = this.page.getByRole('button', { name: /save invoice/i });
  readonly discountInput = this.page.locator('input[name="discount"]');
  readonly invoiceNumberInput = this.page.locator('input[name="invoiceNumber"]');

  async gotoAdd() {
    await this.navigate('/invoice/add');
  }

  async createInvoice(clientName: string, items: {name: string, qty: string, price: string}[]) {
    // Select Client (Handling MUI/AntD Select dropdown)
    await this.clientSelect.click();
    await this.page.getByText(clientName, { exact: false }).click();

    // Select Dates utilizing the BasePage helper
    await this.selectDate('Invoice Date', '2026-01-01');
    await this.selectDate('Due Date', '2026-12-31');

    // Add items
    for (const item of items) {
      await this.addItemBtn.click();
      await this.itemNameInput.last().fill(item.name);
      await this.itemQtyInput.last().fill(item.qty);
      await this.itemPriceInput.last().fill(item.price);
    }

    await this.saveBtn.click();
  }

  async getInvoiceDueAmount() {
    // Depending on UI structure, find the due amount element. 
    // Usually it's in a summary table or big text element.
    const dueElement = this.page.locator('text=/Amount Due/i').locator('..').locator('span, div').last();
    const text = await dueElement.textContent();
    return text ? text.replace(/[^0-9.-]+/g, "") : "0";
  }

  getInvoiceStatusBadge() {
    return this.page.locator('.ant-tag, .status-badge');
  }
}
