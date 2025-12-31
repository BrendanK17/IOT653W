import React, { useState, useEffect } from 'react';
import { MainLayout } from './layout/MainLayout';
import type { ViewType } from '../types';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

interface TerminalTransfersPageProps {
  isLoggedIn: boolean;
  onNavigate: (view: ViewType) => void;
  selectedAirport: string;
}

interface Section {
  name: string;
  tips: string[];
}

interface TerminalTransfers {
  iata: string;
  sections: Section[];
}

const API_BASE: string = (import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE || 'http://127.0.0.1:8000';

const extractIATA = (airportString: string): string => {
  const match = airportString.match(/\(([A-Z]{3})\)/);
  return match ? match[1] : airportString;
};

const TerminalTransfersPage: React.FC<TerminalTransfersPageProps> = ({
  isLoggedIn,
  onNavigate,
  selectedAirport
}) => {
  const [transfers, setTransfers] = useState<TerminalTransfers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTerminalTransfers = async () => {
      try {
        setLoading(true);
        setError(null);
        const iata = extractIATA(selectedAirport);
        const response = await fetch(`${API_BASE}/airports/${iata}/terminal-transfers`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Terminal transfer information not available for this airport');
          } else {
            setError('Failed to load terminal transfer information');
          }
          setTransfers(null);
          return;
        }

        const data = await response.json();
        setTransfers(data);
      } catch (err) {
        console.error('Error fetching terminal transfers:', err);
        setError('Failed to load terminal transfer information');
        setTransfers(null);
      } finally {
        setLoading(false);
      }
    };

    if (selectedAirport) {
      fetchTerminalTransfers();
    }
  }, [selectedAirport]);

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
        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading terminal transfer information...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {transfers && (
          <div className="space-y-6">
            {transfers.sections.map((section, index) => {
              // Use different styling for Important Notes section
              const isImportantNotes = section.name === 'Important Notes';
              
              return (
                <div
                  key={index}
                  className={`border rounded-lg p-6 ${
                    isImportantNotes
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <h4 className={`font-medium mb-3 text-lg ${
                    isImportantNotes ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {section.name}
                  </h4>
                  <ul className={`space-y-2 text-sm ${
                    isImportantNotes ? 'text-blue-800' : 'text-gray-700'
                  }`}>
                    {section.tips.map((tip, tipIndex) => (
                      <li key={tipIndex}>{tip}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export { TerminalTransfersPage };