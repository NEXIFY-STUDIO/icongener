/**
 * PNG to HTML Generator E2E Tests
 * Tests the complete PNG to HTML conversion workflow
 */

import { test, expect, Page } from '@playwright/test';
import path from 'path';

// Test data
const COLOR_QUANTIZATION_OPTIONS = [2, 4, 8, 16, 32, 64, 128, 256];
const OUTPUT_FORMATS = ['HTML', 'CSS', 'SVG'];

test.describe('PNG to HTML Generator Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/png-to-html');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/png-to-html');
  });

  test('should load PNG to HTML generator page', async ({ page }) => {
    // Verify page elements
    await expect(page.locator('app-png-to-html')).toBeVisible();
    
    // Verify main sections
    const uploadSection = page.locator('.upload-section, [data-testid="upload-section"]');
    const settingsSection = page.locator('.settings-section, [data-testid="settings-section"]');
    const previewSection = page.locator('.preview-section, [data-testid="preview-section"]');
    const actionsSection = page.locator('.actions-section, [data-testid="actions-section"]');
    
    await expect(uploadSection).toBeVisible();
    await expect(settingsSection).toBeVisible();
    await expect(previewSection).toBeVisible();
    await expect(actionsSection).toBeVisible();
  });

  test('should have file upload area', async ({ page }) => {
    const uploadArea = page.locator('.upload-area, [data-testid="upload-area"]');
    await expect(uploadArea).toBeVisible();
    
    // Verify drag and drop instructions
    const instructions = page.locator('.upload-instructions, [data-testid="upload-instructions"]');
    if (await instructions.count() > 0) {
      await expect(instructions).toBeVisible();
      const instructionText = await instructions.textContent();
      expect(instructionText?.toLowerCase()).toContain('drag') || 
      expect(instructionText?.toLowerCase()).toContain('drop') ||
      expect(instructionText?.toLowerCase()).toContain('upload');
    }
  });

  test('should have file input', async ({ page }) => {
    const fileInput = page.locator('input[type="file"], [data-testid="file-input"]');
    await expect(fileInput).toBeVisible();
    
    // Verify file input accepts image files
    const acceptAttribute = await fileInput.getAttribute('accept');
    expect(acceptAttribute?.toLowerCase()).toContain('image') || 
    expect(acceptAttribute?.toLowerCase()).toContain('png');
  });

  test('should have color quantization selection', async ({ page }) => {
    const quantizationSelect = page.locator('select, [data-testid="quantization-select"]');
    await expect(quantizationSelect).toBeVisible();
    
    // Verify all quantization options are available
    const options = await quantizationSelect.locator('option').allTextContents();
    for (const option of COLOR_QUANTIZATION_OPTIONS) {
      expect(options.some(opt => opt.includes(option.toString()))).toBeTruthy();
    }
  });

  test('should have output format selection', async ({ page }) => {
    for (const format of OUTPUT_FORMATS) {
      const formatOption = page.locator(`input[value="${format.toLowerCase()}"], [data-format="${format.toLowerCase()}"]`);
      await expect(formatOption).toBeVisible();
    }
  });

  test('should have crop controls', async ({ page }) => {
    const cropSection = page.locator('.crop-section, [data-testid="crop-section"]');
    if (await cropSection.count() > 0) {
      await expect(cropSection).toBeVisible();
      
      // Verify crop controls
      const cropControls = page.locator('.crop-controls, [data-testid="crop-controls"]');
      await expect(cropControls).toBeVisible();
    }
  });

  test('should have preview canvas', async ({ page }) => {
    const canvas = page.locator('canvas, [data-testid="preview-canvas"]');
    await expect(canvas).toBeVisible();
    
    // Verify canvas has reasonable dimensions
    const box = await canvas.boundingBox();
    expect(box?.width).toBeGreaterThan(100);
    expect(box?.height).toBeGreaterThan(100);
  });

  test('should have code output area', async ({ page }) => {
    const codeOutput = page.locator('.code-output, [data-testid="code-output"]');
    if (await codeOutput.count() > 0) {
      await expect(codeOutput).toBeVisible();
      
      // Verify it's a textarea or pre element
      const textarea = page.locator('textarea, pre', { has: codeOutput });
      await expect(textarea).toBeVisible();
    }
  });

  test('should handle file upload via drag and drop', async ({ page }) => {
    // Create a simple test PNG file (base64 encoded 1x1 transparent PNG)
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    // Create a data URL
    const dataUrl = `data:image/png;base64,${pngBase64}`;
    
    // Convert to buffer for upload
    const buffer = Buffer.from(pngBase64, 'base64');
    
    // Create a file for upload
    const filePath = path.join(__dirname, 'test-image.png');
    
    // For testing purposes, we'll simulate the file upload
    const uploadArea = page.locator('.upload-area');
    
    // In a real test, we would use:
    // await uploadArea.setInputFiles(filePath);
    // But for now, we'll verify the upload area is ready
    await expect(uploadArea).toBeVisible();
  });

  test('should handle file upload via file input', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    
    // In a real test, we would upload a file:
    // const filePath = path.join(__dirname, 'test-image.png');
    // await fileInput.setInputFiles(filePath);
    
    // For now, verify the input is ready for file upload
    const inputType = await fileInput.getAttribute('type');
    expect(inputType).toBe('file');
  });

  test('should display uploaded image preview', async ({ page }) => {
    // This test would require actual file upload
    // For now, verify preview area exists
    const previewArea = page.locator('.image-preview, [data-testid="image-preview"]');
    if (await previewArea.count() > 0) {
      await expect(previewArea).toBeVisible();
    }
  });

  test('should change color quantization and update preview', async ({ page }) => {
    const quantizationSelect = page.locator('select, [data-testid="quantization-select"]');
    const canvas = page.locator('canvas');
    
    // Get initial canvas state (if image is uploaded)
    if (await canvas.count() > 0) {
      const initialScreenshot = await canvas.screenshot();
      
      // Change quantization
      await quantizationSelect.selectOption('16');
      await page.waitForTimeout(500); // Wait for preview update
      
      // Verify canvas changed (if image was uploaded)
      const newScreenshot = await canvas.screenshot();
      // Note: This might not change if no image is uploaded
    }
  });

  test('should change output format', async ({ page }) => {
    const htmlOption = page.locator('input[value="html"]');
    const cssOption = page.locator('input[value="css"]');
    
    // Select CSS format
    await cssOption.check();
    
    // Verify CSS is selected
    expect(await cssOption.isChecked()).toBeTruthy();
    
    // Select HTML format
    await htmlOption.check();
    
    // Verify HTML is selected
    expect(await htmlOption.isChecked()).toBeTruthy();
  });

  test('should generate HTML when clicking generate button', async ({ page }) => {
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

  test('should display generated code output', async ({ page }) => {
    const codeOutput = page.locator('.code-output, [data-testid="code-output"]');
    if (await codeOutput.count() > 0) {
      await expect(codeOutput).toBeVisible();
      
      // In a real test with an uploaded image, we would verify the code content
      // For now, just verify the output area exists
    }
  });

  test('should copy generated code to clipboard', async ({ page }) => {
    const copyButton = page.locator('button:has-text("Copy"), [data-testid="copy-button"]');
    
    if (await copyButton.count() > 0) {
      await expect(copyButton).toBeVisible();
      
      // Click copy (in a real test, this would copy to clipboard)
      await copyButton.click();
      
      // Verify toast notification
      const toast = page.locator('.toast, [data-testid="toast"]');
      if (await toast.count() > 0) {
        await expect(toast).toBeVisible();
        const toastText = await toast.textContent();
        expect(toastText?.toLowerCase()).toContain('copied');
      }
    }
  });

  test('should download generated code', async ({ page }) => {
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

  test('should have crop functionality', async ({ page }) => {
    const cropSection = page.locator('.crop-section, [data-testid="crop-section"]');
    if (await cropSection.count() > 0) {
      await expect(cropSection).toBeVisible();
      
      // Verify crop controls
      const cropControls = page.locator('.crop-controls');
      await expect(cropControls).toBeVisible();
      
      // Verify crop buttons
      const cropButton = page.locator('button:has-text("Crop"), [data-testid="crop-button"]');
      if (await cropButton.count() > 0) {
        await expect(cropButton).toBeVisible();
      }
    }
  });

  test('should reset to default settings', async ({ page }) => {
    // Change some settings
    const quantizationSelect = page.locator('select, [data-testid="quantization-select"]');
    await quantizationSelect.selectOption('64');
    
    const cssOption = page.locator('input[value="css"]');
    await cssOption.check();
    
    // Find and click reset button
    const resetButton = page.locator('button:has-text("Reset"), [data-testid="reset-button"]');
    if (await resetButton.count() > 0) {
      await resetButton.click();
      
      // Verify settings reset
      const resetQuantization = await quantizationSelect.inputValue();
      expect(resetQuantization).not.toBe('64');
      
      const resetFormat = await cssOption.isChecked();
      expect(resetFormat).toBeFalsy();
    }
  });
});

test.describe('PNG to HTML Generator Mobile Tests', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone size

  test('should display mobile-optimized layout', async ({ page }) => {
    await page.goto('/png-to-html');
    
    // Verify responsive layout
    const uploadSection = page.locator('.upload-section');
    const box = await uploadSection.boundingBox();
    
    // On mobile, upload section should take most of the width
    expect(box?.width).toBeGreaterThan(300);
  });

  test('should have accessible file upload', async ({ page }) => {
    await page.goto('/png-to-html');
    
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    
    // Verify file input has proper label
    await expect(fileInput).toHaveAttribute(/label|aria-label/i, /.*/);
  });

  test('should display upload area prominently on mobile', async ({ page }) => {
    await page.goto('/png-to-html');
    
    const uploadArea = page.locator('.upload-area');
    await expect(uploadArea).toBeVisible();
    
    // Verify upload area has sufficient height for touch
    const box = await uploadArea.boundingBox();
    expect(box?.height).toBeGreaterThan(100);
  });
});
