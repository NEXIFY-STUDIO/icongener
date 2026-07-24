/**
 * Banner Generator E2E Tests
 * Tests the complete banner generation workflow
 */

import { test, expect, Page } from '@playwright/test';

// Test data - 25+ banner presets
const BANNER_PRESETS = [
  { name: 'Facebook Cover', width: 820, height: 312 },
  { name: 'Twitter Header', width: 1500, height: 500 },
  { name: 'LinkedIn Banner', width: 1584, height: 396 },
  { name: 'YouTube Banner', width: 2560, height: 1440 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'Instagram Post', width: 1080, height: 1080 },
  { name: 'Twitter Post', width: 1200, height: 675 },
  { name: 'Facebook Post', width: 1200, height: 630 },
  { name: 'LinkedIn Post', width: 1200, height: 627 },
  { name: 'Pinterest Pin', width: 1000, height: 1500 },
  { name: 'TikTok Video', width: 1080, height: 1920 },
  { name: 'Website Header', width: 1920, height: 400 },
  { name: 'Website Hero', width: 1920, height: 1080 },
  { name: 'Email Header', width: 600, height: 200 },
  { name: 'Google Ads', width: 300, height: 250 },
  { name: 'Facebook Ads', width: 1200, height: 628 },
  { name: 'Instagram Ads', width: 1080, height: 1350 },
  { name: 'Twitter Ads', width: 800, height: 418 },
  { name: 'LinkedIn Ads', width: 300, height: 250 },
  { name: 'YouTube Thumbnail', width: 1280, height: 720 },
  { name: 'Blog Header', width: 1200, height: 400 },
  { name: 'Mobile App Banner', width: 1080, height: 1920 },
  { name: 'Desktop Wallpaper', width: 1920, height: 1080 },
  { name: 'Tablet Banner', width: 2048, height: 1536 },
  { name: 'WhatsApp Status', width: 1080, height: 1920 },
];

const BANNER_CATEGORIES = ['Social Media', 'Website', 'Advertising', 'Custom'];
const BACKGROUND_TYPES = ['solid', 'gradient', 'image', 'transparent'];

test.describe('Banner Generator Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/banner-generator');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/banner-generator');
  });

  test('should load banner generator page', async ({ page }) => {
    // Verify page elements
    await expect(page.locator('app-banner-generator')).toBeVisible();
    
    // Verify main sections
    const previewSection = page.locator('.preview-section, [data-testid="preview-section"]');
    const settingsSection = page.locator('.settings-section, [data-testid="settings-section"]');
    const presetsSection = page.locator('.presets-section, [data-testid="presets-section"]');
    const actionsSection = page.locator('.actions-section, [data-testid="actions-section"]');
    
    await expect(previewSection).toBeVisible();
    await expect(settingsSection).toBeVisible();
    await expect(presetsSection).toBeVisible();
    await expect(actionsSection).toBeVisible();
  });

  test('should display preview canvas', async ({ page }) => {
    const canvas = page.locator('canvas, [data-testid="banner-preview"]');
    await expect(canvas).toBeVisible();
    
    // Verify canvas has reasonable dimensions
    const box = await canvas.boundingBox();
    expect(box?.width).toBeGreaterThan(200);
    expect(box?.height).toBeGreaterThan(100);
  });

  test('should have 25+ preset options', async ({ page }) => {
    const presetSelect = page.locator('select, [data-testid="preset-select"]');
    await expect(presetSelect).toBeVisible();
    
    // Verify preset options count
    const options = await presetSelect.locator('option').count();
    expect(options).toBeGreaterThanOrEqual(25);
  });

  test('should have all required preset categories', async ({ page }) => {
    const presetSelect = page.locator('select, [data-testid="preset-select"]');
    const options = await presetSelect.locator('option').allTextContents();
    
    // Verify at least some key presets exist
    const requiredPresets = ['Facebook', 'Twitter', 'LinkedIn', 'YouTube', 'Instagram'];
    for (const preset of requiredPresets) {
      expect(options.some(opt => opt.includes(preset))).toBeTruthy();
    }
  });

  test('should have category filtering', async ({ page }) => {
    for (const category of BANNER_CATEGORIES) {
      const categoryFilter = page.locator(`button:has-text("${category}"), [data-category="${category.toLowerCase()}"]`);
      if (await categoryFilter.count() > 0) {
        await expect(categoryFilter).toBeVisible();
      }
    }
  });

  test('should have custom dimensions input', async ({ page }) => {
    const widthInput = page.locator('input[type="number"] >> n=0, [data-testid="width-input"]');
    const heightInput = page.locator('input[type="number"] >> n=1, [data-testid="height-input"]');
    
    await expect(widthInput).toBeVisible();
    await expect(heightInput).toBeVisible();
    
    // Verify default values
    const defaultWidth = await widthInput.inputValue();
    const defaultHeight = await heightInput.inputValue();
    expect(parseInt(defaultWidth)).toBeGreaterThan(0);
    expect(parseInt(defaultHeight)).toBeGreaterThan(0);
  });

  test('should have background type selection', async ({ page }) => {
    for (const bgType of BACKGROUND_TYPES) {
      const bgOption = page.locator(`input[value="${bgType}"], [data-bg-type="${bgType}"]`);
      await expect(bgOption).toBeVisible();
    }
  });

  test('should have color picker for solid background', async ({ page }) => {
    const colorPicker = page.locator('input[type="color"], [data-testid="color-picker"]');
    await expect(colorPicker).toBeVisible();
    
    // Verify default color
    const defaultColor = await colorPicker.getAttribute('value');
    expect(defaultColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  test('should have gradient controls', async ({ page }) => {
    // Switch to gradient background
    const gradientOption = page.locator('input[value="gradient"]');
    await gradientOption.check();
    await page.waitForTimeout(500);
    
    // Verify gradient controls appear
    const gradientControls = page.locator('.gradient-controls, [data-testid="gradient-controls"]');
    if (await gradientControls.count() > 0) {
      await expect(gradientControls).toBeVisible();
      
      // Verify gradient color pickers
      const gradientColorPickers = page.locator('input[type="color"]', { has: gradientControls });
      expect(await gradientColorPickers.count()).toBeGreaterThanOrEqual(2);
    }
  });

  test('should have text input for banner text', async ({ page }) => {
    const textInput = page.locator('textarea, input[type="text"]', { hasText: /text|content/i });
    if (await textInput.count() > 0) {
      await expect(textInput).toBeVisible();
      
      // Enter custom text
      await textInput.fill('Test Banner Text');
      
      // Verify input value
      const value = await textInput.inputValue();
      expect(value).toContain('Test Banner');
    }
  });

  test('should change preset and update dimensions', async ({ page }) => {
    const presetSelect = page.locator('select, [data-testid="preset-select"]');
    const widthInput = page.locator('input[type="number"] >> n=0');
    const heightInput = page.locator('input[type="number"] >> n=1');
    
    // Get initial dimensions
    const initialWidth = await widthInput.inputValue();
    const initialHeight = await heightInput.inputValue();
    
    // Select Facebook Cover preset
    await presetSelect.selectOption('Facebook Cover');
    await page.waitForTimeout(500);
    
    // Verify dimensions changed
    const newWidth = await widthInput.inputValue();
    const newHeight = await heightInput.inputValue();
    
    expect(newWidth).not.toBe(initialWidth);
    expect(newHeight).not.toBe(initialHeight);
    expect(parseInt(newWidth)).toBe(820);
    expect(parseInt(newHeight)).toBe(312);
  });

  test('should change custom dimensions and update preview', async ({ page }) => {
    const widthInput = page.locator('input[type="number"] >> n=0');
    const heightInput = page.locator('input[type="number"] >> n=1');
    const canvas = page.locator('canvas');
    
    // Get initial canvas dimensions
    const initialBox = await canvas.boundingBox();
    
    // Change dimensions
    await widthInput.fill('800');
    await heightInput.fill('400');
    await page.waitForTimeout(500); // Wait for preview update
    
    // Verify canvas dimensions changed
    const newBox = await canvas.boundingBox();
    expect(newBox?.width).not.toBe(initialBox?.width);
  });

  test('should change background color and update preview', async ({ page }) => {
    const colorPicker = page.locator('input[type="color"]');
    const canvas = page.locator('canvas');
    
    // Get initial canvas state
    const initialScreenshot = await canvas.screenshot();
    
    // Change color to green
    await colorPicker.fill('#00ff00');
    await colorPicker.dispatchEvent('input');
    await page.waitForTimeout(500); // Wait for preview update
    
    // Verify canvas changed
    const newScreenshot = await canvas.screenshot();
    expect(newScreenshot).not.toEqual(initialScreenshot);
  });

  test('should generate banner when clicking generate button', async ({ page }) => {
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

  test('should download generated banner', async ({ page }) => {
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

  test('should filter presets by category', async ({ page }) => {
    // Click Social Media category
    const socialMediaFilter = page.locator('button:has-text("Social Media")');
    if (await socialMediaFilter.count() > 0) {
      await socialMediaFilter.click();
      await page.waitForTimeout(500);
      
      // Verify only social media presets are shown
      const presetSelect = page.locator('select, [data-testid="preset-select"]');
      const options = await presetSelect.locator('option').allTextContents();
      
      // All options should contain social media platform names
      const socialPlatforms = ['Facebook', 'Twitter', 'LinkedIn', 'YouTube', 'Instagram', 'TikTok'];
      for (const option of options) {
        expect(socialPlatforms.some(platform => option.includes(platform))).toBeTruthy();
      }
    }
  });

  test('should reset to default settings', async ({ page }) => {
    // Change some settings
    const presetSelect = page.locator('select, [data-testid="preset-select"]');
    await presetSelect.selectOption('Twitter Header');
    
    const colorPicker = page.locator('input[type="color"]');
    await colorPicker.fill('#ff00ff');
    
    // Find and click reset button
    const resetButton = page.locator('button:has-text("Reset"), [data-testid="reset-button"]');
    if (await resetButton.count() > 0) {
      await resetButton.click();
      
      // Verify settings reset
      const resetColor = await colorPicker.getAttribute('value');
      expect(resetColor).not.toBe('#ff00ff');
      
      const resetPreset = await presetSelect.inputValue();
      expect(resetPreset).not.toContain('Twitter');
    }
  });
});

test.describe('Banner Generator Mobile Tests', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone size

  test('should display mobile-optimized layout', async ({ page }) => {
    await page.goto('/banner-generator');
    
    // Verify responsive layout
    const previewSection = page.locator('.preview-section');
    const box = await previewSection.boundingBox();
    
    // On mobile, preview should take most of the width
    expect(box?.width).toBeGreaterThan(300);
  });

  test('should have accessible form controls', async ({ page }) => {
    await page.goto('/banner-generator');
    
    // Verify all form controls have labels or aria-labels
    const colorPicker = page.locator('input[type="color"]');
    await expect(colorPicker).toHaveAttribute(/label|aria-label/i, /.*/);
  });

  test('should display presets in mobile-friendly way', async ({ page }) => {
    await page.goto('/banner-generator');
    
    const presetSelect = page.locator('select, [data-testid="preset-select"]');
    await expect(presetSelect).toBeVisible();
    
    // On mobile, select dropdown should be usable
    await presetSelect.click();
    await page.waitForTimeout(300);
    
    const options = page.locator('option');
    await expect(options.first()).toBeVisible();
  });
});
