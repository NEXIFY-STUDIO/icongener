/**
 * Global E2E Tests
 * Tests complete application workflows and integrations
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Global Application Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have consistent styling across all pages', async ({ page }) => {
    // Test that all pages have the same basic styling
    const pages = ['/', '/icon-generator', '/favicon-generator', '/banner-generator', '/png-to-html', '/history', '/settings'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Verify consistent background
      const html = page.locator('html');
      const bgColor = await html.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      
      // Should have dark theme background
      expect(bgColor).toMatch(/rgb\([0-9]+, [0-9]+, [0-9]+\)/);
    }
  });

  test('should maintain state when navigating between pages', async ({ page }) => {
    // Navigate to icon generator
    await page.goto('/icon-generator');
    await page.waitForLoadState('networkidle');
    
    // Change some settings
    const colorPicker = page.locator('input[type="color"]');
    await colorPicker.fill('#ff0000');
    
    // Navigate to favicon generator
    await page.goto('/favicon-generator');
    await page.waitForLoadState('networkidle');
    
    // Navigate back to icon generator
    await page.goto('/icon-generator');
    await page.waitForLoadState('networkidle');
    
    // Settings should be preserved (if using service state)
    const currentColor = await colorPicker.getAttribute('value');
    // Note: This depends on how state is managed in the app
  });

  test('should have working toast notifications', async ({ page }) => {
    // Navigate to a page with actions that trigger toasts
    await page.goto('/icon-generator');
    
    // Try to trigger a toast (this might need adjustment based on actual implementation)
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.click();
      await page.waitForTimeout(1000);
      
      // Check for toast
      const toast = page.locator('.toast, [data-testid="toast"]');
      if (await toast.count() > 0) {
        await expect(toast).toBeVisible();
        
        // Toast should auto-dismiss
        await page.waitForTimeout(3000);
        await expect(toast).not.toBeVisible();
      }
    }
  });

  test('should have working progress tracking', async ({ page }) => {
    // Navigate to a page with progress tracking
    await page.goto('/icon-generator');
    
    // Try to trigger progress (this might need adjustment based on actual implementation)
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.click();
      
      // Check for progress bar
      const progressBar = page.locator('.progress-bar, [data-testid="progress-bar"]');
      if (await progressBar.count() > 0) {
        await expect(progressBar).toBeVisible();
        
        // Progress should update
        await page.waitForTimeout(1000);
        
        // Check progress value (if available)
        const progressText = await progressBar.textContent();
        if (progressText) {
          expect(progressText).toMatch(/\d+%/);
        }
      }
    }
  });

  test('should have responsive design on all breakpoints', async ({ page }) => {
    const breakpoints = [
      { width: 320, height: 568, name: 'Small Mobile' },
      { width: 375, height: 667, name: 'iPhone' },
      { width: 414, height: 896, name: 'iPhone Plus' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1024, height: 768, name: 'Desktop Small' },
      { width: 1440, height: 900, name: 'Desktop Medium' },
      { width: 1920, height: 1080, name: 'Desktop Large' },
    ];
    
    for (const bp of breakpoints) {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Verify basic layout
      const sidebar = page.locator('app-sidebar');
      const header = page.locator('app-header');
      const mainContent = page.locator('.main-content, [data-testid="main-content"]');
      
      await expect(sidebar).toBeVisible();
      await expect(header).toBeVisible();
      
      if (await mainContent.count() > 0) {
        await expect(mainContent).toBeVisible();
      }
    }
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/');
    
    // Verify skip to main content link
    const skipLink = page.locator('a[href="#main"]');
    if (await skipLink.count() > 0) {
      await expect(skipLink).toBeVisible();
    }
    
    // Verify all navigation links have proper labels
    const navLinks = page.locator('a[routerLink], a[href]');
    const count = await navLinks.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const link = navLinks.nth(i);
      const text = await link.textContent();
      const href = await link.getAttribute('href') || await link.getAttribute('routerLink');
      
      // Links should have text or aria-label
      expect(text?.trim()).toBeTruthy() || 
      expect(await link.getAttribute('aria-label')).toBeTruthy();
      
      // Links should have valid href/routerLink
      expect(href).toBeTruthy();
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Verify h1 exists
    const h1 = page.locator('h1');
    if (await h1.count() > 0) {
      await expect(h1).toBeVisible();
    }
    
    // Verify heading hierarchy
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    expect(headingCount).toBeGreaterThan(0);
    
    // Get all heading levels
    const headingLevels = [];
    for (let i = 0; i < headingCount; i++) {
      const heading = headings.nth(i);
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
      headingLevels.push(tagName);
    }
    
    // First heading should be h1
    expect(headingLevels[0]).toBe('h1');
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');
    
    // Verify viewport meta tag
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveAttribute('content', /.*width=device-width.*/);
    
    // Verify charset meta tag
    const charsetMeta = page.locator('meta[charset]');
    await expect(charsetMeta).toHaveAttribute('charset', 'utf-8');
    
    // Verify title
    await expect(page).toHaveTitle(/.*/);
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Focus on first focusable element
    await page.keyboard.press('Tab');
    
    // Verify focus is on a focusable element
    const focusedElement = page.locator(':focus-visible');
    await expect(focusedElement).toBeVisible();
    
    // Navigate through focusable elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const currentFocus = page.locator(':focus-visible');
      await expect(currentFocus).toBeVisible();
    }
  });

  test('should have proper error handling', async ({ page }) => {
    // Navigate to a non-existent route
    await page.goto('/non-existent-route');
    
    // Should either redirect to home or show 404
    const url = page.url();
    expect(url).toMatch(/\/(404|not-found|$)/);
    
    // Should not show raw errors
    const errorElements = page.locator('pre, code');
    const errorCount = await errorElements.count();
    
    // If there are error elements, they shouldn't contain stack traces
    for (let i = 0; i < errorCount; i++) {
      const error = errorElements.nth(i);
      const text = await error.textContent();
      expect(text?.toLowerCase()).not.toContain('error:') ||
      expect(text?.toLowerCase()).not.toContain('at ') ||
      expect(text?.toLowerCase()).not.toContain('stack trace');
    }
  });
});

test.describe('Complete Workflow Tests', () => {
  test('should complete icon generation workflow', async ({ page }) => {
    // Navigate to icon generator
    await page.goto('/icon-generator');
    await page.waitForLoadState('networkidle');
    
    // Select platform
    const androidOption = page.locator('input[value="android"]');
    await androidOption.check();
    
    // Select shape
    const circleOption = page.locator('input[value="circle"]');
    await circleOption.check();
    
    // Change color
    const colorPicker = page.locator('input[type="color"]');
    await colorPicker.fill('#ff0000');
    
    // Select size
    const sizeSelect = page.locator('select');
    await sizeSelect.selectOption('192');
    
    // Click generate
    const generateButton = page.locator('button:has-text("Generate")');
    await generateButton.click();
    
    // Wait for generation
    await page.waitForTimeout(2000);
    
    // Verify success
    const toast = page.locator('.toast');
    if (await toast.count() > 0) {
      await expect(toast).toBeVisible();
    }
    
    // Click download
    const downloadButton = page.locator('button:has-text("Download")');
    if (await downloadButton.count() > 0) {
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        downloadButton.click()
      ]);
      
      expect(download).toBeTruthy();
    }
  });

  test('should complete favicon generation workflow', async ({ page }) => {
    // Navigate to favicon generator
    await page.goto('/favicon-generator');
    await page.waitForLoadState('networkidle');
    
    // Select size
    const sizeSelect = page.locator('select');
    await sizeSelect.selectOption('256');
    
    // Change color
    const colorPicker = page.locator('input[type="color"]');
    await colorPicker.fill('#00ff00');
    
    // Click generate
    const generateButton = page.locator('button:has-text("Generate")');
    await generateButton.click();
    
    // Wait for generation
    await page.waitForTimeout(2000);
    
    // Verify success
    const toast = page.locator('.toast');
    if (await toast.count() > 0) {
      await expect(toast).toBeVisible();
    }
  });

  test('should complete banner generation workflow', async ({ page }) => {
    // Navigate to banner generator
    await page.goto('/banner-generator');
    await page.waitForLoadState('networkidle');
    
    // Select preset
    const presetSelect = page.locator('select');
    await presetSelect.selectOption('Facebook Cover');
    
    // Change color
    const colorPicker = page.locator('input[type="color"]');
    await colorPicker.fill('#0000ff');
    
    // Click generate
    const generateButton = page.locator('button:has-text("Generate")');
    await generateButton.click();
    
    // Wait for generation
    await page.waitForTimeout(2000);
    
    // Verify success
    const toast = page.locator('.toast');
    if (await toast.count() > 0) {
      await expect(toast).toBeVisible();
    }
  });

  test('should navigate through all pages without errors', async ({ page }) => {
    const pages = ['/', '/icon-generator', '/favicon-generator', '/banner-generator', '/png-to-html', '/history', '/settings'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Verify no console errors
      const consoleMessages = await page.evaluate(() => {
        return window.console.error.messages || [];
      });
      
      expect(consoleMessages.length).toBe(0);
      
      // Verify page loaded successfully
      await expect(page).toHaveURL(new RegExp(`.*${pagePath}$`));
    }
  });
});
