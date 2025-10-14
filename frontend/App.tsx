import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LoginForm, RegisterForm } from './components/auth/AuthForms';
import { HomePage } from './components/layout/HomePage';
import { NewInsightsPage } from './components/InsightsPage';
import { TransfersPage } from './components/TransfersPage';
import { AccountPage } from './components/AccountPage';
import { ViewType } from './types';

// Mock transport data
const mockTransportOptions = [
  {
    id: '1',
    mode: 'train',
    name: 'Heathrow Express',
    airport: 'LHR',
    duration: '15 mins',
    price: 25,
    stops: 'Direct',
    isEco: false,
    isFastest: true,
    isCheapest: false,
    isBest: true,
    route: 'Heathrow → Paddington Station',
    co2: 2.1
  },
  {
    id: '2',
    mode: 'subway',
    name: 'Piccadilly Line',
    airport: 'LHR',
    duration: '45 mins',
    price: 6,
    stops: '8 stops',
    isEco: true,
    isFastest: false,
    isCheapest: true,
    isBest: false,
    route: 'Heathrow → Central London',
    co2: 1.2
  },
  {
    id: '3',
    mode: 'bus',
    name: 'National Express',
    airport: 'LHR',
    duration: '60 mins',
    price: 8,
    stops: '3 stops',
    isEco: true,
    isFastest: false,
    isCheapest: false,
    isBest: false,
    route: 'Heathrow → Victoria Coach Station',
    co2: 1.8
  },
  {
    id: '4',
    mode: 'taxi',
    name: 'Taxi/Uber',
    airport: 'LHR',
    duration: '35 mins',
    price: 45,
    stops: 'Direct',
    isEco: false,
    isFastest: false,
    isCheapest: false,
    isBest: false,
    route: 'Heathrow → Central London',
    co2: 8.5
  }
];

const mockAirports = [
  'London Heathrow (LHR)',
  'London Gatwick (LGW)',
  'London Stansted (STN)',
  'London Luton (LTN)',
  'London City (LCY)',
  'London Southend (SEN)',
  'Manchester (MAN)',
  'Birmingham (BHX)',
  'Edinburgh (EDI)',
  'Glasgow (GLA)'
];

function App() {
  const navigate = useNavigate();
  const location = useLocation();

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
            darkMode={appState.darkMode}
            onDarkModeChange={handleDarkModeChange}
          />
        }
      />
      
      <Route 
        path="/register" 
        element={
          <RegisterForm
            onRegister={handleLogin}
            onNavigate={handleNavigate}
            darkMode={appState.darkMode}
            onDarkModeChange={handleDarkModeChange}
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

            case 'transfers':
              return (
                <TransfersPage
                  darkMode={appState.darkMode}
                  isLoggedIn={userState.isLoggedIn}
                  onDarkModeChange={handleDarkModeChange}
                  onNavigate={handleNavigate}
                  selectedAirport={appState.selectedAirport}
                  searchQuery={appState.searchQuery}
                  transportOptions={mockTransportOptions}
                />
              );

            case 'home':
            default:
              return (
                <HomePage
                  darkMode={appState.darkMode}
                  isLoggedIn={userState.isLoggedIn}
                  searchQuery={appState.searchQuery}
                  onSearchChange={(query) => setAppState(prev => ({ ...prev, searchQuery: query }))}
                  onSearch={() => handleNavigate('transfers')}
                  selectedAirport={appState.selectedAirport}
                  showDropdown={appState.showDropdown}
                  onShowDropdown={(show) => setAppState(prev => ({ ...prev, showDropdown: show }))}
                  onAirportSelect={(airport) => setAppState(prev => ({ ...prev, selectedAirport: airport }))}
                  onDarkModeChange={handleDarkModeChange}
                  onNavigate={handleNavigate}
                  airports={mockAirports}
                  userEmail={userState.email}
                  onLogout={handleLogout}
                />
              );
          }
        })()}
      />
    </Routes>
  );
}

export default App;