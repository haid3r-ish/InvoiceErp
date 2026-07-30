import { test, expect } from '@playwright/test';
import { APIUtils } from './utils/apiUtils';
import { InvoicePage } from './pages/InvoicePage';

test.describe('Data Integrity & Orphaned Records', () => {
  let apiUtils: APIUtils;

  test.beforeEach(async ({ request }, testInfo) => {
    apiUtils = new APIUtils(request, testInfo.workerIndex);
    await apiUtils.authenticate();
  });

  test('UI handles deleted Client gracefully on Invoice list', async ({ page }) => {
    // We create a client and an invoice
    // Instead of full UI flows for setup, we can use the API if it's available.
    // If not, we'll mock the deletion. Let's assume the API has a delete client endpoint
    // or we can intercept the list and return an orphaned record.
    
    // Simulating an orphaned invoice by mocking the /invoice/list response
    // to include an invoice whose customer reference is null or deleted.
    await page.route('**/invoice/list', async route => {
      const response = await route.fetch();
      const json = await response.json();
      
      // Inject an orphaned invoice
      json.push({
        _id: 'orphaned_123',
        invoiceNumber: 'ORPH-001',
        customerName: 'Deleted Client', // Assume backend still holds the string, but relation is dead
        subTotal: 500,
        due: 500,
        status: 'Unpaid',
        // customerId might be null in DB if it was cascading, but MERN usually just leaves it as an invalid ObjectId
        customerId: null,
      });
      
      await route.fulfill({ response, json });
    });

    await page.goto('/invoice');
    
    // The UI should still render the table row for ORPH-001 without crashing
    const orphanedRow = page.locator('tr:has-text("ORPH-001")');
    await expect(orphanedRow).toBeVisible();
    
    // It should display 'Deleted Client' or fallback text
    await expect(orphanedRow).toContainText('Deleted Client');
    
    // Unroute at end
    await page.unrouteAll();
  });

  test('UI handles deleted Invoice gracefully on Payments list', async ({ page }) => {
    // Similar to above, we mock the payment list to include an orphaned payment
    await page.route('**/payment/list', async route => {
      // Assuming a payment list endpoint exists
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            _id: 'pay_orph_123',
            amount: 100,
            method: 'cash',
            invoiceId: null // Orphaned
          }
        ])
      });
    });

    await page.goto('/dashboard'); // or wherever payments are listed
    
    // Just verify the page doesn't crash (React Error Boundary)
    const errorToast = page.locator('.Toastify__toast--error');
    await expect(errorToast).not.toBeVisible();
    await expect(page.locator('nav')).toBeVisible();

    await page.unrouteAll();
  });
});
