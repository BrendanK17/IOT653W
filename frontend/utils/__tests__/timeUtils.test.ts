/**
 * @jest-environment jsdom
 */

import {
  isValidTimeFormat,
  incrementHours,
  incrementMinutes,
  formatTimeDisplay,
} from '../timeUtils';

describe('timeUtils', () => {
  describe('isValidTimeFormat', () => {
    it('should validate correct time format', () => {
      expect(isValidTimeFormat('00:00')).toBe(true);
      expect(isValidTimeFormat('12:30')).toBe(true);
      expect(isValidTimeFormat('23:59')).toBe(true);
      expect(isValidTimeFormat('09:15')).toBe(true);
    });

    it('should reject invalid time format', () => {
      expect(isValidTimeFormat('24:00')).toBe(false);
      expect(isValidTimeFormat('12:60')).toBe(false);
      expect(isValidTimeFormat('1:30')).toBe(false); // Single digit hour
      expect(isValidTimeFormat('12:5')).toBe(false); // Single digit minute
      expect(isValidTimeFormat('12-30')).toBe(false);
      expect(isValidTimeFormat('invalid')).toBe(false);
      expect(isValidTimeFormat('')).toBe(false);
    });
  });

  describe('incrementHours', () => {
    it('should increment hours correctly', () => {
      expect(incrementHours('10:30', 1)).toBe('11:30');
      expect(incrementHours('10:30', 2)).toBe('12:30');
      expect(incrementHours('22:30', 3)).toBe('01:30');
    });

    it('should handle midnight rollover', () => {
      expect(incrementHours('23:30', 1)).toBe('00:30');
      expect(incrementHours('23:30', 2)).toBe('01:30');
    });

    it('should handle negative increments', () => {
      expect(incrementHours('10:30', -1)).toBe('09:30');
      expect(incrementHours('00:30', -1)).toBe('23:30');
    });

    it('should default to increment of 1', () => {
      expect(incrementHours('10:30')).toBe('11:30');
    });
  });

  describe('incrementMinutes', () => {
    it('should increment minutes correctly', () => {
      expect(incrementMinutes('10:00', 15)).toBe('10:15');
      expect(incrementMinutes('10:30', 15)).toBe('10:45');
      expect(incrementMinutes('10:45', 15)).toBe('11:00');
    });

    it('should handle hour rollover', () => {
      expect(incrementMinutes('10:50', 15)).toBe('11:05');
      expect(incrementMinutes('23:50', 15)).toBe('00:05');
    });

    it('should handle negative increments', () => {
      expect(incrementMinutes('10:30', -15)).toBe('10:15');
      expect(incrementMinutes('10:00', -15)).toBe('09:45');
    });

    it('should default to increment of 15', () => {
      expect(incrementMinutes('10:00')).toBe('10:15');
    });

    it('should handle large increments', () => {
      expect(incrementMinutes('10:00', 90)).toBe('11:30');
      expect(incrementMinutes('10:00', 1440)).toBe('10:00'); // 24 hours
    });
  });

  describe('formatTimeDisplay', () => {
    it('should format time for AM display', () => {
      expect(formatTimeDisplay('00:00')).toBe('12:00 AM');
      expect(formatTimeDisplay('01:30')).toBe('1:30 AM');
      expect(formatTimeDisplay('09:15')).toBe('9:15 AM');
      expect(formatTimeDisplay('11:59')).toBe('11:59 AM');
    });

    it('should format time for PM display', () => {
      expect(formatTimeDisplay('12:00')).toBe('12:00 PM');
      expect(formatTimeDisplay('13:30')).toBe('1:30 PM');
      expect(formatTimeDisplay('18:45')).toBe('6:45 PM');
      expect(formatTimeDisplay('23:59')).toBe('11:59 PM');
    });

    it('should return original string for invalid format', () => {
      expect(formatTimeDisplay('invalid')).toBe('invalid');
      expect(formatTimeDisplay('25:00')).toBe('25:00');
    });
  });
});
