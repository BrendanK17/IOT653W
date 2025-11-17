import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { LoginForm, RegisterForm } from './components/auth/AuthForms';
import { HomePage } from './components/layout/HomePage';
import { NewInsightsPage } from './components/InsightsPage';
import { TransfersPage } from './components/TransfersPage';
import { TerminalTransfersPage } from './components/TerminalTransfersPage';
import { AccountPage } from './components/AccountPage';
import { airports, transportOptions as rawTransportOptions } from './utils/mockData';
import { ViewType, TransportOption } from './types';

// Convert airports data structure to simple array for backward compatibility
const mockAirports = Object.entries(airports).flatMap(([city, airportList]) =>
  airportList.map(airport => {
    // Format as "City AirportName (CODE)" e.g., "London Heathrow (LHR)"
    const cityName = city === 'London (All Airports)' ? 'London' : city;
    return `${cityName} ${airport.name.replace(' Airport', '')} (${airport.code})`;
  })
);

// Helper function to extract airport code from formatted string
const extractAirportCode = (airportString: string): string => {
  const match = airportString.match(/\(([A-Z]{3})\)/);
  return match?.[1] || '';
};

// Convert transport options from mockData format to component format
const convertTransportOptions = (options: any[], airportCode: string): TransportOption[] => {
  return options.map((option, index) => ({
    id: `${airportCode}-${index + 1}`,
    mode: option.mode,
    name: option.route,
    airport: airportCode,
    duration: `${option.duration} mins`,
    price: option.price,
    stops: option.stops === 0 ? 'Direct' : `${option.stops} stops`,
    isEco: option.isEcoFriendly || false,
    isFastest: option.isFastest || false,
    isCheapest: option.isCheapest || false,
    isBest: option.isBestOverall || false,
    route: option.route,
    co2: option.co2 || 0,
  }));
};

// Helper function to get airport name from code
const getAirportNameFromCode = (code: string): string => {
  const upperCode = code.toUpperCase();
  for (const [city, airportList] of Object.entries(airports)) {
    const airport = airportList.find(a => a.code === upperCode);
    if (airport) {
      const cityName = city === 'London (All Airports)' ? 'London' : city;
      return `${cityName} ${airport.name.replace(' Airport', '')} (${airport.code})`;
    }
  }
  return '';
};

// Wrapper component for TransfersPage that reads URL params
const TransfersPageWrapper = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const { airportCode } = useParams<{ airportCode: string }>();
  const navigate = useNavigate();
  
  const airportName = getAirportNameFromCode(airportCode || '');
  const transportOptions = airportCode ? convertTransportOptions(
    rawTransportOptions[(airportCode.toUpperCase()) as keyof typeof rawTransportOptions] || [],
    airportCode.toUpperCase()
  ) : [];

  // Redirect to home if invalid airport code
  if (!airportName && airportCode) {
    return <Navigate to="/" replace />;
  }

  const handleNavigate = (view: ViewType) => {
    switch (view) {
      case 'home':
        navigate('/');
        break;
      case 'login':
        navigate('/login');
        break;
      case 'register':
        navigate('/register');
        break;
      case 'account':
        navigate('/account');
        break;
      case 'insights':
        navigate(`/${airportCode}/insights`);
        break;
      case 'terminal-transfers':
        navigate(`/${airportCode}/transfers`);
        break;
      default:
        navigate('/');
    }
  };

  const onAirportSelect = (airport: string) => {
    const code = extractAirportCode(airport);
    navigate(`/${code}`);
  };

  return (
    <TransfersPage
      isLoggedIn={isLoggedIn}
      onNavigate={handleNavigate}
      selectedAirport={airportName}
      searchQuery={airportName}
      transportOptions={transportOptions}
      onAirportSelect={onAirportSelect}
      airports={mockAirports}
    />
  );
};

// Wrapper component for TerminalTransfersPage that reads URL params
const TerminalTransfersPageWrapper = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const { airportCode } = useParams<{ airportCode: string }>();
  const navigate = useNavigate();

  const airportName = getAirportNameFromCode(airportCode || '');

  // Redirect to home if invalid airport code
  if (!airportName && airportCode) {
    return <Navigate to="/" replace />;
  }

  const handleNavigate = (view: ViewType) => {
    switch (view) {
      case 'home':
        navigate('/');
        break;
      case 'login':
        navigate('/login');
        break;
      case 'register':
        navigate('/register');
        break;
      case 'account':
        navigate('/account');
        break;
      case 'insights':
        navigate(`/${airportCode}/insights`);
        break;
      case 'transfers':
        navigate(`/${airportCode}`);
        break;
      default:
        navigate('/');
    }
  };

  return (
    <TerminalTransfersPage
      isLoggedIn={isLoggedIn}
      onNavigate={handleNavigate}
      selectedAirport={airportName}
    />
  );
};

// Wrapper component for InsightsPage that reads URL params
const InsightsPageWrapper = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const { airportCode } = useParams<{ airportCode: string }>();
  const navigate = useNavigate();

  const airportName = getAirportNameFromCode(airportCode || '');

  // Redirect to home if invalid airport code
  if (!airportName && airportCode) {
    return <Navigate to="/" replace />;
  }

  const handleNavigate = (view: ViewType) => {
    switch (view) {
      case 'home':
        navigate('/');
        break;
      case 'login':
        navigate('/login');
        break;
      case 'register':
        navigate('/register');
        break;
      case 'account':
        navigate('/account');
        break;
      case 'results':
        navigate(`/${airportCode}`);
        break;
      case 'transfers':
        navigate(`/${airportCode}`);
        break;
      case 'terminal-transfers':
        navigate(`/${airportCode}/transfers`);
        break;
      default:
        navigate('/');
    }
  };

  const handleDarkModeChange = (value: boolean) => {
    // For now, just log - in a real app this would update global state
    console.log('Dark mode changed:', value);
  };

  return (
    <NewInsightsPage
      darkMode={false} // Default to light mode for now
      isLoggedIn={isLoggedIn}
      onDarkModeChange={handleDarkModeChange}
      onNavigate={handleNavigate}
    />
  );
};

function App() {
  const navigate = useNavigate();

  // User state
  const [userState, setUserState] = useState({
    isLoggedIn: false,
    email: '',
    defaultAirport: '',
  });

  // App state
  const [appState, setAppState] = useState({
    currentView: 'home' as ViewType,
    activeTab: 'best' as const,
    selectedAirport: '',
    searchQuery: '',
    showDropdown: false,
    showHeaderDropdown: false,
    darkMode: false,
    departureTime: '09:00',
    filters: {
      maxPrice: 50,
      transportModes: {
        train: true,
        bus: true,
        taxi: true,
        subway: true,
      },
    },
  });

  // Apply dark mode class to root html element
  useEffect(() => {
    if (appState.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appState.darkMode]);

  // Update app state when user logs in/out
  useEffect(() => {
    if (userState.isLoggedIn && userState.defaultAirport && !appState.searchQuery) {
      setAppState(prev => ({
        ...prev,
        searchQuery: userState.defaultAirport,
        selectedAirport: userState.defaultAirport,
      }));
    }
  }, [userState.isLoggedIn, userState.defaultAirport, appState.searchQuery]);

  const handleNavigate = (view: ViewType) => {
    switch (view) {
      case 'login':
        navigate('/login');
        break;
      case 'register':
        navigate('/register');
        break;
      case 'account':
        navigate('/account');
        break;
      default:
        setAppState(prev => ({ ...prev, currentView: view }));
    }
  };

  const handleDarkModeChange = (value: boolean) => {
    setAppState(prev => ({ ...prev, darkMode: value }));
  };

  const handleLogin = (email: string) => {
    setUserState({
      isLoggedIn: true,
      email,
      defaultAirport: '',
    });
    navigate('/');
  };

  const handleLogout = () => {
    setUserState({
      isLoggedIn: false,
      email: '',
      defaultAirport: '',
    });
    navigate('/');
  };

  // Determine what to render based on both URL and state
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <LoginForm
            onLogin={handleLogin}
            onNavigate={handleNavigate}
          />
        }
      />
      
      <Route 
        path="/register" 
        element={
          <RegisterForm
            onRegister={handleLogin}
            onNavigate={handleNavigate}
          />
        }
      />

      <Route 
        path="/account" 
        element={
          userState.isLoggedIn ? (
            <AccountPage
              userEmail={userState.email}
              defaultAirport={userState.defaultAirport}
              setDefaultAirport={(value: string) => setUserState(prev => ({ ...prev, defaultAirport: value }))}
              setIsLoggedIn={(value: boolean) => {
                if (!value) handleLogout();
              }}
              setUserEmail={(value: string) => setUserState(prev => ({ ...prev, email: value }))}
              onNavigateHome={() => handleNavigate('home')}
              airports={mockAirports}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route 
        path="/*" 
        element={(() => {
          switch (appState.currentView) {
            case 'insights':
              return (
                <NewInsightsPage
                  darkMode={appState.darkMode}
                  isLoggedIn={userState.isLoggedIn}
                  onDarkModeChange={handleDarkModeChange}
                  onNavigate={handleNavigate}
                />
              );

            case 'home':
            default:
              return (
                <HomePage
                  isLoggedIn={userState.isLoggedIn}
                  searchQuery={appState.searchQuery}
                  onSearchChange={(query) => setAppState(prev => ({ ...prev, searchQuery: query }))}
                  onSearch={() => {
                    const code = extractAirportCode(appState.selectedAirport || appState.searchQuery);
                    if (code) {
                      navigate(`/${code.toLowerCase()}`);
                    }
                  }}
                  selectedAirport={appState.selectedAirport}
                  showDropdown={appState.showDropdown}
                  onShowDropdown={(show) => setAppState(prev => ({ ...prev, showDropdown: show }))}
                  onAirportSelect={(airport) => setAppState(prev => ({ ...prev, selectedAirport: airport }))}
                  onNavigate={handleNavigate}
                  airports={mockAirports}
                  userEmail={userState.email}
                  onLogout={handleLogout}
                />
              );
          }
        })()}
      />

      {/* Airport-specific route */}
      <Route 
        path="/:airportCode" 
        element={<TransfersPageWrapper isLoggedIn={userState.isLoggedIn} />}
      />

      {/* Terminal transfers route */}
      <Route 
        path="/:airportCode/transfers" 
        element={<TerminalTransfersPageWrapper isLoggedIn={userState.isLoggedIn} />}
      />

      {/* Insights route */}
      <Route 
        path="/:airportCode/insights" 
        element={<InsightsPageWrapper isLoggedIn={userState.isLoggedIn} />}
      />
    </Routes>
  );
}

export default App;