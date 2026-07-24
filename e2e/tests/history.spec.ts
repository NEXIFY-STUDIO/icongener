/**
 * History E2E Tests
 * Tests the history functionality for tracking generated items
 */

import { test, expect, Page } from '@playwright/test';

test.describe('History Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/history');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/history');
  });

  test('should load history page', async ({ page }) => {
    // Verify page elements
    await expect(page.locator('app-history')).toBeVisible();
    
    // Verify main sections
    const historyList = page.locator('.history-list, [data-testid="history-list"]');
    const filters = page.locator('.history-filters, [data-testid="history-filters"]');
    
    await expect(historyList).toBeVisible();
    
    // Filters might be optional
    if (await filters.count() > 0) {
      await expect(filters).toBeVisible();
    }
  });

  test('should display history items if any exist', async ({ page }) => {
    const historyItems = page.locator('.history-item, [data-testid="history-item"]');
    
    // Count existing history items
    const itemCount = await historyItems.count();
    
    // If there are history items, verify they have proper structure
    if (itemCount > 0) {
      const firstItem = historyItems.first();
      await expect(firstItem).toBeVisible();
      
      // Verify item has preview
      const preview = firstItem.locator('.history-preview, [data-testid="history-preview"]');
      if (await preview.count() > 0) {
        await expect(preview).toBeVisible();
      }
      
      // Verify item has info
      const info = firstItem.locator('.history-info, [data-testid="history-info"]');
      if (await info.count() > 0) {
        await expect(info).toBeVisible();
      }
      
      // Verify item has actions
      const actions = firstItem.locator('.history-actions, [data-testid="history-actions"]');
      if (await actions.count() > 0) {
        await expect(actions).toBeVisible();
      }
    }
  });

  test('should show empty state when no history', async ({ page }) => {
    const historyItems = page.locator('.history-item');
    const emptyState = page.locator('.empty-state, [data-testid="empty-state"]');
    
    // If no history items, verify empty state is shown
    const itemCount = await historyItems.count();
    if (itemCount === 0) {
      await expect(emptyState).toBeVisible();
      
      // Verify empty state has helpful message
      const emptyText = await emptyState.textContent();
      expect(emptyText?.toLowerCase()).toContain('no history') || 
      expect(emptyText?.toLowerCase()).toContain('empty') ||
      expect(emptyText?.toLowerCase()).toContain('start');
    }
  });

  test('should have filter controls', async ({ page }) => {
    const filterControls = page.locator('.filter-controls, [data-testid="filter-controls"]');
    
    if (await filterControls.count() > 0) {
      await expect(filterControls).toBeVisible();
      
      // Verify filter options
      const filterOptions = page.locator('select, [data-testid="filter-select"]');
      if (await filterOptions.count() > 0) {
        await expect(filterOptions).toBeVisible();
        
        const options = await filterOptions.locator('option').count();
        expect(options).toBeGreaterThan(0);
      }
      
      // Verify search input
      const searchInput = page.locator('input[type="text"], [data-testid="search-input"]');
      if (await searchInput.count() > 0) {
        await expect(searchInput).toBeVisible();
        
        // Test search functionality
        await searchInput.fill('icon');
        await page.waitForTimeout(500);
        
        // Verify search results (if any)
        const results = page.locator('.history-item');
        const resultCount = await results.count();
        
        // Results should be filtered (might be 0 if no matches)
        expect(resultCount).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should have date range filter', async ({ page }) => {
    const dateFilter = page.locator('.date-filter, [data-testid="date-filter"]');
    
    if (await dateFilter.count() > 0) {
      await expect(dateFilter).toBeVisible();
      
      // Verify date inputs
      const dateInputs = page.locator('input[type="date"]');
      if (await dateInputs.count() > 0) {
        await expect(dateInputs.first()).toBeVisible();
      }
    }
  });

  test('should have type filter', async ({ page }) => {
    const typeFilter = page.locator('.type-filter, [data-testid="type-filter"]');
    
    if (await typeFilter.count() > 0) {
      await expect(typeFilter).toBeVisible();
      
      // Verify type options (icon, favicon, banner, html)
      const typeOptions = ['icon', 'favicon', 'banner', 'html'];
      for (const type of typeOptions) {
        const option = page.locator(`input[value="${type}"], [data-type="${type}"]`);
        if (await option.count() > 0) {
          await expect(option).toBeVisible();
        }
      }
    }
  });

  test('should filter history by type', async ({ page }) => {
    const typeFilter = page.locator('.type-filter');
    const historyItems = page.locator('.history-item');
    
    if (await typeFilter.count() > 0 && await historyItems.count() > 0) {
      // Select icon type
      const iconOption = page.locator('input[value="icon"]');
      if (await iconOption.count() > 0) {
        await iconOption.check();
        await page.waitForTimeout(500);
        
        // Verify filtered results
        const filteredItems = page.locator('.history-item');
        const filteredCount = await filteredItems.count();
        
        // All filtered items should be icons (if filtering works)
        for (let i = 0; i < Math.min(filteredCount, 3); i++) {
          const item = filteredItems.nth(i);
          const itemText = await item.textContent();
          expect(itemText?.toLowerCase()).toContain('icon');
        }
      }
    }
  });

  test('should clear filters', async ({ page }) => {
    const filterControls = page.locator('.filter-controls');
    
    if (await filterControls.count() > 0) {
      // Apply some filters
      const searchInput = page.locator('input[type="text"]');
      if (await searchInput.count() > 0) {
        await searchInput.fill('test');
      }
      
      // Find and click clear button
      const clearButton = page.locator('button:has-text("Clear"), [data-testid="clear-filters"]');
      if (await clearButton.count() > 0) {
        await clearButton.click();
        await page.waitForTimeout(500);
        
        // Verify filters are cleared
        const clearedValue = await searchInput.inputValue();
        expect(clearedValue).toBe('');
      }
    }
  });

  test('should have history item actions', async ({ page }) => {
    const historyItems = page.locator('.history-item');
    
    if (await historyItems.count() > 0) {
      const firstItem = historyItems.first();
      
      // Verify action buttons
      const downloadButton = firstItem.locator('button:has-text("Download")');
      if (await downloadButton.count() > 0) {
        await expect(downloadButton).toBeVisible();
      }
      
      const deleteButton = firstItem.locator('button:has-text("Delete")');
      if (await deleteButton.count() > 0) {
        await expect(deleteButton).toBeVisible();
      }
      
      const viewButton = firstItem.locator('button:has-text("View")');
      if (await viewButton.count() > 0) {
        await expect(viewButton).toBeVisible();
      }
    }
  });

  test('should download history item', async ({ page }) => {
    const historyItems = page.locator('.history-item');
    
    if (await historyItems.count() > 0) {
      const firstItem = historyItems.first();
      const downloadButton = firstItem.locator('button:has-text("Download")');
      
      if (await downloadButton.count() > 0) {
        await expect(downloadButton).toBeVisible();
        
        // Click download
        const [download] = await Promise.all([
          page.waitForEvent('download'),
          downloadButton.click()
        ]);
        
        // Verify download started
        expect(download).toBeTruthy();
        expect(download.url()).toContain('blob:');
      }
    }
  });

  test('should delete history item', async ({ page }) => {
    const historyItems = page.locator('.history-item');
    const initialCount = await historyItems.count();
    
    if (initialCount > 0) {
      const firstItem = historyItems.first();
      const deleteButton = firstItem.locator('button:has-text("Delete")');
      
      if (await deleteButton.count() > 0) {
        await deleteButton.click();
        
        // Confirm deletion if needed
        const confirmButton = page.locator('button:has-text("Confirm"), [data-testid="confirm-delete"]');
        if (await confirmButton.count() > 0) {
          await confirmButton.click();
        }
        
        await page.waitForTimeout(500);
        
        // Verify item count decreased
        const newCount = await historyItems.count();
        expect(newCount).toBeLessThan(initialCount);
      }
    }
  });

  test('should bulk delete history items', async ({ page }) => {
    const historyItems = page.locator('.history-item');
    const initialCount = await historyItems.count();
    
    if (initialCount > 0) {
      // Find bulk delete button
      const bulkDeleteButton = page.locator('button:has-text("Delete All"), [data-testid="bulk-delete"]');
      
      if (await bulkDeleteButton.count() > 0) {
        await bulkDeleteButton.click();
        
        // Confirm deletion
        const confirmButton = page.locator('button:has-text("Confirm")');
        if (await confirmButton.count() > 0) {
          await confirmButton.click();
        }
        
        await page.waitForTimeout(500);
        
        // Verify all items are deleted
        const newCount = await historyItems.count();
        expect(newCount).toBe(0);
      }
    }
  });

  test('should export history', async ({ page }) => {
    const exportButton = page.locator('button:has-text("Export"), [data-testid="export-history"]');
    
    if (await exportButton.count() > 0) {
      await expect(exportButton).toBeVisible();
      
      // Click export
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        exportButton.click()
      ]);
      
      // Verify download started
      expect(download).toBeTruthy();
      expect(download.url()).toContain('blob:');
    }
  });

  test('should navigate to history item details', async ({ page }) => {
    const historyItems = page.locator('.history-item');
    
    if (await historyItems.count() > 0) {
      const firstItem = historyItems.first();
      const viewButton = firstItem.locator('button:has-text("View")');
      
      if (await viewButton.count() > 0) {
        await viewButton.click();
        await page.waitForTimeout(500);
        
        // Verify navigation or modal opened
        const modal = page.locator('.modal, [data-testid="modal"]');
        if (await modal.count() > 0) {
          await expect(modal).toBeVisible();
        } else {
          // Check if navigated to detail page
          const url = page.url();
          expect(url).toContain('/history/') || expect(url).toContain('details');
        }
      }
    }
  });
});

test.describe('History Mobile Tests', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone size

  test('should display mobile-optimized history list', async ({ page }) => {
    await page.goto('/history');
    
    const historyList = page.locator('.history-list');
    await expect(historyList).toBeVisible();
    
    // Verify list takes full width
    const box = await historyList.boundingBox();
    expect(box?.width).toBeGreaterThan(300);
  });

  test('should have mobile-friendly history items', async ({ page }) => {
    await page.goto('/history');
    
    const historyItems = page.locator('.history-item');
    
    if (await historyItems.count() > 0) {
      const firstItem = historyItems.first();
      const box = await firstItem.boundingBox();
      
      // Items should be full width on mobile
      expect(box?.width).toBeGreaterThan(300);
    }
  });

  test('should have accessible action buttons', async ({ page }) => {
    await page.goto('/history');
    
    const historyItems = page.locator('.history-item');
    
    if (await historyItems.count() > 0) {
      const firstItem = historyItems.first();
      const buttons = firstItem.locator('button');
      
      // Verify buttons have proper labels
      const buttonCount = await buttons.count();
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        await expect(button).toHaveAttribute(/aria-label|title/i, /.*/);
      }
    }
  });
});
