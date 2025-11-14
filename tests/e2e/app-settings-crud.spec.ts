import { test, expect } from '@playwright/test';
import { AdminDashboardPage } from './helpers/AdminDashboardPage';

test.describe('App Settings CRUD Operations', () => {
  let adminPage: AdminDashboardPage;

  test.beforeEach(async ({ page }) => {
    adminPage = new AdminDashboardPage(page);
    await page.goto('/admin/login');
    await adminPage.login('admin@example.com', 'validpassword');
    await adminPage.navigateToAppSettings();
  });

  test('should create a new feature flag setting', async ({ page }) => {
    await adminPage.createAppSetting('enable_ai_features', 'true');
    await adminPage.expectSuccessMessage('App setting created successfully');
    await expect(page.locator('text=enable_ai_features')).toBeVisible();
  });

  test('should read existing app settings', async ({ page }) => {
    await expect(page.locator('text=enable_ai_features')).toBeVisible(); // Assuming some default entries exist
    await expect(page.locator('text=global_config')).toBeVisible();
  });

  test('should update an existing global config setting', async ({ page }) => {
    await adminPage.editAppSetting(1, 'global_config', 'updated_value');
    await adminPage.expectSuccessMessage('App setting updated successfully');
    await expect(page.locator('text=updated_value')).toBeVisible();
  });

  test('should delete a feature flag setting', async ({ page }) => {
    await adminPage.deleteAppSetting(2);
    await adminPage.expectSuccessMessage('App setting deleted successfully');
    await expect(page.locator('text=enable_ai_features')).not.toBeVisible();
  });

  test('should handle invalid input during creation', async ({ page }) => {
    await adminPage.createAppSetting('', '');
    await adminPage.expectErrorMessage('Key and value are required');
  });
});