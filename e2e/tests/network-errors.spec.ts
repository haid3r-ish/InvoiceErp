import { test, expect } from '@playwright/test';
import { ClientPage } from './pages/ClientPage';

test.describe('Network Error Simulation', () => {
  test('Application handles failed API requests gracefully without crashing', async ({ page }) => {
    const clientPage = new ClientPage(page);
    
    // Abort the client list API request to simulate a network drop
    await page.route('**/client/list', route => route.abort('failed'));
    
    await clientPage.gotoList();
    
    // Look for error boundaries, toast messages, or graceful empty states
    // rather than a white screen of death.
    const errorToast = page.locator('.Toastify__toast--error');
    await expect(errorToast).toBeVisible();
    await expect(errorToast).toContainText(/Failed|Error/i);
    
    // Ensure the page layout is still visible (sidebar, navbar)
    await expect(page.locator('nav')).toBeVisible();

    await page.unrouteAll();
  });
});
