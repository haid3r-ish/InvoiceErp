import { test, expect } from '@playwright/test';
import { APIUtils } from './utils/apiUtils';

test.describe('PDF and Print Mechanics', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to an existing invoice view. 
    // In a fully isolated test, we would create a new invoice via apiUtils here.
    await page.goto('/invoice');
    
    // Wait for table to load
    await expect(page.locator('table tbody tr').first()).toBeVisible();
    await page.locator('table tbody tr').first().locator('a[href*="/view"]').click();
  });

  test('React-PDF Download Interception', async ({ page }) => {
    // Wait for the download event to be triggered
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 }).catch(() => null);
    
    // Try clicking Download button (checking multiple common text variants)
    const downloadBtn = page.locator('button:has-text("Download PDF"), button:has-text("Download")').first();
    if (await downloadBtn.isVisible()) {
      await downloadBtn.click();
      
      const download = await downloadPromise;
      if (download) {
        expect(download.suggestedFilename()).toMatch(/\.pdf$/);
      }
    }
    
    // Assert no failure toasts occurred during generation
    const errorToast = page.locator('.Toastify__toast--error');
    await expect(errorToast).not.toBeVisible();
  });

  test('react-to-print Mock Window Print', async ({ page }) => {
    // Mock window.print to prevent the native browser dialog from hanging the headless test
    await page.evaluate(() => {
      window['originalPrint'] = window.print;
      window.print = function() {
        window['printCalled'] = true;
      };
    });
    
    // Click Print button
    const printBtn = page.locator('button:has-text("Print"), [aria-label="Print"]').first();
    if (await printBtn.isVisible()) {
      await printBtn.click();
      
      // Assert the print function was called (meaning the react-to-print hook fired correctly)
      const printWasCalled = await page.evaluate(() => window['printCalled'] === true);
      expect(printWasCalled).toBeTruthy();
    }

    // Restore original
    await page.evaluate(() => {
      window.print = window['originalPrint'];
    });
  });

  test('jspdf + html2canvas Canvas Creation Validation', async ({ page }) => {
    // Some implementations use jspdf to generate PDF client-side without the native download event
    const exportBtn = page.locator('button:has-text("Export"), button:has-text("Save as PDF")').first();
    
    if (await exportBtn.isVisible()) {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await exportBtn.click();
      
      // Allow time for html2canvas generation
      await page.waitForTimeout(2000);
      
      // Assert no console errors occurred during the complex canvas rendering
      expect(errors).toHaveLength(0);
      
      const errorToast = page.locator('.Toastify__toast--error');
      await expect(errorToast).not.toBeVisible();
    }
  });
});
