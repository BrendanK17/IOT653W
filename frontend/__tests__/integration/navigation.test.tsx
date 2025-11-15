/**
 * Integration tests for navigation flows
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App';

// Helper to render App with Router
const renderApp = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

describe('Navigation Integration Tests', () => {
  it('should navigate from home to login page', async () => {
    renderApp();
    
    // Click login button
    const loginButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    });
  });

  it('should navigate from home to register page', async () => {
    renderApp();
    
    // Click register button (get all and click the first one which should be in header)
    const registerButtons = screen.getAllByRole('button', { name: /register/i });
    fireEvent.click(registerButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText(/Create an account/i)).toBeInTheDocument();
    });
  });

  it('should return to home page from login', async () => {
    renderApp();
    
    // Navigate to login (get all and click the first one which should be in header)
    const loginButtons = screen.getAllByRole('button', { name: /log in/i });
    fireEvent.click(loginButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    });
    
    // Click logo to return home
    const logo = screen.getByText('GroundScanner');
    fireEvent.click(logo);
    
    await waitFor(() => {
      expect(screen.getByText(/Compare your best route from the airport to the city/i)).toBeInTheDocument();
    });
  });

  it('should complete login flow', async () => {
    renderApp();
    
    // Navigate to login
    const loginButtons = screen.getAllByRole('button', { name: /log in/i });
    fireEvent.click(loginButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    });
    
    // Fill in login form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Submit form (there should be only one submit button visible now)
    const submitButtons = screen.getAllByRole('button', { name: /log in/i });
    const submitButton = submitButtons.find(btn => btn.type === 'submit') || submitButtons[submitButtons.length - 1];
    fireEvent.click(submitButton);
    
    // Should return to home page
    await waitFor(() => {
      expect(screen.getByText(/Compare your best route from the airport to the city/i)).toBeInTheDocument();
    });
  });

  it('should navigate to account page after login', async () => {
    renderApp();
    
    // Login first
    const loginButtons = screen.getAllByRole('button', { name: /log in/i });
    fireEvent.click(loginButtons[0]);
    
    await waitFor(() => {
      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      
      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const submitButtons = screen.getAllByRole('button', { name: /log in/i });
      const submitButton = submitButtons.find(btn => btn.type === 'submit') || submitButtons[submitButtons.length - 1];
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Compare your best route from the airport to the city/i)).toBeInTheDocument();
    });
    
    // Navigate to account
    const accountButton = screen.getByRole('button', { name: /account/i });
    fireEvent.click(accountButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Account Settings/i)).toBeInTheDocument();
    });
  });
});
