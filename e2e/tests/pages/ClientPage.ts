import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export class ClientPage extends BasePage {
  readonly addClientBtn = this.page.getByRole('button', { name: 'Add Client' });
  
  // Resilient label-based locators
  readonly nameInput = this.page.locator('input[name="customerName"]');
  readonly numberInput = this.page.locator('input[name="customerNumber"]');
  readonly addressInput = this.page.locator('input[name="customerAddress"]');
  readonly submitBtn = this.page.getByRole('button', { name: /save/i });
  readonly errorMessages = this.page.locator('.Mui-error, .ant-form-item-explain-error');

  async gotoList() {
    await this.navigate('/customers');
  }

  async gotoAdd() {
    await this.navigate('/customer/add');
  }

  async addClient(name: string, number: string, address: string) {
    await this.nameInput.fill(name);
    await this.numberInput.fill(number);
    await this.addressInput.fill(address);
    await this.submitBtn.click();
  }
}
