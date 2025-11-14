import { test, expect } from '@playwright/test';

test('dashboard access', async ({ page }) => {
  // Assume user is logged in or login first
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Navigate to dashboard
  await page.goto('/dashboard');

  // Verify dashboard elements
  await expect(page.locator('text=Dashboard')).toBeVisible();
  await expect(page.locator('text=Welcome')).toBeVisible();
});