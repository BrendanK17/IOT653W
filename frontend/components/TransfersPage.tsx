import { useState } from 'react';
import type { TransportOption, ViewType } from '../types';
import { MainLayout } from './layout/MainLayout';
import { FilterSidebar } from './transport/FilterSidebar';
import { TransferList } from './transport/TransferList';
import type { FilterState } from './transport/FilterSidebar';
import { Button } from './ui/button';

interface TransfersPageProps {
  isLoggedIn: boolean;
  onNavigate: (view: ViewType) => void;
  selectedAirport: string;
  searchQuery: string;
  transportOptions: TransportOption[];
}

const TransfersPage = ({
  isLoggedIn,
  onNavigate,
  selectedAirport,
  transportOptions,
}: TransfersPageProps) => {
  const [filters, setFilters] = useState<FilterState>({
    transportModes: {
      taxi: true,
      bus: true,
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

  const [sortBy] = useState<string>('price');

  const [activeTab, setActiveTab] = useState('best-overall');

  // Sort and filter transport options based on the active tab
  const getDurationInMinutes = (duration: string): number => {
    const match = duration.match(/(\d+)/);
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
              <h2 className="text-lg font-semibold">
                {selectedAirport}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
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
              sortBy={sortBy}
            />
          </div>
        </main>
      </div>
    </MainLayout>
  );
};

export { TransfersPage };
