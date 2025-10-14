# Code Quality & Testing Guide

This document outlines the code quality standards, type safety, and testing practices for the GroundScanner application.

## Table of Contents

- [Type Safety](#type-safety)
- [Code Organization](#code-organization)
- [Testing Strategy](#testing-strategy)
- [Best Practices](#best-practices)
- [Continuous Integration](#continuous-integration)

## Type Safety

### TypeScript Configuration

The project uses strict TypeScript settings for maximum type safety:

```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true,
  "noImplicitReturns": true,
  "noUncheckedIndexedAccess": true
}
```

### Type Definitions

All types are centralized in `/types/index.ts`:

```typescript
// Core application types
export type ViewType = 'home' | 'results' | 'insights' | ...;
export interface TransportOption { ... }
export interface FilterState { ... }
```

### Type Checking

Run type checking without emitting files:

```bash
npm run type-check
```

## Code Organization

### Directory Structure

```
project/
├── types/              # TypeScript type definitions
├── utils/              # Utility functions with tests
│   ├── airportUtils.ts
│   ├── transportUtils.ts
│   ├── timeUtils.ts
│   └── __tests__/     # Unit tests for utilities
├── components/         # React components
│   ├── TransfersPage.tsx
│   ├── NewInsightsPage.tsx
│   └── __tests__/     # Component tests
├── __tests__/          # Integration and E2E tests
│   ├── integration/
│   └── e2e/
└── App.tsx            # Main application
```

### Utility Functions

All reusable logic is extracted into utility functions:

#### `airportUtils.ts`
- `getAirportCode()` - Extract airport code from name
- `filterAirports()` - Filter airports by search query
- `isValidAirportFormat()` - Validate airport name format
- `getAirportDisplayName()` - Get full name from code

#### `transportUtils.ts`
- `filterByTab()` - Filter options by tab type
- `applyFilters()` - Apply price and mode filters
- `getMostEcoFriendly()` - Find lowest CO2 option
- `getFastest()` - Find shortest duration
- `getCheapest()` - Find lowest price
- `calculateAveragePrice()` - Calculate average cost
- `calculateAverageCO2()` - Calculate average emissions

#### `timeUtils.ts`
- `isValidTimeFormat()` - Validate time string
- `incrementHours()` - Add/subtract hours
- `incrementMinutes()` - Add/subtract minutes
- `formatTimeDisplay()` - Format for display (12-hour)
- `getCurrentTime()` - Get current time

### Component Structure

Components follow a consistent pattern:

```typescript
interface ComponentProps {
  // All props explicitly typed
  data: DataType;
  onAction: (param: string) => void;
}

export function Component({ data, onAction }: ComponentProps) {
  // Component implementation
}
```

## Testing Strategy

### Test Pyramid

```
    E2E Tests (Few)           - Complete user journeys
   ─────────────────
  Integration Tests (Some)    - Feature workflows
 ───────────────────────
Unit Tests (Many)              - Functions & utilities
```

### Unit Tests (70% of tests)

**Purpose:** Test individual functions in isolation

**Location:** `utils/__tests__/`

**Coverage:** 90%+ for utilities

```bash
npm run test:unit
```

**Example:**
```typescript
describe('getAirportCode', () => {
  it('should extract airport code from valid name', () => {
    expect(getAirportCode('London Heathrow (LHR)')).toBe('lhr');
  });
});
```

### Component Tests (20% of tests)

**Purpose:** Test component rendering and interactions

**Location:** `components/__tests__/`

**Coverage:** 80%+ for components

```bash
npm test components/
```

**Example:**
```typescript
it('should navigate when button clicked', () => {
  render(<Component onNavigate={mockFn} />);
  fireEvent.click(screen.getByRole('button'));
  expect(mockFn).toHaveBeenCalledWith('expected-view');
});
```

### Integration Tests (7% of tests)

**Purpose:** Test multiple components working together

**Location:** `__tests__/integration/`

**Coverage:** Critical user paths

```bash
npm run test:integration
```

**Example:**
```typescript
it('should complete search flow', async () => {
  render(<App />);
  // Search for airport
  // Click search
  // Verify results displayed
});
```

### E2E Tests (3% of tests)

**Purpose:** Test complete user journeys

**Location:** `__tests__/e2e/`

**Coverage:** Critical business flows

```bash
npm run test:e2e
```

**Example:**
```typescript
it('should complete booking journey', async () => {
  // Login
  // Search
  // View results
  // Book transport
});
```

## Best Practices

### 1. Pure Functions

Utility functions should be pure (no side effects):

```typescript
// Good - Pure function
export function calculateTotal(prices: number[]): number {
  return prices.reduce((sum, price) => sum + price, 0);
}

// Bad - Side effects
let total = 0;
export function calculateTotal(prices: number[]): void {
  total = prices.reduce((sum, price) => sum + price, 0);
}
```

### 2. Explicit Types

Always use explicit types, avoid `any`:

```typescript
// Good
function processData(data: TransportOption[]): number {
  return data.length;
}

// Bad
function processData(data: any): any {
  return data.length;
}
```

### 3. Error Handling

Handle errors appropriately:

```typescript
export function parseAirportCode(name: string): string {
  const match = name.match(/\(([^)]+)\)/);
  if (!match) {
    throw new Error(`Invalid airport name format: ${name}`);
  }
  return match[1].toLowerCase();
}
```

### 4. Immutability

Use immutable data patterns:

```typescript
// Good - Immutable
const updatedOptions = options.map(opt => ({
  ...opt,
  price: opt.price * 1.1
}));

// Bad - Mutates original
options.forEach(opt => {
  opt.price = opt.price * 1.1;
});
```

### 5. Documentation

Document complex functions:

```typescript
/**
 * Filters transport options based on active tab and user preferences
 * @param options - Array of all available transport options
 * @param tab - Currently active tab (best, cheapest, fastest, eco)
 * @param filters - User's filter preferences
 * @returns Filtered array of transport options
 * @throws {Error} If options array is invalid
 */
export function getFilteredOptions(
  options: TransportOption[],
  tab: TabType,
  filters: FilterState
): TransportOption[] {
  // Implementation
}
```

### 6. Small Functions

Keep functions focused and small:

```typescript
// Good - Single responsibility
function isEcoFriendly(co2: number): boolean {
  return co2 < 2.0;
}

function isCheap(price: number): boolean {
  return price < 10;
}

// Use together
function findBestOption(option: TransportOption): boolean {
  return isEcoFriendly(option.co2) && isCheap(option.price);
}
```

### 7. Consistent Naming

Use clear, consistent naming:

```typescript
// Good
function calculateAveragePrice(options: TransportOption[]): number
function filterByMaxPrice(options: TransportOption[], max: number): TransportOption[]
function sortByPrice(options: TransportOption[]): TransportOption[]

// Bad
function calc(opts: any): number
function filter(stuff: any, x: number): any
function sort(arr: any): any
```

## Code Quality Checks

### Linting

Run ESLint to check code quality:

```bash
npm run lint
```

Fix auto-fixable issues:

```bash
npm run lint -- --fix
```

### Type Checking

Check for type errors:

```bash
npm run type-check
```

### Testing

Run all tests:

```bash
npm test
```

Run with coverage:

```bash
npm run test:coverage
```

### Pre-commit Checklist

Before committing code:

- [ ] All tests pass (`npm test`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Coverage meets threshold (70%+)
- [ ] No console.log statements (except console.error/warn)
- [ ] All new functions have tests
- [ ] All new components have tests
- [ ] Complex logic is documented

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: CI
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Quality Gates

Pull requests must pass:

1. **Type checking** - No TypeScript errors
2. **Linting** - No ESLint errors
3. **Tests** - All tests pass
4. **Coverage** - Meets 70% threshold
5. **Build** - Application builds successfully

## Maintenance

### Regular Tasks

- **Weekly:** Review test coverage report
- **Monthly:** Update dependencies
- **Quarterly:** Review and refactor complex code
- **Ongoing:** Add tests for new features

### Refactoring Guidelines

When refactoring:

1. Ensure tests pass before refactoring
2. Refactor in small increments
3. Run tests after each change
4. Keep test coverage at or above current level
5. Update documentation as needed

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [Testing Documentation](./TESTING.md)
