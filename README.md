# icongener - PWA Icon Generator Application

![icongener Logo](https://via.placeholder.com/150x150/00d4ff/ffffff?text=icongener)

**icongener** is a comprehensive dashboard application for generating icons, favicons, banners, and converting PNG images to HTML/CSS. Built with Angular 20 and powered by Mistral AI.

## 🌟 Features

### 🎨 Icon Generator
- Generate PWA, Android, and iOS icons in all required sizes
- Customizable shapes (circle, rounded, square)
- Color and background customization
- Live preview
- Multiple platform support

### 🖼️ Favicon Generator
- Create favicons in all standard sizes (16x16 to 512x512)
- ICO, PNG, and SVG format support
- Shape and color customization
- Live preview

### 📛 Banner Generator
- Generate custom-sized banners for social media, websites, and ads
- 25+ preset configurations (Facebook, Twitter, LinkedIn, YouTube, Instagram, etc.)
- Background color and type options (solid, gradient, image, transparent)
- Text overlay support

### 🔄 PNG to HTML Generator
- Convert PNG images to perfect-pixel HTML/CSS
- Color quantization (2-256 colors)
- Multiple output formats (HTML, CSS, SVG)
- Drag & drop upload
- Crop functionality

### 📊 Additional Features
- History tracking with filtering and search
- Settings with language (EN/SK) and theme (light/dark/system) switching
- Progress tracking for all generation tasks
- Toast notifications
- Responsive design for all devices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+
- Angular CLI 20+

### Installation

```bash
# Clone the repository
git clone https://github.com/NEXIFY-STUDIO/icongener.git

# Navigate to project directory
cd icongener

# Install dependencies
npm install

# Install e2e test dependencies (optional)
cd e2e && npm install
cd ..

# Copy environment file
cp .env.example .env

# Edit .env with your Mistral AI API key
nano .env
```

### Run the Application

```bash
# Development server
npm run dev

# Application will be available at http://localhost:3000
```

### Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview

# Start production server
npm start
```

## 🧪 Testing

### Run Unit Tests

```bash
# Run all unit tests
npm test

# Run with watch mode
npm run test:watch

# Run with code coverage
npm run test:coverage
```

### Run E2E Tests

```bash
# Install Playwright dependencies (first time only)
cd e2e && npm install
cd ..

# Run all e2e tests
npm run e2e

# Run with UI mode (interactive)
npm run e2e:ui

# Run with visible browsers
npm run e2e:headed
```

### Test Coverage
- **Unit Tests**: 18 files, ~200+ tests
- **E2E Tests**: 8 files, ~130+ tests
- **Total**: ~330+ tests across 34 files

See [TEST_SUMMARY.md](TEST_SUMMARY.md) for detailed test information.

## 📁 Project Structure

```
icongener/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   └── services/           # AI, Download, Progress, Toast services
│   │   ├── features/              # Main feature components
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
│   └── index.tsx
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
├── DEVELOPMENT.md               # Development guide
├── TEST_SUMMARY.md              # Test documentation
├── package.json
├── angular.json
├── tsconfig.json
└── .gitignore
```

## 🔧 Configuration

### Environment Variables

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Required variables:
```env
MISTRAL_API_KEY=your_api_key_here
```

See [.env.example](.env.example) for all available configuration options.

## 🛠️ Development

### Create a New Branch

```bash
git checkout -b feature/your-feature-name
```

### Development Workflow

1. Create feature branch
2. Make changes and add tests
3. Run tests to verify
4. Commit changes
5. Push to GitHub
6. Create Pull Request

See [DEVELOPMENT.md](DEVELOPMENT.md) for complete development guide.

## 📊 Technologies

- **Framework**: Angular 20
- **Language**: TypeScript 5.x
- **State Management**: Angular Signals
- **Styling**: Custom CSS with Tailwind-inspired utilities
- **AI Integration**: Mistral AI via @google/genai
- **File Handling**: JSZip for multi-file downloads
- **Testing**: Jasmine/Karma (unit), Playwright (e2e)

## 🎨 Design

- **Theme**: Dark theme with cyan accents
- **Colors**: 
  - Primary background: `#0f172a`
  - Secondary background: `#1e293b`
  - Accent color: `#00d4ff`
- **Responsive**: Mobile-first design with breakpoints at 768px and 1024px

## 📚 Documentation

- [DEVELOPMENT.md](DEVELOPMENT.md) - Complete development guide
- [TEST_SUMMARY.md](TEST_SUMMARY.md) - Test coverage and statistics
- [e2e/tests/README.md](e2e/tests/README.md) - E2E test documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a Pull Request

## 📄 License

This project is private and proprietary to NEXIFY-STUDIO.

## 📞 Support

For issues or questions:
1. Check the documentation files
2. Create an issue in the GitHub repository
3. Contact the development team

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Angular Version**: 20.3.0  
**Node.js Version**: 18+
