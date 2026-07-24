# 🚀 Quick Start Guide for icongener

This guide will help you set up the icongener project locally on your PC in just a few minutes.

## 📋 Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** version 18 or higher
- **npm** version 9 or higher
- **Git** version 2.x or higher
- **Code Editor** (VS Code, WebStorm, etc.)

### Check Your Environment

```bash
# Check Node.js version
node --version
# Should output: v18.x.x or higher

# Check npm version
npm --version
# Should output: 9.x.x or higher

# Check Git version
git --version
# Should output: git version 2.x.x or higher
```

If you don't have these installed, download them first:
- [Node.js](https://nodejs.org/) (includes npm)
- [Git](https://git-scm.com/)

---

## 💻 Step 1: Clone the Repository

Open your terminal or command prompt and run:

```bash
# Clone the repository from GitHub
git clone https://github.com/NEXIFY-STUDIO/icongener.git

# Navigate into the project directory
cd icongener
```

**Expected Output:**
```
Cloning into 'icongener'...
remote: Enumerating objects: X, done.
remote: Counting objects: 100% (X/X), done.
remote: Compressing objects: 100% (X/X), done.
remote: Total X (delta Y), reused X (delta Y), pack-reused X
Receiving objects: 100% (X/X), Y KiB | Z MiB/s, done.
Resolving deltas: 100% (Y/Y), done.
```

---

## 📦 Step 2: Install Dependencies

Install all required dependencies:

```bash
# Install main project dependencies
npm install
```

This will install all the Angular dependencies and other packages. It may take a few minutes.

**Optional:** Install e2e test dependencies (only needed if you want to run end-to-end tests)

```bash
# Navigate to e2e directory
cd e2e

# Install Playwright dependencies
npm install

# Navigate back to project root
cd ..
```

**Expected Output:**
```
added X packages in Ys
```

---

## ⚙️ Step 3: Configure Environment

Copy the example environment file and configure your API key:

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env file with your Mistral AI API key
# On Linux/Mac:
nano .env

# On Windows (Command Prompt):
notepad .env

# On Windows (PowerShell):
code .env
```

### Edit the .env File

Find the line with `MISTRAL_API_KEY` and replace it with your actual API key:

```env
# Before
MISTRAL_API_KEY=dlgLJEL5033QHNmwpCHYHaT0iXlVq3bG

# After
MISTRAL_API_KEY=your_actual_api_key_here
```

**Note:** The API key in the example is the one provided in your requirements. Replace it with your actual Mistral AI API key.

Save the file and exit the editor.

---

## 🏃 Step 4: Run the Application

Start the development server:

```bash
# Start the Angular development server
npm run dev
```

**Expected Output:**
```
✔ Browser application bundle generation complete.
✔ Compiling @angular/core : es2022 as esm2022
✔ Compiling @angular/common : es2022 as esm2022
✔ Compiling @angular/platform-browser : es2022 as esm2022
✔ Browser application bundle generation complete.

Initial chunk files   | Names         |  Raw size | Estimated transfer size
main.js              | main          |   123.45 kB |                12.34 kB
styles.css           | styles        |    45.67 kB |                 4.57 kB

                      | Initial total |   169.12 kB |                16.91 kB

Application bundle generation complete. [X.XXX seconds]

Watch mode enabled. Watching for file changes...

  Local:   http://localhost:3000
  Network: http://192.168.x.x:3000

✔ Compiled successfully
```

### Access the Application

Open your web browser and navigate to:

👉 [http://localhost:3000](http://localhost:3000)

You should see the icongener application running!

---

## 🧪 Step 5: Run Tests (Optional)

### Run Unit Tests

```bash
# Run all unit tests
npm test
```

### Run E2E Tests (if you installed Playwright dependencies)

```bash
# Run all end-to-end tests
npm run e2e
```

---

## 📁 Project Structure

After setup, your project directory should look like this:

```
icongener/
├── src/                  # Source code
│   ├── app/              # Angular application
│   │   ├── core/         # Core services
│   │   ├── features/     # Feature components
│   │   ├── layout/       # Layout components
│   │   └── shared/       # Shared components & models
│   └── index.tsx        # Entry point
├── e2e/                 # End-to-end tests
│   ├── tests/           # Test files
│   └── playwright.config.ts
├── .env                  # Environment configuration (created by you)
├── .env.example          # Environment template
├── .gitignore            # Git ignore rules
├── package.json          # Project dependencies
├── README.md             # Project documentation
├── DEVELOPMENT.md        # Development guide
├── TEST_SUMMARY.md       # Test documentation
└── QUICK_START.md        # This file
```

---

## 🛠️ Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run unit tests with watch mode |
| `npm run e2e` | Run end-to-end tests |
| `npm run e2e:ui` | Run e2e tests with UI mode |
| `npm run e2e:headed` | Run e2e tests with visible browsers |

---

## 🐛 Troubleshooting

### 1. Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find and kill the process using port 3000
# On Linux/Mac:
lsof -i :3000
kill -9 <PID>

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Then restart the server
npm run dev
```

### 2. Missing Dependencies

**Error:** `Cannot find module '@angular/core'`

**Solution:**
```bash
# Install missing dependencies
npm install
```

### 3. Node.js Version Too Old

**Error:** `Error: Node.js version X.X.X is not supported`

**Solution:**
```bash
# Install Node Version Manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

# Install Node.js 18+
nvm install 18
nvm use 18

# Then try again
npm install
npm run dev
```

### 4. API Key Not Working

**Error:** `401 Unauthorized` or `Invalid API key`

**Solution:**
```bash
# Verify .env file exists
ls -la .env

# Check if API key is set
cat .env | grep MISTRAL_API_KEY

# Restart the development server
npm run dev
```

### 5. Build Timeout

**Error:** Build process times out

**Solution:**
```bash
# Increase memory limit
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

---

## 🎯 Next Steps

Now that you have the project running, you can:

1. **Explore the Application**
   - Navigate through all features
   - Try generating icons, favicons, and banners
   - Test the PNG to HTML converter

2. **Run All Tests**
   ```bash
   npm test
   npm run e2e
   ```

3. **Start Developing**
   - Create a new branch: `git checkout -b feature/your-feature`
   - Make your changes
   - Add tests for new functionality
   - Commit and push your changes

4. **Read Documentation**
   - [README.md](README.md) - Project overview
   - [DEVELOPMENT.md](DEVELOPMENT.md) - Development guide
   - [TEST_SUMMARY.md](TEST_SUMMARY.md) - Test coverage
   - [e2e/tests/README.md](e2e/tests/README.md) - E2E test guide

---

## 📞 Need Help?

If you encounter any issues:

1. **Check this guide** - Most common issues are covered above
2. **Check DEVELOPMENT.md** - Detailed troubleshooting section
3. **Check the GitHub repository** - Look for open issues
4. **Create a new issue** - If you can't find a solution

---

## ✅ Setup Complete!

You've successfully set up the icongener project on your local machine. 
The application should now be running at [http://localhost:3000](http://localhost:3000).

Happy coding! 🎉

---

*Last updated: 2024*
*Version: 1.0.0*
