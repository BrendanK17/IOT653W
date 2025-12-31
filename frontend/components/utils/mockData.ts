/**
 * Mock data for development and testing
 * Centralized location for all mock transport options and airports
 */

import { TransportOption } from '../../types';

export const mockTransportOptions: TransportOption[] = [
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
    route: 'Heathrow → Paddington Station',
    co2: 2.1,
  },
  {
    id: '2',
    mode: 'underground',
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
  {
    id: '3',
    mode: 'bus',
    name: 'National Express',
    airport: 'LHR',
    duration: '60 mins',
    price: 8,
    stops: '3 stops',
    isEco: true,
    isFastest: false,
    isCheapest: false,
    isBest: false,
    route: 'Heathrow → Victoria Coach Station',
    co2: 1.8,
  },
  {
    id: '4',
    mode: 'taxi',
    name: 'Taxi/Uber',
    airport: 'LHR',
    duration: '35 mins',
    price: 45,
    stops: 'Direct',
    isEco: false,
    isFastest: false,
    isCheapest: false,
    isBest: false,
    route: 'Heathrow → Central London',
    co2: 8.5,
  },
];

/**
 * Gets mock transport options for a specific airport
 * @param airportCode - Three-letter airport code
 * @returns Array of transport options for that airport
 */
export function getMockOptionsForAirport(airportCode: string): TransportOption[] {
  // In a real app, this would fetch from an API
  // For now, return options matching the airport
  return mockTransportOptions.filter(opt => opt.airport === airportCode.toUpperCase());
}

/**
 * Gets a single mock transport option by ID
 * @param id - Option ID
 * @returns Transport option or undefined if not found
 */
export function getMockOptionById(id: string): TransportOption | undefined {
  return mockTransportOptions.find(option => option.id === id);
}

/**
 * Gets all unique airport codes from mock data
 * @returns Array of airport codes
 */
export function getAvailableAirportCodes(): string[] {
  return Array.from(new Set(mockTransportOptions.map(opt => opt.airport)));
}
