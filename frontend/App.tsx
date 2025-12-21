import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { LoginForm, RegisterForm } from './components/auth/AuthForms';
import { HomePage } from './components/layout/HomePage';
import { NewInsightsPage } from './components/InsightsPage';
import { TransfersPage } from './components/TransfersPage';
import { TerminalTransfersPage } from './components/TerminalTransfersPage';
import { AccountPage } from './components/AccountPage';
import { ViewType, TransportOption } from './types';
import { useToast } from './components/ui/Toast';
import { refreshAccessToken, parseJwt, default as API_BASE } from './utils/api';
import type { AirportOption } from './components/search/SearchComponents';

// Module-level guards to prevent duplicate startup effects (works with React StrictMode)
let __refreshRan = false;
let __airportsLoaded = false;

// Helper function to extract airport code from formatted string
const extractAirportCode = (airportString: string): string => {
  const match = airportString.match(/\(([A-Z]{3})\)/);
  return match?.[1] || '';
};

// Convert transport options from backend API format to component format
const convertTransportOptions = (options: any[], airportCode: string): TransportOption[] => {
  // helper to map backend modes to our frontend modes
  const mapMode = (m: string) => {
    if (!m) return 'train';
    const mm = m.toLowerCase();
    if (mm === 'rail' || mm === 'train') return 'train';
    if (mm === 'coach' || mm === 'bus') return 'bus';
    if (mm === 'underground' || mm === 'subway' || mm === 'tube') return 'subway';
    if (mm === 'taxi' || mm === 'cab' || mm === 'ride_hailing') return 'taxi';
    return 'train';
  };

  return options.map((option, index) => {
    // Support backend shape: option.stops is an array of stops with prices
    const backendStops = Array.isArray(option.stops) ? option.stops : undefined;

    // compute price: pick minimum positive price from stops/prices, or fallback to option.price
    let price = 0;
    if (backendStops && backendStops.length) {
      const amounts: number[] = [];
      for (const s of backendStops) {
        if (Array.isArray(s.prices)) {
          for (const p of s.prices) {
            const a = Number(p?.amount);
            if (!Number.isNaN(a) && a > 0) amounts.push(a);
          }
        }
      }
      if (amounts.length) price = Math.min(...amounts);
    }
    if (!price && typeof option.price === 'number' && option.price > 0) price = option.price;

    // duration: backend doesn't provide duration; estimate from stops or fallback
    const durationMinutes = backendStops ? Math.max(10, Math.round(backendStops.length * 2)) : (typeof option.duration === 'number' ? option.duration : parseInt(option.duration || '0'));
    const duration = `${durationMinutes} mins`;

    // stops string
    const stopsStr = backendStops ? (backendStops.length <= 1 ? 'Direct' : `${backendStops.length} stops`) : (typeof option.stops === 'string' ? option.stops : (option.stops === 0 ? 'Direct' : `${option.stops} stops`));

    // route: prefer option.route or combine name + last stop
    let route = option.route || option.name || '';
    if (!route && backendStops && backendStops.length) {
      const last = backendStops[backendStops.length - 1];
      route = `${option.name || ''} → ${last?.stop_name || ''}`.trim();
    }

    // co2: backend may have null
    const co2 = (option.co2 === null || option.co2 === undefined) ? 0 : Number(option.co2) || 0;

    // simple heuristics for flags
    const mode = mapMode(option.mode || option.type || 'train');
    const isEco = mode !== 'taxi';

    return {
      id: `${airportCode}-${index + 1}`,
      mode,
      name: option.name || option.route || `${option.mode || 'Transport'}`,
      airport: airportCode,
      duration,
      price,
      stops: stopsStr,
      isEco,
      isFastest: false,
      isCheapest: false,
      isBest: false,
      route: route || (option.route || ''),
      co2,
    } as TransportOption;
  });
};

// Helper function to get airport name from code.
// It prefers the loaded `airportOptions` (from backend) when provided,
// falling back to the backend lookup for compatibility.
const getAirportNameFromCode = (code: string, airportOptionsList?: AirportOption[]): string => {
  const upperCode = (code || '').toUpperCase();

  // Prefer loaded airport options if provided
  if (airportOptionsList && airportOptionsList.length) {
    // Try to match by IATA code first
    const byIata = airportOptionsList.find(o => o.iata && o.iata.toUpperCase() === upperCode);
    if (byIata) {
      if (byIata.type === 'city_all') {
        return `${byIata.city} (ALL)`;
      }
      const city = byIata.city || '';
      const name = (byIata.name || '').replace(' Airport', '');
      const codeToShow = byIata.iata || (byIata.value || upperCode);
      return `${city ? city + ' ' : ''}${name} (${codeToShow})`.trim();
    }

    // If not matched by iata, try the `value` field (used for some city/all entries)
    const byValue = airportOptionsList.find(o => (o.value || '').toUpperCase() === upperCode);
    if (byValue) {
      if (byValue.type === 'city_all') {
        return `${byValue.city} (ALL)`;
      }
      const city = byValue.city || '';
      const name = (byValue.name || '').replace(' Airport', '');
      const codeToShow = byValue.iata || (byValue.value || upperCode);
      return `${city ? city + ' ' : ''}${name} (${codeToShow})`.trim();
    }
  }
};

// Wrapper component for TransfersPage that reads URL params
const TransfersPageWrapper = ({ isLoggedIn, airports }: { isLoggedIn: boolean; airports: AirportOption[] }) => {
  const { airportCode } = useParams<{ airportCode: string }>();
  const navigate = useNavigate();
  
  const airportName = getAirportNameFromCode(airportCode || '', airports);
  // transport options loaded from backend for the given airport code
  const [transportOptionsState, setTransportOptionsState] = useState<TransportOption[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!airportCode) {
        setTransportOptionsState([]);
        return;
      }
      const code = airportCode.toUpperCase();
      try {
        const res = await fetch(`${API_BASE}/airports/${code}/transports`);
        if (!res.ok) {
          if (mounted) setTransportOptionsState([]);
          return;
        }
        const body = await res.json().catch(() => ({}));
        const items = Array.isArray(body.transports) ? body.transports : [];
        if (mounted) setTransportOptionsState(convertTransportOptions(items, code));
      } catch (e) {
        if (mounted) setTransportOptionsState([]);
      }
    };
    load();
    return () => { mounted = false; };
  }, [airportCode]);

  const transportOptions = transportOptionsState;

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

  const onAirportSelect = (_display: string, code: string) => {
    if (!code) return;
    navigate(`/${code.toLowerCase()}`);
  };

  return (
    <TransfersPage
      isLoggedIn={isLoggedIn}
      onNavigate={handleNavigate}
      selectedAirport={airportName}
      searchQuery={airportName}
      transportOptions={transportOptions}
      onAirportSelect={onAirportSelect}
      airports={airports}
    />
  );
};

// Wrapper component for TerminalTransfersPage that reads URL params
const TerminalTransfersPageWrapper = ({ isLoggedIn, airports }: { isLoggedIn: boolean; airports: AirportOption[] }) => {
  const { airportCode } = useParams<{ airportCode: string }>();
  const navigate = useNavigate();

  const airportName = getAirportNameFromCode(airportCode || '', airports);

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
const InsightsPageWrapper = ({ isLoggedIn, airports }: { isLoggedIn: boolean; airports: AirportOption[] }) => {
  const { airportCode } = useParams<{ airportCode: string }>();
  const navigate = useNavigate();

  const airportName = getAirportNameFromCode(airportCode || '', airports);

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
  const toast = useToast();

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

  // login using top-level alias
  const handleLoginApi = async (email: string, password: string) => {
    try {
      const res = await fetch(`${(import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8000'}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // send/receive refresh cookie
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.showToast(err.detail || 'Login failed', 'error');
        return;
      }
      const data = await res.json();
      // store access token locally
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
      }
      setUserState({ isLoggedIn: true, email, defaultAirport: '' });
      toast.showToast('Logged in', 'success');
      navigate('/');
    } catch (e) {
      console.error(e);
      toast.showToast('Login error', 'error');
    }
  };

  const handleRegister = async (email: string, password: string) => {
    try {
      const res = await fetch(`${(import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8000'}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.showToast(body.detail || 'Registration failed', 'error');
        return;
      }
      toast.showToast('Registered successfully', 'success');
      navigate('/login');
    } catch (e) {
      console.error(e);
      toast.showToast('Registration error', 'error');
    }
  };

  // `parseJwt`, `refreshAccessToken`, and `apiFetch` are imported from `./utils/api`

  const handleLogout = async () => {
    try {
      await fetch(`${(import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8000'}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) {
      // ignore network errors during logout
      console.error('logout error', e);
    }
    localStorage.removeItem('access_token');
    setUserState({
      isLoggedIn: false,
      email: '',
      defaultAirport: '',
    });
    navigate('/');
  };

  // On app start, try to refresh access token (if refresh cookie present)
  useEffect(() => {
    if (__refreshRan) return; // guard against double-run (React StrictMode)
    __refreshRan = true;
    (async () => {
      const token = await refreshAccessToken();
      if (token) {
        const payload = parseJwt(token);
        setUserState({ isLoggedIn: true, email: (payload && payload.email) || '', defaultAirport: '' });
      }
    })();
  }, []);

  // Airports loaded from backend and processed into search options
  const [airportOptions, setAirportOptions] = useState<AirportOption[]>([]);
  useEffect(() => {
    if (__airportsLoaded) return; // guard against double-run (React StrictMode)
    __airportsLoaded = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/airports`);
        if (!res.ok) return;
        const body = await res.json();
        const docs: any[] = body.airports || [];

        // build airport option objects
        const options: AirportOption[] = docs.map((d, idx) => ({
          id: d.iata || `${d.name}-${idx}`,
          display: `${d.name} (${d.iata || ''})`.trim(),
          value: d.iata ? d.iata.toUpperCase() : (d.city || '').replace(/[^A-Za-z]/g, '').slice(0,3).toUpperCase(),
          type: d.iata ? 'airport' : 'airport',
          iata: d.iata ? d.iata.toUpperCase() : null,
          name: d.name,
          city: d.city,
          aliases: d.aliases || [],
        }));

        // create city (ALL) entries for cities with multiple airports
        const cityMap: Record<string, AirportOption[]> = {};
        for (const opt of options) {
          const cityKey = (opt.city || '').toUpperCase();
          if (!cityMap[cityKey]) cityMap[cityKey] = [];
          cityMap[cityKey].push(opt);
        }

        const cityAllOptions: AirportOption[] = Object.entries(cityMap).flatMap(([cityName, list]) => {
          if (list.length <= 1) return [];
          const code = cityName.replace(/[^A-Z]/g, '').slice(0,3).toUpperCase() || cityName.slice(0,3);
          return [{
            id: `${cityName}-ALL`,
            display: `${cityName.charAt(0) + cityName.slice(1).toLowerCase()} (ALL)`,
            value: code,
            type: 'city_all',
            city: cityName.charAt(0) + cityName.slice(1).toLowerCase(),
            aliases: [],
          }];
        });

        // final options: city ALL entries first, then airports
        setAirportOptions([...cityAllOptions, ...options]);
      } catch (e) {
        console.error('Failed to load airports', e);
      }
    })();
  }, []);

  // Determine what to render based on both URL and state
  return (
      <Routes>
      <Route 
        path="/login" 
        element={
          <LoginForm
            onLogin={handleLoginApi}
            onNavigate={handleNavigate}
          />
        }
      />
      
      <Route 
        path="/register" 
        element={
          <RegisterForm
            onRegister={handleRegister}
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
              airports={airportOptions}
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
                    const code = (appState as any).selectedAirportCode || extractAirportCode(appState.selectedAirport || appState.searchQuery);
                    if (code) {
                      navigate(`/${code.toLowerCase()}`);
                    }
                  }}
                  selectedAirport={appState.selectedAirport}
                  showDropdown={appState.showDropdown}
                  onShowDropdown={(show) => setAppState(prev => ({ ...prev, showDropdown: show }))}
                  onAirportSelect={(display, code) => {
                    setAppState(prev => ({ ...prev, selectedAirport: display, selectedAirportCode: code }));
                    if (code) navigate(`/${code.toLowerCase()}`);
                  }}
                  onNavigate={handleNavigate}
                  airports={airportOptions}
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
        element={<TransfersPageWrapper isLoggedIn={userState.isLoggedIn} airports={airportOptions} />}
      />

      {/* Terminal transfers route */}
      <Route 
        path="/:airportCode/transfers" 
        element={<TerminalTransfersPageWrapper isLoggedIn={userState.isLoggedIn} airports={airportOptions} />}
      />

      {/* Insights route */}
      <Route 
        path="/:airportCode/insights" 
        element={<InsightsPageWrapper isLoggedIn={userState.isLoggedIn} airports={airportOptions} />}
      />
    </Routes>
  );
}

export default App;