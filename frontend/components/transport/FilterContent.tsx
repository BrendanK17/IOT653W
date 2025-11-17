import React from 'react';
import { Checkbox } from "../ui/checkbox";
import { Slider } from "../ui/slider";
import { FilterState } from '../../types';
import { Train, Bus, Car } from 'lucide-react';
import { TimePicker } from './TimePicker';

interface FilterContentProps {
  filters: FilterState;
  onFiltersChange: (newFilters: FilterState) => void;
}

export const FilterContent: React.FC<FilterContentProps> = ({
  filters,
  onFiltersChange
}) => {
  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  return (
    <div className="space-y-6">
      {/* Transport Modes */}
      <div>
        <h4 className="font-semibold mb-3">Transport Modes</h4>
        <div className="space-y-2">
          {[
            { key: 'train', label: 'Train', icon: <Train className="w-4 h-4" /> },
            { key: 'bus', label: 'Bus', icon: <Bus className="w-4 h-4" /> },
            { key: 'taxi', label: 'Taxi', icon: <Car className="w-4 h-4" /> },
            { key: 'subway', label: 'Subway', icon: <Train className="w-4 h-4" /> },
          ].map(({ key, label, icon }) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={`${key}-filter`}
                checked={filters.transportModes[key as keyof typeof filters.transportModes]}
                onCheckedChange={(checked) =>
                  updateFilters({
                    transportModes: { ...filters.transportModes, [key]: checked === true }
                  })
                }
              />
              <label htmlFor={`${key}-filter`} className="flex items-center space-x-2 cursor-pointer">
                {icon}
                <span>{label}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Stops */}
      <div>
        <h4 className="font-semibold mb-3">Stops</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="direct-filter"
              checked={filters.stops.direct}
              onCheckedChange={(checked) =>
                updateFilters({
                  stops: { ...filters.stops, direct: checked === true }
                })
              }
            />
            <label htmlFor="direct-filter" className="cursor-pointer">Direct</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="withStops-filter"
              checked={filters.stops.oneOrMore}
              onCheckedChange={(checked) =>
                updateFilters({
                  stops: { ...filters.stops, oneOrMore: checked === true }
                })
              }
            />
            <label htmlFor="withStops-filter" className="cursor-pointer">1+ stops</label>
          </div>
        </div>
      </div>

      {/* Max Time */}
      <div>
        <h4 className="font-semibold mb-3">Maximum Time</h4>
        <div className="space-y-2">
          <Slider
            value={[filters.maxTime]}
            onValueChange={(value) =>
              updateFilters({ maxTime: value[0] })
            }
            max={120}
            min={15}
            step={5}
            className="w-full"
          />
          <div className="text-sm text-muted-foreground">{filters.maxTime} minutes</div>
        </div>
      </div>

      {/* Max Price */}
      <div>
        <h4 className="font-semibold mb-3">Maximum Price</h4>
        <div className="space-y-2">
          <Slider
            value={[filters.maxPrice]}
            onValueChange={(value) =>
              updateFilters({ maxPrice: value[0] })
            }
            max={100}
            min={5}
            step={5}
            className="w-full"
          />
          <div className="text-sm text-muted-foreground">£{filters.maxPrice}</div>
        </div>
      </div>

      {/* Departure Time */}
      <div>
        <h4 className="font-semibold mb-3">Departure Time</h4>
        <TimePicker
          value={`${String(filters.departureTime[0]).padStart(2, '0')}:${String(filters.departureTime[1]).padStart(2, '0')}`}
          onChange={(value) => {
            const parts = value.split(':');
            const hours = parseInt(parts[0] || '0');
            const minutes = parseInt(parts[1] || '0');
            updateFilters({ departureTime: [hours, minutes] });
          }}
        />
      </div>

      {/* Additional Options */}
      <div>
        <h4 className="font-semibold mb-3">Additional Options</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="flexible-filter"
              checked={filters.flexibleTicketsOnly}
              onCheckedChange={(checked) =>
                updateFilters({ flexibleTicketsOnly: checked === true })
              }
            />
            <label htmlFor="flexible-filter" className="cursor-pointer">Flexible tickets only</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="firstClass-filter"
              checked={filters.firstClassOnly}
              onCheckedChange={(checked) =>
                updateFilters({ firstClassOnly: checked === true })
              }
            />
            <label htmlFor="firstClass-filter" className="cursor-pointer">First class</label>
          </div>
        </div>
      </div>
    </div>
  );
};