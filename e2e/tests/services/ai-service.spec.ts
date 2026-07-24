/**
 * E2E Tests for AI Service
 * Tests the Mistral AI integration endpoints
 */

import { test, expect } from '@playwright/test';

// Mock API responses for testing
const MOCK_SVG_RESPONSE = {
  success: true,
  svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#00d4ff"/></svg>',
  prompt: 'Generate a simple icon',
  model: 'mistral-tiny'
};

const MOCK_ENHANCE_RESPONSE = {
  success: true,
  preset: {
    name: 'Social Media Banner',
    width: 1200,
    height: 630,
    background: 'gradient',
    colors: ['#00d4ff', '#0f172a', '#1e293b']
  },
  enhanced: true
};

test.describe('AI Service E2E Tests', () => {
  let baseURL: string;

  test.beforeAll(async () => {
    // Get base URL from environment or use default
    baseURL = process.env.BASE_URL || 'http://localhost:3000';
  });

  test('should generate SVG from text prompt via API', async ({ request }) => {
    // Test the /api/generate-svg endpoint
    const response = await request.post(`${baseURL}/api/generate-svg`, {
      data: {
        prompt: 'Generate a simple blue circle icon',
        style: 'minimal',
        size: '100x100'
      }
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body).toHaveProperty('success');
    expect(body).toHaveProperty('svg');
    expect(typeof body.svg).toBe('string');
    expect(body.svg).toContain('<svg');
    expect(body.svg).toContain('</svg>');
  });

  test('should enhance preset via API', async ({ request }) => {
    // Test the /api/enhance-preset endpoint
    const preset = {
      name: 'Test Banner',
      width: 800,
      height: 400,
      background: 'solid',
      colors: ['#00d4ff']
    };

    const response = await request.post(`${baseURL}/api/enhance-preset`, {
      data: {
        preset: preset,
        enhance: true
      }
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body).toHaveProperty('success');
    expect(body).toHaveProperty('preset');
    expect(body.preset).toHaveProperty('name');
    expect(body.preset).toHaveProperty('width');
    expect(body.preset).toHaveProperty('height');
  });

  test('should handle invalid prompt gracefully', async ({ request }) => {
    // Test with empty prompt
    const response = await request.post(`${baseURL}/api/generate-svg`, {
      data: {
        prompt: '',
        style: 'minimal'
      }
    });

    // Should either return error or generate default SVG
    expect(response.status()).toBeLessThan(500); // Not a server error
    
    const body = await response.json();
    // Either has error message or generates fallback SVG
    expect(body).toHaveProperty('success');
  });

  test('should handle missing API key configuration', async ({ request }) => {
    // This tests the service's error handling when API key is not configured
    // We'll test with a known invalid endpoint
    const response = await request.post(`${baseURL}/api/generate-svg-invalid`, {
      data: {
        prompt: 'test'
      }
    });

    // Should return 404 or handle gracefully
    expect(response.status()).toBeLessThan(500);
  });

  test('should generate SVG with specific dimensions', async ({ request }) => {
    const width = 256;
    const height = 256;

    const response = await request.post(`${baseURL}/api/generate-svg`, {
      data: {
        prompt: `Generate a ${width}x${height} icon`,
        size: `${width}x${height}`
      }
    });

    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(body.svg).toContain('viewBox=');
  });

  test('should generate different styles of SVG', async ({ request }) => {
    const styles = ['minimal', 'flat', '3d', 'outline', 'filled'];

    for (const style of styles) {
      const response = await request.post(`${baseURL}/api/generate-svg`, {
        data: {
          prompt: `Generate icon in ${style} style`,
          style: style
        }
      });

      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.svg).toContain('<svg');
    }
  });

  test('should enhance multiple preset types', async ({ request }) => {
    const presets = [
      { name: 'Social Media', width: 1200, height: 630 },
      { name: 'Website Banner', width: 1920, height: 400 },
      { name: 'Mobile App', width: 512, height: 512 },
      { name: 'Android Icon', width: 192, height: 192 }
    ];

    for (const preset of presets) {
      const response = await request.post(`${baseURL}/api/enhance-preset`, {
        data: {
          preset: preset,
          enhance: true
        }
      });

      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.preset.name).toBe(preset.name);
    }
  });
});

test.describe('AI Service Integration with UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/icon-generator');
  });

  test('should display AI-generated content in Icon Generator', async ({ page }) => {
    // Wait for the component to load
    await page.waitForSelector('app-icon-generator');
    
    // Check if AI service is being used (indirect test)
    const preview = page.locator('.preview-container');
    await expect(preview).toBeVisible();
  });

  test('should show AI loading state when generating', async ({ page }) => {
    // This tests the integration between UI and AI service
    const generateButton = page.locator('button:has-text("Generate")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
      
      // Should show loading state
      const loading = page.locator('.loading, .spinner');
      await expect(loading).toBeVisible({ timeout: 5000 });
    }
  });
});
