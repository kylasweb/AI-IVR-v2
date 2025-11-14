import { test, expect } from '@playwright/test';
import { AdminDashboardPage } from './helpers/AdminDashboardPage';

test.describe('Site Content CRUD Operations', () => {
  let adminPage: AdminDashboardPage;

  test.beforeEach(async ({ page }) => {
    adminPage = new AdminDashboardPage(page);
    await page.goto('/admin/login');
    await adminPage.login('admin@example.com', 'validpassword');
    await adminPage.navigateToSiteContent();
  });

  test('should create a new hero text entry', async ({ page }) => {
    await adminPage.createSiteContent('hero', 'Welcome to AI IVR', 'Advanced voice solutions for modern businesses');
    await adminPage.expectSuccessMessage('Site content created successfully');
    await expect(page.locator('text=Welcome to AI IVR')).toBeVisible();
  });

  test('should read existing site content entries', async ({ page }) => {
    await expect(page.locator('text=hero')).toBeVisible(); // Assuming some default entries exist
    await expect(page.locator('text=faq')).toBeVisible();
  });

  test('should update an existing FAQ entry', async ({ page }) => {
    await adminPage.editSiteContent(1, 'Updated FAQ Title', 'Updated FAQ content');
    await adminPage.expectSuccessMessage('Site content updated successfully');
    await expect(page.locator('text=Updated FAQ Title')).toBeVisible();
  });

  test('should delete a pricing entry', async ({ page }) => {
    await adminPage.deleteSiteContent(2);
    await adminPage.expectSuccessMessage('Site content deleted successfully');
    await expect(page.locator('text=pricing')).not.toBeVisible();
  });

  test('should handle invalid input during creation', async ({ page }) => {
    await adminPage.createSiteContent('', '', '');
    await adminPage.expectErrorMessage('All fields are required');
  });
});