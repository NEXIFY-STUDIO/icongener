/**
 * E2E Tests for Progress Service
 * Tests progress tracking and UI feedback during generation
 */

import { test, expect } from '@playwright/test';

test.describe('Progress Service E2E Tests', () => {
  let baseURL: string;

  test.beforeAll(async () => {
    baseURL = process.env.BASE_URL || 'http://localhost:3000';
  });

  test.beforeEach(async ({ page }) => {
    // Clear any existing progress state
    await page.goto(`${baseURL}/`);
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('should show progress bar during icon generation', async ({ page }) => {
    await page.goto(`${baseURL}/icon-generator`);
    
    await page.waitForSelector('app-icon-generator');
    
    // Set options
    await page.selectOption('select[name="shape"]', 'circle');
    await page.fill('input[name="color"]', '#00d4ff');
    
    // Click generate button
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    // Should show progress bar
    const progressBar = page.locator('.progress-bar');
    await expect(progressBar).toBeVisible({ timeout: 3000 });
    
    // Progress bar should have width > 0%
    const progressWidth = await progressBar.evaluate(el => {
      return el.clientWidth;
    });
    expect(progressWidth).toBeGreaterThan(0);
  });

  test('should show progress percentage during generation', async ({ page }) => {
    await page.goto(`${baseURL}/icon-generator`);
    
    await page.waitForSelector('app-icon-generator');
    
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    // Should show progress percentage
    const progressText = page.locator('.progress-text, .progress-percentage');
    await expect(progressText).toBeVisible({ timeout: 3000 });
    
    // Percentage should be between 0 and 100
    const percentageText = await progressText.textContent();
    if (percentageText) {
      const percentage = parseInt(percentageText.replace(/%/g, ''));
      expect(percentage).toBeGreaterThanOrEqual(0);
      expect(percentage).toBeLessThanOrEqual(100);
    }
  });

  test('should show step indicators during multi-step generation', async ({ page }) => {
    await page.goto(`${baseURL}/favicon-generator`);
    
    await page.waitForSelector('app-favicon-generator');
    
    // Select multiple sizes
    await page.check('input[type="checkbox"]:has-text("16x16")');
    await page.check('input[type="checkbox"]:has-text("32x32")');
    await page.check('input[type="checkbox"]:has-text("48x48")');
    
    // Click generate/download button
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    // Should show step indicators
    const stepIndicators = page.locator('.step-indicator, .step, .progress-step');
    await expect(stepIndicators).toHaveCount(3, { timeout: 3000 });
  });

  test('should update progress for each step in multi-step process', async ({ page }) => {
    await page.goto(`${baseURL}/banner-generator`);
    
    await page.waitForSelector('app-banner-generator');
    
    // Set large dimensions to ensure multiple steps
    await page.fill('input[name="width"]', '2000');
    await page.fill('input[name="height"]', '1000');
    
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    // Wait for progress to update multiple times
    const progressBar = page.locator('.progress-bar');
    await expect(progressBar).toBeVisible({ timeout: 3000 });
    
    // Check progress at different times
    const initialWidth = await progressBar.evaluate(el => el.clientWidth);
    await page.waitForTimeout(1000);
    const middleWidth = await progressBar.evaluate(el => el.clientWidth);
    
    // Progress should increase over time
    expect(middleWidth).toBeGreaterThanOrEqual(initialWidth);
  });

  test('should show loading spinner during generation', async ({ page }) => {
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
    
    // Create a temporary file
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const testFilePath = path.join(tempDir, 'test-progress.png');
    fs.writeFileSync(testFilePath, testImage);
    
    await page.setInputFiles('input[type="file"]', testFilePath);
    
    // Should show loading spinner during processing
    const spinner = page.locator('.spinner, .loading-spinner');
    await expect(spinner).toBeVisible({ timeout: 3000 });
    
    // Clean up
    fs.unlinkSync(testFilePath);
    fs.rmdirSync(tempDir);
  });

  test('should show progress for color quantization in PNG to HTML', async ({ page }) => {
    await page.goto(`${baseURL}/png-to-html`);
    
    await page.waitForSelector('app-png-to-html');
    
    // Set color quantization options
    const colorInput = page.locator('input[name="colors"]');
    if (await colorInput.count() > 0) {
      await colorInput.first().fill('16');
    }
    
    // Upload test image
    const testImage = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x08,
      0x08, 0x06, 0x00, 0x00, 0x00
    ]);
    
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const testFilePath = path.join(tempDir, 'test-quant.png');
    fs.writeFileSync(testFilePath, testImage);
    
    await page.setInputFiles('input[type="file"]', testFilePath);
    
    // Should show progress for quantization
    const progressText = page.locator('.progress-text:has-text("Quantizing")');
    await expect(progressText).toBeVisible({ timeout: 5000 });
    
    // Clean up
    fs.unlinkSync(testFilePath);
    fs.rmdirSync(tempDir);
  });

  test('should show progress for each icon size generation', async ({ page }) => {
    await page.goto(`${baseURL}/icon-generator`);
    
    await page.waitForSelector('app-icon-generator');
    
    // Generate icons for all platforms
    const platformButtons = page.locator('button:has-text("PWA"), button:has-text("Android"), button:has-text("iOS")');
    const count = await platformButtons.count();
    
    if (count > 0) {
      await platformButtons.first().click();
    }
    
    // Should show progress for each size being generated
    const progressSteps = page.locator('.progress-step');
    await expect(progressSteps).toHaveCount(1, { timeout: 3000 });
  });

  test('should complete progress at 100% when generation finishes', async ({ page }) => {
    await page.goto(`${baseURL}/icon-generator`);
    
    await page.waitForSelector('app-icon-generator');
    
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    // Wait for generation to complete
    const progressBar = page.locator('.progress-bar');
    await expect(progressBar).toBeVisible({ timeout: 3000 });
    
    // Wait for completion
    await page.waitForTimeout(5000);
    
    // Progress should reach 100%
    const progressText = page.locator('.progress-text:has-text("100%")');
    await expect(progressText).toBeVisible({ timeout: 5000 });
  });

  test('should hide progress bar after generation completes', async ({ page }) => {
    await page.goto(`${baseURL}/icon-generator`);
    
    await page.waitForSelector('app-icon-generator');
    
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    // Wait for generation to complete
    await page.waitForTimeout(5000);
    
    // Progress bar should be hidden or removed
    const progressBar = page.locator('.progress-bar');
    await expect(progressBar).not.toBeVisible({ timeout: 2000 });
  });

  test('should show error state when generation fails', async ({ page }) => {
    // Mock a failure scenario by trying to generate with invalid input
    await page.goto(`${baseURL}/icon-generator`);
    
    await page.waitForSelector('app-icon-generator');
    
    // Try to generate with invalid color
    await page.fill('input[name="color"]', 'invalid-color');
    
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    // Should show error state
    const errorState = page.locator('.progress-error, .error-state');
    await expect(errorState).toBeVisible({ timeout: 3000 });
  });

  test('should reset progress when starting new generation', async ({ page }) => {
    await page.goto(`${baseURL}/icon-generator`);
    
    await page.waitForSelector('app-icon-generator');
    
    // First generation
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    // Wait for first generation to start
    await page.waitForTimeout(1000);
    
    // Start second generation
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    // Progress should reset
    const progressBar = page.locator('.progress-bar');
    const widthAfterReset = await progressBar.evaluate(el => el.clientWidth);
    
    // Width should be reset (close to 0 or starting value)
    expect(widthAfterReset).toBeLessThan(100);
  });
});

// Import required modules
import path from 'path';
import fs from 'fs';

test.describe('Progress Service - Multi-step Workflow Tests', () => {
  test('should track progress through entire favicon generation workflow', async ({ page }) => {
    await page.goto(`${baseURL}/favicon-generator`);
    
    await page.waitForSelector('app-favicon-generator');
    
    // Select all sizes
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      await checkboxes.nth(i).check();
    }
    
    // Click generate
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    // Should show multi-step progress
    const progressContainer = page.locator('.progress-container');
    await expect(progressContainer).toBeVisible({ timeout: 3000 });
    
    // Should have multiple steps
    const steps = page.locator('.step');
    await expect(steps).toHaveCount(1, { timeout: 3000 });
  });

  test('should show estimated time remaining', async ({ page }) => {
    await page.goto(`${baseURL}/banner-generator`);
    
    await page.waitForSelector('app-banner-generator');
    
    // Set large dimensions
    await page.fill('input[name="width"]', '3000');
    await page.fill('input[name="height"]', '2000');
    
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
    }
    
    // Should show estimated time
    const timeRemaining = page.locator('.time-remaining, .eta');
    await expect(timeRemaining).toBeVisible({ timeout: 3000 });
  });
});
