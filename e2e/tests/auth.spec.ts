import { test, expect } from '@playwright/test';
import { config } from '../config';

// Do not use the authenticated storage state for these specific tests
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication Edge Cases & State Management', () => {
  
  test('unauthenticated users are redirected to login', async ({ page }) => {
    // Navigate directly to a protected route
    await page.goto('/invoice/add');
    
    // Assert redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('malformed/expired JWT causes a redirect to login', async ({ page }) => {
    // Navigate to establish origin
    await page.goto('/login');
    
    // Inject a malformed token
    const badData = {
      _id: 'fake_id',
      name: 'Fake User',
      email: 'fake@fake.com',
      isAdmin: false,
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.malformed.token'
    };
    
    await page.evaluate((data) => {
      localStorage.setItem('userInfo', JSON.stringify(data));
    }, badData);

    // Attempt to access a protected route
    // The application should attempt an API call, fail with 401, and log out/redirect.
    // Wait, the client side route might just render first since it relies on localStorage presence.
    // Let's go to /dashboard and let it make its API calls.
    await page.goto('/dashboard');
    
    // Playwright route mocking can be used if we need to force 401, but the backend will naturally 401 the malformed token.
    // So we just assert we end up back at login.
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('401 API Interception is handled gracefully (Axios interceptor)', async ({ page }) => {
    // Navigate to establish origin
    await page.goto('/login');
    
    // Inject a valid-looking structure so the frontend attempts rendering
    const fakeData = {
      _id: 'fake_id',
      name: 'Fake User',
      email: 'fake@fake.com',
      isAdmin: false,
      token: 'fake.token.string'
    };
    
    await page.evaluate((data) => {
      localStorage.setItem('userInfo', JSON.stringify(data));
    }, fakeData);

    // Intercept ANY API call and force a 401 Unauthorized response
    await page.route('**/*(/api/|/user/|/client/|/invoice/)*', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'You are not authorized to access this' })
      });
    });

    // Go to customers page which triggers an API call
    await page.goto('/customers');

    // If the frontend Axios interceptors or Redux actions handle 401 correctly, 
    // it should clear localStorage and redirect to login
    await expect(page).toHaveURL(/.*\/login/);
    
    const tokenExists = await page.evaluate(() => localStorage.getItem('userInfo') !== null);
    expect(tokenExists).toBeFalsy();

    await page.unrouteAll();
  });
});
