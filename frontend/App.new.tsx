import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { LoginForm, RegisterForm } from './components/auth/AuthForms';
import { HomePage } from './components/layout/HomePage';
import { NewInsightsPage } from './components/InsightsPage';
import { TransfersPage } from './components/TransfersPage';
import { AccountPage } from './components/AccountPage';
import { UserState } from './types';

// Mock data imports remain the same...

// Wrap components that need URL parameters
const InsightsPageWrapper = () => {
  const { airport } = useParams();
  const navigate = useNavigate();
  
  return (
    <NewInsightsPage
      airport={airport?.toUpperCase() || ''}
      onNavigate={(path) => navigate(path)}
      transportOptions={mockTransportOptions}
    />
  );
};

const TransfersPageWrapper = () => {
  const { airport } = useParams();
  const navigate = useNavigate();
  
  return (
    <TransfersPage
      selectedAirport={airport?.toUpperCase() || ''}
      onNavigate={(path) => navigate(path)}
      transportOptions={mockTransportOptions}
    />
  );
};

function App() {
  const [userState, setUserState] = useState<UserState>({
    isLoggedIn: false,
    email: '',
    defaultAirport: '',
  });

  const handleLogin = (email: string) => {
    setUserState({
      isLoggedIn: true,
      email,
      defaultAirport: '',
    });
  };

  const handleLogout = () => {
    setUserState({
      isLoggedIn: false,
      email: '',
      defaultAirport: '',
    });
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <HomePage
              userState={userState}
              onLogout={handleLogout}
              airports={mockAirports}
            />
          } 
        />
        
        <Route 
          path="/results/:airport" 
          element={<ResultsPage airports={mockAirports} transportOptions={mockTransportOptions} />} 
        />
        
        <Route 
          path="/insights/:airport" 
          element={<InsightsPageWrapper />} 
        />
        
        <Route 
          path="/transfers/:airport" 
          element={<TransfersPageWrapper />} 
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
              onNavigate={(path) => navigate(path)}
            />
          } 
        />
        
        <Route 
          path="/register" 
          element={
            <RegisterForm
              onRegister={handleLogin}
              onNavigate={(path) => navigate(path)}
            />
          } 
        />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;