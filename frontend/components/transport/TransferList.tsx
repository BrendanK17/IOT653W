import { useState } from 'react';
import { TransportOption } from '../../types';
import { FilterState } from '../transport/FilterSidebar';
import TransportCard from '../transport/TransportCard';
import { MapOverlay } from '../transport/MapOverlay';

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

interface TransferListProps {
  transportOptions: TransportOption[];
  filters: FilterState;
  selectedAirport: string;
  fareSummary?: FareSummary;
}

export function TransferList({
  transportOptions,
  filters,
  selectedAirport,
  fareSummary,
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
            const minutes = typeof t.duration === 'number' ? t.duration : parseInt(t.duration);
            return minutes <= filters.maxTime;
          })
          .filter(t => {
            if (!filters.stops.direct && !filters.stops.oneOrMore) return true;
            const stopsStr = typeof t.stops === 'string' ? t.stops : `${t.stops.length} stops`;
            const hasStops = stopsStr && stopsStr.toLowerCase().includes('stop');
            return filters.stops.direct ? !hasStops : hasStops;
          })
          .map((transfer) => (
            <TransportCard
              key={transfer.id}
              transport={transfer}
              onShowMap={() => setSelectedTransfer(transfer)}
              fareSummary={fareSummary}
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