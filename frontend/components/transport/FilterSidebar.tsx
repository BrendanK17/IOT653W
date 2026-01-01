import { Car, Bus, Train, Clock, PoundSterling, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

export interface FilterState {
  transportModes: {
    taxi: boolean;
    bus: boolean;
    coach: boolean;
    train: boolean;
    underground: boolean;
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
  minTimeLimit?: number;
  maxTimeLimit?: number;
  minPriceLimit?: number;
  maxPriceLimit?: number;
}

const transportModeIcons = {
  taxi: Car,
  bus: Bus,
  coach: Bus,
  train: Train,
  underground: Train,
};

export function FilterSidebar({ filters, onFiltersChange, minTimeLimit = 15, maxTimeLimit = 180, minPriceLimit = 5, maxPriceLimit = 200 }: FilterSidebarProps) {
  const updateTransportMode = (mode: keyof FilterState['transportModes'], checked: boolean) => {
    onFiltersChange({
      ...filters,
      transportModes: {
        ...filters.transportModes,
        [mode]: checked,
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

        {/* Maximum Time */}
        <div>
          <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Maximum time: {filters.maxTime} mins
          </Label>
          <Slider
            value={[filters.maxTime]}
            onValueChange={updateMaxTime}
            max={maxTimeLimit}
            min={minTimeLimit}
            step={15}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{minTimeLimit} mins</span>
            <span>{maxTimeLimit} mins</span>
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
            max={maxPriceLimit}
            min={minPriceLimit}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>£{minPriceLimit}</span>
            <span>£{maxPriceLimit}</span>
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
              <Label htmlFor="firstClass" className="cursor-pointer flex items-center gap-2">
                First class
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">Prices displayed may not be accurate for first class tickets</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}