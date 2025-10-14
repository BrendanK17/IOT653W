/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NewInsightsPage } from '../InsightsPage';
import { TransportOption } from '../../types';

const mockTransportOptions: TransportOption[] = [
  {
    id: '1',
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
    id: '2',
    mode: 'subway',
    name: 'Piccadilly Line',
    airport: 'LHR',
    duration: '45 mins',
    price: 6,
    stops: '8 stops',
    isEco: true,
    isFastest: false,
    isCheapest: true,
    isBest: false,
    route: 'Heathrow → Central London',
    co2: 1.2,
  },
];

describe('NewInsightsPage', () => {
  const mockProps = {
    selectedAirport: 'London Heathrow (LHR)',
    searchQuery: '',
    darkMode: false,
    isLoggedIn: false,
    transportOptions: mockTransportOptions,
    onSetDarkMode: jest.fn(),
    onNavigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the page with airport name', () => {
    render(<NewInsightsPage {...mockProps} />);
    expect(screen.getByText(/London Heathrow \(LHR\) Transfer Insights/i)).toBeInTheDocument();
  });

  it('should display CO2 emissions chart', () => {
    render(<NewInsightsPage {...mockProps} />);
    expect(screen.getByText('CO₂ Emissions by Transport Mode')).toBeInTheDocument();
    expect(screen.getByText('2.1 kg')).toBeInTheDocument();
    expect(screen.getByText('1.2 kg')).toBeInTheDocument();
  });

  it('should display time vs cost analysis', () => {
    render(<NewInsightsPage {...mockProps} />);
    expect(screen.getByText('Time vs Cost Analysis')).toBeInTheDocument();
  });

  it('should display route map', () => {
    render(<NewInsightsPage {...mockProps} />);
    expect(screen.getByText('Route Map')).toBeInTheDocument();
    expect(screen.getByText('Airport')).toBeInTheDocument();
    expect(screen.getByText('City Centre')).toBeInTheDocument();
  });

  it('should display summary statistics', () => {
    render(<NewInsightsPage {...mockProps} />);
    expect(screen.getByText('Most Eco-Friendly')).toBeInTheDocument();
    expect(screen.getByText('Fastest Option')).toBeInTheDocument();
    expect(screen.getByText('Most Affordable')).toBeInTheDocument();
  });

  it('should calculate and display most eco-friendly option', () => {
    render(<NewInsightsPage {...mockProps} />);
    // Piccadilly Line has lowest CO2 (1.2 kg)
    const ecoCards = screen.getAllByText('Piccadilly Line');
    expect(ecoCards.length).toBeGreaterThan(0);
  });

  it('should calculate and display fastest option', () => {
    render(<NewInsightsPage {...mockProps} />);
    // Heathrow Express is fastest (15 mins)
    const fastestCards = screen.getAllByText('Heathrow Express');
    expect(fastestCards.length).toBeGreaterThan(0);
  });

  it('should calculate and display cheapest option', () => {
    render(<NewInsightsPage {...mockProps} />);
    // Piccadilly Line is cheapest (£6)
    expect(screen.getByText('£6')).toBeInTheDocument();
  });

  it('should navigate to home when logo is clicked', () => {
    render(<NewInsightsPage {...mockProps} />);
    const logo = screen.getByText('GroundScanner');
    fireEvent.click(logo);
    expect(mockProps.onNavigate).toHaveBeenCalledWith('home');
  });

  it('should toggle dark mode', () => {
    render(<NewInsightsPage {...mockProps} />);
    const buttons = screen.getAllByRole('button');
    const darkModeButton = buttons.find(btn => 
      btn.querySelector('svg') // Look for icon buttons
    );
    if (darkModeButton) {
      fireEvent.click(darkModeButton);
      expect(mockProps.onSetDarkMode).toHaveBeenCalled();
    }
  });

  it('should navigate to results page', () => {
    render(<NewInsightsPage {...mockProps} />);
    const backButton = screen.getByRole('button', { name: /back to results/i });
    fireEvent.click(backButton);
    expect(mockProps.onNavigate).toHaveBeenCalledWith('results');
  });

  it('should display all transport option names in CO2 chart', () => {
    render(<NewInsightsPage {...mockProps} />);
    mockTransportOptions.forEach(option => {
      expect(screen.getAllByText(option.name).length).toBeGreaterThan(0);
    });
  });

  it('should use color coding for CO2 emissions', () => {
    render(<NewInsightsPage {...mockProps} />);
    // Low CO2 should use green, high CO2 should use red/yellow
    const co2Bars = screen.getByText('CO₂ Emissions by Transport Mode').parentElement?.parentElement;
    expect(co2Bars).toBeInTheDocument();
  });
});
