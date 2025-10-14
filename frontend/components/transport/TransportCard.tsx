import React from 'react';
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { TransportOption, TransportMode } from '../../types';
import { Train, Bus, Car, Clock, ExternalLink, Map, Leaf } from 'lucide-react';

interface TransportCardProps {
  transport: TransportOption;
  onShowMap: () => void;
}

const getTransportIcon = (mode: TransportMode) => {
  switch (mode) {
    case 'train': return <Train className="w-5 h-5" />;
    case 'bus': return <Bus className="w-5 h-5" />;
    case 'taxi': return <Car className="w-5 h-5" />;
    case 'subway': return <Train className="w-5 h-5" />;
    default: return <Train className="w-5 h-5" />;
  }
};



export const TransportCard: React.FC<TransportCardProps> = ({ transport, onShowMap }) => {
  return (
    <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow bg-white border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
          <div className="p-2 rounded-lg bg-blue-50 shrink-0">
            {getTransportIcon(transport.mode)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="font-bold text-base sm:text-lg capitalize text-gray-900">{transport.mode}</h3>
              {transport.isEco && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  🌱 Eco-Friendly
                </Badge>
              )}
              {transport.isFastest && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  ⚡ Fastest
                </Badge>
              )}
              {transport.isCheapest && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  💰 Best Value
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">{transport.route}</p>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {transport.duration}
              </span>
              <span>{transport.stops}</span>
              {transport.co2 && (
                <span className={`flex items-center ${transport.isEco ? 'text-green-600' : 'text-gray-600'}`}>
                  <Leaf className="w-3 h-3 mr-1" />
                  {transport.co2} kg CO₂
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-2 shrink-0">
          <p className="text-xl sm:text-2xl font-bold text-blue-600">
            £{transport.price}
          </p>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Book
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onShowMap}
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <Map className="w-4 h-4 mr-2" />
              Map
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TransportCard;