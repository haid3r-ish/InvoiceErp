import { test, expect } from '@playwright/test';
import { ClientPage } from './pages/ClientPage';
import { InvoicePage } from './pages/InvoicePage';
import { PaymentPage } from './pages/PaymentPage';
import { APIUtils } from './utils/apiUtils';

test.describe('E2E Invoice Lifecycle', () => {
  let clientName: string;
  let apiUtils: APIUtils;

  test.beforeEach(async ({ request }, testInfo) => {
    apiUtils = new APIUtils(request, testInfo.workerIndex);
    await apiUtils.authenticate();
    const suffix = apiUtils.getSuffix();
    clientName = `E2E Client ${suffix}`;
  });

  test('Complete workflow: Create Client -> Invoice -> Payment', async ({ page }) => {
    const clientPage = new ClientPage(page);
    const invoicePage = new InvoicePage(page);
    const paymentPage = new PaymentPage(page);

    // 1. Create Client
    await clientPage.gotoAdd();
    await clientPage.addClient(clientName, `123456`, '789 E2E St');
    
    // Assert client creation success (wait for navigation to list)
    await expect(page).toHaveURL(/.*\/customers/);

    // 2. Create Invoice for the new client
    await invoicePage.gotoAdd();
    await invoicePage.createInvoice(clientName, [
      { name: 'Consulting', qty: '10', price: '100' }
    ]);

    // Assert navigation to invoice list
    await expect(page).toHaveURL(/.*\/invoice(?!.*add)/);

    // 3. View the newly created invoice and apply payment
    // We navigate to the first invoice's view page (assuming recent is first)
    await page.locator('table tbody tr').first().locator('a[href*="/view"]').click();
    
    // Extract ID from URL for the payment
    const url = page.url();
    const invoiceId = url.split('/invoice/')[1].split('/')[0];

    // Pay half (10 * 100 = 1000, paying 500)
    await paymentPage.applyPayment(invoiceId, '500', 'cash');

    // 4. Verify the status updates to Partial
    const statusBadge = page.locator('.ant-tag, .status-badge').first();
    await expect(statusBadge).toHaveText(/Partial/i, { timeout: 10000 });
  });
});
