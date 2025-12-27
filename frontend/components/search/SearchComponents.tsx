import React from 'react';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, MapPin, Plane } from 'lucide-react';
import { sanitizeInput } from '../../utils/cn';

export type AirportOption = {
  id: string;
  display: string; // e.g., "Heathrow Airport (LHR)" or "London (ALL)"
  value: string; // code to navigate to (IATA or city code)
  type: 'airport' | 'city_all';
  iata?: string | null;
  name?: string;
  city?: string;
  aliases?: string[];
};

interface AirportDropdownProps {
  searchQuery: string;
  showDropdown: boolean;
  airports: AirportOption[];
  onSelect: (display: string, code: string) => void;
}

export const AirportDropdown: React.FC<AirportDropdownProps> = ({
  searchQuery,
  showDropdown,
  airports,
  onSelect
}) => {
  if (!showDropdown || !searchQuery) return null;

  const sanitizedQuery = sanitizeInput(searchQuery);
  const q = sanitizedQuery.toLowerCase().trim();

  const filtered = airports.filter(opt => {
    if (!q) return true;
    const hay = [opt.display, opt.city || '', opt.iata || '', ...(opt.aliases || [])].join(' ').toLowerCase();
    return hay.includes(q);
  });

  if (filtered.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
      {filtered.map((opt) => (
        <button
          key={opt.id}
          className="w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors text-gray-900"
          onClick={() => onSelect(opt.display, opt.value)}
        >
          <div className="flex items-center space-x-2">
            <Plane className="w-4 h-4 text-blue-500" />
            <span>{opt.display}</span>
          </div>
        </button>
      ))}
    </div>
  );
};

interface SearchBoxProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onFocus: () => void;
  onBlur?: () => void;
  className?: string;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  searchQuery,
  onSearchChange,
  onFocus,
  onBlur,
  className
}) => {
  return (
    <div className={`relative ${className || ''}`}>
      <div className="flex items-center space-x-2 p-3 sm:p-4 border-2 border-gray-200 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 bg-white">
        <MapPin className="w-5 h-5 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Where would you like to go? (e.g., London Heathrow)"
          className="border-none outline-none shadow-none text-base sm:text-lg p-0 bg-transparent text-gray-900"
        />
      </div>
    </div>
  );
};

interface SearchButtonProps {
  disabled: boolean;
  onClick: () => void;
  className?: string;
}

export const SearchButton: React.FC<SearchButtonProps> = ({
  disabled,
  onClick,
  className
}) => {
  return (
    <Button
      className={`text-base sm:text-lg py-5 sm:py-6 bg-blue-600 hover:bg-blue-700 ${className || ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <Search className="w-5 h-5 mr-2" />
      Search Routes
    </Button>
  );
};