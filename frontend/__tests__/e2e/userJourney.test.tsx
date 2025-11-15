/**
 * End-to-end tests for complete user journeys
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

describe('End-to-End User Journey Tests', () => {
  it('should complete a full search and view results journey', async () => {
    renderApp();
    
    // Step 1: User sees landing page
    expect(screen.getByText(/Compare your best route from the airport to the city/i)).toBeInTheDocument();
    
    // Step 2: User searches for an airport
    const searchInput = screen.getByPlaceholderText(/Search for an airport/i);
    fireEvent.change(searchInput, { target: { value: 'London Heathrow' } });
    
    await waitFor(() => {
      const airportOption = screen.getByText(/London Heathrow \(LHR\)/i);
      fireEvent.click(airportOption);
    });
    
    // Step 3: User clicks search
    const searchButton = screen.getByRole('button', { name: /search routes/i });
    fireEvent.click(searchButton);
    
    // Step 4: User sees results
    await waitFor(() => {
      expect(screen.getByText(/Transport Options/i)).toBeInTheDocument();
    });
    
    // Step 5: User can see different tabs
    expect(screen.getByRole('tab', { name: /best overall/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /cheapest/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /fastest/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /eco-friendly/i })).toBeInTheDocument();
  });

  it('should complete registration and account setup journey', async () => {
    renderApp();
    
    // Step 1: Click register
    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);
    
    // Step 2: Fill in registration form
    await waitFor(() => {
      expect(screen.getByText(/Create an account/i)).toBeInTheDocument();
    });
    
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Step 3: Submit registration
    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);
    
    // Step 4: Navigate to account settings
    await waitFor(() => {
      const accountButton = screen.getByRole('button', { name: /account/i });
      fireEvent.click(accountButton);
    });
    
    // Step 5: Verify account page
    await waitFor(() => {
      expect(screen.getByText(/Account Settings/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    });
  });

  it('should complete insights exploration journey', async () => {
    renderApp();
    
    // Step 1: Search for airport
    const searchInput = screen.getByPlaceholderText(/Search for an airport/i);
    fireEvent.change(searchInput, { target: { value: 'London Heathrow' } });
    
    await waitFor(() => {
      const airportOption = screen.getByText(/London Heathrow \(LHR\)/i);
      fireEvent.click(airportOption);
    });
    
    const searchButton = screen.getByRole('button', { name: /search routes/i });
    fireEvent.click(searchButton);
    
    // Step 2: Navigate to insights
    await waitFor(() => {
      const insightsButton = screen.getByRole('button', { name: /insights/i });
      fireEvent.click(insightsButton);
    });
    
    // Step 3: Verify insights page content
    await waitFor(() => {
      expect(screen.getByText(/Transfer Insights/i)).toBeInTheDocument();
      expect(screen.getByText(/CO₂ Emissions by Transport Mode/i)).toBeInTheDocument();
      expect(screen.getByText(/Time vs Cost Analysis/i)).toBeInTheDocument();
      expect(screen.getByText(/Route Map/i)).toBeInTheDocument();
    });
  });

  it('should complete terminal transfers exploration journey', async () => {
    renderApp();
    
    // Step 1: Search for airport
    const searchInput = screen.getByPlaceholderText(/Search for an airport/i);
    fireEvent.change(searchInput, { target: { value: 'London Heathrow' } });
    
    await waitFor(() => {
      const airportOption = screen.getByText(/London Heathrow \(LHR\)/i);
      fireEvent.click(airportOption);
    });
    
    const searchButton = screen.getByRole('button', { name: /search routes/i });
    fireEvent.click(searchButton);
    
    // Step 2: Navigate to transfers
    await waitFor(() => {
      const transfersButton = screen.getByRole('button', { name: /transfers/i });
      fireEvent.click(transfersButton);
    });
    
    // Step 3: Verify transfers page content
    await waitFor(() => {
      expect(screen.getByText(/Terminal Transfers/i)).toBeInTheDocument();
      expect(screen.getByText(/Heathrow Express/i)).toBeInTheDocument();
      expect(screen.getByText(/Elizabeth Line/i)).toBeInTheDocument();
      expect(screen.getByText(/Terminal Shuttle Buses/i)).toBeInTheDocument();
    });
  });

  it('should handle dark mode toggle throughout journey', async () => {
    renderApp();
    
    // Step 1: Toggle dark mode on home page
    const darkModeButtons = screen.getAllByRole('button');
    const darkModeButton = darkModeButtons.find(btn => 
      btn.querySelector('svg') && (btn.getAttribute('aria-label')?.includes('dark') || true)
    );
    
    if (darkModeButton) {
      fireEvent.click(darkModeButton);
      
      // Step 2: Navigate to results
      const searchInput = screen.getByPlaceholderText(/Search for an airport/i);
      fireEvent.change(searchInput, { target: { value: 'London Heathrow' } });
      
      await waitFor(() => {
        const airportOption = screen.getByText(/London Heathrow \(LHR\)/i);
        fireEvent.click(airportOption);
      });
      
      const searchButton = screen.getByRole('button', { name: /search routes/i });
      fireEvent.click(searchButton);
      
      // Step 3: Verify dark mode persists
      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });
    }
  });

  it('should complete booking flow', async () => {
    renderApp();
    
    // Step 1: Search and get results
    const searchInput = screen.getByPlaceholderText(/Search for an airport/i);
    fireEvent.change(searchInput, { target: { value: 'London Heathrow' } });
    
    await waitFor(() => {
      const airportOption = screen.getByText(/London Heathrow \(LHR\)/i);
      fireEvent.click(airportOption);
    });
    
    const searchButton = screen.getByRole('button', { name: /search routes/i });
    fireEvent.click(searchButton);
    
    // Step 2: Click book button (should open external link)
    await waitFor(() => {
      const bookButtons = screen.getAllByRole('button', { name: /book/i });
      expect(bookButtons.length).toBeGreaterThan(0);
      
      // Mock window.open
      const originalOpen = window.open;
      window.open = jest.fn();
      
      fireEvent.click(bookButtons[0]);
      
      expect(window.open).toHaveBeenCalledWith('https://www.google.com', '_blank');
      
      window.open = originalOpen;
    });
  });
});
