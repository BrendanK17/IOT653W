import { TransportOption, FilterState } from '../types';

export function filterByTab(
  options: TransportOption[],
  tab: string
): TransportOption[] {
  switch (tab) {
    case 'best':
      return options.filter(opt => opt.isBest);
    case 'cheapest':
      return options.filter(opt => opt.isCheapest);
    case 'fastest':
      return options.filter(opt => opt.isFastest);
    case 'eco':
      return options.filter(opt => opt.isEco);
    default:
      return options;
  }
}

export function applyFilters(
  options: TransportOption[],
  filters: FilterState
): TransportOption[] {
  return options.filter(opt => {
    // Filter by price
    if (opt.price > filters.maxPrice) {
      return false;
    }
    
    // Filter by transport mode
    if (!filters.transportModes[opt.mode]) {
      return false;
    }
    
    return true;
  });
}

export function getMostEcoFriendly(
  options: TransportOption[]
): TransportOption | null {
  if (options.length === 0) return null;
  
  return options.reduce((min, opt) => 
    opt.co2 < min.co2 ? opt : min
  , options[0]);
}

export function getFastest(
  options: TransportOption[]
): TransportOption | null {
  if (options.length === 0) return null;
  
  return options.reduce((min, opt) => {
    const minMinutes = parseDurationToMinutes(min.duration);
    const optMinutes = parseDurationToMinutes(opt.duration);
    return optMinutes < minMinutes ? opt : min;
  }, options[0]);
}

export function getCheapest(
  options: TransportOption[]
): TransportOption | null {
  if (options.length === 0) return null;
  
  return options.reduce((min, opt) => 
    opt.price < min.price ? opt : min
  , options[0]);
}

export function parseDurationToMinutes(duration: string): number {
  const match = duration.match(/(\d+)\s*mins?/);
  return match ? parseInt(match[1], 10) : 0;
}

export function calculateAveragePrice(options: TransportOption[]): number {
  if (options.length === 0) return 0;
  
  const total = options.reduce((sum, opt) => sum + opt.price, 0);
  return total / options.length;
}

export function calculateAverageCO2(options: TransportOption[]): number {
  if (options.length === 0) return 0;
  
  const total = options.reduce((sum, opt) => sum + opt.co2, 0);
  return total / options.length;
}
