# E2E Tests for icongener Application

This directory contains end-to-end tests for the icongener application using Playwright.

## Test Files

- `navigation.spec.ts` - Tests navigation, routing, and sidebar functionality
- `icon-generator.spec.ts` - Tests the complete icon generation workflow
- `favicon-generator.spec.ts` - Tests the complete favicon generation workflow
- `banner-generator.spec.ts` - Tests the complete banner generation workflow
- `png-to-html.spec.ts` - Tests the PNG to HTML conversion workflow
- `history.spec.ts` - Tests history functionality and filtering
- `settings.spec.ts` - Tests language and theme switching
- `global.spec.ts` - Tests complete application workflows and integrations

## Running Tests

### Install Dependencies
```bash
cd e2e
npm install
```

### Run All Tests
```bash
npm test
```

### Run with UI Mode (Interactive)
```bash
npm run test:ui
```

### Run with Headed Browsers
```bash
npm run test:headed
```

### Run Specific Browser
```bash
npm run test:chrome    # Chromium
npm run test:firefox   # Firefox
npm run test:webkit    # WebKit (Safari)
```

### Run All Browsers
```bash
npm run test:all
```

### Generate Test Code
```bash
npm run codegen
```

### Show Test Report
```bash
npm run show-report
```

## Test Configuration

The test configuration is in `playwright.config.ts`:

- **Base URL**: http://localhost:3000
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari, Edge, Chrome
- **Viewport**: Multiple breakpoints tested
- **Retries**: 2 on CI, 0 locally
- **Timeout**: 30 seconds per test
- **Artifacts**: Screenshots on failure, videos on retry, traces on first retry

## Test Data

### Icon Generator
- Platforms: PWA, Android, iOS
- Shapes: circle, rounded, square
- Sizes: Platform-specific sizes

### Favicon Generator
- Sizes: 16, 32, 48, 64, 128, 256, 512
- Formats: ICO, PNG, SVG
- Shapes: circle, rounded, square

### Banner Generator
- 25+ Presets: Facebook, Twitter, LinkedIn, YouTube, Instagram, etc.
- Categories: Social Media, Website, Advertising, Custom
- Background Types: solid, gradient, image, transparent

### PNG to HTML
- Color Quantization: 2, 4, 8, 16, 32, 64, 128, 256
- Output Formats: HTML, CSS, SVG

## Mobile Testing

All test suites include mobile-specific tests with:
- iPhone viewport (375x667)
- Touch target verification
- Responsive layout checks
- Accessibility validation

## Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Wait for network idle** before asserting page state
3. **Use conditional checks** for optional features
4. **Test both success and error paths**
5. **Verify accessibility** on all interactive elements
6. **Test responsive behavior** across breakpoints

## Adding New Tests

1. Create a new `.spec.ts` file in the `tests/` directory
2. Import Playwright test utilities: `import { test, expect, Page } from '@playwright/test'`
3. Use `test.describe()` to group related tests
4. Use `test.beforeEach()` for common setup
5. Use `test.use()` for specific configurations (e.g., mobile viewport)
6. Use conditional checks for optional features

## Debugging Tests

- Use `npm run test:headed` to see the browser
- Use `npm run test:debug` for interactive debugging
- Use `page.pause()` to pause test execution
- Use `console.log()` for debugging output
