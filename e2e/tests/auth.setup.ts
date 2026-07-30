import { test as setup, expect } from '@playwright/test';
import { config } from '../config';

setup('authenticate via API and inject into localStorage', async ({ page, request }) => {
  // 1. Authenticate via API
  const response = await request.post(`${config.apiURL}/user/login`, {
    data: {
      email: config.testUserEmail,
      password: config.testUserPassword,
    }
  });
  
  expect(response.ok()).toBeTruthy();
  const authData = await response.json();

  // 2. Navigate to base URL to establish origin context
  await page.goto(config.baseURL);
  
  // 3. Inject userInfo into localStorage
  await page.evaluate((userInfo) => {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  }, authData);

  // 4. Save the storage state for subsequent tests
  await page.context().storageState({ path: config.storageStatePath });
});
