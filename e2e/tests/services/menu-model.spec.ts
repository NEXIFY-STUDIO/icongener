/**
 * E2E Tests for Menu Model
 * Tests navigation structure and menu item validation
 */

import { test, expect } from '@playwright/test';

// Expected menu structure
const EXPECTED_MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid', category: 'main' },
  { id: 'icon-generator', label: 'Icon Generator', icon: 'image', category: 'generators' },
  { id: 'favicon-generator', label: 'Favicon Generator', icon: 'favicon', category: 'generators' },
  { id: 'banner-generator', label: 'Banner Generator', icon: 'rectangle', category: 'generators' },
  { id: 'png-to-html', label: 'PNG to HTML', icon: 'code', category: 'generators' },
  { id: 'history', label: 'History', icon: 'clock', category: 'tools' },
  { id: 'settings', label: 'Settings', icon: 'settings', category: 'tools' }
];

const EXPECTED_CATEGORIES = ['main', 'generators', 'tools'];

test.describe('Menu Model E2E Tests', () => {
  let baseURL: string;

  test.beforeAll(async () => {
    baseURL = process.env.BASE_URL || 'http://localhost:3000';
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/`);
  });

  test('should render all menu items in sidebar', async ({ page }) => {
    await page.waitForSelector('app-sidebar');
    
    // Check each menu item exists
    for (const item of EXPECTED_MENU_ITEMS) {
      const menuItem = page.locator(`[data-testid="menu-item-${item.id}"]`);
      await expect(menuItem).toBeVisible({ timeout: 3000 });
    }
  });

  test('should have correct menu item labels', async ({ page }) => {
    await page.waitForSelector('app-sidebar');
    
    for (const item of EXPECTED_MENU_ITEMS) {
      const menuItem = page.locator(`[data-testid="menu-item-${item.id}"]`);
      const label = await menuItem.textContent();
      
      expect(label).toContain(item.label);
    }
  });

  test('should have correct menu item icons', async ({ page }) => {
    await page.waitForSelector('app-sidebar');
    
    for (const item of EXPECTED_MENU_ITEMS) {
      const icon = page.locator(`[data-testid="menu-item-${item.id}"] .icon`);
      await expect(icon).toBeVisible({ timeout: 3000 });
    }
  });

  test('should group menu items by category', async ({ page }) => {
    await page.waitForSelector('app-sidebar');
    
    for (const category of EXPECTED_CATEGORIES) {
      const categoryGroup = page.locator(`[data-testid="category-${category}"]`);
      await expect(categoryGroup).toBeVisible({ timeout: 3000 });
    }
  });

  test('should have correct items in each category', async ({ page }) => {
    await page.waitForSelector('app-sidebar');
    
    // Main category should have dashboard
    const mainCategory = page.locator('[data-testid="category-main"]');
    const mainItems = mainCategory.locator('[data-testid^="menu-item-"]');
    await expect(mainItems).toHaveCount(1);
    
    // Generators category should have 4 items
    const generatorsCategory = page.locator('[data-testid="category-generators"]');
    const generatorItems = generatorsCategory.locator('[data-testid^="menu-item-"]');
    await expect(generatorItems).toHaveCount(4);
    
    // Tools category should have 2 items
    const toolsCategory = page.locator('[data-testid="category-tools"]');
    const toolItems = toolsCategory.locator('[data-testid^="menu-item-"]');
    await expect(toolItems).toHaveCount(2);
  });

  test('should navigate to correct route when menu item is clicked', async ({ page }) => {
    await page.waitForSelector('app-sidebar');
    
    for (const item of EXPECTED_MENU_ITEMS) {
      const menuItem = page.locator(`[data-testid="menu-item-${item.id}"]`);
      await menuItem.click();
      
      // Wait for navigation
      await page.waitForURL(`${baseURL}/${item.id}`);
      
      // Verify we're on the correct page
      expect(page.url()).toContain(item.id);
      
      // Go back to homepage for next iteration
      await page.goto(`${baseURL}/`);
      await page.waitForSelector('app-sidebar');
    }
  });

  test('should highlight active menu item', async ({ page }) => {
    await page.goto(`${baseURL}/icon-generator`);
    
    await page.waitForSelector('app-sidebar');
    
    // Icon Generator should be highlighted
    const activeItem = page.locator('[data-testid="menu-item-icon-generator"].active');
    await expect(activeItem).toBeVisible({ timeout: 3000 });
    
    // Other items should not be active
    const dashboardItem = page.locator('[data-testid="menu-item-dashboard"].active');
    await expect(dashboardItem).not.toBeVisible();
  });

  test('should expand and collapse categories', async ({ page }) => {
    await page.waitForSelector('app-sidebar');
    
    // Find a category header
    const categoryHeader = page.locator('[data-testid="category-header-generators"]');
    
    if (await categoryHeader.count() > 0) {
      // Click to collapse
      await categoryHeader.first().click();
      
      // Items should be hidden
      const categoryItems = page.locator('[data-testid="category-generators"] [data-testid^="menu-item-"]');
      await expect(categoryItems).not.toBeVisible({ timeout: 1000 });
      
      // Click to expand
      await categoryHeader.first().click();
      
      // Items should be visible again
      await expect(categoryItems).toBeVisible({ timeout: 1000 });
    }
  });

  test('should show tooltip on menu item hover', async ({ page }) => {
    await page.waitForSelector('app-sidebar');
    
    const menuItem = page.locator('[data-testid="menu-item-icon-generator"]');
    
    // Hover over menu item
    await menuItem.hover();
    
    // Should show tooltip
    const tooltip = page.locator('.tooltip, [role="tooltip"]');
    await expect(tooltip).toBeVisible({ timeout: 1000 });
    
    // Tooltip should contain the label
    const tooltipText = await tooltip.textContent();
    expect(tooltipText).toContain('Icon Generator');
  });

  test('should have correct menu item order', async ({ page }) => {
    await page.waitForSelector('app-sidebar');
    
    const menuItems = page.locator('[data-testid^="menu-item-"]');
    const count = await menuItems.count();
    
    expect(count).toBe(EXPECTED_MENU_ITEMS.length);
    
    // Check order by getting all text content
    const allTexts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await menuItems.nth(i).textContent();
      allTexts.push(text || '');
    }
    
    // Verify order matches expected
    const expectedOrder = EXPECTED_MENU_ITEMS.map(item => item.label);
    expect(allTexts).toEqual(expectedOrder);
  });

  test('should have correct category order', async ({ page }) => {
    await page.waitForSelector('app-sidebar');
    
    const categories = page.locator('[data-testid^="category-"]');
    const count = await categories.count();
    
    expect(count).toBe(EXPECTED_CATEGORIES.length);
    
    // Check order
    const categoryTexts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await categories.nth(i).getAttribute('data-testid');
      categoryTexts.push(text ? text.replace('category-', '') : '');
    }
    
    expect(categoryTexts).toEqual(EXPECTED_CATEGORIES);
  });

  test('should have correct translations for menu items', async ({ page }) => {
    await page.waitForSelector('app-sidebar');
    
    // Switch to Slovak
    await page.goto(`${baseURL}/settings`);
    await page.waitForSelector('app-settings');
    
    const languageSelect = page.locator('select[name="language"]');
    if (await languageSelect.count() > 0) {
      await languageSelect.first().selectOption('sk');
    }
    
    // Go back to dashboard
    await page.goto(`${baseURL}/`);
    await page.waitForSelector('app-sidebar');
    
    // Check Slovak translations
    const dashboardItem = page.locator('[data-testid="menu-item-dashboard"]');
    const dashboardText = await dashboardItem.textContent();
    expect(dashboardText).toContain('Nádvestie'); // Slovak for Dashboard
    
    const iconGeneratorItem = page.locator('[data-testid="menu-item-icon-generator"]');
    const iconGeneratorText = await iconGeneratorItem.textContent();
    expect(iconGeneratorText).toContain('Generátor ikon'); // Slovak for Icon Generator
  });

  test('should maintain menu state across navigation', async ({ page }) => {
    await page.waitForSelector('app-sidebar');
    
    // Collapse a category
    const categoryHeader = page.locator('[data-testid="category-header-generators"]');
    if (await categoryHeader.count() > 0) {
      await categoryHeader.first().click();
    }
    
    // Navigate to another page
    await page.goto(`${baseURL}/icon-generator`);
    await page.waitForSelector('app-sidebar');
    
    // Category should still be collapsed
    const categoryItems = page.locator('[data-testid="category-generators"] [data-testid^="menu-item-"]');
    await expect(categoryItems).not.toBeVisible({ timeout: 1000 });
  });

  test('should have accessible menu items', async ({ page }) => {
    await page.waitForSelector('app-sidebar');
    
    for (const item of EXPECTED_MENU_ITEMS) {
      const menuItem = page.locator(`[data-testid="menu-item-${item.id}"]`);
      
      // Should have aria-label
      const ariaLabel = await menuItem.getAttribute('aria-label');
      expect(ariaLabel).toContain(item.label);
      
      // Should be focusable
      await menuItem.focus();
      expect(await menuItem.evaluate(el => el === document.activeElement)).toBeTruthy();
    }
  });

  test('should navigate with keyboard', async ({ page }) => {
    await page.waitForSelector('app-sidebar');
    
    // Focus first menu item
    const firstItem = page.locator('[data-testid="menu-item-dashboard"]');
    await firstItem.focus();
    
    // Press Arrow Down to navigate to next item
    await page.keyboard.press('ArrowDown');
    
    // Next item should be focused
    const secondItem = page.locator('[data-testid="menu-item-icon-generator"]');
    expect(await secondItem.evaluate(el => el === document.activeElement)).toBeTruthy();
    
    // Press Enter to navigate
    await page.keyboard.press('Enter');
    
    // Should navigate to icon-generator
    await page.waitForURL(`${baseURL}/icon-generator`);
    expect(page.url()).toContain('icon-generator');
  });

  test('should have correct href attributes', async ({ page }) => {
    await page.waitForSelector('app-sidebar');
    
    for (const item of EXPECTED_MENU_ITEMS) {
      const menuItem = page.locator(`[data-testid="menu-item-${item.id}"]`);
      const href = await menuItem.getAttribute('href');
      
      expect(href).toContain(`/${item.id}`);
    }
  });

  test('should show badge for new features', async ({ page }) => {
    await page.waitForSelector('app-sidebar');
    
    // Check if any menu items have badges
    const badges = page.locator('.badge, .new-badge');
    const count = await badges.count();
    
    // At least some items should have badges (if configured)
    // This is optional based on configuration
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const badgeText = await badges.nth(i).textContent();
        expect(badgeText).toMatch(/new|beta|updated/i);
      }
    }
  });

  test('should have correct icon for each menu item', async ({ page }) => {
    await page.waitForSelector('app-sidebar');
    
    const iconMap: Record<string, string> = {
      dashboard: 'grid',
      'icon-generator': 'image',
      'favicon-generator': 'favicon',
      'banner-generator': 'rectangle',
      'png-to-html': 'code',
      history: 'clock',
      settings: 'settings'
    };
    
    for (const item of EXPECTED_MENU_ITEMS) {
      const menuItem = page.locator(`[data-testid="menu-item-${item.id}"]`);
      const icon = menuItem.locator('.icon, svg');
      
      await expect(icon).toBeVisible({ timeout: 3000 });
      
      // Verify icon class or name
      const iconClass = await icon.getAttribute('class');
      const iconName = await icon.getAttribute('name');
      
      expect(iconClass || iconName || '').toContain(iconMap[item.id]);
    }
  });

  test('should handle mobile menu toggle', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(`${baseURL}/`);
    await page.waitForSelector('app-sidebar');
    
    // Menu should be collapsed on mobile by default
    const sidebar = page.locator('app-sidebar');
    const isCollapsed = await sidebar.evaluate(el => {
      return el.classList.contains('collapsed') || el.offsetWidth < 100;
    });
    
    expect(isCollapsed).toBeTruthy();
    
    // Click menu toggle
    const menuToggle = page.locator('[data-testid="menu-toggle"]');
    if (await menuToggle.count() > 0) {
      await menuToggle.first().click();
    }
    
    // Menu should be expanded
    const isExpanded = await sidebar.evaluate(el => {
      return !el.classList.contains('collapsed') && el.offsetWidth > 200;
    });
    
    expect(isExpanded).toBeTruthy();
    
    // Click toggle again to collapse
    if (await menuToggle.count() > 0) {
      await menuToggle.first().click();
    }
    
    // Menu should be collapsed again
    const isCollapsedAgain = await sidebar.evaluate(el => {
      return el.classList.contains('collapsed') || el.offsetWidth < 100;
    });
    
    expect(isCollapsedAgain).toBeTruthy();
  });

  test('should close mobile menu when navigating', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(`${baseURL}/`);
    await page.waitForSelector('app-sidebar');
    
    // Open menu
    const menuToggle = page.locator('[data-testid="menu-toggle"]');
    if (await menuToggle.count() > 0) {
      await menuToggle.first().click();
    }
    
    // Click a menu item
    const menuItem = page.locator('[data-testid="menu-item-dashboard"]');
    await menuItem.click();
    
    // Menu should be collapsed after navigation
    const sidebar = page.locator('app-sidebar');
    const isCollapsed = await sidebar.evaluate(el => {
      return el.classList.contains('collapsed') || el.offsetWidth < 100;
    });
    
    expect(isCollapsed).toBeTruthy();
  });
});

test.describe('Menu Model - Route Validation Tests', () => {
  test('should have valid routes for all menu items', async ({ page }) => {
    await page.goto(`${baseURL}/`);
    await page.waitForSelector('app-sidebar');
    
    for (const item of EXPECTED_MENU_ITEMS) {
      // Try to navigate to each route
      await page.goto(`${baseURL}/${item.id}`);
      
      // Should not 404
      expect(page.url()).not.toContain('404');
      expect(page.url()).toContain(item.id);
      
      // Should have the component loaded
      const component = page.locator(`app-${item.id}`);
      await expect(component).toBeVisible({ timeout: 3000 });
    }
  });

  test('should redirect to dashboard for invalid routes', async ({ page }) => {
    await page.goto(`${baseURL}/invalid-route`);
    
    // Should redirect to dashboard or show 404
    // Depending on routing configuration
    await page.waitForTimeout(1000);
    
    // Either redirects to dashboard or stays on 404
    const url = page.url();
    expect(url).toMatch(/(dashboard|404)/i);
  });

  test('should maintain active state after page reload', async ({ page }) => {
    await page.goto(`${baseURL}/icon-generator`);
    await page.waitForSelector('app-sidebar');
    
    // Icon Generator should be active
    const activeItem = page.locator('[data-testid="menu-item-icon-generator"].active');
    await expect(activeItem).toBeVisible({ timeout: 3000 });
    
    // Reload page
    await page.reload();
    await page.waitForSelector('app-sidebar');
    
    // Icon Generator should still be active
    await expect(activeItem).toBeVisible({ timeout: 3000 });
  });
});
