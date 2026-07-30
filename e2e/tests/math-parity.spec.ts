import { test, expect } from '@playwright/test';
import { APIUtils } from './utils/apiUtils';
import { InvoicePage } from './pages/InvoicePage';
import { ClientPage } from './pages/ClientPage';

test.describe('Math Parity Validation', () => {
  let apiUtils: APIUtils;
  let clientName: string;

  test.beforeEach(async ({ request, page }, testInfo) => {
    apiUtils = new APIUtils(request, testInfo.workerIndex);
    await apiUtils.authenticate();
    const suffix = apiUtils.getSuffix();
    clientName = `Math Client ${suffix}`;
    
    // Create client for the invoice test
    const clientPage = new ClientPage(page);
    await clientPage.gotoAdd();
    await clientPage.addClient(clientName, `123`, 'Math St');
    await expect(page).toHaveURL(/.*\/customers/);
  });

  test('UI calculated due amount strictly matches backend Mongoose pre-save hook calculation', async ({ page }) => {
    const invoicePage = new InvoicePage(page);
    await invoicePage.gotoAdd();
    
    await invoicePage.createInvoice(clientName, [
      { name: 'Service A', qty: '2', price: '500' } // Total 1000
    ]);
    
    // Navigate to view to extract ID and check UI amount
    await page.locator('table tbody tr').first().locator('a[href*="/view"]').click();
    const invoiceId = page.url().split('/invoice/')[1].split('/')[0];
    
    const uiDueAmount = await invoicePage.getInvoiceDueAmount();
    
    // Cross-check with API directly to ensure the UI isn't masking a backend drift
    const response = await apiUtils.request.get(`/invoice/${invoiceId}`, {
      headers: {
        'Authorization': `Bearer ${(await apiUtils.authenticate()).token}`
      }
    });
    
    const serverInvoice = await response.json();
    
    // Assert backend calculated `due` strictly matches UI parsed due
    expect(Number(uiDueAmount)).toBeCloseTo(serverInvoice.due, 2);
  });
});
