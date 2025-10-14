# GroundScanner

> A travel comparison platform for finding the best, cheapest, and most sustainable airport-to-city transfers.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)](./TESTING.md)
[![Coverage](https://img.shields.io/badge/Coverage-70%25+-brightgreen.svg)](./CODE_QUALITY.md)

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

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/groundscanner.git

# Navigate to directory
cd groundscanner

# Install dependencies
npm install

# Start development server
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Watch mode
npm test -- --watch
```

## 📚 Documentation

- **[Project Structure](./PROJECT_STRUCTURE.md)** - Complete architecture overview
- **[Testing Guide](./TESTING.md)** - Comprehensive testing documentation
- **[Code Quality](./CODE_QUALITY.md)** - Standards and best practices

## 🏗️ Architecture

### Tech Stack

- **Frontend:** React 18, TypeScript 5.2
- **Styling:** Tailwind CSS 4.0
- **UI Components:** ShadCN UI
- **Icons:** Lucide React
- **Testing:** Jest, React Testing Library
- **Linting:** ESLint, TypeScript ESLint

### Project Structure

```
groundscanner/
├── types/                 # TypeScript definitions
├── utils/                 # Business logic & utilities
│   └── __tests__/        # Unit tests
├── components/            # React components
│   ├── ui/               # ShadCN UI components
│   └── __tests__/        # Component tests
├── __tests__/            # Integration & E2E tests
└── App.tsx               # Main application
```

## 🧪 Testing

We maintain high test coverage with multiple testing strategies:

| Test Type | Coverage | Location |
|-----------|----------|----------|
| Unit Tests | 90%+ | `utils/__tests__/` |
| Component Tests | 80%+ | `components/__tests__/` |
| Integration Tests | 75%+ | `__tests__/integration/` |
| E2E Tests | Critical paths | `__tests__/e2e/` |
| **Overall** | **70%+** | All files |

### Test Examples

```typescript
// Unit test
it('should extract airport code from name', () => {
  expect(getAirportCode('London Heathrow (LHR)')).toBe('lhr');
});

// Component test
it('should navigate when button clicked', () => {
  render(<TransfersPage {...props} />);
  fireEvent.click(screen.getByText('GroundScanner'));
  expect(props.onNavigate).toHaveBeenCalledWith('home');
});

// Integration test
it('should complete search flow', async () => {
  render(<App />);
  // User searches for airport
  // Results are displayed
  // User can filter and sort
});
```

## 🔧 Development

### Available Scripts

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run test:unit     # Run only unit tests
npm run test:integration # Run integration tests
npm run test:e2e      # Run end-to-end tests
npm run lint          # Check code quality
npm run type-check    # Check TypeScript types
```

### Code Quality

We enforce high code quality standards:

- ✅ Strict TypeScript with no implicit `any`
- ✅ ESLint with React and TypeScript rules
- ✅ Comprehensive test coverage (70%+)
- ✅ Proper error handling
- ✅ Accessibility compliance
- ✅ Performance optimization

### Pre-commit Checklist

Before committing code:

- [ ] All tests pass (`npm test`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Coverage maintained (70%+)
- [ ] New features have tests
- [ ] Documentation updated

## 📦 Key Utilities

### Airport Utils

```typescript
import { getAirportCode, filterAirports } from './utils/airportUtils';

// Extract code
getAirportCode('London Heathrow (LHR)'); // 'lhr'

// Filter airports
filterAirports(airports, 'London'); // [LHR, LGW, LCY, ...]
```

### Transport Utils

```typescript
import { 
  getMostEcoFriendly, 
  calculateAverageCO2 
} from './utils/transportUtils';

// Find greenest option
const eco = getMostEcoFriendly(options);

// Calculate average emissions
const avgCO2 = calculateAverageCO2(options);
```

### Time Utils

```typescript
import { incrementHours, formatTimeDisplay } from './utils/timeUtils';

// Add hours
incrementHours('10:30', 2); // '12:30'

// Format for display
formatTimeDisplay('14:30'); // '2:30 PM'
```

## 🎨 Components

### TransfersPage

Displays terminal transfer information:

```typescript
<TransfersPage
  selectedAirport="London Heathrow (LHR)"
  darkMode={true}
  isLoggedIn={true}
  onNavigate={handleNavigate}
  onSetDarkMode={setDarkMode}
/>
```

### NewInsightsPage

Shows data visualizations:

```typescript
<NewInsightsPage
  selectedAirport="London Heathrow (LHR)"
  transportOptions={options}
  darkMode={true}
  isLoggedIn={true}
  onNavigate={handleNavigate}
  onSetDarkMode={setDarkMode}
/>
```

## 🎯 Type Safety

All code is fully typed with TypeScript:

```typescript
// Core types
type ViewType = 'home' | 'results' | 'insights' | ...;
type TransportMode = 'train' | 'bus' | 'taxi' | 'subway';

// Interfaces
interface TransportOption {
  id: string;
  mode: TransportMode;
  name: string;
  price: number;
  co2: number;
  // ...
}

// Props
interface PageProps {
  selectedAirport: string;
  darkMode: boolean;
  onNavigate: (view: ViewType) => void;
}
```

## 🌐 Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for your changes
5. Ensure all tests pass
6. Commit your changes (`git commit -m 'feat: add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Product**: Travel comparison and sustainability focus
- **Design**: User-centric, accessible interface
- **Engineering**: TypeScript, React, comprehensive testing

## 📞 Support

- 📧 Email: support@groundscanner.com
- 💬 Issues: [GitHub Issues](https://github.com/your-org/groundscanner/issues)
- 📖 Documentation: See `/docs` folder

## 🙏 Acknowledgments

- ShadCN for the beautiful UI components
- React Testing Library for testing utilities
- The open-source community

---

**Built with ❤️ by the GroundScanner Team**

[Website](https://groundscanner.com) • [Documentation](./PROJECT_STRUCTURE.md) • [Report Bug](https://github.com/your-org/groundscanner/issues)
