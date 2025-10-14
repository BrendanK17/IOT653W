/**
 * @jest-environment jsdom
 */

import {
  getAirportCode,
  filterAirports,
  isValidAirportFormat,
  getAirportDisplayName,
} from '../airportUtils';

describe('airportUtils', () => {
  describe('getAirportCode', () => {
    it('should extract airport code from valid airport name', () => {
      expect(getAirportCode('London Heathrow (LHR)')).toBe('lhr');
      expect(getAirportCode('Manchester (MAN)')).toBe('man');
      expect(getAirportCode('London City (LCY)')).toBe('lcy');
    });

    it('should return empty string for invalid format', () => {
      expect(getAirportCode('Invalid Airport')).toBe('');
      expect(getAirportCode('Airport ()')).toBe('');
      expect(getAirportCode('')).toBe('');
    });

    it('should handle multiple parentheses correctly', () => {
      expect(getAirportCode('London (City) Airport (LCY)')).toBe('City');
    });
  });

  describe('filterAirports', () => {
    const airports = [
      'London Heathrow (LHR)',
      'London Gatwick (LGW)',
      'London City (LCY)',
      'Manchester (MAN)',
      'Birmingham (BHX)',
      'Edinburgh (EDI)',
    ];

    it('should filter airports by query', () => {
      const result = filterAirports(airports, 'London');
      expect(result).toHaveLength(3);
      expect(result).toContain('London Heathrow (LHR)');
      expect(result).toContain('London Gatwick (LGW)');
      expect(result).toContain('London City (LCY)');
    });

    it('should be case insensitive', () => {
      const result = filterAirports(airports, 'LONDON');
      expect(result).toHaveLength(3);
    });

    it('should return empty array for empty query', () => {
      expect(filterAirports(airports, '')).toEqual([]);
      expect(filterAirports(airports, '   ')).toEqual([]);
    });

    it('should filter by airport code', () => {
      const result = filterAirports(airports, 'LHR');
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('London Heathrow (LHR)');
    });

    it('should return empty array when no matches', () => {
      expect(filterAirports(airports, 'Paris')).toEqual([]);
    });
  });

  describe('isValidAirportFormat', () => {
    it('should validate correct airport format', () => {
      expect(isValidAirportFormat('London Heathrow (LHR)')).toBe(true);
      expect(isValidAirportFormat('Manchester (MAN)')).toBe(true);
      expect(isValidAirportFormat('A (ABC)')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(isValidAirportFormat('London Heathrow')).toBe(false);
      expect(isValidAirportFormat('(LHR)')).toBe(false);
      expect(isValidAirportFormat('London (LH)')).toBe(false); // Only 2 letters
      expect(isValidAirportFormat('London (LHRS)')).toBe(false); // 4 letters
      expect(isValidAirportFormat('London (lhr)')).toBe(false); // Lowercase
      expect(isValidAirportFormat('')).toBe(false);
    });
  });

  describe('getAirportDisplayName', () => {
    const airports = [
      'London Heathrow (LHR)',
      'London Gatwick (LGW)',
      'Manchester (MAN)',
    ];

    it('should return full airport name from code', () => {
      expect(getAirportDisplayName('LHR', airports)).toBe('London Heathrow (LHR)');
      expect(getAirportDisplayName('lhr', airports)).toBe('London Heathrow (LHR)');
      expect(getAirportDisplayName('MAN', airports)).toBe('Manchester (MAN)');
    });

    it('should return empty string for unknown code', () => {
      expect(getAirportDisplayName('XYZ', airports)).toBe('');
      expect(getAirportDisplayName('', airports)).toBe('');
    });
  });
});
