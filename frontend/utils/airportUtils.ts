export function getAirportCode(airportName: string): string {
  // Match the first pattern "Text (CODE)"
  const match = airportName.match(/\(([^)]+)\)/);
  if (!match || !match[1]) {
    return '';
  }
  // Return the first match content - lowercase only if it looks like an airport code (3 letters)
  const content = match[1];
  if (/^[A-Z]{3}$/.test(content)) {
    return content.toLowerCase();
  }
  return content;
}

export function filterAirports(airports: string[], query: string): string[] {
  const trimmedQuery = query.trim();
  
  if (!trimmedQuery) {
    return [];
  }
  
  const lowerQuery = trimmedQuery.toLowerCase();
  
  return airports.filter(airport => {
    const lowerAirport = airport.toLowerCase();
    return lowerAirport.includes(lowerQuery);
  });
}

export function isValidAirportFormat(airportName: string): boolean {
  // Format: "Name (XXX)" where XXX is exactly 3 uppercase letters
  const pattern = /^.+\s\([A-Z]{3}\)$/;
  return pattern.test(airportName);
}

export function getAirportDisplayName(code: string, airports: string[]): string {
  const upperCode = code.toUpperCase();
  
  const found = airports.find(airport => {
    const airportCode = getAirportCode(airport).toUpperCase();
    return airportCode === upperCode;
  });
  
  return found || '';
}
