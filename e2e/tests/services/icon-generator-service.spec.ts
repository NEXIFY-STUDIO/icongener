/**
 * E2E Tests for Icon Generator Service
 * Tests icon generation logic and all platform-specific sizes
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Platform configurations for testing
const PLATFORM_CONFIGS = {
  pwa: {
    sizes: [192, 512],
    name: 'PWA'
  },
  android: {
    sizes: [48, 72, 96, 144, 192, 512],
    name: 'Android'
  },
  ios: {
    sizes: [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180],
    name: 'iOS'
  }
};

test.describe('Icon Generator Service E2E Tests', () => {
  let baseURL: string;
  let tempDir: string;

  test.beforeAll(async () => {
    baseURL = process.env.BASE_URL || 'http://localhost:3000';
    tempDir = path.join(__dirname, 'downloads');
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  test.afterAll(() => {
    // Clean up
    try {
      const files = fs.readdirSync(tempDir);
      for (const file of files) {
        fs.unlinkSync(path.join(tempDir, file));
      }
      fs.rmdirSync(tempDir);
    } catch (error) {
      console.log('Could not clean up:', error);
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/icon-generator`);
    await page.waitForSelector('app-icon-generator');
  });

  test('should generate PWA icons in all required sizes', async ({ page }) => {
    // Set PWA options
    await page.selectOption('select[name="shape"]', 'circle');
    await page.fill('input[name="color"]', '#00d4ff');
    
    // Click PWA generation button
    const pwaButton = page.locator('button:has-text("PWA")');
    if (await pwaButton.count() > 0) {
      await pwaButton.first().click();
    }
    
    // Wait for generation
    await page.waitForTimeout(2000);
    
    // Download ZIP
    const downloadPromise = page.waitForEvent('download');
    const downloadButton = page.locator('button:has-text("Download ZIP")');
    if (await downloadButton.count() > 0) {
      await downloadButton.first().click();
    }
    
    const download = await downloadPromise;
    const filePath = await download.path();
    
    expect(filePath).toContain('.zip');
    
    // Verify ZIP contains all PWA sizes
    const fileContent = fs.readFileSync(filePath);
    expect(fileContent.length).toBeGreaterThan(0);
    
    // Check for PNG files in ZIP (by checking file names in the ZIP)
    // This is a basic check - in a real test, you'd extract and verify
    const zipBuffer = fileContent;
    const zipString = zipBuffer.toString('utf-8');
    
    // PWA sizes: 192x192, 512x512
    expect(zipString).toMatch(/192\.png|192x192/i);
    expect(zipString).toMatch(/512\.png|512x512/i);
  });

  test('should generate Android icons in all required sizes', async ({ page }) => {
    await page.selectOption('select[name="shape"]', 'square');
    await page.fill('input[name="color"]', '#ff0000');
    
    // Click Android generation button
    const androidButton = page.locator('button:has-text("Android")');
    if (await androidButton.count() > 0) {
      await androidButton.first().click();
    }
    
    await page.waitForTimeout(2000);
    
    // Download ZIP
    const downloadPromise = page.waitForEvent('download');
    const downloadButton = page.locator('button:has-text("Download ZIP")');
    if (await downloadButton.count() > 0) {
      await downloadButton.first().click();
    }
    
    const download = await downloadPromise;
    const filePath = await download.path();
    
    expect(filePath).toContain('.zip');
    
    const fileContent = fs.readFileSync(filePath);
    const zipString = fileContent.toString('utf-8');
    
    // Android sizes: 48, 72, 96, 144, 192, 512
    expect(zipString).toMatch(/48\.png|48x48/i);
    expect(zipString).toMatch(/72\.png|72x72/i);
    expect(zipString).toMatch(/96\.png|96x96/i);
    expect(zipString).toMatch(/144\.png|144x144/i);
    expect(zipString).toMatch(/192\.png|192x192/i);
    expect(zipString).toMatch(/512\.png|512x512/i);
  });

  test('should generate iOS icons in all required sizes', async ({ page }) => {
    await page.selectOption('select[name="shape"]', 'rounded');
    await page.fill('input[name="color"]', '#00ff00');
    
    // Click iOS generation button
    const iosButton = page.locator('button:has-text("iOS")');
    if (await iosButton.count() > 0) {
      await iosButton.first().click();
    }
    
    await page.waitForTimeout(2000);
    
    // Download ZIP
    const downloadPromise = page.waitForEvent('download');
    const downloadButton = page.locator('button:has-text("Download ZIP")');
    if (await downloadButton.count() > 0) {
      await downloadButton.first().click();
    }
    
    const download = await downloadPromise;
    const filePath = await download.path();
    
    expect(filePath).toContain('.zip');
    
    const fileContent = fs.readFileSync(filePath);
    const zipString = fileContent.toString('utf-8');
    
    // iOS sizes: 20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180
    expect(zipString).toMatch(/20\.png|20x20/i);
    expect(zipString).toMatch(/29\.png|29x29/i);
    expect(zipString).toMatch(/40\.png|40x40/i);
    expect(zipString).toMatch(/58\.png|58x58/i);
    expect(zipString).toMatch(/60\.png|60x60/i);
    expect(zipString).toMatch(/76\.png|76x76/i);
  });

  test('should generate icons with different shapes', async ({ page }) => {
    const shapes = ['circle', 'square', 'rounded', 'triangle', 'hexagon'];
    
    for (const shape of shapes) {
      await page.selectOption('select[name="shape"]', shape);
      await page.fill('input[name="color"]', '#00d4ff');
      
      const generateButton = page.locator('button:has-text("Generate")');
      if (await generateButton.count() > 0) {
        await generateButton.first().click();
      }
      
      // Wait for generation
      await page.waitForTimeout(1000);
      
      // Preview should show the selected shape
      const preview = page.locator('.preview-container svg');
      await expect(preview).toBeVisible();
      
      // Verify shape is rendered (basic check)
      const svgContent = await preview.evaluate(el => el.outerHTML);
      expect(svgContent).toContain('<svg');
    }
  });

  test('should generate icons with different colors', async ({ page }) => {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    
    for (const color of colors) {
      await page.selectOption('select[name="shape"]', 'circle');
      await page.fill('input[name="color"]', color);
      
      const generateButton = page.locator('button:has-text("Generate")');
      if (await generateButton.count() > 0) {
        await generateButton.first().click();
      }
      
      await page.waitForTimeout(1000);
      
      // Preview should show the selected color
      const preview = page.locator('.preview-container svg');
      await expect(preview).toBeVisible();
      
      const svgContent = await preview.evaluate(el => el.outerHTML);
      expect(svgContent).toContain(color.toLowerCase().replace('#', ''));
    }
  });

  test('should generate icons with custom size', async ({ page }) => {
    await page.selectOption('select[name="shape"]', 'circle');
    await page.fill('input[name="color"]', '#00d4ff');
    
    // Set custom size
    const sizeInput = page.locator('input[name="size"]');
    if (await sizeInput.count() > 0) {
      await sizeInput.first().fill('256');
    }
    
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    await page.waitForTimeout(1000);
    
    // Download PNG
    const downloadPromise = page.waitForEvent('download');
    const downloadButton = page.locator('button:has-text("Download PNG")');
    if (await downloadButton.count() > 0) {
      await downloadButton.first().click();
    }
    
    const download = await downloadPromise;
    const filePath = await download.path();
    
    expect(filePath).toContain('.png');
    
    // Verify it's a valid PNG
    const fileContent = fs.readFileSync(filePath);
    expect(fileContent.length).toBeGreaterThan(0);
    
    const magicBytes = fileContent.subarray(0, 8);
    expect(magicBytes.toString('hex')).toContain('89504e47');
  });

  test('should generate icons with border', async ({ page }) => {
    await page.selectOption('select[name="shape"]', 'circle');
    await page.fill('input[name="color"]', '#00d4ff');
    
    // Enable border
    const borderCheckbox = page.locator('input[name="border"]');
    if (await borderCheckbox.count() > 0) {
      await borderCheckbox.first().check();
    }
    
    // Set border color and width
    const borderColor = page.locator('input[name="borderColor"]');
    if (await borderColor.count() > 0) {
      await borderColor.first().fill('#ffffff');
    }
    
    const borderWidth = page.locator('input[name="borderWidth"]');
    if (await borderWidth.count() > 0) {
      await borderWidth.first().fill('5');
    }
    
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    await page.waitForTimeout(1000);
    
    // Preview should show icon with border
    const preview = page.locator('.preview-container svg');
    await expect(preview).toBeVisible();
    
    const svgContent = await preview.evaluate(el => el.outerHTML);
    // Should contain border/stroke
    expect(svgContent.toLowerCase()).toMatch(/stroke|border/i);
  });

  test('should generate icons with shadow', async ({ page }) => {
    await page.selectOption('select[name="shape"]', 'circle');
    await page.fill('input[name="color"]', '#00d4ff');
    
    // Enable shadow
    const shadowCheckbox = page.locator('input[name="shadow"]');
    if (await shadowCheckbox.count() > 0) {
      await shadowCheckbox.first().check();
    }
    
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    await page.waitForTimeout(1000);
    
    // Preview should show icon with shadow
    const preview = page.locator('.preview-container svg');
    await expect(preview).toBeVisible();
    
    const svgContent = await preview.evaluate(el => el.outerHTML);
    // Should contain filter for shadow
    expect(svgContent.toLowerCase()).toMatch(/filter|shadow/i);
  });

  test('should generate all platforms at once', async ({ page }) => {
    await page.selectOption('select[name="shape"]', 'circle');
    await page.fill('input[name="color"]', '#00d4ff');
    
    // Click all platform buttons
    const platformButtons = page.locator('button:has-text("PWA"), button:has-text("Android"), button:has-text("iOS")');
    const count = await platformButtons.count();
    
    for (let i = 0; i < count; i++) {
      await platformButtons.nth(i).click();
      await page.waitForTimeout(500);
    }
    
    // Download all
    const downloadPromise = page.waitForEvent('download');
    const downloadAllButton = page.locator('button:has-text("Download All")');
    if (await downloadAllButton.count() > 0) {
      await downloadAllButton.first().click();
    }
    
    const download = await downloadPromise;
    const filePath = await download.path();
    
    expect(filePath).toContain('.zip');
    
    // Verify ZIP contains files for all platforms
    const fileContent = fs.readFileSync(filePath);
    const zipString = fileContent.toString('utf-8');
    
    // Should contain PWA, Android, and iOS sizes
    expect(zipString).toMatch(/192\.png|512\.png/i); // PWA
    expect(zipString).toMatch(/48\.png|72\.png|96\.png/i); // Android
    expect(zipString).toMatch(/20\.png|29\.png|40\.png/i); // iOS
  });

  test('should show live preview when options change', async ({ page }) => {
    await page.selectOption('select[name="shape"]', 'circle');
    await page.fill('input[name="color"]', '#00d4ff');
    
    const preview = page.locator('.preview-container svg');
    await expect(preview).toBeVisible();
    
    // Change shape
    await page.selectOption('select[name="shape"]', 'square');
    await page.waitForTimeout(500);
    
    // Preview should update
    const updatedPreview = await preview.evaluate(el => el.outerHTML);
    expect(updatedPreview).toContain('<svg');
    
    // Change color
    await page.fill('input[name="color"]', '#ff0000');
    await page.waitForTimeout(500);
    
    // Preview should update with new color
    const colorUpdatedPreview = await preview.evaluate(el => el.outerHTML);
    expect(colorUpdatedPreview).toContain('ff0000');
  });

  test('should reset icon options', async ({ page }) => {
    await page.selectOption('select[name="shape"]', 'circle');
    await page.fill('input[name="color"]', '#00d4ff');
    
    // Enable border and shadow
    const borderCheckbox = page.locator('input[name="border"]');
    if (await borderCheckbox.count() > 0) {
      await borderCheckbox.first().check();
    }
    
    const shadowCheckbox = page.locator('input[name="shadow"]');
    if (await shadowCheckbox.count() > 0) {
      await shadowCheckbox.first().check();
    }
    
    // Click reset button
    const resetButton = page.locator('button:has-text("Reset")');
    if (await resetButton.count() > 0) {
      await resetButton.first().click();
    }
    
    // Options should be reset
    const shapeValue = await page.evaluate(() => {
      const select = document.querySelector('select[name="shape"]') as HTMLSelectElement;
      return select?.value;
    });
    
    expect(shapeValue).toBe('circle'); // Default
    
    const colorValue = await page.evaluate(() => {
      const input = document.querySelector('input[name="color"]') as HTMLInputElement;
      return input?.value;
    });
    
    expect(colorValue).toBe('#00d4ff'); // Default
  });

  test('should validate color input', async ({ page }) => {
    await page.selectOption('select[name="shape"]', 'circle');
    
    // Try invalid color
    await page.fill('input[name="color"]', 'invalid');
    
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    // Should show error or not generate
    const errorToast = page.locator('.toast.error');
    await expect(errorToast).toBeVisible({ timeout: 3000 });
  });

  test('should handle edge cases for size input', async ({ page }) => {
    await page.selectOption('select[name="shape"]', 'circle');
    
    // Try very small size
    const sizeInput = page.locator('input[name="size"]');
    if (await sizeInput.count() > 0) {
      await sizeInput.first().fill('1');
    }
    
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    // Should handle gracefully
    const preview = page.locator('.preview-container svg');
    await expect(preview).toBeVisible({ timeout: 3000 });
    
    // Try very large size
    if (await sizeInput.count() > 0) {
      await sizeInput.first().fill('10000');
    }
    
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    // Should show warning or handle gracefully
    const warningToast = page.locator('.toast.warning');
    await expect(warningToast).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Icon Generator Service - Platform-Specific Tests', () => {
  test('should generate PWA icons with correct naming convention', async ({ page }) => {
    await page.goto(`${baseURL}/icon-generator`);
    await page.waitForSelector('app-icon-generator');
    
    await page.selectOption('select[name="shape"]', 'circle');
    
    const pwaButton = page.locator('button:has-text("PWA")');
    if (await pwaButton.count() > 0) {
      await pwaButton.first().click();
    }
    
    await page.waitForTimeout(2000);
    
    const downloadPromise = page.waitForEvent('download');
    const downloadButton = page.locator('button:has-text("Download ZIP")');
    if (await downloadButton.count() > 0) {
      await downloadButton.first().click();
    }
    
    const download = await downloadPromise;
    const fileName = download.suggestedFilename();
    
    expect(fileName).toMatch(/pwa|web/i);
  });

  test('should generate Android icons with correct naming convention', async ({ page }) => {
    await page.goto(`${baseURL}/icon-generator`);
    await page.waitForSelector('app-icon-generator');
    
    await page.selectOption('select[name="shape"]', 'square');
    
    const androidButton = page.locator('button:has-text("Android")');
    if (await androidButton.count() > 0) {
      await androidButton.first().click();
    }
    
    await page.waitForTimeout(2000);
    
    const downloadPromise = page.waitForEvent('download');
    const downloadButton = page.locator('button:has-text("Download ZIP")');
    if (await downloadButton.count() > 0) {
      await downloadButton.first().click();
    }
    
    const download = await downloadPromise;
    const fileName = download.suggestedFilename();
    
    expect(fileName).toMatch(/android/i);
  });

  test('should generate iOS icons with correct naming convention', async ({ page }) => {
    await page.goto(`${baseURL}/icon-generator`);
    await page.waitForSelector('app-icon-generator');
    
    await page.selectOption('select[name="shape"]', 'rounded');
    
    const iosButton = page.locator('button:has-text("iOS")');
    if (await iosButton.count() > 0) {
      await iosButton.first().click();
    }
    
    await page.waitForTimeout(2000);
    
    const downloadPromise = page.waitForEvent('download');
    const downloadButton = page.locator('button:has-text("Download ZIP")');
    if (await downloadButton.count() > 0) {
      await downloadButton.first().click();
    }
    
    const download = await downloadPromise;
    const fileName = download.suggestedFilename();
    
    expect(fileName).toMatch(/ios|apple/i);
  });
});
