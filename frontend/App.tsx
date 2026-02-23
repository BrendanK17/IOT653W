import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
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

// Backend API response types
interface BackendTransportOption {
  mode?: string;
  type?: string;
  name?: string;
  route?: string;
  price?: number | string;
  duration?: number | string;
  stops?: string | number | string[];
  co2?: number | null;
  [key: string]: unknown;
}

interface BackendAirport {
  iata?: string;
  name?: string;
  city?: string;
  aliases?: string[];
  [key: string]: unknown;
}

interface FareSummary {
  modes?: Record<string, {
    summary: string;
    payment?: {
      allowed?: string[];
      not_allowed?: string[];
    };
  }>;
  airports?: {
    terminals?: Record<string, {
      services?: Array<{
        name: string;
        payment?: {
          allowed?: string[];
          not_allowed?: string[];
        };
      }>;
    }>;
  };
}

// Module-level guards to prevent duplicate startup effects (works with React StrictMode)
let __refreshRan = false;
let __airportsLoaded = false;

// Helper function to extract airport code from formatted string
const extractAirportCode = (airportString: string): string => {
  const match = airportString.match(/\(([A-Z]{3})\)/);
  return match?.[1] || '';
};

// Convert transport options from backend API format to component format
const convertTransportOptions = (options: BackendTransportOption[], airportCode: string): TransportOption[] => {
  // helper to map backend modes to our frontend modes
  const mapMode = (m: string) => {
    if (!m) return 'train';
    const mm = m.toLowerCase();
    if (mm === 'rail' || mm === 'train') return 'train';
    if (mm === 'bus') return 'bus';
    if (mm === 'coach') return 'coach';
    if (mm === 'underground' || mm === 'subway' || mm === 'tube') return 'underground';
    if (mm === 'taxi' || mm === 'cab' || mm === 'ride_hailing') return 'taxi';
    return 'train';
  };

  return options.map((option, index) => {
    // Support backend shape: option.stops is an array of stops with prices
    const backendStops = Array.isArray(option.stops) ? option.stops : undefined;

    // compute price: for city center, use Liverpool Street (Elizabeth Line, Piccadilly Line), 
    // or Paddington (Heathrow Express), otherwise pick last stop or minimum positive price
    let price = 0;
    if (backendStops && backendStops.length) {
      const amounts: number[] = [];
      let centralPrice: number | null = null;
      
      // Look for central stops: Liverpool Street (Zone 1 for Elizabeth/Piccadilly), Paddington (for Heathrow Express)
      for (const s of backendStops) {
        const stopName = (s as any)?.stop_name || ''; // eslint-disable-line @typescript-eslint/no-explicit-any
        if (Array.isArray((s as any).prices)) { // eslint-disable-line @typescript-eslint/no-explicit-any
          for (const p of (s as any).prices) { // eslint-disable-line @typescript-eslint/no-explicit-any
            const a = Number(p?.amount);
            if (!Number.isNaN(a) && a > 0) {
              amounts.push(a);
              // Check if this is a central stop
              if (stopName.includes('Liverpool Street') || stopName.includes('Paddington')) {
                centralPrice = a;
              }
            }
          }
        }
      }
      
      // Use central price if found, otherwise use last stop, otherwise use minimum
      if (centralPrice !== null) {
        price = centralPrice;
      } else if (amounts.length) {
        // Use last stop price
        const lastStop = backendStops[backendStops.length - 1];
        if (Array.isArray((lastStop as any).prices)) { // eslint-disable-line @typescript-eslint/no-explicit-any
          const lastPrice = (lastStop as any).prices[0]?.amount; // eslint-disable-line @typescript-eslint/no-explicit-any
          if (lastPrice) {
            price = Number(lastPrice);
          }
        }
        if (!price) price = Math.min(...amounts);
      }
    }
    if (!price && typeof option.price === 'number' && option.price > 0) price = option.price;

    // duration: keep as number in minutes, always from backend
    const duration = typeof option.duration === 'number' ? option.duration : (option.duration ? parseInt(option.duration) : 0);

    // stops: preserve the actual stops array if available, otherwise use string
    const stops = backendStops && backendStops.length > 0 ? backendStops : (typeof option.stops === 'string' ? option.stops : (option.stops === 0 ? 'Direct' : `${option.stops} stops`));

    // route: prefer option.route or combine name + last stop
    let route = option.route || option.name || '';
    if (!route && backendStops && backendStops.length) {
      const last = backendStops[backendStops.length - 1];
      route = `${option.name || ''} → ${(last as any)?.stop_name || ''}`.trim(); // eslint-disable-line @typescript-eslint/no-explicit-any
    }

    // co2: preserve the full CO2 data structure from backend if available, otherwise use number
    const co2 = (option as any).co2 || null; // eslint-disable-line @typescript-eslint/no-explicit-any

    // simple heuristics for flags
    const mode = mapMode(option.mode || option.type || 'train');
    const isEco = mode !== 'taxi';

    return {
      id: (option as any).id || `${airportCode}-${index + 1}`, // eslint-disable-line @typescript-eslint/no-explicit-any
      mode,
      name: option.name || option.route || `${option.mode || 'Transport'}`,
      airport: airportCode,
      duration,
      price,
      stops,
      isEco,
      isFastest: false,
      isCheapest: false,
      isBest: false,
      route: route || (option.route || ''),
      co2,
      url: (option as any).url, // eslint-disable-line @typescript-eslint/no-explicit-any
      sponsored: (option as any).sponsored || false, // eslint-disable-line @typescript-eslint/no-explicit-any
      hasFirstClass: (option as any).hasFirstClass || false, // eslint-disable-line @typescript-eslint/no-explicit-any
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
      return byIata.display;
    }

    // If not matched by iata, try the `value` field (used for some city/all entries)
    const byValue = airportOptionsList.find(o => (o.value || '').toUpperCase() === upperCode);
    if (byValue) {
      return byValue.display;
    }
  }

  // Fallback: return the code itself if not found
  return upperCode;
};

// Wrapper component for TransfersPage that reads URL params
const TransfersPageWrapper = ({ isLoggedIn, airports }: { isLoggedIn: boolean; airports: AirportOption[] }) => {
  const { airportCode } = useParams<{ airportCode: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const airportName = getAirportNameFromCode(airportCode || '', airports);
  // transport options loaded from backend for the given airport code
  const [transportOptionsState, setTransportOptionsState] = useState<TransportOption[]>([]);
  const [fareSummary, setFareSummary] = useState<FareSummary | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!airportCode) {
        setTransportOptionsState([]);
        setFareSummary(null);
        return;
      }
      const code = airportCode.toUpperCase();
      const passengers = searchParams.get('passengers') || '1';
      try {
        const res = await fetch(`${API_BASE}/airports/${code}/transports?passengers=${passengers}`, {
          headers: {
            'X-Requested-By': 'GroundScanner-Frontend',
          },
        });
        if (!res.ok) {
          if (mounted) setTransportOptionsState([]);
          return;
        }
        const body = await res.json().catch(() => ({}));
        let items = Array.isArray(body.transports) ? body.transports : [];
        
        if (mounted) setTransportOptionsState(convertTransportOptions(items, code));
      } catch (e) {
        if (mounted) setTransportOptionsState([]);
      }

      // Load fare summary
      const selectedOption = airports.find(o => o.iata?.toUpperCase() === code || o.value?.toUpperCase() === code);
      const city = selectedOption?.city?.toUpperCase();
      if (city) {
        try {
          const res = await fetch(`${API_BASE}/cities/${city}/fares`, {
            headers: {
              'X-Requested-By': 'GroundScanner-Frontend',
            },
          });
          if (res.ok) {
            const data = await res.json();
            if (mounted) setFareSummary(data.fare_summary);
          }
        } catch (e) {
          // ignore
        }
      } else {
        if (mounted) setFareSummary(null);
      }
    };
    load();
    return () => { mounted = false; };
  }, [airportCode, airports, searchParams]);

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
      fareSummary={fareSummary || undefined}
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
      airports={airports}
    />
  );
};

// Wrapper component for InsightsPage that reads URL params
const InsightsPageWrapper = ({ isLoggedIn, airports }: { isLoggedIn: boolean; airports: AirportOption[] }) => {
  const { airportCode } = useParams<{ airportCode: string }>();
  const navigate = useNavigate();
  const [transportOptionsState, setTransportOptionsState] = useState<TransportOption[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!airportCode) {
        setTransportOptionsState([]);
        return;
      }
      const code = airportCode.toUpperCase();
      const passengers = '1';
      try {
        const res = await fetch(`${API_BASE}/airports/${code}/transports?passengers=${passengers}`, {
          headers: {
            'X-Requested-By': 'GroundScanner-Frontend',
          },
        });
        if (!res.ok) {
          if (mounted) setTransportOptionsState([]);
          return;
        }
        const body = await res.json().catch(() => ({}));
        let items = Array.isArray(body.transports) ? body.transports : [];
        
        if (mounted) setTransportOptionsState(convertTransportOptions(items, code));
      } catch (e) {
        if (mounted) setTransportOptionsState([]);
      }
    };
    load();
    return () => { mounted = false; };
  }, [airportCode]);

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

  return (
    <NewInsightsPage
      isLoggedIn={isLoggedIn}
      onNavigate={handleNavigate}
      transportOptions={transportOptionsState}
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
        underground: true,
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
      const res = await fetch(`${(window as unknown as { __CONFIG__?: { VITE_API_BASE?: string } }).__CONFIG__?.VITE_API_BASE || 'http://127.0.0.1:8000'}/login`, {
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
      const res = await fetch(`${(window as unknown as { __CONFIG__?: { VITE_API_BASE?: string } }).__CONFIG__?.VITE_API_BASE || 'http://127.0.0.1:8000'}/register`, {
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
      await fetch(`${(window as unknown as { __CONFIG__?: { VITE_API_BASE?: string } }).__CONFIG__?.VITE_API_BASE || 'http://127.0.0.1:8000'}/auth/logout`, { 
        method: 'POST', 
        credentials: 'include',
        headers: {
          'X-Requested-By': 'GroundScanner-Frontend',
        },
      });
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
        const res = await fetch(`${API_BASE}/airports`, {
          headers: {
            'X-Requested-By': 'GroundScanner-Frontend',
          },
        });
        if (!res.ok) return;
        const body = await res.json();
        const docs: BackendAirport[] = body.airports || [];

        // build airport option objects
        const options: AirportOption[] = docs.map((d, idx) => {
          // Use first alias if available, otherwise construct from city + name
          const displayName = d.aliases && d.aliases.length > 0 
            ? d.aliases[0] 
            : `${d.city ? d.city + ' ' : ''}${d.name || ''}`.trim();
          
          return {
            id: d.iata || `${d.name}-${idx}`,
            display: displayName + (d.iata ? ` (${d.iata})` : ''),
            value: d.iata ? d.iata.toUpperCase() : (d.city || '').replace(/[^A-Za-z]/g, '').slice(0,3).toUpperCase(),
            type: d.iata ? 'airport' : 'airport',
            iata: d.iata ? d.iata.toUpperCase() : null,
            name: d.name,
            city: d.city,
            aliases: d.aliases || [],
          };
        });

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
                  isLoggedIn={userState.isLoggedIn}
                  onNavigate={handleNavigate}
                  transportOptions={appState.transportOptions}
                />
              );

            case 'home':
            default:
              return (
                <HomePage
                  isLoggedIn={userState.isLoggedIn}
                  searchQuery={appState.searchQuery}
                  onSearchChange={(query) => setAppState(prev => ({ ...prev, searchQuery: query }))}
                  onSearch={(passengers) => {
                    const code = (appState as unknown as { selectedAirportCode?: string }).selectedAirportCode || extractAirportCode(appState.selectedAirport || appState.searchQuery);
                    if (code) {
                      navigate(`/${code.toLowerCase()}?passengers=${passengers}`);
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
