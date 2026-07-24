# Development Guide for icongener Application

## 🚀 Quick Start

### Local Setup

#### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/NEXIFY-STUDIO/icongener.git

# Navigate to project directory
cd icongener
```

#### 2. Install Dependencies

```bash
# Install main project dependencies
npm install

# Install e2e test dependencies (optional)
cd e2e && npm install
cd ..
```

#### 3. Environment Configuration

```bash
# Create .env file from template
cp .env.example .env

# Edit .env file with your API keys
nano .env  # or use your preferred editor
```

#### 4. Run the Application

```bash
# Development server
npm run dev

# Application will be available at http://localhost:3000
```

#### 5. Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

---

## 📁 Project Structure

```
icongener/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   └── services/           # Core services (AI, Download, Progress, Toast)
│   │   ├── features/              # Feature components
│   │   │   ├── dashboard/
│   │   │   ├── icon-generator/
│   │   │   ├── favicon-generator/
│   │   │   ├── banner-generator/
│   │   │   ├── png-to-html/
│   │   │   ├── history/
│   │   │   └── settings/
│   │   ├── layout/                # Layout components
│   │   │   └── main-layout/
│   │   ├── shared/                # Shared components and models
│   │   │   ├── components/
│   │   │   │   ├── header/
│   │   │   │   ├── sidebar/
│   │   │   │   └── logo/
│   │   │   └── models/
│   │   │       └── menu.model.ts
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   └── index.tsx                 # Entry point
├── e2e/                         # End-to-end tests
│   ├── tests/
│   │   ├── navigation.spec.ts
│   │   ├── icon-generator.spec.ts
│   │   ├── favicon-generator.spec.ts
│   │   ├── banner-generator.spec.ts
│   │   ├── png-to-html.spec.ts
│   │   ├── history.spec.ts
│   │   ├── settings.spec.ts
│   │   └── global.spec.ts
│   ├── playwright.config.ts
│   └── package.json
├── TEST_SUMMARY.md              # Test documentation
├── DEVELOPMENT.md               # This file
├── package.json
├── angular.json
├── tsconfig.json
└── .gitignore
```

---

## 🧪 Testing

### Unit Tests

```bash
# Run all unit tests
npm test

# Run with watch mode (auto-reload on changes)
npm run test:watch

# Run with code coverage report
npm run test:coverage
```

### E2E Tests

```bash
# Install Playwright dependencies (first time only)
cd e2e && npm install
cd ..

# Run all e2e tests
npm run e2e

# Run with UI mode (interactive test runner)
npm run e2e:ui

# Run with visible browsers
npm run e2e:headed

# Run specific browser
npm run e2e:chrome
npm run e2e:firefox
npm run e2e:webkit

# Run all browsers
npm run e2e:all

# Generate test code interactively
npm run e2e:codegen

# Show test report
npm run e2e:show-report
```

### Test Verification

```bash
# Verify all test files exist and are valid
./verify-tests.sh
```

---

## 📋 Test Coverage Status

### ✅ Completed Tests

#### Unit Tests (18 files, ~200+ tests)
- ✅ **Core Services** (5 files)
  - `ai.service.spec.ts` - AI service with Mistral API
  - `download.service.spec.ts` - PNG/SVG/ZIP downloads
  - `progress.service.spec.ts` - Progress tracking
  - `toast.service.spec.ts` - Toast notifications
  - `icon-generator.service.spec.ts` - Icon generation logic

- ✅ **Layout & Shared** (4 files)
  - `main-layout.component.spec.ts` - Main layout
  - `sidebar.component.spec.ts` - Sidebar navigation
  - `header.component.spec.ts` - Header with time and language
  - `logo.component.spec.ts` - Logo rendering

- ✅ **Feature Components** (8 files)
  - `dashboard.component.spec.ts` - Dashboard page
  - `icon-generator.component.spec.ts` - Icon generator
  - `favicon-generator.component.spec.ts` - Favicon generator
  - `banner-generator.component.spec.ts` - Banner generator
  - `png-to-html.component.spec.ts` - PNG to HTML converter
  - `history.component.spec.ts` - History management
  - `settings.component.spec.ts` - Settings page
  - `menu.model.spec.ts` - Menu model validation

- ✅ **Application** (1 file)
  - `app.component.spec.ts` - Main app component

#### E2E Tests (8 files, ~130+ tests)
- ✅ `navigation.spec.ts` - Routing and navigation
- ✅ `icon-generator.spec.ts` - Complete icon generation workflow
- ✅ `favicon-generator.spec.ts` - Complete favicon generation workflow
- ✅ `banner-generator.spec.ts` - Complete banner generation workflow
- ✅ `png-to-html.spec.ts` - Complete PNG to HTML conversion
- ✅ `history.spec.ts` - History functionality
- ✅ `settings.spec.ts` - Language and theme switching
- ✅ `global.spec.ts` - Integration and workflow tests

### 📝 Missing Tests (Optional)

These components already have tests, but you could add more edge cases:

1. **Service Integration Tests**
   - Test actual API calls with mock servers
   - Test file download functionality with real files
   - Test error handling for network failures

2. **Component Integration Tests**
   - Test component interactions
   - Test parent-child component communication
   - Test with real Angular router

3. **Performance Tests**
   - Test rendering performance with large datasets
   - Test memory usage
   - Test load times

4. **Accessibility Tests**
   - More detailed WCAG compliance tests
   - Keyboard navigation tests
   - Screen reader compatibility tests

5. **Mobile-Specific Tests**
   - More viewport sizes
   - Touch event testing
   - Mobile browser-specific tests

---

## 🔧 Configuration

### Environment Variables

Create `.env` file in project root:

```env
# Mistral AI API Key
MISTRAL_API_KEY=your_api_key_here

# Application settings
NODE_ENV=development
PORT=3000

# API endpoints
API_BASE_URL=http://localhost:3000
GENERATE_SVG_ENDPOINT=/api/generate-svg
ENHANCE_PRESET_ENDPOINT=/api/enhance-preset
```

### GitHub Setup

```bash
# Create new branch
git checkout -b feature/comprehensive-tests

# Add all changes
git add .

# Commit changes
git commit -m "feat(tests): Add comprehensive test coverage for icongener"

# Push to GitHub
git push -u origin feature/comprehensive-tests

# Create Pull Request
# Go to GitHub repository and create PR from feature/comprehensive-tests to main
```

---

## 🛠️ Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes, add tests
# ...

# Run tests to verify
npm test
npm run e2e

# Commit changes
git add .
git commit -m "feat: Add your feature"

# Push to GitHub
git push -u origin feature/your-feature-name
```

### 2. Bug Fixing

```bash
# Create bugfix branch
git checkout -b bugfix/issue-description

# Fix the bug, add regression tests
# ...

# Verify tests pass
npm test

# Commit changes
git add .
git commit -m "fix: Fix issue description"

# Push to GitHub
git push -u origin bugfix/issue-description
```

### 3. Running All Tests

```bash
# Run unit tests
npm test

# Run e2e tests (requires Playwright dependencies)
npm run e2e

# Verify test files
./verify-tests.sh
```

---

## 📦 Dependencies

### Main Dependencies
- Angular 20.x
- TypeScript 5.x
- RxJS 7.x
- Express 5.x
- JSZip 3.x
- @google/genai 1.x

### Development Dependencies
- @angular/cli 20.x
- @angular/build 20.x
- @playwright/test 1.x
- @types/node 22.x
- @types/jszip 3.x
- @types/playwright 1.x

---

## 🎨 Code Style

### TypeScript
- Use strict typing
- Use interfaces for complex objects
- Use signals for reactive state
- Use async/await for promises

### Angular
- Use standalone components
- Use signals for state management
- Use inject() for dependency injection
- Use CommonModule for common directives

### CSS
- Use Tailwind-inspired utility classes
- Use dark theme colors (#0f172a, #1e293b, #00d4ff)
- Use responsive design (mobile-first)

---

## 📚 API Documentation

### Mistral AI Integration

The application uses Mistral AI for:
- SVG generation from text prompts
- Preset description enhancement

**Endpoints:**
- `POST /api/generate-svg` - Generate SVG from prompt
- `POST /api/enhance-preset` - Enhance preset descriptions

**Request Format:**
```json
{
  "prompt": "Generate a simple icon"
}
```

**Response Format:**
```json
{
  "svgCode": "<svg>...</svg>"
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Tests not running
```bash
# Make sure all dependencies are installed
npm install

# For e2e tests, install Playwright dependencies
cd e2e && npm install
cd ..
```

#### 2. Build timeout
```bash
# Try with more memory
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

#### 3. Port already in use
```bash
# Change port in angular.json or use different port
PORT=4000 npm run dev
```

#### 4. API key not working
```bash
# Verify .env file exists and has correct API key
cat .env

# Restart development server
npm run dev
```

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Check TEST_SUMMARY.md for test-related questions
3. Check e2e/tests/README.md for e2e test documentation
4. Create an issue in GitHub repository

---

## 🎯 Next Steps

1. **Complete Setup**
   ```bash
   git clone https://github.com/NEXIFY-STUDIO/icongener.git
   cd icongener
   npm install
   cd e2e && npm install
   cd ..
   cp .env.example .env
   # Edit .env with your API key
   npm run dev
   ```

2. **Run All Tests**
   ```bash
   npm test
   npm run e2e
   ```

3. **Start Developing**
   - Create new branch for your changes
   - Add tests for new features
   - Verify all tests pass before committing

---

## 📄 License

This project is private and proprietary to NEXIFY-STUDIO.

---

*Last updated: $(date)*
