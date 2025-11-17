import React from 'react';
import { MainLayout } from './layout/MainLayout';
import type { ViewType } from '../types';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

interface TerminalTransfersPageProps {
  isLoggedIn: boolean;
  onNavigate: (view: ViewType) => void;
  selectedAirport: string;
}

const TerminalTransfersPage: React.FC<TerminalTransfersPageProps> = ({
  isLoggedIn,
  onNavigate,
  selectedAirport
}) => {
  return (
    <MainLayout
      isLoggedIn={isLoggedIn}
      onNavigate={onNavigate}
      className="text-gray-900"
    >
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => onNavigate('transfers')}
                className="text-gray-700 hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Transfers
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                Terminal Transfer Details - {selectedAirport}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium mb-3 text-lg">Heathrow Express</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Runs every 15 minutes between terminals</li>
              <li>• Direct service to Paddington Station</li>
              <li>• Journey time: 15 minutes</li>
              <li>• Price: £25 one way</li>
              <li>• Operating hours: 5:00 AM - 11:45 PM</li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium mb-3 text-lg">Elizabeth Line</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Touch in at entry, touch out at destination</li>
              <li>• Direct connection to central London</li>
              <li>• Frequency: Every 5 minutes</li>
              <li>• Journey time: 45 minutes to central London</li>
              <li>• Price: Pay as you go or contactless</li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium mb-3 text-lg">Terminal Shuttle Buses</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Runs 24/7 between all terminals</li>
              <li>• Free service within the airport</li>
              <li>• Frequency: Every 10 minutes</li>
              <li>• Journey time: 15-30 minutes between terminals</li>
              <li>• No booking required</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-medium mb-3 text-lg text-blue-900">Important Notes</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Allow extra time during peak hours (7-9 AM, 4-7 PM)</li>
              <li>• Check live schedules on airport website or apps</li>
              <li>• Have your Oyster card or contactless payment ready</li>
              <li>• Wheelchair accessible options available</li>
              <li>• 24/7 customer service available</li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export { TerminalTransfersPage };