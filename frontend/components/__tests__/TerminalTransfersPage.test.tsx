/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { TerminalTransfersPage } from '../TerminalTransfersPage';

describe('TerminalTransfersPage', () => {
  const mockProps = {
    isLoggedIn: false,
    onNavigate: vi.fn(),
    selectedAirport: 'London Heathrow (LHR)',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the page with airport name in header', () => {
    render(<TerminalTransfersPage {...mockProps} />);
    expect(screen.getByText('Terminal Transfer Details - London Heathrow (LHR)')).toBeInTheDocument();
  });

  it('should display all terminal transfer options', () => {
    render(<TerminalTransfersPage {...mockProps} />);
    expect(screen.getByText('Heathrow Express')).toBeInTheDocument();
    expect(screen.getByText('Elizabeth Line')).toBeInTheDocument();
    expect(screen.getByText('Terminal Shuttle Buses')).toBeInTheDocument();
  });

  it('should display detailed information for Heathrow Express', () => {
    render(<TerminalTransfersPage {...mockProps} />);
    expect(screen.getByText(/Runs every 15 minutes between terminals/i)).toBeInTheDocument();
    expect(screen.getByText(/Direct service to Paddington Station/i)).toBeInTheDocument();
    expect(screen.getByText(/Journey time: 15 minutes/i)).toBeInTheDocument();
    expect(screen.getByText(/Price: £25 one way/i)).toBeInTheDocument();
  });

  it('should display detailed information for Elizabeth Line', () => {
    render(<TerminalTransfersPage {...mockProps} />);
    expect(screen.getByText(/Touch in at entry, touch out at destination/i)).toBeInTheDocument();
    expect(screen.getByText(/Direct connection to central London/i)).toBeInTheDocument();
    expect(screen.getByText(/Frequency: Every 5 minutes/i)).toBeInTheDocument();
    expect(screen.getByText(/Journey time: 45 minutes to central London/i)).toBeInTheDocument();
  });

  it('should display detailed information for Terminal Shuttle Buses', () => {
    render(<TerminalTransfersPage {...mockProps} />);
    expect(screen.getByText(/Runs 24\/7 between all terminals/i)).toBeInTheDocument();
    expect(screen.getByText(/Free service within the airport/i)).toBeInTheDocument();
    expect(screen.getByText(/Frequency: Every 10 minutes/i)).toBeInTheDocument();
    expect(screen.getByText(/No booking required/i)).toBeInTheDocument();
  });

  it('should display important notes section', () => {
    render(<TerminalTransfersPage {...mockProps} />);
    expect(screen.getByText('Important Notes')).toBeInTheDocument();
    expect(screen.getByText(/Allow extra time during peak hours/i)).toBeInTheDocument();
    expect(screen.getByText(/Wheelchair accessible options available/i)).toBeInTheDocument();
  });

  it('should navigate back to transfers page when back button is clicked', () => {
    render(<TerminalTransfersPage {...mockProps} />);
    const backButton = screen.getByRole('button', { name: /back to transfers/i });
    fireEvent.click(backButton);
    expect(mockProps.onNavigate).toHaveBeenCalledWith('transfers');
  });

  it('should navigate to home when logo is clicked', () => {
    render(<TerminalTransfersPage {...mockProps} />);
    const logo = screen.getByText('GroundScanner');
    fireEvent.click(logo);
    expect(mockProps.onNavigate).toHaveBeenCalledWith('home');
  });
});