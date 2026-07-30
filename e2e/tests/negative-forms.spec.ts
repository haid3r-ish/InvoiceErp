import { test, expect } from '@playwright/test';
import { ClientPage } from './pages/ClientPage';
import { InvoicePage } from './pages/InvoicePage';

test.describe('Negative Form Testing', () => {
  test('Submitting empty client form displays validation errors', async ({ page }) => {
    const clientPage = new ClientPage(page);
    await clientPage.gotoAdd();
    
    // Submit empty form
    await clientPage.submitBtn.click();
    
    // Assert error messages
    await expect(clientPage.errorMessages.first()).toBeVisible();
    
    // URL shouldn't change
    await expect(page).toHaveURL(/.*\/customer\/add/);
  });

  test('Attempting to create invoice with duplicate invoiceNumber shows error', async ({ page }) => {
    const invoicePage = new InvoicePage(page);
    await invoicePage.gotoAdd();
    
    // By default, the application auto-generates invoice numbers, but if we override it
    // with a known duplicate we expect a failure toast.
    await invoicePage.invoiceNumberInput.fill('001'); // Assuming 001 exists
    await invoicePage.saveBtn.click();

    // The react-toastify container should pop up with an error
    const toastMessage = page.locator('.Toastify__toast--error');
    await expect(toastMessage).toBeVisible();
  });
});
