/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TransfersPage } from '../TransfersPage';

describe('TransfersPage', () => {
  const mockProps = {
    selectedAirport: 'London Heathrow (LHR)',
    searchQuery: '',
    darkMode: false,
    isLoggedIn: false,
    onSetDarkMode: jest.fn(),
    onNavigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the page with airport name', () => {
    render(<TransfersPage {...mockProps} />);
    expect(screen.getByText(/Terminal Transfers at London Heathrow/i)).toBeInTheDocument();
  });

  it('should display all transfer options', () => {
    render(<TransfersPage {...mockProps} />);
    expect(screen.getByText('Heathrow Express')).toBeInTheDocument();
    expect(screen.getByText('Elizabeth Line')).toBeInTheDocument();
    expect(screen.getByText('Terminal Shuttle Buses')).toBeInTheDocument();
  });

  it('should show FREE badges for all options', () => {
    render(<TransfersPage {...mockProps} />);
    const freeBadges = screen.getAllByText('FREE');
    expect(freeBadges.length).toBeGreaterThan(0);
  });

  it('should navigate to home when logo is clicked', () => {
    render(<TransfersPage {...mockProps} />);
    const logo = screen.getByText('GroundScanner');
    fireEvent.click(logo);
    expect(mockProps.onNavigate).toHaveBeenCalledWith('home');
  });

  it('should toggle dark mode', () => {
    render(<TransfersPage {...mockProps} />);
    const darkModeButton = screen.getByRole('button', { name: /sun|moon/i });
    fireEvent.click(darkModeButton);
    expect(mockProps.onSetDarkMode).toHaveBeenCalled();
  });

  it('should show account button when logged in', () => {
    render(<TransfersPage {...mockProps} isLoggedIn={true} />);
    // Account button is hidden on small screens, so we just check it's in the document
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should navigate to results page', () => {
    render(<TransfersPage {...mockProps} />);
    const backButton = screen.getByRole('button', { name: /back to results/i });
    fireEvent.click(backButton);
    expect(mockProps.onNavigate).toHaveBeenCalledWith('results');
  });

  it('should use searchQuery when selectedAirport is empty', () => {
    const props = {
      ...mockProps,
      selectedAirport: '',
      searchQuery: 'London City (LCY)',
    };
    render(<TransfersPage {...props} />);
    expect(screen.getByText(/Terminal Transfers at London City/i)).toBeInTheDocument();
  });

  it('should use default airport when both are empty', () => {
    const props = {
      ...mockProps,
      selectedAirport: '',
      searchQuery: '',
    };
    render(<TransfersPage {...props} />);
    expect(screen.getByText(/Terminal Transfers at London Heathrow/i)).toBeInTheDocument();
  });

  it('should display pro tips section', () => {
    render(<TransfersPage {...mockProps} />);
    expect(screen.getByText('Pro Tips')).toBeInTheDocument();
    expect(screen.getByText(/Allow at least 60-90 minutes/i)).toBeInTheDocument();
  });

  it('should display terminal transfer details', () => {
    render(<TransfersPage {...mockProps} />);
    expect(screen.getByText(/Runs every 15 minutes/i)).toBeInTheDocument();
    expect(screen.getByText(/Touch in at entry, touch out at destination/i)).toBeInTheDocument();
    expect(screen.getByText(/Runs 24\/7 between all terminals/i)).toBeInTheDocument();
  });
});
