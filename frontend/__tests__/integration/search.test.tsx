/**
 * Integration tests for search functionality
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';

describe('Search Integration Tests', () => {
  it('should display search results after searching', async () => {
    render(<App />);
    
    // Find and fill search input
    const searchInput = screen.getByPlaceholderText(/Search for an airport/i);
    fireEvent.change(searchInput, { target: { value: 'London Heathrow' } });
    
    // Wait for dropdown to appear
    await waitFor(() => {
      const dropdown = screen.getByText(/London Heathrow \(LHR\)/i);
      expect(dropdown).toBeInTheDocument();
    });
    
    // Click on airport option
    const airportOption = screen.getByText(/London Heathrow \(LHR\)/i);
    fireEvent.click(airportOption);
    
    // Click search button
    const searchButton = screen.getByRole('button', { name: /search routes/i });
    fireEvent.click(searchButton);
    
    // Should navigate to results page
    await waitFor(() => {
      expect(screen.getByText(/Transport Options/i)).toBeInTheDocument();
    });
  });

  it('should filter airports as user types', async () => {
    render(<App />);
    
    const searchInput = screen.getByPlaceholderText(/Search for an airport/i);
    
    // Type partial airport name
    fireEvent.change(searchInput, { target: { value: 'London' } });
    
    await waitFor(() => {
      // Should show multiple London airports
      expect(screen.getByText(/London Heathrow/i)).toBeInTheDocument();
      expect(screen.getByText(/London Gatwick/i)).toBeInTheDocument();
      expect(screen.getByText(/London City/i)).toBeInTheDocument();
    });
  });

  it('should not show dropdown for empty search', () => {
    render(<App />);
    
    const searchInput = screen.getByPlaceholderText(/Search for an airport/i);
    fireEvent.focus(searchInput);
    
    // Should not show dropdown with no input
    const heathrow = screen.queryByText(/London Heathrow \(LHR\)/i);
    expect(heathrow).not.toBeInTheDocument();
  });

  it('should disable search button when no airport selected', () => {
    render(<App />);
    
    const searchButton = screen.getByRole('button', { name: /search routes/i });
    expect(searchButton).toBeDisabled();
  });

  it('should enable search button when airport is selected', async () => {
    render(<App />);
    
    const searchInput = screen.getByPlaceholderText(/Search for an airport/i);
    fireEvent.change(searchInput, { target: { value: 'London Heathrow' } });
    
    await waitFor(() => {
      const airportOption = screen.getByText(/London Heathrow \(LHR\)/i);
      fireEvent.click(airportOption);
    });
    
    const searchButton = screen.getByRole('button', { name: /search routes/i });
    expect(searchButton).not.toBeDisabled();
  });

  it('should prepopulate search with default airport for logged in users', async () => {
    render(<App />);
    
    // Login
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
    
    // Set default airport
    await waitFor(() => {
      const accountButton = screen.getByRole('button', { name: /account/i });
      fireEvent.click(accountButton);
    });
    
    await waitFor(() => {
      const airportSelect = screen.getByRole('combobox');
      fireEvent.click(airportSelect);
    });
    
    // Select an airport as default
    const heathrowOption = screen.getByText(/London Heathrow \(LHR\)/i);
    fireEvent.click(heathrowOption);
    
    // Go back to home
    const backButton = screen.getByRole('button', { name: /back to home/i });
    fireEvent.click(backButton);
    
    // Search should be prepopulated
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/Search for an airport/i);
      expect(searchInput).toHaveValue('London Heathrow (LHR)');
    });
  });
});
