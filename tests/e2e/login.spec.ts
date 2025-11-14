import { test, expect } from '@playwright/test';

test('login flow', async ({ page }) => {
  await page.goto('/');

  // Assuming login form is on home page or /login
  // Fill in credentials
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');

  // Submit form
  await page.click('button[type="submit"]');

  // Expect redirect to dashboard
  await expect(page).toHaveURL(/dashboard/);
});