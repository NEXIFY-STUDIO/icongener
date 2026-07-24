/**
 * E2E Tests for Download Service
 * Tests file download functionality across all generators
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Helper to wait for download and verify file
async function waitForDownload(page, downloadName: string, timeout = 10000): Promise<string> {
  const downloadPath = await page.waitForEvent('download', { timeout });
  const filePath = await downloadPath.path();
  
  // Wait for file to be written
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return filePath;
}

test.describe('Download Service E2E Tests', () => {
  let baseURL: string;
  let tempDir: string;

  test.beforeAll(async () => {
    baseURL = process.env.BASE_URL || 'http://localhost:3000';
    tempDir = path.join(__dirname, 'downloads');
    
    // Create temp directory for downloads
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  test.afterAll(() => {
    // Clean up downloads
    try {
      const files = fs.readdirSync(tempDir);
      for (const file of files) {
        fs.unlinkSync(path.join(tempDir, file));
      }
      fs.rmdirSync(tempDir);
    } catch (error) {
      console.log('Could not clean up downloads:', error);
    }
  });

  test('should download PNG file from Icon Generator', async ({ page }) => {
    await page.goto(`${baseURL}/icon-generator`);
    
    // Wait for component to load
    await page.waitForSelector('app-icon-generator');
    
    // Set some options
    await page.selectOption('select[name="shape"]', 'circle');
    await page.fill('input[name="color"]', '#00d4ff');
    
    // Click download button
    const downloadPromise = page.waitForEvent('download');
    const downloadButton = page.locator('button:has-text("Download PNG")');
    if (await downloadButton.count() > 0) {
      await downloadButton.first().click();
    }
    
    // Wait for download
    const download = await downloadPromise;
    const filePath = await download.path();
    
    // Verify file exists and has content
    expect(filePath).toBeTruthy();
    const fileContent = fs.readFileSync(filePath);
    expect(fileContent.length).toBeGreaterThan(0);
    
    // Verify it's a PNG file (check magic bytes)
    const magicBytes = fileContent.subarray(0, 8);
    expect(magicBytes.toString('hex')).toContain('89504e470d0a1a0a'); // PNG magic number
  });

  test('should download SVG file from Icon Generator', async ({ page }) => {
    await page.goto(`${baseURL}/icon-generator`);
    
    await page.waitForSelector('app-icon-generator');
    
    // Click SVG download button
    const downloadPromise = page.waitForEvent('download');
    const downloadButton = page.locator('button:has-text("Download SVG")');
    if (await downloadButton.count() > 0) {
      await downloadButton.first().click();
    }
    
    const download = await downloadPromise;
    const filePath = await download.path();
    
    expect(filePath).toBeTruthy();
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    expect(fileContent).toContain('<svg');
    expect(fileContent).toContain('</svg>');
  });

  test('should download ZIP file with multiple sizes from Favicon Generator', async ({ page }) => {
    await page.goto(`${baseURL}/favicon-generator`);
    
    await page.waitForSelector('app-favicon-generator');
    
    // Select multiple sizes
    await page.check('input[type="checkbox"]:has-text("16x16")');
    await page.check('input[type="checkbox"]:has-text("32x32")');
    await page.check('input[type="checkbox"]:has-text("48x48")');
    
    // Click download ZIP button
    const downloadPromise = page.waitForEvent('download');
    const downloadButton = page.locator('button:has-text("Download ZIP")');
    if (await downloadButton.count() > 0) {
      await downloadButton.first().click();
    }
    
    const download = await downloadPromise;
    const filePath = await download.path();
    
    expect(filePath).toBeTruthy();
    expect(filePath).toContain('.zip');
    
    // Verify ZIP file has content
    const fileContent = fs.readFileSync(filePath);
    expect(fileContent.length).toBeGreaterThan(0);
    
    // Verify it's a ZIP file (check magic bytes)
    const magicBytes = fileContent.subarray(0, 4);
    expect(magicBytes.toString('hex')).toContain('504b'); // ZIP magic number
  });

  test('should download ICO file from Favicon Generator', async ({ page }) => {
    await page.goto(`${baseURL}/favicon-generator`);
    
    await page.waitForSelector('app-favicon-generator');
    
    // Click ICO download button
    const downloadPromise = page.waitForEvent('download');
    const downloadButton = page.locator('button:has-text("Download ICO")');
    if (await downloadButton.count() > 0) {
      await downloadButton.first().click();
    }
    
    const download = await downloadPromise;
    const filePath = await download.path();
    
    expect(filePath).toBeTruthy();
    expect(filePath).toContain('.ico');
    
    const fileContent = fs.readFileSync(filePath);
    expect(fileContent.length).toBeGreaterThan(0);
  });

  test('should download Banner as PNG', async ({ page }) => {
    await page.goto(`${baseURL}/banner-generator`);
    
    await page.waitForSelector('app-banner-generator');
    
    // Set banner options
    await page.fill('input[name="width"]', '800');
    await page.fill('input[name="height"]', '400');
    
    // Click download button
    const downloadPromise = page.waitForEvent('download');
    const downloadButton = page.locator('button:has-text("Download")');
    if (await downloadButton.count() > 0) {
      await downloadButton.first().click();
    }
    
    const download = await downloadPromise;
    const filePath = await download.path();
    
    expect(filePath).toBeTruthy();
    const fileContent = fs.readFileSync(filePath);
    expect(fileContent.length).toBeGreaterThan(0);
    
    // Verify PNG
    const magicBytes = fileContent.subarray(0, 8);
    expect(magicBytes.toString('hex')).toContain('89504e47');
  });

  test('should download PNG to HTML conversion result', async ({ page }) => {
    await page.goto(`${baseURL}/png-to-html`);
    
    await page.waitForSelector('app-png-to-html');
    
    // Upload a test image (we'll use a data URL)
    const testImage = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG header
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 image
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
      0x54, 0x08, 0xD7, 0x63, 0x60, 0x00, 0x00, 0x00,
      0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33, 0x00,
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
      0x42, 0x60, 0x82
    ]);
    
    // Create a temporary test file
    const testFilePath = path.join(tempDir, 'test.png');
    fs.writeFileSync(testFilePath, testImage);
    
    // Upload the file
    await page.setInputFiles('input[type="file"]', testFilePath);
    
    // Wait for processing
    await page.waitForTimeout(2000);
    
    // Click download HTML button
    const downloadPromise = page.waitForEvent('download');
    const downloadButton = page.locator('button:has-text("Download HTML")');
    if (await downloadButton.count() > 0) {
      await downloadButton.first().click();
    }
    
    const download = await downloadPromise;
    const filePath = await download.path();
    
    expect(filePath).toBeTruthy();
    expect(filePath).toContain('.html');
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    expect(fileContent).toContain('<html');
    expect(fileContent).toContain('<style');
    expect(fileContent).toContain('</html>');
  });

  test('should download CSS file from PNG to HTML', async ({ page }) => {
    await page.goto(`${baseURL}/png-to-html`);
    
    await page.waitForSelector('app-png-to-html');
    
    // Upload test image
    const testImage = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xDE, 0x00
    ]);
    
    const testFilePath = path.join(tempDir, 'test2.png');
    fs.writeFileSync(testFilePath, testImage);
    
    await page.setInputFiles('input[type="file"]', testFilePath);
    await page.waitForTimeout(2000);
    
    // Click download CSS button
    const downloadPromise = page.waitForEvent('download');
    const downloadButton = page.locator('button:has-text("Download CSS")');
    if (await downloadButton.count() > 0) {
      await downloadButton.first().click();
    }
    
    const download = await downloadPromise;
    const filePath = await download.path();
    
    expect(filePath).toBeTruthy();
    expect(filePath).toContain('.css');
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    expect(fileContent).toContain('.pixel');
    expect(fileContent).toContain('{');
    expect(fileContent).toContain('}');
  });

  test('should handle download errors gracefully', async ({ page }) => {
    await page.goto(`${baseURL}/icon-generator`);
    
    // Try to download without generating anything first
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 });
    const downloadButton = page.locator('button:has-text("Download PNG")');
    
    if (await downloadButton.count() > 0) {
      await downloadButton.first().click();
    }
    
    // Should either download or show error
    try {
      await downloadPromise;
      // Download succeeded
    } catch (error) {
      // No download occurred - check for error message
      const errorToast = page.locator('.toast.error, .alert.error');
      await expect(errorToast).toBeVisible({ timeout: 2000 });
    }
  });

  test('should show download progress indicator', async ({ page }) => {
    await page.goto(`${baseURL}/banner-generator`);
    
    await page.waitForSelector('app-banner-generator');
    
    // Set large banner size
    await page.fill('input[name="width"]', '2000');
    await page.fill('input[name="height"]', '1000');
    
    // Click download
    const downloadPromise = page.waitForEvent('download');
    const downloadButton = page.locator('button:has-text("Download")');
    if (await downloadButton.count() > 0) {
      await downloadButton.first().click();
    }
    
    // Should show progress or loading state
    const progressBar = page.locator('.progress-bar, .loading');
    await expect(progressBar).toBeVisible({ timeout: 3000 });
    
    await downloadPromise;
  });
});

test.describe('Download Service - File Naming Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/icon-generator');
  });

  test('should generate correct file names for PNG downloads', async ({ page }) => {
    await page.waitForSelector('app-icon-generator');
    
    // Set specific options
    await page.selectOption('select[name="shape"]', 'square');
    await page.fill('input[name="color"]', '#ff0000');
    
    const downloadPromise = page.waitForEvent('download');
    const downloadButton = page.locator('button:has-text("Download PNG")');
    if (await downloadButton.count() > 0) {
      await downloadButton.first().click();
    }
    
    const download = await downloadPromise;
    const fileName = download.suggestedFilename();
    
    expect(fileName).toContain('.png');
    expect(fileName).toMatch(/^[a-zA-Z0-9\-_]+\.png$/);
  });

  test('should generate correct file names for SVG downloads', async ({ page }) => {
    await page.waitForSelector('app-icon-generator');
    
    const downloadPromise = page.waitForEvent('download');
    const downloadButton = page.locator('button:has-text("Download SVG")');
    if (await downloadButton.count() > 0) {
      await downloadButton.first().click();
    }
    
    const download = await downloadPromise;
    const fileName = download.suggestedFilename();
    
    expect(fileName).toContain('.svg');
  });
});
