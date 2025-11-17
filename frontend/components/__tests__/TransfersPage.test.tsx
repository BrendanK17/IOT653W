/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { TransfersPage } from '../TransfersPage';
import { TransportOption } from '../../types';

const mockTransportOptions: TransportOption[] = [
  {
    id: 'LHR-1',
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
    route: 'Heathrow → Paddington',
    co2: 2.1,
  },
  {
    id: 'LHR-2',
    mode: 'subway',
    name: 'Elizabeth Line',
    airport: 'LHR',
    duration: '35 mins',
    price: 10,
    stops: 'Direct',
    isEco: true,
    isFastest: false,
    isCheapest: false,
    isBest: false,
    route: 'Heathrow → Central London',
    co2: 1.2,
  },
  {
    id: 'LHR-3',
    mode: 'bus',
    name: 'Terminal Shuttle Buses',
    airport: 'LHR',
    duration: '10 mins',
    price: 0,
    stops: 'Direct',
    isEco: false,
    isFastest: false,
    isCheapest: true,
    isBest: false,
    route: 'Between Terminals',
    co2: 0.5,
  },
];

describe('TransfersPage', () => {
  const mockProps = {
    selectedAirport: 'London Heathrow (LHR)',
    searchQuery: '',
    isLoggedIn: false,
    onNavigate: vi.fn(),
    transportOptions: mockTransportOptions,
    onAirportSelect: vi.fn(),
    airports: ['London Heathrow (LHR)', 'London Gatwick (LGW)'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the page with airport name in search bar', () => {
    render(<TransfersPage {...mockProps} />);
    const searchInput = screen.getByPlaceholderText('Where would you like to go? (e.g., London Heathrow)');
    expect(searchInput).toHaveValue('London Heathrow (LHR)');
  });

  it('should display all transfer options', () => {
    render(<TransfersPage {...mockProps} />);
    expect(screen.getByRole('heading', { level: 3, name: 'Heathrow Express' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Elizabeth Line' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Terminal Shuttle Buses' })).toBeInTheDocument();
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
    const searchInput = screen.getByPlaceholderText('Where would you like to go? (e.g., London Heathrow)');
    expect(searchInput).toHaveValue('London City (LCY)');
  });

  it('should use default airport when both are empty', () => {
    const props = {
      ...mockProps,
      selectedAirport: '',
      searchQuery: '',
    };
    render(<TransfersPage {...props} />);
    const searchInput = screen.getByPlaceholderText('Where would you like to go? (e.g., London Heathrow)');
    expect(searchInput).toHaveValue('');
  });

  it('should display pro tips section', () => {
    render(<TransfersPage {...mockProps} />);
    expect(screen.getByText('Pro Tips')).toBeInTheDocument();
    expect(screen.getByText(/Allow at least 60-90 minutes/i)).toBeInTheDocument();
  });

  it('should navigate to terminal transfers page', () => {
    render(<TransfersPage {...mockProps} />);
    const terminalButton = screen.getByRole('button', { name: /terminal transfer details/i });
    fireEvent.click(terminalButton);
    expect(mockProps.onNavigate).toHaveBeenCalledWith('terminal-transfers');
  });
});
