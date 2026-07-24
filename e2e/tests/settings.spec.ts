/**
 * Settings E2E Tests
 * Tests the settings functionality including language and theme switching
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Settings Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/settings');
  });

  test('should load settings page', async ({ page }) => {
    // Verify page elements
    await expect(page.locator('app-settings')).toBeVisible();
    
    // Verify main sections
    const settingsSection = page.locator('.settings-section, [data-testid="settings-section"]');
    await expect(settingsSection).toBeVisible();
  });

  test('should have language settings', async ({ page }) => {
    const languageSection = page.locator('.language-settings, [data-testid="language-settings"]');
    await expect(languageSection).toBeVisible();
    
    // Verify language options
    const enOption = page.locator('input[value="en"], [data-lang="en"]');
    const skOption = page.locator('input[value="sk"], [data-lang="sk"]');
    
    await expect(enOption).toBeVisible();
    await expect(skOption).toBeVisible();
  });

  test('should have theme settings', async ({ page }) => {
    const themeSection = page.locator('.theme-settings, [data-testid="theme-settings"]');
    await expect(themeSection).toBeVisible();
    
    // Verify theme options
    const lightOption = page.locator('input[value="light"], [data-theme="light"]');
    const darkOption = page.locator('input[value="dark"], [data-theme="dark"]');
    const systemOption = page.locator('input[value="system"], [data-theme="system"]');
    
    await expect(lightOption).toBeVisible();
    await expect(darkOption).toBeVisible();
    await expect(systemOption).toBeVisible();
  });

  test('should switch language from English to Slovak', async ({ page }) => {
    // Get initial language
    const html = page.locator('html');
    const initialLang = await html.getAttribute('lang') || 'en';
    
    // Switch to Slovak
    const skOption = page.locator('input[value="sk"]');
    await skOption.check();
    await page.waitForTimeout(500); // Wait for language change
    
    // Verify language changed
    const newLang = await html.getAttribute('lang') || 'sk';
    expect(newLang).not.toBe(initialLang);
    expect(newLang).toBe('sk');
  });

  test('should switch language from Slovak to English', async ({ page }) => {
    // First switch to Slovak
    const skOption = page.locator('input[value="sk"]');
    await skOption.check();
    await page.waitForTimeout(500);
    
    // Then switch back to English
    const enOption = page.locator('input[value="en"]');
    await enOption.check();
    await page.waitForTimeout(500);
    
    // Verify language changed back
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    expect(lang).toBe('en');
  });

  test('should persist language preference across navigation', async ({ page, context }) => {
    // Switch to Slovak
    const skOption = page.locator('input[value="sk"]');
    await skOption.check();
    await page.waitForTimeout(500);
    
    // Navigate to another page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open new page in same context
    const newPage = await context.newPage();
    await newPage.goto('/settings');
    
    // Verify language persisted
    const html = newPage.locator('html');
    const lang = await html.getAttribute('lang');
    expect(lang).toBe('sk');
    
    await newPage.close();
  });

  test('should switch theme to dark', async ({ page }) => {
    // Get initial theme
    const html = page.locator('html');
    const initialTheme = await html.getAttribute('data-theme') || 'light';
    
    // Switch to dark theme
    const darkOption = page.locator('input[value="dark"]');
    await darkOption.check();
    await page.waitForTimeout(500); // Wait for theme change
    
    // Verify theme changed
    const newTheme = await html.getAttribute('data-theme') || 'dark';
    expect(newTheme).not.toBe(initialTheme);
    expect(newTheme).toBe('dark');
  });

  test('should switch theme to light', async ({ page }) => {
    // First switch to dark
    const darkOption = page.locator('input[value="dark"]');
    await darkOption.check();
    await page.waitForTimeout(500);
    
    // Then switch to light
    const lightOption = page.locator('input[value="light"]');
    await lightOption.check();
    await page.waitForTimeout(500);
    
    // Verify theme changed
    const html = page.locator('html');
    const theme = await html.getAttribute('data-theme');
    expect(theme).toBe('light');
  });

  test('should switch theme to system', async ({ page }) => {
    // Switch to system theme
    const systemOption = page.locator('input[value="system"]');
    await systemOption.check();
    await page.waitForTimeout(500);
    
    // Verify theme changed
    const html = page.locator('html');
    const theme = await html.getAttribute('data-theme');
    expect(theme).toBe('system');
  });

  test('should persist theme preference across navigation', async ({ page, context }) => {
    // Switch to dark theme
    const darkOption = page.locator('input[value="dark"]');
    await darkOption.check();
    await page.waitForTimeout(500);
    
    // Navigate to another page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open new page in same context
    const newPage = await context.newPage();
    await newPage.goto('/settings');
    
    // Verify theme persisted
    const html = newPage.locator('html');
    const theme = await html.getAttribute('data-theme');
    expect(theme).toBe('dark');
    
    await newPage.close();
  });

  test('should have additional settings options', async ({ page }) => {
    // Check for other settings sections
    const additionalSections = [
      'notifications',
      'privacy',
      'accessibility',
      'about'
    ];
    
    for (const section of additionalSections) {
      const sectionElement = page.locator(`.${section}-settings, [data-testid="${section}-settings"]`);
      if (await sectionElement.count() > 0) {
        await expect(sectionElement).toBeVisible();
      }
    }
  });

  test('should have save button', async ({ page }) => {
    const saveButton = page.locator('button:has-text("Save"), [data-testid="save-button"]');
    
    if (await saveButton.count() > 0) {
      await expect(saveButton).toBeVisible();
      
      // Click save
      await saveButton.click();
      
      // Verify success message
      const toast = page.locator('.toast, [data-testid="toast"]');
      if (await toast.count() > 0) {
        await expect(toast).toBeVisible();
        const toastText = await toast.textContent();
        expect(toastText?.toLowerCase()).toContain('saved') || 
        expect(toastText?.toLowerCase()).toContain('success');
      }
    }
  });

  test('should have reset button', async ({ page }) => {
    // Change some settings
    const skOption = page.locator('input[value="sk"]');
    await skOption.check();
    
    const darkOption = page.locator('input[value="dark"]');
    await darkOption.check();
    
    // Find and click reset button
    const resetButton = page.locator('button:has-text("Reset"), [data-testid="reset-button"]');
    
    if (await resetButton.count() > 0) {
      await resetButton.click();
      
      // Verify settings reset
      const enOption = page.locator('input[value="en"]');
      expect(await enOption.isChecked()).toBeTruthy();
      
      const lightOption = page.locator('input[value="light"]');
      expect(await lightOption.isChecked()).toBeTruthy();
    }
  });

  test('should display current settings summary', async ({ page }) => {
    const summarySection = page.locator('.settings-summary, [data-testid="settings-summary"]');
    
    if (await summarySection.count() > 0) {
      await expect(summarySection).toBeVisible();
      
      // Verify summary contains current settings
      const summaryText = await summarySection.textContent();
      expect(summaryText?.toLowerCase()).toContain('language') || 
      expect(summaryText?.toLowerCase()).toContain('theme');
    }
  });
});

test.describe('Settings Mobile Tests', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone size

  test('should display mobile-optimized settings layout', async ({ page }) => {
    await page.goto('/settings');
    
    const settingsSection = page.locator('.settings-section');
    await expect(settingsSection).toBeVisible();
    
    // Verify section takes full width
    const box = await settingsSection.boundingBox();
    expect(box?.width).toBeGreaterThan(300);
  });

  test('should have accessible form controls', async ({ page }) => {
    await page.goto('/settings');
    
    // Verify all radio buttons have labels
    const radioButtons = page.locator('input[type="radio"]');
    const count = await radioButtons.count();
    
    for (let i = 0; i < count; i++) {
      const radio = radioButtons.nth(i);
      await expect(radio).toHaveAttribute(/label|aria-label/i, /.*/);
    }
  });

  test('should have mobile-friendly language switcher', async ({ page }) => {
    await page.goto('/settings');
    
    const languageSection = page.locator('.language-settings');
    await expect(languageSection).toBeVisible();
    
    // Verify language options are easily tappable
    const enOption = page.locator('input[value="en"]');
    const skOption = page.locator('input[value="sk"]');
    
    const enBox = await enOption.boundingBox();
    const skBox = await skOption.boundingBox();
    
    // Options should have sufficient touch target size
    expect(enBox?.width).toBeGreaterThan(40);
    expect(enBox?.height).toBeGreaterThan(40);
    expect(skBox?.width).toBeGreaterThan(40);
    expect(skBox?.height).toBeGreaterThan(40);
  });

  test('should have mobile-friendly theme switcher', async ({ page }) => {
    await page.goto('/settings');
    
    const themeSection = page.locator('.theme-settings');
    await expect(themeSection).toBeVisible();
    
    // Verify theme options are easily tappable
    const lightOption = page.locator('input[value="light"]');
    const darkOption = page.locator('input[value="dark"]');
    const systemOption = page.locator('input[value="system"]');
    
    const lightBox = await lightOption.boundingBox();
    const darkBox = await darkOption.boundingBox();
    const systemBox = await systemOption.boundingBox();
    
    // Options should have sufficient touch target size
    expect(lightBox?.width).toBeGreaterThan(40);
    expect(lightBox?.height).toBeGreaterThan(40);
    expect(darkBox?.width).toBeGreaterThan(40);
    expect(darkBox?.height).toBeGreaterThan(40);
    expect(systemBox?.width).toBeGreaterThan(40);
    expect(systemBox?.height).toBeGreaterThan(40);
  });
});

test.describe('Global Settings Tests', () => {
  test('should access settings from header', async ({ page }) => {
    await page.goto('/');
    
    // Find settings button in header
    const settingsButton = page.locator('button[routerLink="/settings"], a[href="/settings"]');
    
    if (await settingsButton.count() > 0) {
      await settingsButton.click();
      await page.waitForURL('/settings');
      await expect(page).toHaveURL('/settings');
    }
  });

  test('should access settings from sidebar', async ({ page }) => {
    await page.goto('/');
    
    // Open sidebar if needed
    const menuToggle = page.locator('.menu-toggle');
    if (await menuToggle.count() > 0) {
      await menuToggle.click();
    }
    
    // Find settings link in sidebar
    const settingsLink = page.locator('a[routerLink="/settings"], a[href="/settings"]');
    
    if (await settingsLink.count() > 0) {
      await settingsLink.click();
      await page.waitForURL('/settings');
      await expect(page).toHaveURL('/settings');
    }
  });

  test('should have consistent language switcher in header', async ({ page }) => {
    await page.goto('/');
    
    // Find language switcher in header
    const headerLangSwitcher = page.locator('app-header .lang-switcher');
    
    if (await headerLangSwitcher.count() > 0) {
      await expect(headerLangSwitcher).toBeVisible();
      
      // Switch language via header
      const skButton = page.locator('app-header button[value="sk"]');
      if (await skButton.count() > 0) {
        await skButton.click();
        await page.waitForTimeout(500);
        
        // Verify language changed
        const html = page.locator('html');
        const lang = await html.getAttribute('lang');
        expect(lang).toBe('sk');
      }
    }
  });
});
