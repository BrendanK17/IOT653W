import { X, Clock, PoundSterling, ExternalLink, Car, Bus, Train } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { TransportOption } from '../../types';

interface MapOverlayProps {
  transport: TransportOption;
  onClose: () => void;
}

const transportModeIcons = {
  taxi: Car,
  bus: Bus,
  train: Train,
  subway: Train,
};

const routeColors = {
  taxi: '#FF6B35',
  bus: '#4ECDC4', 
  train: '#45B7D1',
  subway: '#96CEB4',
};

export function MapOverlay({ transport, onClose }: MapOverlayProps) {
  const Icon = transportModeIcons[transport.mode as keyof typeof transportModeIcons];
  const routeColor = routeColors[transport.mode as keyof typeof routeColors];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Route Details</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex h-[600px]">
          {/* Map Area */}
          <div className="flex-1 relative bg-gray-100 dark:bg-gray-900">
            {/* Simplified Map Visualization */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 400 300"
                className="max-w-lg max-h-96"
              >
                {/* Background */}
                <rect width="400" height="300" className="fill-gray-100 dark:fill-gray-900" />
                
                {/* City area */}
                <rect x="300" y="100" width="80" height="100" className="fill-gray-200 dark:fill-gray-800" rx="4" />
                <text x="340" y="155" textAnchor="middle" className="text-xs fill-gray-600 dark:fill-gray-400">
                  City Centre
                </text>
                
                {/* Airport */}
                <rect x="20" y="130" width="60" height="40" className="fill-gray-300 dark:fill-gray-700" rx="4" />
                <text x="50" y="155" textAnchor="middle" className="text-xs fill-gray-600 dark:fill-gray-400">
                  {transport.airport}
                </text>
                
                {/* Route line */}
                <line
                  x1="80"
                  y1="150"
                  x2="300"
                  y2="150"
                  stroke={routeColor}
                  strokeWidth="4"
                  strokeDasharray={transport.mode === 'train' ? '0' : '8,4'}
                />
                
                {/* Transport mode indicator */}
                <circle cx="190" cy="140" r="15" className="fill-white dark:fill-gray-800" stroke={routeColor} strokeWidth="3" />
                <text x="190" y="145" textAnchor="middle" className="text-xs fill-gray-800 dark:fill-gray-200 font-bold">
                  {transport.mode === 'taxi' ? '🚕' : 
                   transport.mode === 'bus' ? '🚌' :
                   transport.mode === 'train' ? '🚆' : '🚇'}
                </text>
              </svg>
            </div>

            {/* Map Labels */}
            <div className="absolute top-4 left-4">
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: routeColor }}
                  />
                  <span className="dark:text-white">{transport.mode.charAt(0).toUpperCase() + transport.mode.slice(1)} Route</span>
                </div>
              </div>
            </div>
          </div>

          {/* Route Details Sidebar */}
          <div className="w-80 border-l dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" style={{ color: routeColor }} />
                  {transport.mode.charAt(0).toUpperCase() + transport.mode.slice(1)} Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Route Summary */}
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Route</div>
                  <div className="font-medium dark:text-white">{transport.route}</div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <PoundSterling className="h-4 w-4" />
                    Price
                  </div>
                  <div className="font-bold text-lg dark:text-white">£{transport.price}</div>
                </div>

                {/* Duration */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    Duration
                  </div>
                  <div className="font-medium dark:text-white">{transport.duration}</div>
                </div>

                {/* Stops */}
                {transport.stops && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Stops</div>
                    <div className="font-medium dark:text-white">{transport.stops}</div>
                  </div>
                )}

                {/* Features */}
                <div className="pt-2 border-t dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Features</div>
                  <div className="space-y-1">
                    {transport.isEco && (
                      <div className="text-sm text-green-600 dark:text-green-400">🌱 Eco-friendly</div>
                    )}
                    {transport.isFastest && (
                      <div className="text-sm text-orange-600 dark:text-orange-400">⚡ Fastest option</div>
                    )}
                    {transport.isCheapest && (
                      <div className="text-sm text-yellow-600 dark:text-yellow-400">💰 Cheapest option</div>
                    )}
                  </div>
                </div>

                {/* Book Button */}
                <Button
                  className="w-full bg-[#007AFF] hover:bg-[#0056CC] text-white mt-6"
                  size="lg"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Book Ticket
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}