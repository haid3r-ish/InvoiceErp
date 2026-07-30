import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export class PaymentPage extends BasePage {
  readonly addPaymentBtn = this.page.getByRole('button', { name: /add payment/i });
  readonly amountInput = this.page.locator('input[name="amount"]');
  readonly methodSelect = this.page.locator('.ant-select-selection-item');
  readonly saveBtn = this.page.getByRole('button', { name: /save/i });

  async applyPayment(invoiceId: string, amount: string, method: string) {
    // Assuming UI lets you click add payment from invoice view
    await this.navigate(`/invoice/${invoiceId}/view`);
    await this.addPaymentBtn.click();
    
    await this.amountInput.fill(amount);
    
    // Select method
    await this.methodSelect.click();
    await this.page.getByText(method, { exact: true }).click();

    await this.saveBtn.click();
  }
}
