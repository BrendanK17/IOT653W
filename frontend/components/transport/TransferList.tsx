import { useState } from 'react';
import { TransportOption } from '../../types';
import { FilterState } from '../transport/FilterSidebar';
import TransportCard from '../transport/TransportCard';
import { MapOverlay } from '../transport/MapOverlay';

interface TransferListProps {
  transportOptions: TransportOption[];
  filters: FilterState;
  selectedAirport: string;
  sortBy: string;
}

export function TransferList({
  transportOptions,
  filters,
  selectedAirport,
  sortBy
}: TransferListProps) {
  const [selectedTransfer, setSelectedTransfer] = useState<TransportOption | null>(null);
  const airportCode = selectedAirport.match(/\(([^)]+)\)/)?.[1] || selectedAirport;

  return (
    <>
      <div className="space-y-4">
        {transportOptions
          .filter(t => t.airport === airportCode)
          .filter(t => filters.transportModes[t.mode as keyof typeof filters.transportModes])
          .filter(t => {
            const price = Number(t.price);
            return price <= filters.maxPrice;
          })
          .filter(t => {
            const minutes = parseInt(t.duration);
            return minutes <= filters.maxTime;
          })
          .filter(t => {
            if (!filters.stops.direct && !filters.stops.oneOrMore) return true;
            const hasStops = t.stops && t.stops.toLowerCase().includes('stop');
            return filters.stops.direct ? !hasStops : hasStops;
          })
          .sort((a, b) => {
            switch (sortBy) {
              case 'price':
                return Number(a.price) - Number(b.price);
              case 'duration':
                return a.duration.localeCompare(b.duration);
              case 'eco':
                return Number(b.isEco) - Number(a.isEco);
              default:
                return 0;
            }
          })
          .map((transfer) => (
            <TransportCard
              key={transfer.id}
              transport={transfer}
              onShowMap={() => setSelectedTransfer(transfer)}
            />
          ))}
      </div>

      {/* Map Overlay */}
      {selectedTransfer && (
        <MapOverlay
          transport={selectedTransfer}
          onClose={() => setSelectedTransfer(null)}
        />
      )}
    </>
  );
}