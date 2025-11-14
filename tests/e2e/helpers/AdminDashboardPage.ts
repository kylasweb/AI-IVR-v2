import { Page, Locator } from '@playwright/test';

export class AdminDashboardPage {
  readonly page: Page;

  // Common selectors
  readonly loginEmailInput: Locator;
  readonly loginPasswordInput: Locator;
  readonly loginButton: Locator;
  readonly logoutButton: Locator;

  // Navigation
  readonly cmsMenu: Locator;
  readonly siteContentLink: Locator;
  readonly appSettingsLink: Locator;
  readonly mockDataMenu: Locator;
  readonly mockUsersLink: Locator;
  readonly mockPostsLink: Locator;

  // Site Content CRUD
  readonly createSiteContentButton: Locator;
  readonly siteContentTitleInput: Locator;
  readonly siteContentContentInput: Locator;
  readonly saveSiteContentButton: Locator;
  readonly siteContentList: Locator;
  readonly editSiteContentButton: Locator;
  readonly deleteSiteContentButton: Locator;
  readonly confirmDeleteButton: Locator;

  // App Settings CRUD
  readonly createAppSettingButton: Locator;
  readonly appSettingKeyInput: Locator;
  readonly appSettingValueInput: Locator;
  readonly saveAppSettingButton: Locator;
  readonly appSettingsList: Locator;
  readonly editAppSettingButton: Locator;
  readonly deleteAppSettingButton: Locator;

  // Mock Data CRUD
  readonly createMockUserButton: Locator;
  readonly mockUserNameInput: Locator;
  readonly mockUserEmailInput: Locator;
  readonly saveMockUserButton: Locator;
  readonly mockUsersList: Locator;
  readonly editMockUserButton: Locator;
  readonly deleteMockUserButton: Locator;

  readonly createMockPostButton: Locator;
  readonly mockPostTitleInput: Locator;
  readonly mockPostBodyInput: Locator;
  readonly saveMockPostButton: Locator;
  readonly mockPostsList: Locator;
  readonly editMockPostButton: Locator;
  readonly deleteMockPostButton: Locator;

  // Scenarios
  readonly scenarioSelect: Locator;
  readonly loadScenarioButton: Locator;
  readonly saveScenarioButton: Locator;

  // Error handling
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  // Accessibility
  readonly mainContent: Locator;

  constructor(page: Page) {
    this.page = page;

    // Login
    this.loginEmailInput = page.locator('input[type="email"]');
    this.loginPasswordInput = page.locator('input[type="password"]');
    this.loginButton = page.locator('button:has-text("Login")');
    this.logoutButton = page.locator('button:has-text("Logout")');

    // Navigation
    this.cmsMenu = page.locator('nav a:has-text("CMS")');
    this.siteContentLink = page.locator('a:has-text("Site Content")');
    this.appSettingsLink = page.locator('a:has-text("App Settings")');
    this.mockDataMenu = page.locator('nav a:has-text("Mock Data")');
    this.mockUsersLink = page.locator('a:has-text("Mock Users")');
    this.mockPostsLink = page.locator('a:has-text("Mock Posts")');

    // Site Content
    this.createSiteContentButton = page.locator('button:has-text("Create Site Content")');
    this.siteContentTitleInput = page.locator('input[name="title"]');
    this.siteContentContentInput = page.locator('textarea[name="content"]');
    this.saveSiteContentButton = page.locator('button:has-text("Save")');
    this.siteContentList = page.locator('.site-content-list');
    this.editSiteContentButton = page.locator('.edit-site-content');
    this.deleteSiteContentButton = page.locator('.delete-site-content');
    this.confirmDeleteButton = page.locator('button:has-text("Confirm Delete")');

    // App Settings
    this.createAppSettingButton = page.locator('button:has-text("Create App Setting")');
    this.appSettingKeyInput = page.locator('input[name="key"]');
    this.appSettingValueInput = page.locator('input[name="value"]');
    this.saveAppSettingButton = page.locator('button:has-text("Save")');
    this.appSettingsList = page.locator('.app-settings-list');
    this.editAppSettingButton = page.locator('.edit-app-setting');
    this.deleteAppSettingButton = page.locator('.delete-app-setting');

    // Mock Data
    this.createMockUserButton = page.locator('button:has-text("Create Mock User")');
    this.mockUserNameInput = page.locator('input[name="name"]');
    this.mockUserEmailInput = page.locator('input[name="email"]');
    this.saveMockUserButton = page.locator('button:has-text("Save")');
    this.mockUsersList = page.locator('.mock-users-list');
    this.editMockUserButton = page.locator('.edit-mock-user');
    this.deleteMockUserButton = page.locator('.delete-mock-user');

    this.createMockPostButton = page.locator('button:has-text("Create Mock Post")');
    this.mockPostTitleInput = page.locator('input[name="title"]');
    this.mockPostBodyInput = page.locator('textarea[name="body"]');
    this.saveMockPostButton = page.locator('button:has-text("Save")');
    this.mockPostsList = page.locator('.mock-posts-list');
    this.editMockPostButton = page.locator('.edit-mock-post');
    this.deleteMockPostButton = page.locator('.delete-mock-post');

    // Scenarios
    this.scenarioSelect = page.locator('select[name="scenario"]');
    this.loadScenarioButton = page.locator('button:has-text("Load Scenario")');
    this.saveScenarioButton = page.locator('button:has-text("Save Scenario")');

    // Messages
    this.errorMessage = page.locator('.error-message');
    this.successMessage = page.locator('.success-message');

    // Accessibility
    this.mainContent = page.locator('main');
  }

  async login(email: string, password: string) {
    await this.loginEmailInput.fill(email);
    await this.loginPasswordInput.fill(password);
    await this.loginButton.click();
  }

  async logout() {
    await this.logoutButton.click();
  }

  async navigateToSiteContent() {
    await this.cmsMenu.click();
    await this.siteContentLink.click();
  }

  async navigateToAppSettings() {
    await this.cmsMenu.click();
    await this.appSettingsLink.click();
  }

  async navigateToMockUsers() {
    await this.mockDataMenu.click();
    await this.mockUsersLink.click();
  }

  async navigateToMockPosts() {
    await this.mockDataMenu.click();
    await this.mockPostsLink.click();
  async navigateToMockData() {
    await this.mockDataMenu.click();
  }
  }

  async createSiteContent(title: string, content: string) {
    await this.createSiteContentButton.click();
    await this.siteContentTitleInput.fill(title);
    await this.siteContentContentInput.fill(content);
    await this.saveSiteContentButton.click();
  }

  async editSiteContent(index: number, newTitle: string, newContent: string) {
    await this.siteContentList.locator('.edit-site-content').nth(index).click();
    await this.siteContentTitleInput.fill(newTitle);
    await this.siteContentContentInput.fill(newContent);
    await this.saveSiteContentButton.click();
  }

  async deleteSiteContent(index: number) {
    await this.siteContentList.locator('.delete-site-content').nth(index).click();
    await this.confirmDeleteButton.click();
  }

  async createAppSetting(key: string, value: string) {
    await this.createAppSettingButton.click();
    await this.appSettingKeyInput.fill(key);
    await this.appSettingValueInput.fill(value);
    await this.saveAppSettingButton.click();
  }

  async editAppSetting(index: number, newKey: string, newValue: string) {
    await this.appSettingsList.locator('.edit-app-setting').nth(index).click();
    await this.appSettingKeyInput.fill(newKey);
    await this.appSettingValueInput.fill(newValue);
    await this.saveAppSettingButton.click();
  }

  async deleteAppSetting(index: number) {
    await this.appSettingsList.locator('.delete-app-setting').nth(index).click();
    await this.confirmDeleteButton.click();
  }

  async createMockUser(name: string, email: string) {
    await this.createMockUserButton.click();
    await this.mockUserNameInput.fill(name);
    await this.mockUserEmailInput.fill(email);
    await this.saveMockUserButton.click();
  }

  async editMockUser(index: number, newName: string, newEmail: string) {
    await this.mockUsersList.locator('.edit-mock-user').nth(index).click();
    await this.mockUserNameInput.fill(newName);
    await this.mockUserEmailInput.fill(newEmail);
    await this.saveMockUserButton.click();
  }

  async deleteMockUser(index: number) {
    await this.mockUsersList.locator('.delete-mock-user').nth(index).click();
    await this.confirmDeleteButton.click();
  }

  async createMockPost(title: string, body: string) {
    await this.createMockPostButton.click();
    await this.mockPostTitleInput.fill(title);
    await this.mockPostBodyInput.fill(body);
    await this.saveMockPostButton.click();
  }

  async editMockPost(index: number, newTitle: string, newBody: string) {
    await this.mockPostsList.locator('.edit-mock-post').nth(index).click();
    await this.mockPostTitleInput.fill(newTitle);
    await this.mockPostBodyInput.fill(newBody);
    await this.saveMockPostButton.click();
  }

  async deleteMockPost(index: number) {
    await this.mockPostsList.locator('.delete-mock-post').nth(index).click();
    await this.confirmDeleteButton.click();
  }

  async loadScenario(scenario: string) {
    await this.scenarioSelect.selectOption(scenario);
    await this.loadScenarioButton.click();
  }

  async saveScenario(scenario: string) {
    await this.scenarioSelect.selectOption(scenario);
    await this.saveScenarioButton.click();
  }

  async expectErrorMessage(text: string) {
    await this.page.waitForSelector('.error-message');
    await this.page.locator('.error-message').filter({ hasText: text }).waitFor();
  }

  async expectSuccessMessage(text: string) {
    await this.page.waitForSelector('.success-message');
    await this.page.locator('.success-message').filter({ hasText: text }).waitFor();
  }

  async checkAccessibility() {
    // Basic accessibility checks
    await this.page.keyboard.press('Tab');
    // Add more accessibility assertions as needed
  }
}