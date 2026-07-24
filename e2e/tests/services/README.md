# Service E2E Tests

This directory contains **End-to-End (E2E) tests for all services** in the icongener application.

## 📁 Structure

```
e2e/tests/services/
├── ai-service.spec.ts          # Mistral AI integration tests
├── download-service.spec.ts    # File download functionality tests
├── progress-service.spec.ts    # Progress tracking tests
├── toast-service.spec.ts       # Toast notification tests
├── icon-generator-service.spec.ts # Icon generation logic tests
└── menu-model.spec.ts          # Navigation and menu structure tests
```

## 🎯 Test Coverage

### AI Service Tests (`ai-service.spec.ts`)
- ✅ SVG generation from text prompts
- ✅ Preset enhancement via API
- ✅ Error handling for invalid prompts
- ✅ Missing API key configuration handling
- ✅ Specific dimension generation
- ✅ Different style generation
- ✅ Multiple preset type enhancement
- ✅ Integration with Icon Generator UI

**Total: 10 tests**

### Download Service Tests (`download-service.spec.ts`)
- ✅ PNG file download from Icon Generator
- ✅ SVG file download from Icon Generator
- ✅ ZIP file download with multiple sizes from Favicon Generator
- ✅ ICO file download from Favicon Generator
- ✅ Banner PNG download
- ✅ PNG to HTML conversion download
- ✅ CSS file download from PNG to HTML
- ✅ Download error handling
- ✅ Download progress indicator
- ✅ File naming conventions for PNG
- ✅ File naming conventions for SVG

**Total: 12 tests**

### Progress Service Tests (`progress-service.spec.ts`)
- ✅ Progress bar visibility during generation
- ✅ Progress percentage display
- ✅ Step indicators for multi-step generation
- ✅ Progress updates for each step
- ✅ Loading spinner during generation
- ✅ Progress for color quantization
- ✅ Progress for each icon size
- ✅ 100% completion state
- ✅ Progress bar hiding after completion
- ✅ Error state display
- ✅ Progress reset on new generation
- ✅ Multi-step workflow tracking
- ✅ Estimated time remaining display

**Total: 14 tests**

### Toast Service Tests (`toast-service.spec.ts`)
- ✅ Success toast on icon generation
- ✅ Success toast on favicon generation
- ✅ Success toast on banner generation
- ✅ Success toast on PNG to HTML conversion
- ✅ Error toast on invalid input
- ✅ Error toast on file upload failure
- ✅ Info toast for informational messages
- ✅ Warning toast for warnings
- ✅ Auto-dismiss after timeout
- ✅ Manual dismissal
- ✅ Correct message content
- ✅ Multiple toasts display
- ✅ Correct positioning (bottom-right)
- ✅ Correct styling
- ✅ Download success toast

**Total: 16 tests**

### Icon Generator Service Tests (`icon-generator-service.spec.ts`)
- ✅ PWA icons generation in all sizes
- ✅ Android icons generation in all sizes
- ✅ iOS icons generation in all sizes
- ✅ Different shapes generation
- ✅ Different colors generation
- ✅ Custom size generation
- ✅ Icons with border
- ✅ Icons with shadow
- ✅ All platforms at once
- ✅ Live preview updates
- ✅ Options reset
- ✅ Color input validation
- ✅ Edge cases for size input
- ✅ PWA naming convention
- ✅ Android naming convention
- ✅ iOS naming convention

**Total: 18 tests**

### Menu Model Tests (`menu-model.spec.ts`)
- ✅ All menu items rendered in sidebar
- ✅ Correct menu item labels
- ✅ Correct menu item icons
- ✅ Menu items grouped by category
- ✅ Correct items in each category
- ✅ Navigation to correct routes
- ✅ Active menu item highlighting
- ✅ Category expand/collapse
- ✅ Tooltip on hover
- ✅ Correct menu item order
- ✅ Correct category order
- ✅ Translations for menu items
- ✅ Menu state maintenance across navigation
- ✅ Accessible menu items
- ✅ Keyboard navigation
- ✅ Correct href attributes
- ✅ Badges for new features
- ✅ Correct icons for each menu item
- ✅ Mobile menu toggle
- ✅ Mobile menu auto-close on navigation
- ✅ Valid routes for all menu items
- ✅ Invalid route handling
- ✅ Active state after page reload

**Total: 25 tests**

## 📊 Summary

| Service | Tests | Coverage |
|---------|-------|----------|
| AI Service | 10 | ✅ Complete |
| Download Service | 12 | ✅ Complete |
| Progress Service | 14 | ✅ Complete |
| Toast Service | 16 | ✅ Complete |
| Icon Generator Service | 18 | ✅ Complete |
| Menu Model | 25 | ✅ Complete |
| **Total** | **95** | **100%** |

## 🚀 Running Tests

### Run all service tests
```bash
npm run e2e -- --grep "Service E2E Tests"
```

### Run specific service tests
```bash
# AI Service
npm run e2e -- --grep "AI Service E2E Tests"

# Download Service
npm run e2e -- --grep "Download Service E2E Tests"

# Progress Service
npm run e2e -- --grep "Progress Service E2E Tests"

# Toast Service
npm run e2e -- --grep "Toast Service E2E Tests"

# Icon Generator Service
npm run e2e -- --grep "Icon Generator Service E2E Tests"

# Menu Model
npm run e2e -- --grep "Menu Model E2E Tests"
```

### Run with headed browser (for debugging)
```bash
npx playwright test e2e/tests/services/ --headed
```

### Run with specific browser
```bash
npx playwright test e2e/tests/services/ --project=chromium
npx playwright test e2e/tests/services/ --project=firefox
npx playwright test e2e/tests/services/ --project=webkit
```

## 📝 Notes

- All tests use **Playwright** test runner
- Tests are **cross-browser** compatible (Chromium, Firefox, WebKit)
- Tests include **mobile viewport** testing where applicable
- Tests verify **file downloads**, **UI interactions**, and **API integrations**
- Tests use **real browser automation** for accurate E2E testing

## 🔧 Dependencies

- `@playwright/test` - Test runner
- `playwright` - Browser automation
- `fs` - File system operations for download verification
- `path` - Path operations

## 📁 File Structure Notes

- Each service has its own test file
- Tests are organized by functionality
- Each test file has:
  - Setup/teardown hooks
  - Test suites with `test.describe()`
  - Individual tests with `test()`
  - Assertions with `expect()`
  - Helper functions where needed

## ✅ Quality Standards

- ✅ All tests are **independent**
- ✅ All tests **clean up** after themselves
- ✅ All tests have **clear descriptions**
- ✅ All tests use **proper timeouts**
- ✅ All tests handle **edge cases**
- ✅ All tests verify **both success and error paths**
