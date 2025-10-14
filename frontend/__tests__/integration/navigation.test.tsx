/**
 * Integration tests for navigation flows
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';

describe('Navigation Integration Tests', () => {
  it('should navigate from home to login page', async () => {
    render(<App />);
    
    // Click login button
    const loginButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    });
  });

  it('should navigate from home to register page', async () => {
    render(<App />);
    
    // Click register button
    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Create an account/i)).toBeInTheDocument();
    });
  });

  it('should return to home page from login', async () => {
    render(<App />);
    
    // Navigate to login
    const loginButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    });
    
    // Click logo to return home
    const logo = screen.getByText('GroundScanner');
    fireEvent.click(logo);
    
    await waitFor(() => {
      expect(screen.getByText(/Find the Best Way from Airport to City/i)).toBeInTheDocument();
    });
  });

  it('should complete login flow', async () => {
    render(<App />);
    
    // Navigate to login
    const loginButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    });
    
    // Fill in login form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(submitButton);
    
    // Should return to home page
    await waitFor(() => {
      expect(screen.getByText(/Find the Best Way from Airport to City/i)).toBeInTheDocument();
    });
  });

  it('should navigate to account page after login', async () => {
    render(<App />);
    
    // Login first
    const loginButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      
      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const submitButton = screen.getByRole('button', { name: /log in/i });
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Find the Best Way from Airport to City/i)).toBeInTheDocument();
    });
    
    // Navigate to account
    const accountButton = screen.getByRole('button', { name: /account/i });
    fireEvent.click(accountButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Account Settings/i)).toBeInTheDocument();
    });
  });
});
