// Core types for the GroundScanner application

export type TransportMode = 'train' | 'bus' | 'coach' | 'taxi' | 'underground';

export type TabType = 'best' | 'cheapest' | 'fastest' | 'eco';

export type ViewType = 'home' | 'results' | 'insights' | 'login' | 'register' | 'account' | 'transfers' | 'terminal-transfers';

export interface Stop {
  stop_name: string;
  lat: number;
  lon: number;
  currency: string;
  prices: Array<{
    type: string;
    amount: number;
  }>;
  branch_id?: string | null;
}

export interface TransportOption {
  id: string;
  mode: TransportMode;
  name: string;
  airport: string;
  duration: string | number;
  price: number;
  stops: string | Stop[];
  isEco: boolean;
  isFastest: boolean;
  isCheapest: boolean;
  isBest: boolean;
  route: string;
  co2: number | null; // kg of CO2
  iata?: string;
  created_at?: string;
  updated_at?: string;
  sponsored?: boolean; // Flag to indicate if this is a sponsored transport option
  hasFirstClass?: boolean; // Flag to indicate if first class tickets are available
}

export interface FilterState {
  transportModes: {
    train: boolean;
    bus: boolean;
    coach: boolean;
    taxi: boolean;
    underground: boolean;
  };
  stops: {
    direct: boolean;
    oneOrMore: boolean;
  };
  maxTime: number;
  maxPrice: number;
  departureTime: [number, number];
  flexibleTicketsOnly: boolean;
  firstClassOnly: boolean;
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
