/**
 * Favicon Generator E2E Tests
 * Tests the complete favicon generation workflow
 */

import { test, expect, Page } from '@playwright/test';

// Test data
const FAVICON_SIZES = [16, 32, 48, 64, 128, 256, 512];
const FAVICON_FORMATS = ['ICO', 'PNG', 'SVG'];

test.describe('Favicon Generator Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/favicon-generator');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/favicon-generator');
  });

  test('should load favicon generator page', async ({ page }) => {
    // Verify page elements
    await expect(page.locator('app-favicon-generator')).toBeVisible();
    
    // Verify main sections
    const previewSection = page.locator('.preview-section, [data-testid="preview-section"]');
    const settingsSection = page.locator('.settings-section, [data-testid="settings-section"]');
    const actionsSection = page.locator('.actions-section, [data-testid="actions-section"]');
    
    await expect(previewSection).toBeVisible();
    await expect(settingsSection).toBeVisible();
    await expect(actionsSection).toBeVisible();
  });

  test('should display preview canvas', async ({ page }) => {
    const canvas = page.locator('canvas, [data-testid="favicon-preview"]');
    await expect(canvas).toBeVisible();
    
    // Verify canvas has reasonable dimensions
    const box = await canvas.boundingBox();
    expect(box?.width).toBeGreaterThan(50);
    expect(box?.height).toBeGreaterThan(50);
  });

  test('should have size selection for all standard favicon sizes', async ({ page }) => {
    const sizeSelect = page.locator('select, [data-testid="size-select"]');
    await expect(sizeSelect).toBeVisible();
    
    // Verify all standard sizes are available
    const options = await sizeSelect.locator('option').allTextContents();
    for (const size of FAVICON_SIZES) {
      expect(options.some(opt => opt.includes(size.toString()))).toBeTruthy();
    }
  });

  test('should have format selection', async ({ page }) => {
    for (const format of FAVICON_FORMATS) {
      const formatOption = page.locator(`input[value="${format.toLowerCase()}"], [data-format="${format.toLowerCase()}"]`);
      await expect(formatOption).toBeVisible();
    }
  });

  test('should have color picker', async ({ page }) => {
    const colorPicker = page.locator('input[type="color"], [data-testid="color-picker"]');
    await expect(colorPicker).toBeVisible();
    
    // Verify default color
    const defaultColor = await colorPicker.getAttribute('value');
    expect(defaultColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  test('should have background color picker', async ({ page }) => {
    const bgColorPicker = page.locator('input[type="color"] >> n=1, [data-testid="bg-color-picker"]');
    if (await bgColorPicker.count() > 0) {
      await expect(bgColorPicker).toBeVisible();
    }
  });

  test('should have shape selection', async ({ page }) => {
    const shapeOptions = ['circle', 'rounded', 'square'];
    for (const shape of shapeOptions) {
      const shapeOption = page.locator(`input[value="${shape}"], [data-shape="${shape}"]`);
      await expect(shapeOption).toBeVisible();
    }
  });

  test('should change color and update preview', async ({ page }) => {
    const colorPicker = page.locator('input[type="color"]');
    const canvas = page.locator('canvas');
    
    // Get initial canvas state
    const initialScreenshot = await canvas.screenshot();
    
    // Change color to blue
    await colorPicker.fill('#0000ff');
    await colorPicker.dispatchEvent('input');
    await page.waitForTimeout(500); // Wait for preview update
    
    // Verify canvas changed
    const newScreenshot = await canvas.screenshot();
    expect(newScreenshot).not.toEqual(initialScreenshot);
  });

  test('should change size and update preview', async ({ page }) => {
    const sizeSelect = page.locator('select, [data-testid="size-select"]');
    const canvas = page.locator('canvas');
    
    // Get initial canvas dimensions
    const initialBox = await canvas.boundingBox();
    
    // Change to larger size
    await sizeSelect.selectOption('256');
    await page.waitForTimeout(500); // Wait for preview update
    
    // Verify canvas dimensions changed
    const newBox = await canvas.boundingBox();
    expect(newBox?.width).not.toBe(initialBox?.width);
  });

  test('should change shape and update preview', async ({ page }) => {
    const canvas = page.locator('canvas');
    
    // Get initial canvas state
    const initialScreenshot = await canvas.screenshot();
    
    // Change to circle shape
    const circleOption = page.locator('input[value="circle"]');
    await circleOption.check();
    await page.waitForTimeout(500); // Wait for preview update
    
    // Verify canvas changed
    const newScreenshot = await canvas.screenshot();
    expect(newScreenshot).not.toEqual(initialScreenshot);
  });

  test('should generate favicon when clicking generate button', async ({ page }) => {
    const generateButton = page.locator('button:has-text("Generate"), [data-testid="generate-button"]');
    await expect(generateButton).toBeVisible();
    
    // Click generate
    await generateButton.click();
    
    // Wait for generation to complete
    await page.waitForTimeout(2000); // Adjust based on actual generation time
    
    // Verify progress indicator or success message
    const progressBar = page.locator('.progress-bar, [data-testid="progress-bar"]');
    if (await progressBar.count() > 0) {
      await expect(progressBar).toBeVisible();
    }
    
    // Verify toast notification
    const toast = page.locator('.toast, [data-testid="toast"]');
    if (await toast.count() > 0) {
      await expect(toast).toBeVisible();
      const toastText = await toast.textContent();
      expect(toastText?.toLowerCase()).toContain('success') || expect(toastText?.toLowerCase()).toContain('generated');
    }
  });

  test('should download generated favicon', async ({ page }) => {
    // Mock the download or verify download button exists
    const downloadButton = page.locator('button:has-text("Download"), [data-testid="download-button"]');
    
    if (await downloadButton.count() > 0) {
      await expect(downloadButton).toBeVisible();
      
      // Click download (in a real test, this would trigger a download)
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        downloadButton.click()
      ]);
      
      // Verify download started
      expect(download).toBeTruthy();
      expect(download.url()).toContain('blob:');
    }
  });

  test('should generate multiple sizes when selecting "All Sizes"', async ({ page }) => {
    const allSizesOption = page.locator('input[value="all"], [data-testid="all-sizes"]');
    if (await allSizesOption.count() > 0) {
      await allSizesOption.check();
      
      const generateButton = page.locator('button:has-text("Generate")');
      await generateButton.click();
      
      // Wait for generation
      await page.waitForTimeout(3000);
      
      // Verify multiple files are generated (check download or preview)
      const downloadButton = page.locator('button:has-text("Download")');
      if (await downloadButton.count() > 0) {
        await expect(downloadButton).toBeVisible();
      }
    }
  });

  test('should have custom SVG input', async ({ page }) => {
    const svgInput = page.locator('textarea, [data-testid="svg-input"]');
    if (await svgInput.count() > 0) {
      await expect(svgInput).toBeVisible();
      
      // Enter custom SVG
      const customSvg = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="red"/></svg>';
      await svgInput.fill(customSvg);
      
      // Verify input value
      const value = await svgInput.inputValue();
      expect(value).toContain('svg');
    }
  });

  test('should reset to default settings', async ({ page }) => {
    // Change some settings
    const colorPicker = page.locator('input[type="color"]');
    await colorPicker.fill('#ff0000');
    
    const sizeSelect = page.locator('select, [data-testid="size-select"]');
    await sizeSelect.selectOption('128');
    
    // Find and click reset button
    const resetButton = page.locator('button:has-text("Reset"), [data-testid="reset-button"]');
    if (await resetButton.count() > 0) {
      await resetButton.click();
      
      // Verify settings reset
      const resetColor = await colorPicker.getAttribute('value');
      expect(resetColor).not.toBe('#ff0000');
      
      const resetSize = await sizeSelect.inputValue();
      expect(resetSize).not.toBe('128');
    }
  });
});

test.describe('Favicon Generator Mobile Tests', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone size

  test('should display mobile-optimized layout', async ({ page }) => {
    await page.goto('/favicon-generator');
    
    // Verify responsive layout
    const previewSection = page.locator('.preview-section');
    const box = await previewSection.boundingBox();
    
    // On mobile, preview should take most of the width
    expect(box?.width).toBeGreaterThan(300);
  });

  test('should have accessible form controls', async ({ page }) => {
    await page.goto('/favicon-generator');
    
    // Verify all form controls have labels or aria-labels
    const colorPicker = page.locator('input[type="color"]');
    await expect(colorPicker).toHaveAttribute(/label|aria-label/i, /.*/);
  });
});
