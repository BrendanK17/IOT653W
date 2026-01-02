# GroundScanner Frontend

> A travel comparison platform for finding the best, cheapest, and most sustainable airport-to-city transfers.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)](./TESTING.md)
[![Coverage](https://img.shields.io/badge/Coverage-70%25+-brightgreen.svg)](./CODE_QUALITY.md)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running Locally](#running-locally)
- [Environment Configuration](#environment-configuration)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🎯 Overview

GroundScanner is a modern web application that helps travelers find the optimal airport-to-city transfer options. Users can compare transport methods based on price, time, and environmental impact. The platform features:

- **Smart Airport Search** with real-time autocomplete
- **Multi-criteria Comparison** - Best overall, cheapest, fastest, most eco-friendly
- **Carbon Footprint Tracking** - See CO₂ emissions for every option
- **Interactive Insights** - Charts and analytics about transport trends
- **Terminal Navigation** - Detailed guidance between airport terminals
- **User Accounts** - Personalized preferences and saved airports
- **Accessible Design** - Full keyboard navigation and screen reader support

## ✨ Features

- 🔍 **Smart Search** - Autocomplete airport search with instant results
- 📊 **Multiple Views** - Compare by best overall, cheapest, fastest, or eco-friendly
- 🌱 **Sustainability** - CO₂ emissions data for every transport option
- 📈 **Insights** - Interactive charts and data visualizations
- 🚇 **Terminal Transfers** - Detailed info on getting between terminals
- 👤 **User Accounts** - Save preferences and default airports
- 🌙 **Dark Mode** - Beautiful dark theme support
- 📱 **Responsive** - Works perfectly on all devices
- ♿ **Accessible** - WCAG compliant with keyboard navigation

## 🛠️ Tech Stack

- **Frontend Framework**: React 18.2 with TypeScript 5.2
- **Build Tool**: Vite 5.0 (fast builds and HMR)
- **Styling**: Tailwind CSS 4.0 (utility-first CSS)
- **UI Components**: ShadCN UI (Radix UI + Tailwind)
- **Icons**: Lucide React
- **Maps**: Leaflet with React wrapper
- **Testing**: Vitest, React Testing Library
- **Linting**: ESLint with React/TypeScript rules
- **State Management**: React Context API & Hooks
- **Type Safety**: TypeScript strict mode

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm 9+** or **Yarn 3+** - Included with Node.js
- **Git** - For version control
- **Backend API** - Running on `http://localhost:8000`

Verify your installation:

```bash
node --version
npm --version
```

## 📦 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd IOT653U/frontend
```

### 2. Install Dependencies

```bash
npm install
```

This installs all packages from `package.json` and creates `node_modules/` directory.

### 3. Verify Installation

```bash
npm run type-check
```

If TypeScript compilation succeeds, you're ready to go.

## 🚀 Running Locally

### Start the Development Server

```bash
npm run dev
```

The application will start with Vite's development server. You'll see output like:

```
VITE v5.0.0  ready in 200 ms

➜ Local:   http://127.0.0.1:5173/
➜ Press h to show help
```

### Access the Application

Open your browser to: `http://127.0.0.1:5173/`

**Hot Module Replacement (HMR)** is enabled - your changes will update instantly!

### Connecting to Backend

The frontend expects the backend API at `http://localhost:8000`. Before running the frontend:

1. **Start the backend first**: 
   ```bash
   cd ../backend
   poetry run uvicorn app.main:app --reload
   ```

2. **Ensure CORS is enabled**: Backend has CORS configured for:
   - `http://localhost:5173` (frontend dev server)
   - `http://127.0.0.1:5173`
   - `http://localhost:3000` (alternative frontend port)

3. **Check network connectivity**:
   - Backend should be running on `http://localhost:8000`
   - Test API: `curl http://localhost:8000/docs`
   - Check browser console (F12) for API errors

**Troubleshooting API Connection**:
- If frontend can't reach backend, check CORS errors in browser console
- Ensure backend port 8000 is not in use: `netstat -an | find "8000"`
- Restart both frontend and backend servers

## 🔧 Environment Configuration

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
# API Configuration
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DARK_MODE=true

# Application
VITE_APP_NAME=GroundScanner
VITE_APP_VERSION=1.0.0
```

**Important Security Notes**: 
- ⚠️ `.env.local` is ignored by git - safe for local configuration
- 🔒 Never commit API keys, tokens, or secrets to the repository
- 🔑 Access environment variables via `import.meta.env.VITE_*` in code
- 🛡️ All values above are examples - replace with your actual configuration
- 📝 Changes to `.env` files require server restart to take effect

### Available Environments

```bash
# Development (default)
npm run dev

# Production build preview
npm run build && npm run preview

# Production build
npm run build
```

## ⚙️ Available Scripts

### Development & Running

```bash
# Start development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Testing

```bash
# Run all tests (watch mode by default in dev)
npm test

# Run tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage

# Run tests with UI dashboard
npm run test:ui

# Run specific test suites
npm run test:unit              # Utils and unit tests
npm run test:integration       # Component integration tests
npm run test:e2e              # End-to-end tests

# Watch mode
npm test -- --watch
```

### Code Quality

```bash
# TypeScript type checking
npm run type-check

# ESLint code quality
npm run lint

# Run type-check + lint
npm run type-check && npm run lint
```

## 📁 Project Structure

```
frontend/
├── components/                  # React components
│   ├── account/                # Account management components
│   │   ├── UserInfoCard.tsx
│   │   ├── DefaultAirportCard.tsx
│   │   ├── PreferencesCard.tsx
│   │   └── ...
│   │
│   ├── auth/                   # Authentication components
│   │   └── AuthForms.tsx
│   │
│   ├── layout/                 # Layout & page templates
│   │   ├── MainLayout.tsx      # Main app layout
│   │   ├── Header.tsx          # Navigation header
│   │   ├── HomePage.tsx        # Home page
│   │   └── ...
│   │
│   ├── search/                 # Search functionality
│   │   └── SearchComponents.tsx
│   │
│   ├── transport/              # Transport display & filtering
│   │   ├── TransportCard.tsx   # Individual option card
│   │   ├── TransferList.tsx    # List of transfers
│   │   ├── FilterSidebar.tsx   # Filter controls
│   │   ├── LeafletMap.tsx      # Map view
│   │   ├── TimePicker.tsx      # Time selection
│   │   └── ...
│   │
│   ├── insights/               # Analytics & charts
│   │   ├── ChartSection.tsx    # Chart containers
│   │   ├── InsightCards.tsx    # Data summary cards
│   │   └── TransportTable.tsx  # Data tables
│   │
│   ├── ui/                     # ShadCN UI base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── accordion.tsx
│   │   └── ... (shadcn components)
│   │
│   ├── figma/                  # Figma integration
│   │   └── ImageWithFallback.tsx
│   │
│   ├── __tests__/              # Component integration tests
│   │   ├── TransfersPage.test.tsx
│   │   ├── TransfersPage.sorting.test.tsx
│   │   └── ...
│   │
│   ├── AccountPage.tsx         # Account page container
│   ├── InsightsPage.tsx        # Insights page container
│   ├── ResultsPage.tsx         # Results page container
│   └── TerminalTransfersPage.tsx
│
├── types/                      # TypeScript type definitions
│   ├── index.ts                # Core types
│   └── routes.ts               # Route type definitions
│
├── utils/                      # Business logic & utilities
│   ├── api.ts                  # API client & requests
│   ├── cn.ts                   # classname utility
│   ├── duration.ts             # Time utilities
│   └── __tests__/              # Unit tests
│
├── styles/                     # Global styles
│   └── globals.css             # Tailwind + custom styles
│
├── guidelines/                 # Design & coding guidelines
│   └── Guidelines.md
│
├── App.tsx                     # Main app component
├── main.tsx                    # React entry point
├── index.html                  # HTML template
│
├── vite.config.ts              # Vite configuration
├── vitest.config.mjs           # Vitest configuration
├── jest.config.js              # Jest configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── package.json                # Dependencies & scripts
├── package-lock.json           # Locked dependency versions
│
└── README.md                   # This file
```

## 🧪 Testing

### Test Organization

- **Unit Tests** (`utils/__tests__/`): Test utility functions
- **Component Tests** (`components/__tests__/`): Test React components
- **Integration Tests** (`__tests__/integration/`): Test multiple components together
- **E2E Tests** (`__tests__/e2e/`): Test complete user workflows

### Test Coverage

| Type | Coverage | Location |
|------|----------|----------|
| Unit Tests | 90%+ | `utils/__tests__/` |
| Component Tests | 80%+ | `components/__tests__/` |
| Integration Tests | 75%+ | `__tests__/integration/` |
| E2E Tests | Critical paths | `__tests__/e2e/` |
| **Overall** | **70%+** | All files |

### Running Tests

```bash
# Watch mode (default in dev)
npm test

# Single run
npm run test:run

# With coverage
npm run test:coverage

# UI dashboard
npm run test:ui

# Specific file
npm test -- TransfersPage.test.tsx

# Specific test pattern
npm test -- --grep "should filter by price"
```

### Test Examples

```typescript
// Unit test - utility function
it('should extract airport code from name', () => {
  const code = getAirportCode('London Heathrow (LHR)');
  expect(code).toBe('lhr');
});

// Component test
it('should render transfer options', () => {
  render(<TransferList transfers={mockTransfers} />);
  expect(screen.getByText('Train')).toBeInTheDocument();
});

// Integration test
it('should complete search flow', async () => {
  render(<App />);
  // User searches for airport
  const input = screen.getByPlaceholderText('Search airports...');
  await userEvent.type(input, 'London');
  
  // Results displayed
  expect(screen.getByText('London Heathrow (LHR)')).toBeInTheDocument();
});
```

## ✅ Code Quality

### Code Standards

- ✅ Strict TypeScript (no implicit `any`)
- ✅ ESLint with React/TypeScript rules
- ✅ Comprehensive test coverage (70%+)
- ✅ PEP 8-like consistency
- ✅ WCAG accessibility compliance
- ✅ Performance best practices

### Pre-commit Checklist

Before committing code:

```bash
# 1. Type check
npm run type-check

# 2. Lint
npm run lint

# 3. Test
npm test

# 4. Build test
npm run build
```

All should pass before committing.

### Code Review Standards

- [ ] All tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No lint warnings (`npm run lint`)
- [ ] Test coverage maintained (70%+)
- [ ] New features have tests
- [ ] Documentation updated
- [ ] Accessibility checked (keyboard nav, screen readers)

## 🆘 Troubleshooting

### Port Already in Use

The default port is 5173. If it's taken:

```bash
npm run dev -- --port 5174
```

### Backend API Not Responding

**Error**: `Failed to fetch from http://localhost:8000`

**Solutions**:
1. Ensure backend is running: `poetry run uvicorn app.main:app --reload`
2. Check backend port: should be 8000
3. Verify CORS is enabled in backend
4. Check browser console for detailed error

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Or clear npm cache
npm cache clean --force
npm install
```

### Type Checking Failures

```bash
# Regenerate types
npm run type-check

# Check for circular dependencies
npm list

# Update types package
npm update @types/react @types/node
```

### Build Fails

```bash
# Clean build
rm -rf dist
npm run build

# Check for obvious errors
npm run type-check && npm run lint

# Detailed build output
npm run build -- --debug
```

### Tests Not Running

```bash
# Ensure vitest is installed
npm install --save-dev vitest

# Regenerate node_modules
rm -rf node_modules
npm install

# Run with verbose output
npm test -- --reporter=verbose
```

### Hot Module Replacement (HMR) Not Working

- Check that Vite server is running
- Look for errors in browser console
- Try refreshing the page (F5)
- Restart dev server: `npm run dev`

## 🤝 Contributing

### Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make changes** and test locally:
   ```bash
   npm test
   npm run type-check
   npm run lint
   ```

3. **Commit with clear messages**:
   ```bash
   git commit -m "feat: add amazing feature"
   git commit -m "fix: resolve issue with search"
   git commit -m "refactor: improve component structure"
   ```

4. **Push and create a Pull Request**:
   ```bash
   git push origin feature/amazing-feature
   ```

### Commit Message Convention

Use conventional commits for clarity:

```
feat: Add new feature
fix: Fix existing bug
refactor: Restructure code
docs: Update documentation
test: Add or update tests
style: Format code
perf: Improve performance
chore: Maintenance tasks
```

### Pull Request Checklist

- [ ] Branch is up to date with main
- [ ] All tests pass (`npm test`)
- [ ] Types check (`npm run type-check`)
- [ ] Lint passes (`npm run lint`)
- [ ] Coverage maintained (70%+)
- [ ] New features have tests
- [ ] Documentation updated
- [ ] No console warnings
- [ ] Accessibility verified

## 📚 Documentation

- **[Project Structure](./PROJECT_STRUCTURE.md)** - Complete architecture overview
- **[Testing Guide](./TESTING.md)** - Comprehensive testing documentation
- **[Code Quality](./CODE_QUALITY.md)** - Standards and best practices
- **[Design Guidelines](./guidelines/Guidelines.md)** - UI/UX standards

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review existing [GitHub Issues](https://github.com/your-org/groundscanner/issues)
3. Create a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Your environment (Node version, OS, etc.)

## 👥 Team

- **Product**: Travel comparison and sustainability focus
- **Design**: User-centric, accessible interface
- **Engineering**: TypeScript, React, comprehensive testing

## 🙏 Acknowledgments

- ShadCN for the beautiful UI components
- React Testing Library for testing utilities
- Vite for the blazing fast build tool
- The open-source community

---

**Last Updated**: January 2026  
**Built with ❤️ by the GroundScanner Team**

[Website](https://groundscanner.com) • [Documentation](./PROJECT_STRUCTURE.md) • [Report Bug](https://github.com/your-org/groundscanner/issues)
