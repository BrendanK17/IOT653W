# Testing Documentation

This document outlines the testing strategy and practices for the GroundScanner application.

## Table of Contents

- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Test Types](#test-types)
- [Writing Tests](#writing-tests)
- [Coverage](#coverage)
- [Best Practices](#best-practices)

## Test Structure

```
project/
├── __tests__/
│   ├── e2e/                    # End-to-end tests
│   │   └── userJourney.test.tsx
│   └── integration/            # Integration tests
│       ├── navigation.test.tsx
│       └── search.test.tsx
├── components/
│   └── __tests__/             # Component unit tests
│       ├── NewInsightsPage.test.tsx
│       └── TransfersPage.test.tsx
└── utils/
    └── __tests__/             # Utility function tests
        ├── airportUtils.test.ts
        ├── timeUtils.test.ts
        └── transportUtils.test.ts
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run specific test file
```bash
npm test -- airportUtils.test.ts
```

### Run tests with coverage
```bash
npm test -- --coverage
```

### Run only integration tests
```bash
npm test -- __tests__/integration
```

### Run only e2e tests
```bash
npm test -- __tests__/e2e
```

## Test Types

### 1. Unit Tests

Test individual functions and utilities in isolation.

**Location:** `utils/__tests__/`

**Examples:**
- `airportUtils.test.ts` - Airport code extraction, filtering
- `timeUtils.test.ts` - Time manipulation and validation
- `transportUtils.test.ts` - Transport filtering and calculations

**Purpose:**
- Ensure utility functions work correctly
- Test edge cases and error handling
- Fast execution for rapid feedback

### 2. Component Tests

Test React components in isolation with mock props.

**Location:** `components/__tests__/`

**Examples:**
- `TransfersPage.test.tsx` - Terminal transfers page rendering
- `NewInsightsPage.test.tsx` - Insights page with charts

**Purpose:**
- Verify component renders correctly
- Test user interactions
- Ensure props are handled properly

### 3. Integration Tests

Test multiple components working together.

**Location:** `__tests__/integration/`

**Examples:**
- `navigation.test.tsx` - Multi-page navigation flows
- `search.test.tsx` - Search functionality with results

**Purpose:**
- Verify feature workflows
- Test component interactions
- Ensure data flows correctly

### 4. End-to-End Tests

Test complete user journeys from start to finish.

**Location:** `__tests__/e2e/`

**Examples:**
- `userJourney.test.tsx` - Full search, booking, and account flows

**Purpose:**
- Simulate real user behavior
- Verify critical paths work
- Catch integration issues

## Writing Tests

### Test Structure

Follow the AAA (Arrange, Act, Assert) pattern:

```typescript
it('should do something', () => {
  // Arrange - Set up test data and environment
  const input = 'test input';
  
  // Act - Execute the code being tested
  const result = functionUnderTest(input);
  
  // Assert - Verify the results
  expect(result).toBe('expected output');
});
```

### Component Testing Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  const mockProps = {
    onAction: jest.fn(),
    data: [...],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with props', () => {
    render(<MyComponent {...mockProps} />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', () => {
    render(<MyComponent {...mockProps} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockProps.onAction).toHaveBeenCalled();
  });
});
```

### Utility Testing Example

```typescript
import { utilityFunction } from '../utils';

describe('utilityFunction', () => {
  it('should handle valid input', () => {
    expect(utilityFunction('valid')).toBe('expected');
  });

  it('should handle edge cases', () => {
    expect(utilityFunction('')).toBe('');
    expect(utilityFunction(null)).toBe('');
  });

  it('should throw error for invalid input', () => {
    expect(() => utilityFunction('invalid')).toThrow();
  });
});
```

## Coverage

### Coverage Goals

- **Statements:** 70%+
- **Branches:** 70%+
- **Functions:** 70%+
- **Lines:** 70%+

### View Coverage Report

```bash
npm test -- --coverage
```

This generates a coverage report in the terminal and creates an HTML report in `coverage/lcov-report/index.html`.

### Coverage Best Practices

1. **Focus on critical paths** - Prioritize testing business logic
2. **Test edge cases** - Handle null, undefined, empty values
3. **Don't test implementation details** - Test behavior, not internals
4. **Mock external dependencies** - Isolate code under test

## Best Practices

### 1. Test Naming

Use descriptive test names that explain what is being tested:

```typescript
// Good
it('should filter airports by search query case-insensitively', () => {

// Bad
it('test filterAirports', () => {
```

### 2. Use Data-Driven Tests

For testing multiple scenarios:

```typescript
describe.each([
  ['London Heathrow (LHR)', 'lhr'],
  ['Manchester (MAN)', 'man'],
  ['Edinburgh (EDI)', 'edi'],
])('getAirportCode', (input, expected) => {
  it(`should extract ${expected} from ${input}`, () => {
    expect(getAirportCode(input)).toBe(expected);
  });
});
```

### 3. Mock External Dependencies

```typescript
jest.mock('../api', () => ({
  fetchData: jest.fn(() => Promise.resolve(mockData)),
}));
```

### 4. Clean Up After Tests

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up any test artifacts
});
```

### 5. Test Accessibility

```typescript
it('should be accessible', () => {
  const { container } = render(<MyComponent />);
  expect(container.querySelector('button')).toHaveAttribute('aria-label');
});
```

### 6. Avoid Testing Implementation Details

```typescript
// Bad - Testing internal state
expect(component.state.count).toBe(1);

// Good - Testing user-facing behavior
expect(screen.getByText('Count: 1')).toBeInTheDocument();
```

### 7. Use Testing Library Queries

Prefer queries in this order:
1. `getByRole` - Most accessible
2. `getByLabelText` - For form fields
3. `getByPlaceholderText` - For inputs
4. `getByText` - For content
5. `getByTestId` - Last resort

## Continuous Integration

### Pre-commit Checks

Run tests before committing:

```bash
npm test -- --bail --findRelatedTests
```

### CI Pipeline

Tests should run in CI/CD on:
- Pull requests
- Merges to main branch
- Nightly builds

Example GitHub Actions workflow:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm test -- --coverage
```

## Debugging Tests

### Run Single Test

```bash
npm test -- -t "specific test name"
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal"
}
```

### View DOM in Tests

```typescript
import { screen, debug } from '@testing-library/react';

// Print entire DOM
debug();

// Print specific element
debug(screen.getByRole('button'));
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
