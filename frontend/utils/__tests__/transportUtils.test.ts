/**
 * @jest-environment jsdom
 */

import {
  filterByTab,
  applyFilters,
  getMostEcoFriendly,
  getFastest,
  getCheapest,
  parseDurationToMinutes,
  calculateAveragePrice,
  calculateAverageCO2,
} from '../transportUtils';
import { TransportOption, FilterState } from '../../types';

const mockOptions: TransportOption[] = [
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
    route: 'Heathrow → Victoria',
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

describe('transportUtils', () => {
  describe('filterByTab', () => {
    it('should filter by best tab', () => {
      const result = filterByTab(mockOptions, 'best');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Heathrow Express');
    });

    it('should filter by cheapest tab', () => {
      const result = filterByTab(mockOptions, 'cheapest');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Piccadilly Line');
    });

    it('should filter by fastest tab', () => {
      const result = filterByTab(mockOptions, 'fastest');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Heathrow Express');
    });

    it('should filter by eco tab', () => {
      const result = filterByTab(mockOptions, 'eco');
      expect(result).toHaveLength(2);
      expect(result.map(r => r.name)).toContain('Piccadilly Line');
      expect(result.map(r => r.name)).toContain('National Express');
    });
  });

  describe('applyFilters', () => {
    const defaultFilters: FilterState = {
      maxPrice: 100,
      transportModes: {
        train: true,
        bus: true,
        taxi: true,
        subway: true,
      },
    };

    it('should apply price filter', () => {
      const filters: FilterState = {
        ...defaultFilters,
        maxPrice: 10,
      };
      const result = applyFilters(mockOptions, filters);
      expect(result).toHaveLength(2);
      expect(result.every(opt => opt.price <= 10)).toBe(true);
    });

    it('should apply transport mode filter', () => {
      const filters: FilterState = {
        ...defaultFilters,
        transportModes: {
          train: true,
          bus: false,
          taxi: false,
          subway: false,
        },
      };
      const result = applyFilters(mockOptions, filters);
      expect(result).toHaveLength(1);
      expect(result[0].mode).toBe('train');
    });

    it('should apply multiple filters', () => {
      const filters: FilterState = {
        maxPrice: 30,
        transportModes: {
          train: true,
          bus: true,
          taxi: false,
          subway: true,
        },
      };
      const result = applyFilters(mockOptions, filters);
      expect(result).toHaveLength(3);
      expect(result.every(opt => opt.price <= 30)).toBe(true);
      expect(result.every(opt => opt.mode !== 'taxi')).toBe(true);
    });
  });

  describe('getMostEcoFriendly', () => {
    it('should return option with lowest CO2', () => {
      const result = getMostEcoFriendly(mockOptions);
      expect(result?.name).toBe('Piccadilly Line');
      expect(result?.co2).toBe(1.2);
    });

    it('should return null for empty array', () => {
      expect(getMostEcoFriendly([])).toBeNull();
    });
  });

  describe('getFastest', () => {
    it('should return option with shortest duration', () => {
      const result = getFastest(mockOptions);
      expect(result?.name).toBe('Heathrow Express');
      expect(result?.duration).toBe('15 mins');
    });

    it('should return null for empty array', () => {
      expect(getFastest([])).toBeNull();
    });
  });

  describe('getCheapest', () => {
    it('should return option with lowest price', () => {
      const result = getCheapest(mockOptions);
      expect(result?.name).toBe('Piccadilly Line');
      expect(result?.price).toBe(6);
    });

    it('should return null for empty array', () => {
      expect(getCheapest([])).toBeNull();
    });
  });

  describe('parseDurationToMinutes', () => {
    it('should parse duration string to minutes', () => {
      expect(parseDurationToMinutes('15 mins')).toBe(15);
      expect(parseDurationToMinutes('45 mins')).toBe(45);
      expect(parseDurationToMinutes('120 mins')).toBe(120);
    });

    it('should handle malformed strings', () => {
      expect(parseDurationToMinutes('invalid')).toBe(0);
      expect(parseDurationToMinutes('')).toBe(0);
    });
  });

  describe('calculateAveragePrice', () => {
    it('should calculate average price', () => {
      const result = calculateAveragePrice(mockOptions);
      expect(result).toBe(21); // (25 + 6 + 8 + 45) / 4 = 21
    });

    it('should return 0 for empty array', () => {
      expect(calculateAveragePrice([])).toBe(0);
    });
  });

  describe('calculateAverageCO2', () => {
    it('should calculate average CO2', () => {
      const result = calculateAverageCO2(mockOptions);
      expect(result).toBe(3.4); // (2.1 + 1.2 + 1.8 + 8.5) / 4 = 3.4
    });

    it('should return 0 for empty array', () => {
      expect(calculateAverageCO2([])).toBe(0);
    });
  });
});
