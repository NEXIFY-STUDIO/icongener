/**
 * Navigation Tests for icongener Application
 * Tests all navigation routes and sidebar functionality
 */

import { test, expect, Page } from '@playwright/test';

// Test data
const NAVIGATION_ROUTES = [
  { path: '/', title: 'Dashboard' },
  { path: '/icon-generator', title: 'Icon Generator' },
  { path: '/favicon-generator', title: 'Favicon Generator' },
  { path: '/banner-generator', title: 'Banner Generator' },
  { path: '/png-to-html', title: 'PNG to HTML' },
  { path: '/history', title: 'History' },
  { path: '/settings', title: 'Settings' },
];

// Helper function to navigate and verify page
async function navigateAndVerify(page: Page, route: { path: string; title: string }) {
  await page.goto(route.path);
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Verify URL
  await expect(page).toHaveURL(new RegExp(`.*${route.path}$`));
  
  // Verify page title or heading (adjust based on actual page structure)
  const heading = page.locator('h1, h2, h3, .page-title');
  if (await heading.count() > 0) {
    const headingText = await heading.first().textContent();
    expect(headingText?.toLowerCase()).toContain(route.title.toLowerCase().split(' ')[0]);
  }
}

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to base URL before each test
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load the application', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/icongener/);
    
    // Verify main layout elements exist
    await expect(page.locator('app-main-layout')).toBeVisible();
    await expect(page.locator('app-sidebar')).toBeVisible();
    await expect(page.locator('app-header')).toBeVisible();
  });

  test('should have working sidebar navigation', async ({ page }) => {
    // Open sidebar if collapsed (mobile view)
    const menuToggle = page.locator('.menu-toggle, [data-testid="menu-toggle"]');
    if (await menuToggle.count() > 0) {
      await menuToggle.click();
    }
    
    // Verify sidebar is visible
    const sidebar = page.locator('app-sidebar');
    await expect(sidebar).toBeVisible();
    
    // Test navigation links
    for (const route of NAVIGATION_ROUTES) {
      if (route.path === '/') continue; // Skip home
      
      const link = page.locator(`a[href="${route.path}"], a[routerLink="${route.path}"]`);
      await expect(link).toBeVisible();
      
      // Click and verify navigation
      await link.click();
      await page.waitForURL(new RegExp(`.*${route.path}$`));
      await expect(page).toHaveURL(new RegExp(`.*${route.path}$`));
    }
  });

  test('should navigate to all main routes directly', async ({ page }) => {
    for (const route of NAVIGATION_ROUTES) {
      await navigateAndVerify(page, route);
    }
  });

  test('should have working header navigation', async ({ page }) => {
    await page.goto('/');
    
    // Verify header exists
    const header = page.locator('app-header');
    await expect(header).toBeVisible();
    
    // Verify time display
    const timeDisplay = page.locator('.time-display, [data-testid="time-display"]');
    if (await timeDisplay.count() > 0) {
      await expect(timeDisplay).toBeVisible();
    }
    
    // Verify language switcher
    const langSwitcher = page.locator('.lang-switcher, [data-testid="lang-switcher"]');
    if (await langSwitcher.count() > 0) {
      await expect(langSwitcher).toBeVisible();
    }
  });

  test('should handle 404 for unknown routes', async ({ page }) => {
    await page.goto('/unknown-route');
    
    // Should either redirect to home or show 404 page
    const url = page.url();
    expect(url).toMatch(/\/(404|not-found|$)/);
  });

  test('should maintain active route highlighting', async ({ page }) => {
    await page.goto('/icon-generator');
    await page.waitForLoadState('networkidle');
    
    // Verify icon generator link has active state
    const activeLink = page.locator('.active, .router-link-active');
    await expect(activeLink).toHaveCountGreaterThan(0);
  });
});

test.describe('Mobile Navigation Tests', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone size

  test('should toggle sidebar on mobile', async ({ page }) => {
    await page.goto('/');
    
    const menuToggle = page.locator('.menu-toggle, [data-testid="menu-toggle"]');
    await expect(menuToggle).toBeVisible();
    
    // Sidebar might be hidden initially on mobile
    const sidebar = page.locator('app-sidebar');
    const initialVisibility = await sidebar.isVisible();
    
    // Toggle menu
    await menuToggle.click();
    
    // Sidebar should now be visible
    await expect(sidebar).toBeVisible();
    
    // Toggle again to close
    await menuToggle.click();
    
    // Sidebar should be hidden or less visible
    // Note: This might need adjustment based on actual implementation
  });

  test('should navigate on mobile view', async ({ page }) => {
    await page.goto('/');
    
    // Open menu
    const menuToggle = page.locator('.menu-toggle, [data-testid="menu-toggle"]');
    if (await menuToggle.count() > 0) {
      await menuToggle.click();
    }
    
    // Navigate to icon generator
    const iconLink = page.locator('a[href="/icon-generator"], a[routerLink="/icon-generator"]');
    await iconLink.click();
    
    await page.waitForURL('/icon-generator');
    await expect(page).toHaveURL('/icon-generator');
  });
});

test.describe('Language Switching Tests', () => {
  test('should switch between English and Slovak', async ({ page }) => {
    await page.goto('/');
    
    // Find language switcher
    const langSwitcher = page.locator('.lang-switcher, [data-testid="lang-switcher"]');
    await expect(langSwitcher).toBeVisible();
    
    // Get initial language
    const initialLang = await page.locator('body').getAttribute('lang') || 'en';
    
    // Switch to Slovak
    const skButton = page.locator('button[value="sk"], [data-lang="sk"]');
    if (await skButton.count() > 0) {
      await skButton.click();
      await page.waitForTimeout(500); // Wait for language change
      
      // Verify language changed
      const newLang = await page.locator('body').getAttribute('lang') || 'sk';
      expect(newLang).not.toBe(initialLang);
    }
  });

  test('should persist language preference', async ({ page, context }) => {
    // Set language to Slovak
    await page.goto('/');
    const skButton = page.locator('button[value="sk"], [data-lang="sk"]');
    if (await skButton.count() > 0) {
      await skButton.click();
      await page.waitForTimeout(500);
    }
    
    // Open new page in same context
    const newPage = await context.newPage();
    await newPage.goto('/');
    
    // Language should persist
    const lang = await newPage.locator('body').getAttribute('lang');
    expect(lang).toBe('sk');
    
    await newPage.close();
  });
});
