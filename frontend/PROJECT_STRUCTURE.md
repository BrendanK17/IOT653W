# GroundScanner Project Structure

Complete overview of the GroundScanner application architecture, code organization, and development guidelines.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Directory Structure](#directory-structure)
- [Type System](#type-system)
- [Utility Functions](#utility-functions)
- [Components](#components)
- [Testing](#testing)
- [Development Workflow](#development-workflow)

## Overview

GroundScanner is a travel comparison platform that helps users find the best, cheapest, and most sustainable ways to get from airports to city centers. Built with React, TypeScript, and Tailwind CSS.

### Key Features

- 🔍 Airport search with autocomplete
- 📊 Multiple comparison views (Best, Cheapest, Fastest, Eco-friendly)
- 📈 Data visualization and insights
- 🚇 Terminal transfer information
- 👤 User accounts with preferences
- 🌙 Dark mode support
- 📱 Fully responsive design
- ♿ Accessibility-focused

## Architecture

### Design Principles

1. **Type Safety First** - Strict TypeScript for all code
2. **Component Composition** - Small, reusable components
3. **Separation of Concerns** - Clear boundaries between logic and presentation
4. **Testability** - All code designed to be easily testable
5. **Maintainability** - Clear structure and documentation

### Data Flow

```
User Input
    ↓
App State (React State)
    ↓
Utility Functions (Business Logic)
    ↓
Components (Presentation)
    ↓
UI (DOM)
```

## Directory Structure

```
groundscanner/
├── types/                      # TypeScript type definitions
│   └── index.ts               # All shared types
│
├── utils/                      # Business logic utilities
│   ├── airportUtils.ts        # Airport-related functions
│   ├── transportUtils.ts      # Transport filtering & calculations
│   ├── timeUtils.ts           # Time manipulation functions
│   └── __tests__/             # Unit tests for utilities
│       ├── airportUtils.test.ts
│       ├── transportUtils.test.ts
│       └── timeUtils.test.ts
│
├── components/                 # React components
│   ├── TransfersPage.tsx      # Terminal transfers page
│   ├── NewInsightsPage.tsx    # Insights dashboard
│   ├── ui/                    # ShadCN UI components
│   ├── figma/                 # Figma-imported components
│   ├── utils/                 # Component utilities
│   │   └── mockData.ts        # Mock data for development
│   └── __tests__/             # Component tests
│       ├── TransfersPage.test.tsx
│       └── NewInsightsPage.test.tsx
│
├── __tests__/                  # Integration & E2E tests
│   ├── integration/           # Multi-component tests
│   │   ├── navigation.test.tsx
│   │   └── search.test.tsx
│   └── e2e/                   # End-to-end tests
│       └── userJourney.test.tsx
│
├── styles/                     # Global styles
│   └── globals.css            # Tailwind & custom styles
│
├── App.tsx                     # Main application entry
├── jest.config.js             # Jest configuration
├── jest.setup.js              # Test environment setup
├── tsconfig.json              # TypeScript configuration
├── .eslintrc.json             # ESLint rules
├── package.json               # Dependencies & scripts
│
└── Documentation
    ├── TESTING.md             # Testing guide
    ├── CODE_QUALITY.md        # Code quality standards
    └── PROJECT_STRUCTURE.md   # This file
```

## Type System

### Core Types (`/types/index.ts`)

#### View Types
```typescript
type ViewType = 'home' | 'results' | 'insights' | 'login' | 
                'register' | 'account' | 'transfers';
```

#### Transport Types
```typescript
type TransportMode = 'train' | 'bus' | 'taxi' | 'subway';
type TabType = 'best' | 'cheapest' | 'fastest' | 'eco';

interface TransportOption {
  id: string;
  mode: TransportMode;
  name: string;
  airport: string;
  duration: string;
  price: number;
  stops: string;
  isEco: boolean;
  isFastest: boolean;
  isCheapest: boolean;
  isBest: boolean;
  route: string;
  co2: number;
}
```

#### Application State
```typescript
interface AppState {
  currentView: ViewType;
  activeTab: TabType;
  selectedAirport: string;
  searchQuery: string;
  darkMode: boolean;
  departureTime: string;
  filters: FilterState;
  user: UserState;
}
```

## Utility Functions

### Airport Utilities (`/utils/airportUtils.ts`)

| Function | Purpose | Tests |
|----------|---------|-------|
| `getAirportCode()` | Extract airport code from name | ✓ |
| `filterAirports()` | Filter by search query | ✓ |
| `isValidAirportFormat()` | Validate format | ✓ |
| `getAirportDisplayName()` | Get full name from code | ✓ |

### Transport Utilities (`/utils/transportUtils.ts`)

| Function | Purpose | Tests |
|----------|---------|-------|
| `filterByTab()` | Filter options by active tab | ✓ |
| `applyFilters()` | Apply price & mode filters | ✓ |
| `getMostEcoFriendly()` | Find lowest CO₂ option | ✓ |
| `getFastest()` | Find shortest duration | ✓ |
| `getCheapest()` | Find lowest price | ✓ |
| `calculateAveragePrice()` | Calculate avg price | ✓ |
| `calculateAverageCO2()` | Calculate avg emissions | ✓ |

### Time Utilities (`/utils/timeUtils.ts`)

| Function | Purpose | Tests |
|----------|---------|-------|
| `isValidTimeFormat()` | Validate HH:MM format | ✓ |
| `incrementHours()` | Add/subtract hours | ✓ |
| `incrementMinutes()` | Add/subtract minutes | ✓ |
| `getCurrentTime()` | Get current time | ✓ |
| `formatTimeDisplay()` | Format to 12-hour | ✓ |

## Components

### Page Components

#### TransfersPage
**Purpose:** Display terminal transfer information
**Props:**
- `selectedAirport: string`
- `searchQuery: string`
- `darkMode: boolean`
- `isLoggedIn: boolean`
- `onSetDarkMode: (value: boolean) => void`
- `onNavigate: (view: string) => void`

**Features:**
- Free transfer options (Heathrow Express, Elizabeth Line, Buses)
- Pro tips for terminal transfers
- Responsive layout

#### NewInsightsPage
**Purpose:** Display data visualizations and analytics
**Props:**
- `selectedAirport: string`
- `searchQuery: string`
- `darkMode: boolean`
- `isLoggedIn: boolean`
- `transportOptions: TransportOption[]`
- `onSetDarkMode: (value: boolean) => void`
- `onNavigate: (view: string) => void`

**Features:**
- CO₂ emissions bar chart
- Time vs cost scatter plot
- Route map visualization
- Summary statistics

### UI Components

Located in `/components/ui/`, these are ShadCN components:
- Buttons, Cards, Dialogs
- Forms (Input, Select, Checkbox)
- Navigation (Tabs, Breadcrumbs)
- Feedback (Alert, Toast)
- Data Display (Table, Badge)

## Testing

### Test Coverage Goals

| Type | Target | Current |
|------|--------|---------|
| Unit Tests | 90%+ | ✓ |
| Component Tests | 80%+ | ✓ |
| Integration Tests | 75%+ | ✓ |
| E2E Tests | Critical paths | ✓ |
| Overall | 70%+ | ✓ |

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# With coverage
npm run test:coverage

# Specific types
npm run test:unit
npm run test:integration
npm run test:e2e

# Single file
npm test -- airportUtils.test.ts
```

### Test Organization

```
Unit Tests (70%)
├── airportUtils.test.ts    - Airport functions
├── transportUtils.test.ts  - Transport logic
└── timeUtils.test.ts       - Time operations

Component Tests (20%)
├── TransfersPage.test.tsx  - Page rendering
└── NewInsightsPage.test.tsx - Charts & data

Integration Tests (7%)
├── navigation.test.tsx     - Page navigation
└── search.test.tsx         - Search flows

E2E Tests (3%)
└── userJourney.test.tsx    - Complete flows
```

## Development Workflow

### 1. Setup

```bash
# Install dependencies
npm install

# Start development
npm run dev
```

### 2. Development

```bash
# Run tests in watch mode
npm test -- --watch

# Type checking
npm run type-check

# Linting
npm run lint
```

### 3. Before Commit

```bash
# Run all checks
npm run type-check
npm run lint
npm test

# Or use a pre-commit hook
```

### 4. Adding Features

1. **Define Types** - Add to `/types/index.ts`
2. **Create Utilities** - Add to `/utils/` with tests
3. **Build Components** - Add to `/components/` with tests
4. **Write Integration Tests** - Add to `/__tests__/integration/`
5. **Update Documentation** - Update relevant .md files

### 5. Code Review Checklist

- [ ] All tests pass
- [ ] Type checking passes
- [ ] Linting passes
- [ ] Coverage maintained (70%+)
- [ ] Functions documented
- [ ] Complex logic explained
- [ ] No console.log statements
- [ ] Accessibility considered
- [ ] Mobile responsive
- [ ] Dark mode supported

## Best Practices

### TypeScript

```typescript
// ✓ Good - Explicit types
function calculateTotal(prices: number[]): number {
  return prices.reduce((sum, p) => sum + p, 0);
}

// ✗ Bad - Implicit any
function calculateTotal(prices) {
  return prices.reduce((sum, p) => sum + p, 0);
}
```

### Components

```typescript
// ✓ Good - Props interface
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}

// ✗ Bad - Inline types
export function Button({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick}>{label}</button>;
}
```

### Testing

```typescript
// ✓ Good - Descriptive test
it('should filter airports by search query case-insensitively', () => {
  const result = filterAirports(airports, 'LONDON');
  expect(result).toHaveLength(3);
});

// ✗ Bad - Unclear test
it('works', () => {
  expect(filterAirports(airports, 'LONDON').length).toBe(3);
});
```

## Performance Considerations

### Optimization Strategies

1. **Memoization** - Use `useMemo` for expensive calculations
2. **Code Splitting** - Lazy load routes/pages
3. **Image Optimization** - Use appropriate formats and sizes
4. **Bundle Size** - Monitor and minimize dependencies
5. **Virtual Scrolling** - For large lists

### Current Optimizations

- Lazy-loaded images with fallbacks
- Debounced search input
- Memoized filter calculations
- Efficient re-render prevention

## Future Enhancements

### Planned Features

- [ ] Real-time price updates
- [ ] User reviews and ratings
- [ ] Booking integration
- [ ] Push notifications
- [ ] Multi-language support
- [ ] Currency conversion
- [ ] Saved searches
- [ ] Price alerts

### Technical Improvements

- [ ] Server-side rendering (Next.js)
- [ ] API integration (REST/GraphQL)
- [ ] State management (Zustand/Redux)
- [ ] End-to-end testing (Playwright/Cypress)
- [ ] Performance monitoring
- [ ] Error tracking (Sentry)
- [ ] Analytics integration

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Testing Library](https://testing-library.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Project Testing Guide](./TESTING.md)
- [Code Quality Guide](./CODE_QUALITY.md)

## Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run all checks
6. Submit a pull request

### Commit Convention

```
type(scope): description

- feat: New feature
- fix: Bug fix
- docs: Documentation
- test: Tests
- refactor: Code refactoring
- style: Formatting
- chore: Maintenance
```

Example:
```
feat(search): add airport autocomplete with debouncing

- Implemented debounced search input
- Added loading states
- Improved accessibility
```

---

**Last Updated:** 2025-01-13
**Version:** 1.0.0
**Maintainers:** GroundScanner Team
