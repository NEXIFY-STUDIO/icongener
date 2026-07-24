/**
 * E2E Tests for Toast Service
 * Tests toast notifications across all features
 */

import { test, expect } from '@playwright/test';

test.describe('Toast Service E2E Tests', () => {
  let baseURL: string;

  test.beforeAll(async () => {
    baseURL = process.env.BASE_URL || 'http://localhost:3000';
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/`);
    // Clear all toasts before each test
    await page.evaluate(() => {
      const toasts = document.querySelectorAll('.toast');
      toasts.forEach(toast => toast.remove());
    });
  });

  test('should show success toast when icon is generated', async ({ page }) => {
    await page.goto(`${baseURL}/icon-generator`);
    
    await page.waitForSelector('app-icon-generator');
    
    // Set options and generate
    await page.selectOption('select[name="shape"]', 'circle');
    await page.fill('input[name="color"]', '#00d4ff');
    
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    // Should show success toast
    const successToast = page.locator('.toast.success, .toast:has-text("Success")');
    await expect(successToast).toBeVisible({ timeout: 5000 });
    
    // Toast should contain success message
    const toastText = await successToast.textContent();
    expect(toastText).toContain('Success');
  });

  test('should show success toast when favicon is generated', async ({ page }) => {
    await page.goto(`${baseURL}/favicon-generator`);
    
    await page.waitForSelector('app-favicon-generator');
    
    // Select some sizes and generate
    await page.check('input[type="checkbox"]:has-text("16x16")');
    await page.check('input[type="checkbox"]:has-text("32x32")');
    
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    // Should show success toast
    const successToast = page.locator('.toast.success');
    await expect(successToast).toBeVisible({ timeout: 5000 });
  });

  test('should show success toast when banner is generated', async ({ page }) => {
    await page.goto(`${baseURL}/banner-generator`);
    
    await page.waitForSelector('app-banner-generator');
    
    // Set dimensions and generate
    await page.fill('input[name="width"]', '800');
    await page.fill('input[name="height"]', '400');
    
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    // Should show success toast
    const successToast = page.locator('.toast.success');
    await expect(successToast).toBeVisible({ timeout: 5000 });
  });

  test('should show success toast when PNG is converted to HTML', async ({ page }) => {
    await page.goto(`${baseURL}/png-to-html`);
    
    await page.waitForSelector('app-png-to-html');
    
    // Upload a test image
    const testImage = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xDE, 0x00
    ]);
    
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const testFilePath = path.join(tempDir, 'test-toast.png');
    fs.writeFileSync(testFilePath, testImage);
    
    await page.setInputFiles('input[type="file"]', testFilePath);
    
    // Wait for processing
    await page.waitForTimeout(2000);
    
    // Should show success toast
    const successToast = page.locator('.toast.success');
    await expect(successToast).toBeVisible({ timeout: 5000 });
    
    // Clean up
    fs.unlinkSync(testFilePath);
    fs.rmdirSync(tempDir);
  });

  test('should show error toast when invalid input is provided', async ({ page }) => {
    await page.goto(`${baseURL}/icon-generator`);
    
    await page.waitForSelector('app-icon-generator');
    
    // Try to generate with invalid color
    await page.fill('input[name="color"]', 'invalid-color-format');
    
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    // Should show error toast
    const errorToast = page.locator('.toast.error, .toast:has-text("Error")');
    await expect(errorToast).toBeVisible({ timeout: 3000 });
  });

  test('should show error toast when file upload fails', async ({ page }) => {
    await page.goto(`${baseURL}/png-to-html`);
    
    await page.waitForSelector('app-png-to-html');
    
    // Try to upload a non-image file
    const testFile = Buffer.from('This is not an image file');
    
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const testFilePath = path.join(tempDir, 'test.txt');
    fs.writeFileSync(testFilePath, testFile);
    
    await page.setInputFiles('input[type="file"]', testFilePath);
    
    // Should show error toast
    const errorToast = page.locator('.toast.error');
    await expect(errorToast).toBeVisible({ timeout: 3000 });
    
    // Clean up
    fs.unlinkSync(testFilePath);
    fs.rmdirSync(tempDir);
  });

  test('should show info toast for informational messages', async ({ page }) => {
    await page.goto(`${baseURL}/settings`);
    
    await page.waitForSelector('app-settings');
    
    // Change language (should show info toast)
    const languageSelect = page.locator('select[name="language"]');
    if (await languageSelect.count() > 0) {
      await languageSelect.first().selectOption('sk');
    }
    
    // Should show info toast
    const infoToast = page.locator('.toast.info, .toast:has-text("Language")');
    await expect(infoToast).toBeVisible({ timeout: 3000 });
  });

  test('should show warning toast for warnings', async ({ page }) => {
    await page.goto(`${baseURL}/banner-generator`);
    
    await page.waitForSelector('app-banner-generator');
    
    // Try to set very large dimensions (should show warning)
    await page.fill('input[name="width"]', '10000');
    await page.fill('input[name="height"]', '10000');
    
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    // Should show warning toast
    const warningToast = page.locator('.toast.warning, .toast:has-text("Warning")');
    await expect(warningToast).toBeVisible({ timeout: 3000 });
  });

  test('should auto-dismiss toast after timeout', async ({ page }) => {
    await page.goto(`${baseURL}/icon-generator`);
    
    await page.waitForSelector('app-icon-generator');
    
    // Generate to show toast
    await page.selectOption('select[name="shape"]', 'square');
    
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    // Wait for toast to appear
    const successToast = page.locator('.toast.success');
    await expect(successToast).toBeVisible({ timeout: 5000 });
    
    // Wait for auto-dismiss (default timeout is 3000ms)
    await page.waitForTimeout(3500);
    
    // Toast should be gone
    await expect(successToast).not.toBeVisible({ timeout: 1000 });
  });

  test('should allow manual dismissal of toast', async ({ page }) => {
    await page.goto(`${baseURL}/icon-generator`);
    
    await page.waitForSelector('app-icon-generator');
    
    // Generate to show toast
    await page.selectOption('select[name="shape"]', 'triangle');
    
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    // Wait for toast to appear
    const successToast = page.locator('.toast.success');
    await expect(successToast).toBeVisible({ timeout: 5000 });
    
    // Click close button
    const closeButton = page.locator('.toast .close, .toast button');
    if (await closeButton.count() > 0) {
      await closeButton.first().click();
    }
    
    // Toast should be gone immediately
    await expect(successToast).not.toBeVisible({ timeout: 1000 });
  });

  test('should show toast with correct message content', async ({ page }) => {
    await page.goto(`${baseURL}/icon-generator`);
    
    await page.waitForSelector('app-icon-generator');
    
    // Generate icon
    await page.selectOption('select[name="shape"]', 'circle');
    
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    // Wait for toast
    const successToast = page.locator('.toast.success');
    await expect(successToast).toBeVisible({ timeout: 5000 });
    
    // Check message content
    const toastText = await successToast.textContent();
    expect(toastText).toMatch(/success|generated|icon/i);
  });

  test('should show multiple toasts for multiple actions', async ({ page }) => {
    await page.goto(`${baseURL}/icon-generator`);
    
    await page.waitForSelector('app-icon-generator');
    
    // Generate multiple times quickly
    for (let i = 0; i < 3; i++) {
      await page.selectOption('select[name="shape"]', ['circle', 'square', 'triangle'][i]);
      
      const generateButton = page.locator('button:has-text("Generate")');
      if (await generateButton.count() > 0) {
        await generateButton.first().click();
      }
      
      await page.waitForTimeout(500);
    }
    
    // Should show multiple toasts
    const toasts = page.locator('.toast');
    await expect(toasts).toHaveCount(3, { timeout: 3000 });
  });

  test('should position toasts in correct location', async ({ page }) => {
    await page.goto(`${baseURL}/icon-generator`);
    
    await page.waitForSelector('app-icon-generator');
    
    // Generate to show toast
    await page.selectOption('select[name="shape"]', 'circle');
    
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    // Wait for toast
    const successToast = page.locator('.toast.success');
    await expect(successToast).toBeVisible({ timeout: 5000 });
    
    // Check position (should be bottom-right by default)
    const toastBox = await successToast.boundingBox();
    expect(toastBox).toBeTruthy();
    
    // Should be in bottom-right quadrant
    const viewport = page.viewportSize;
    if (toastBox && viewport) {
      expect(toastBox.x).toBeGreaterThan(viewport.width * 0.5);
      expect(toastBox.y).toBeGreaterThan(viewport.height * 0.5);
    }
  });

  test('should show toast with correct styling', async ({ page }) => {
    await page.goto(`${baseURL}/icon-generator`);
    
    await page.waitForSelector('app-icon-generator');
    
    // Generate to show toast
    await page.selectOption('select[name="shape"]', 'circle');
    
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    // Wait for toast
    const successToast = page.locator('.toast.success');
    await expect(successToast).toBeVisible({ timeout: 5000 });
    
    // Check styling
    const backgroundColor = await successToast.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    // Should have a background color
    expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(backgroundColor).not.toBe('');
  });

  test('should show download success toast when file is downloaded', async ({ page }) => {
    await page.goto(`${baseURL}/icon-generator`);
    
    await page.waitForSelector('app-icon-generator');
    
    // Generate and download
    await page.selectOption('select[name="shape"]', 'circle');
    
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    await page.waitForTimeout(1000);
    
    // Click download
    const downloadPromise = page.waitForEvent('download');
    const downloadButton = page.locator('button:has-text("Download PNG")');
    if (await downloadButton.count() > 0) {
      await downloadButton.first().click();
    }
    
    await downloadPromise;
    
    // Should show download success toast
    const downloadToast = page.locator('.toast:has-text("Download")');
    await expect(downloadToast).toBeVisible({ timeout: 3000 });
  });
});

// Import required modules
import path from 'path';
import fs from 'fs';
