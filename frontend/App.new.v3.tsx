import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginForm, RegisterForm } from './components/auth/AuthForms';
import { HomePage } from './components/layout/HomePage';
import { NewInsightsPage } from './components/InsightsPage';
import { TransfersPage } from './components/TransfersPage';
import { AccountPage } from './components/AccountPage';
import { ResultsPage } from './components/ResultsPage';
import { airports, transportOptions } from './utils/mockData';
import { ViewType } from './types';

function App() {
  const navigate = useNavigate();
  const [userState, setUserState] = useState({
    isLoggedIn: false,
    email: '',
    defaultAirport: '',
  });

  const [searchState, setSearchState] = useState({
    selectedAirport: '',
    searchQuery: '',
    showDropdown: false,
  });

  const [darkMode, setDarkMode] = useState(false);

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
      default:
        navigate('/');
    }
  };

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <HomePage
            isLoggedIn={userState.isLoggedIn}
            searchQuery={searchState.searchQuery}
            onSearchChange={(query: string) => setSearchState(prev => ({ ...prev, searchQuery: query }))}
            onSearch={(airport: string) => navigate(`/results/${airport.toLowerCase()}`)}
            selectedAirport={searchState.selectedAirport}
            showDropdown={searchState.showDropdown}
            onShowDropdown={(show: boolean) => setSearchState(prev => ({ ...prev, showDropdown: show }))}
            onAirportSelect={(airport: string) => {
              setSearchState(prev => ({ ...prev, selectedAirport: airport }));
              navigate(`/results/${airport.toLowerCase().replace(/[()]/g, '').split(' ').pop()}`);
            }}
            airports={airports}
            userEmail={userState.email}
            onLogout={handleLogout}
          />
        }
      />
      
      <Route 
        path="/results/:airport" 
        element={
          <ResultsPage
            isLoggedIn={userState.isLoggedIn}
            transportOptions={transportOptions}
            onNavigateToInsights={(airport: string) => navigate(`/insights/${airport.toLowerCase()}`)}
            onNavigateToTransfers={(airport: string) => navigate(`/transfers/${airport.toLowerCase()}`)}
          />
        }
      />

      <Route 
        path="/insights/:airport" 
        element={
          <NewInsightsPage
            isLoggedIn={userState.isLoggedIn}
            onNavigate={handleNavigate}
            onBackToResults={(airport: string) => navigate(`/results/${airport.toLowerCase()}`)}
          />
        }
      />

      <Route 
        path="/transfers/:airport" 
        element={
          <TransfersPage
            isLoggedIn={userState.isLoggedIn}
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
              setDefaultAirport={(airport: string) => 
                setUserState(prev => ({ ...prev, defaultAirport: airport }))}
              airports={airports}
              onNavigate={handleNavigate}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route 
        path="/login" 
        element={
          <LoginForm
            onLogin={handleLogin}
            onNavigate={handleNavigate}
            darkMode={darkMode}
            onDarkModeChange={setDarkMode}
          />
        }
      />

      <Route 
        path="/register" 
        element={
          <RegisterForm
            onRegister={handleLogin}
            onNavigate={handleNavigate}
            darkMode={darkMode}
            onDarkModeChange={setDarkMode}
          />
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;