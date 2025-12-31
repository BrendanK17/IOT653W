import { useState } from 'react';
import type { TransportOption, ViewType } from '../types';
import { MainLayout } from './layout/MainLayout';
import { FilterSidebar } from './transport/FilterSidebar';
import { TransferList } from './transport/TransferList';
import type { FilterState } from './transport/FilterSidebar';
import { Button } from './ui/button';
import { SearchBox, AirportDropdown, AirportOption } from './search/SearchComponents';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface FareSummary {
  modes?: Record<string, {
    summary: string;
    payment?: {
      allowed?: string[];
      not_allowed?: string[];
    };
  }>;
  airports?: {
    terminals?: Record<string, {
      services?: Array<{
        name: string;
        payment?: {
          allowed?: string[];
          not_allowed?: string[];
        };
      }>;
    }>;
  };
}

interface TransfersPageProps {
  isLoggedIn: boolean;
  onNavigate: (view: ViewType) => void;
  selectedAirport: string;
  searchQuery: string;
  transportOptions: TransportOption[];
  onAirportSelect: (display: string, code: string) => void;
  airports: AirportOption[];
  fareSummary?: FareSummary;
}

const TransfersPage = ({
  isLoggedIn,
  onNavigate,
  selectedAirport,
  transportOptions,
  onAirportSelect,
  airports,
  searchQuery: initialSearchQuery,
  fareSummary,
}: TransfersPageProps) => {
  const [filters, setFilters] = useState<FilterState>({
    transportModes: {
      taxi: true,
      bus: true,
      coach: true,
      train: true,
      subway: true
    },
    stops: {
      direct: false,
      oneOrMore: false
    },
    maxTime: 180,
    maxPrice: 200,
    departureTime: [6, 23],
    flexibleTicketsOnly: false,
    firstClassOnly: false
  });

  const [activeTab, setActiveTab] = useState('best-overall');

  const [searchValue, setSearchValue] = useState(selectedAirport || initialSearchQuery || '');
  const [showDropdown, setShowDropdown] = useState(false);
  // Sort and filter transport options based on the active tab
  const getDurationInMinutes = (duration: string | number): number => {
    const durationStr = typeof duration === 'number' ? duration.toString() : duration;
    const match = durationStr.match(/(\d+)/);
    return match ? parseInt(match[0]) : 0;
  };

  const sortedTransports = {
    'best-overall': transportOptions,  // Keep original order from mock data
    cheapest: [...transportOptions].sort((a, b) => {
      // Sort all options by price
      return a.price - b.price;
    }),
    fastest: [...transportOptions].sort((a, b) => {
      // Sort all options by duration
      const aDuration = getDurationInMinutes(a.duration);
      const bDuration = getDurationInMinutes(b.duration);
      return aDuration - bDuration;
    }),
    'eco-friendly': [...transportOptions].sort((a, b) => {
      // Sort all options by CO2 emissions
      const aCo2 = typeof a.co2 === 'number' ? a.co2 : Number.MAX_VALUE;
      const bCo2 = typeof b.co2 === 'number' ? b.co2 : Number.MAX_VALUE;
      return aCo2 - bCo2;
    }),
  };

  return (
    <MainLayout
      isLoggedIn={isLoggedIn}
      onNavigate={onNavigate}
      className="text-gray-900"
    >
      {/* Secondary Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <SearchBox
                  searchQuery={searchValue}
                  onSearchChange={setSearchValue}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setShowDropdown(false)}
                  className="w-80"
                />
                <AirportDropdown
                  searchQuery={searchValue}
                  showDropdown={showDropdown}
                  airports={airports}
                  onSelect={(display, code) => {
                    setSearchValue(display);
                    setShowDropdown(false);
                    onAirportSelect(display, code);
                  }}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => onNavigate('terminal-transfers')}
                className="text-gray-700 hover:bg-gray-100"
              >
                Terminal Transfer Details
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate('insights')}
                className="text-gray-700 hover:bg-gray-100"
              >
                Insights
              </Button>
              <Button
                variant="ghost"
                onClick={() => onNavigate('results')}
                className="text-gray-700 hover:bg-gray-100"
              >
                Back to Results
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 py-2">
            {['best-overall', 'cheapest', 'fastest', 'eco-friendly'].map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "ghost"}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                <span className="ml-2">({sortedTransports[tab as keyof typeof sortedTransports].length})</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[calc(100vh-8rem)] flex overflow-hidden">
        {/* Filters Sidebar - Fixed width */}
        <aside className="w-80 flex-shrink-0 bg-gray-50 border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="container px-8 py-6">
            <TransferList
              transportOptions={sortedTransports[activeTab as keyof typeof sortedTransports]}
              filters={filters}
              selectedAirport={selectedAirport}
              fareSummary={fareSummary}
            />

            {/* Pro Tips Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Pro Tips</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Allow at least 60-90 minutes for international flights</li>
                  <li>• Check transport schedules in advance</li>
                  <li>• Consider traffic conditions during peak hours</li>
                  <li>• Have your Oyster card or contactless payment ready</li>
                </ul>
              </div>
            </div>

            {/* Fare Guide Section */}
            {fareSummary && (
              <div className="mt-8">
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
                    <h3 className="text-lg font-semibold">Fare Guide</h3>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      {/* eslint-disable @typescript-eslint/no-explicit-any */}
                      {fareSummary.modes && Object.entries(fareSummary.modes).map(([mode, data]: [string, unknown]) => (
                        <div key={mode} className="mb-4 last:mb-0">
                          <h4 className="font-medium capitalize mb-2">{mode.replace('_', ' ')}</h4>
                          <p className="text-sm text-gray-700 mb-2">{(data as any).summary}</p>
                          {(data as any).payment && (
                            <div className="text-xs text-gray-600">
                              {(data as any).payment.not_allowed && (data as any).payment.not_allowed.length > 0 && (
                                <p>Not accepted: {(data as any).payment.not_allowed.join(', ')}</p>
                              )}
                              {(data as any).payment.allowed && (data as any).payment.allowed.length > 0 && (
                                <p>Accepted: {(data as any).payment.allowed.join(', ')}</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      {/* eslint-enable @typescript-eslint/no-explicit-any */}
                      {/* eslint-disable @typescript-eslint/no-explicit-any */}
                      {fareSummary.airports && fareSummary.airports.terminals && Object.entries(fareSummary.airports.terminals).map(([iata, terminal]: [string, unknown]) => (
                        <div key={iata} className="mb-4 last:mb-0">
                          <h4 className="font-medium">{iata} Airport</h4>
                          {(terminal as any).services && (terminal as any).services.map((service: unknown, idx: number) => (
                            <div key={idx} className="ml-4 mt-2">
                              <p className="text-sm font-medium">{(service as any).name}</p>
                              {(service as any).payment && (
                                <div className="text-xs text-gray-600">
                                  {(service as any).payment.not_allowed && (service as any).payment.not_allowed.length > 0 && (
                                    <p>Not accepted: {(service as any).payment.not_allowed.join(', ')}</p>
                                  )}
                                  {(service as any).payment.allowed && (service as any).payment.allowed.length > 0 && (
                                    <p>Accepted: {(service as any).payment.allowed.join(', ')}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                      {/* eslint-enable @typescript-eslint/no-explicit-any */}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
          </div>
        </main>
      </div>
    </MainLayout>
  );
};

export { TransfersPage };
