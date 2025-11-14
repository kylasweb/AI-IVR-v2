import { test, expect } from '@playwright/test';
import { AdminDashboardPage } from './helpers/AdminDashboardPage';

test.describe('Admin Login and Authentication', () => {
  let adminPage: AdminDashboardPage;

  test.beforeEach(async ({ page }) => {
    adminPage = new AdminDashboardPage(page);
    await page.goto('/admin/login'); // Assuming login route
  });

  test('should login with valid admin credentials', async ({ page }) => {
    await adminPage.login('admin@example.com', 'validpassword');
    await expect(page).toHaveURL(/\/admin\/dashboard/); // Assuming dashboard route after login
    await adminPage.expectSuccessMessage('Login successful');
  });

  test('should show error for invalid email', async ({ page }) => {
    await adminPage.login('invalid@example.com', 'password');
    await adminPage.expectErrorMessage('Invalid email or password');
  });

  test('should show error for invalid password', async ({ page }) => {
    await adminPage.login('admin@example.com', 'invalidpassword');
    await adminPage.expectErrorMessage('Invalid email or password');
  });

  test('should show error for empty fields', async ({ page }) => {
    await adminPage.login('', '');
    await adminPage.expectErrorMessage('Email and password are required');
  });

  test('should handle session persistence after login', async ({ page }) => {
    await adminPage.login('admin@example.com', 'validpassword');
    await page.reload();
    await expect(page).toHaveURL(/\/admin\/dashboard/); // Should remain logged in
  });

  test('should logout successfully', async ({ page }) => {
    await adminPage.login('admin@example.com', 'validpassword');
    await adminPage.logout(); // Assuming logout method in page object
    await expect(page).toHaveURL(/\/admin\/login/); // Redirect to login
    await adminPage.expectSuccessMessage('Logged out successfully');
  });

  test('should prevent access to dashboard without login', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/login/); // Should redirect to login
  });
});