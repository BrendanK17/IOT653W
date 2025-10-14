import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginForm, RegisterForm } from './components/auth/AuthForms';
import { HomePage } from './components/layout/HomePage';
import { NewInsightsPage } from './components/InsightsPage';
import { TransfersPage } from './components/TransfersPage';
import { AccountPage } from './components/AccountPage';
import { ResultsPage } from './components/ResultsPage';

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

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <HomePage
            isLoggedIn={userState.isLoggedIn}
            searchQuery={searchState.searchQuery}
            onSearchChange={(query) => setSearchState(prev => ({ ...prev, searchQuery: query }))}
            onSearch={(airport) => navigate(`/results/${airport.toLowerCase()}`)}
            selectedAirport={searchState.selectedAirport}
            showDropdown={searchState.showDropdown}
            onShowDropdown={(show) => setSearchState(prev => ({ ...prev, showDropdown: show }))}
            onAirportSelect={(airport) => {
              setSearchState(prev => ({ ...prev, selectedAirport: airport }));
              navigate(`/results/${airport.toLowerCase().replace(/[()]/g, '').split(' ').pop()}`);
            }}
            airports={mockAirports}
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
            transportOptions={mockTransportOptions}
            onNavigateToInsights={(airport) => navigate(`/insights/${airport.toLowerCase()}`)}
            onNavigateToTransfers={(airport) => navigate(`/transfers/${airport.toLowerCase()}`)}
          />
        }
      />

      <Route 
        path="/insights/:airport" 
        element={
          <NewInsightsPage
            isLoggedIn={userState.isLoggedIn}
            transportOptions={mockTransportOptions}
            onBackToResults={(airport) => navigate(`/results/${airport.toLowerCase()}`)}
          />
        }
      />

      <Route 
        path="/transfers/:airport" 
        element={
          <TransfersPage
            isLoggedIn={userState.isLoggedIn}
            transportOptions={mockTransportOptions}
            onBackToResults={(airport) => navigate(`/results/${airport.toLowerCase()}`)}
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
              setDefaultAirport={(airport) => 
                setUserState(prev => ({ ...prev, defaultAirport: airport }))}
              airports={mockAirports}
              onLogout={handleLogout}
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
            redirectTo={(path) => navigate(path)}
          />
        }
      />

      <Route 
        path="/register" 
        element={
          <RegisterForm
            onRegister={handleLogin}
            redirectTo={(path) => navigate(path)}
          />
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;