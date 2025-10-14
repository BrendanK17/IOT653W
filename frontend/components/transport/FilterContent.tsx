import React from 'react';
import { Button } from "../ui/button";
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
                checked={filters.modes[key as keyof typeof filters.modes]}
                onCheckedChange={(checked) =>
                  updateFilters({
                    modes: { ...filters.modes, [key]: checked === true }
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
              checked={filters.stops.withStops}
              onCheckedChange={(checked) =>
                updateFilters({
                  stops: { ...filters.stops, withStops: checked === true }
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
            value={filters.maxTime}
            onValueChange={(value) =>
              updateFilters({ maxTime: value as [number] })
            }
            max={120}
            min={15}
            step={5}
            className="w-full"
          />
          <div className="text-sm text-muted-foreground">{filters.maxTime[0]} minutes</div>
        </div>
      </div>

      {/* Max Price */}
      <div>
        <h4 className="font-semibold mb-3">Maximum Price</h4>
        <div className="space-y-2">
          <Slider
            value={filters.maxPrice}
            onValueChange={(value) =>
              updateFilters({ maxPrice: value as [number] })
            }
            max={100}
            min={5}
            step={5}
            className="w-full"
          />
          <div className="text-sm text-muted-foreground">£{filters.maxPrice[0]}</div>
        </div>
      </div>

      {/* Departure Time */}
      <div>
        <h4 className="font-semibold mb-3">Departure Time</h4>
        <TimePicker
          value={filters.departureTime}
          onChange={(value) =>
            updateFilters({ departureTime: value })
          }
        />
      </div>

      {/* Additional Options */}
      <div>
        <h4 className="font-semibold mb-3">Additional Options</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="flexible-filter"
              checked={filters.flexibleTickets}
              onCheckedChange={(checked) =>
                updateFilters({ flexibleTickets: checked === true })
              }
            />
            <label htmlFor="flexible-filter" className="cursor-pointer">Flexible tickets only</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="firstClass-filter"
              checked={filters.firstClass}
              onCheckedChange={(checked) =>
                updateFilters({ firstClass: checked === true })
              }
            />
            <label htmlFor="firstClass-filter" className="cursor-pointer">First class</label>
          </div>
        </div>
      </div>
    </div>
  );
};