import React from 'react';
import { TransportOption } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useParams } from 'react-router-dom';

interface ResultsPageProps {
  isLoggedIn: boolean;
  transportOptions: Record<string, TransportOption[]>;
  onNavigateToInsights: (airport: string) => void;
  onNavigateToTransfers: (airport: string) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  isLoggedIn: _isLoggedIn,
  transportOptions,
  onNavigateToInsights,
  onNavigateToTransfers,
}) => {
  const { airport } = useParams<{ airport: string }>();
  const options = transportOptions[airport?.toUpperCase() ?? ''] ?? [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Transport Options</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-2">Quick Actions</h2>
          <div className="space-y-2">
            <Button
              className="w-full"
              onClick={() => onNavigateToInsights(airport ?? '')}
            >
              View Insights
            </Button>
            <Button
              className="w-full"
              onClick={() => onNavigateToTransfers(airport ?? '')}
            >
              Book Transfer
            </Button>
          </div>
        </Card>

        {options.map((option) => (
          <Card key={option.route} className="p-4">
            <h3 className="text-lg font-semibold">{option.route}</h3>
            <div className="mt-2 space-y-1">
              <p>Mode: {option.mode}</p>
              <p>Duration: {option.duration} minutes</p>
              <p>Price: £{option.price}</p>
              <p>Stops: {option.stops}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};