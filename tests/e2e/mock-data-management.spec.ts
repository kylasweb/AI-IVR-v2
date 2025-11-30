import { test, expect } from '@playwright/test';
import { AdminDashboardPage } from './helpers/AdminDashboardPage';

test.describe('Mock Data Management CRUD and Scenarios', () => {
  let adminPage: AdminDashboardPage;

  test.beforeEach(async ({ page }) => {
    adminPage = new AdminDashboardPage(page);
    await page.goto('/admin/login');
    await page.evaluate(() => localStorage.clear());
    await adminPage.login('admin@example.com', 'password');
    await adminPage.navigateToMockData();
  });

  test('should create a new mock user', async ({ page }) => {
    await adminPage.createMockUser('John Doe', 'john@example.com');
    await adminPage.expectSuccessMessage('Mock user created successfully');
    await expect(page.locator('text=John Doe')).toBeVisible();
  });

  test('should update an existing mock user', async ({ page }) => {
    await adminPage.editMockUser(1, 'Jane Doe', 'jane@example.com');
    await adminPage.expectSuccessMessage('Mock user updated successfully');
    await expect(page.locator('text=Jane Doe')).toBeVisible();
  });

  test('should delete a mock user', async ({ page }) => {
    await adminPage.deleteMockUser(1);
    await adminPage.expectSuccessMessage('Mock user deleted successfully');
    await expect(page.locator('text=John Doe')).not.toBeVisible();
  });

  test('should create a new mock post', async ({ page }) => {
    await adminPage.createMockPost('Sample Title', 'Sample content');
    await adminPage.expectSuccessMessage('Mock post created successfully');
    await expect(page.locator('text=Sample Title')).toBeVisible();
  });

  test('should update an existing mock post', async ({ page }) => {
    await adminPage.editMockPost(2, 'Updated Title', 'Updated content');
    await adminPage.expectSuccessMessage('Mock post updated successfully');
    await expect(page.locator('text=Updated Title')).toBeVisible();
  });

  test('should delete a mock post', async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());
    await adminPage.deleteMockPost(2);
    await adminPage.expectSuccessMessage('Mock post deleted successfully');
    await expect(page.locator('text=Sample Title')).not.toBeVisible();
  });

  test('should load a scenario', async ({ page }) => {
    await adminPage.loadScenario('scenario A');
    await adminPage.expectSuccessMessage('Scenario loaded successfully');
    // Verify scenario data is loaded
    await expect(page.locator('text=scenario A')).toBeVisible();
  });

  test('should save a scenario', async ({ page }) => {
    await adminPage.saveScenario('scenario B');
    await adminPage.expectSuccessMessage('Scenario saved successfully');
    // Verify scenario is saved
    await expect(page.locator('text=scenario B')).toBeVisible();
  });
});