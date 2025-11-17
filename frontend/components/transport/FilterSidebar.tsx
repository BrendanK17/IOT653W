import { Car, Bus, Train, Clock, PoundSterling } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';

export interface FilterState {
  transportModes: {
    taxi: boolean;
    bus: boolean;
    train: boolean;
    subway: boolean;
  };
  stops: {
    direct: boolean;
    oneOrMore: boolean;
  };
  maxTime: number;
  maxPrice: number;
  departureTime: [number, number];
  flexibleTicketsOnly: boolean;
  firstClassOnly: boolean;
}

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const transportModeIcons = {
  taxi: Car,
  bus: Bus,
  train: Train,
  subway: Train,
};

export function FilterSidebar({ filters, onFiltersChange }: FilterSidebarProps) {
  const updateTransportMode = (mode: keyof FilterState['transportModes'], checked: boolean) => {
    onFiltersChange({
      ...filters,
      transportModes: {
        ...filters.transportModes,
        [mode]: checked,
      },
    });
  };

  const updateStops = (type: keyof FilterState['stops'], checked: boolean) => {
    onFiltersChange({
      ...filters,
      stops: {
        ...filters.stops,
        [type]: checked,
      },
    });
  };

  const updateMaxTime = (value: number[]) => {
    onFiltersChange({
      ...filters,
      maxTime: value[0] ?? 180,
    });
  };

  const updateMaxPrice = (value: number[]) => {
    onFiltersChange({
      ...filters,
      maxPrice: value[0] ?? 200,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Filters</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Transport Modes */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Transport modes</Label>
          <div className="space-y-3">
            {Object.entries(filters.transportModes).map(([mode, checked]) => {
              const Icon = transportModeIcons[mode as keyof typeof transportModeIcons];
              return (
                <div key={mode} className="flex items-center space-x-2">
                  <Checkbox
                    id={mode}
                    checked={checked}
                    onCheckedChange={(isChecked) => 
                      updateTransportMode(mode as keyof FilterState['transportModes'], Boolean(isChecked))
                    }
                  />
                  <Label htmlFor={mode} className="flex items-center gap-2 cursor-pointer">
                    <Icon className="h-4 w-4" />
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stops */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Stops</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="direct"
                checked={filters.stops.direct}
                onCheckedChange={(isChecked) => updateStops('direct', Boolean(isChecked))}
              />
              <Label htmlFor="direct" className="cursor-pointer">Direct</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="oneOrMore"
                checked={filters.stops.oneOrMore}
                onCheckedChange={(isChecked) => updateStops('oneOrMore', Boolean(isChecked))}
              />
              <Label htmlFor="oneOrMore" className="cursor-pointer">1+ stops</Label>
            </div>
          </div>
        </div>

        {/* Maximum Time */}
        <div>
          <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Maximum time: {filters.maxTime} mins
          </Label>
          <Slider
            value={[filters.maxTime]}
            onValueChange={updateMaxTime}
            max={180}
            min={15}
            step={15}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>15 mins</span>
            <span>3 hours</span>
          </div>
        </div>

        {/* Maximum Price */}
        <div>
          <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
            <PoundSterling className="h-4 w-4" />
            Maximum price: £{filters.maxPrice}
          </Label>
          <Slider
            value={[filters.maxPrice]}
            onValueChange={updateMaxPrice}
            max={150}
            min={5}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>£5</span>
            <span>£150</span>
          </div>
        </div>

        {/* Additional Options */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Additional options</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="flexibleTickets"
                checked={filters.flexibleTicketsOnly}
                onCheckedChange={(isChecked) =>
                  onFiltersChange({ ...filters, flexibleTicketsOnly: Boolean(isChecked) })
                }
              />
              <Label htmlFor="flexibleTickets" className="cursor-pointer">
                Flexible tickets only
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="firstClass"
                checked={filters.firstClassOnly}
                onCheckedChange={(isChecked) =>
                  onFiltersChange({ ...filters, firstClassOnly: Boolean(isChecked) })
                }
              />
              <Label htmlFor="firstClass" className="cursor-pointer">First class</Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}