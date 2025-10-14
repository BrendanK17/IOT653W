// Core types for the GroundScanner application

export type TransportMode = 'train' | 'bus' | 'taxi' | 'subway';

export type TabType = 'best' | 'cheapest' | 'fastest' | 'eco';

export type ViewType = 'home' | 'results' | 'insights' | 'login' | 'register' | 'account' | 'transfers';

export interface TransportOption {
  id: string;
  mode: TransportMode;
  name: string;
  airport: string;
  duration: string;
  price: number;
  stops: string;
  isEco: boolean;
  isFastest: boolean;
  isCheapest: boolean;
  isBest: boolean;
  route: string;
  co2: number; // kg of CO2
}

export interface FilterState {
  maxPrice: number;
  transportModes: {
    train: boolean;
    bus: boolean;
    taxi: boolean;
    subway: boolean;
  };
}

export interface UserState {
  isLoggedIn: boolean;
  email: string;
  defaultAirport: string;
}

export interface AppState {
  currentView: ViewType;
  activeTab: TabType;
  selectedAirport: string;
  searchQuery: string;
  showDropdown: boolean;
  showHeaderDropdown: boolean;
  darkMode: boolean;
  departureTime: string;
  filters: FilterState;
  user: UserState;
}

// Component Props Types
export interface NavigationProps {
  onNavigate: (view: ViewType) => void;
  currentView: ViewType;
  isLoggedIn: boolean;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export interface AirportSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (airport: string) => void;
  airports: string[];
  placeholder?: string;
  showDropdown: boolean;
  onDropdownChange: (show: boolean) => void;
}

export interface TransportCardProps {
  option: TransportOption;
  activeTab: TabType;
  onBook: (option: TransportOption) => void;
}

// Utility Types
export type AirportCode = string;
export type AirportName = string;
export type AirportMapping = Record<AirportCode, AirportName>;
