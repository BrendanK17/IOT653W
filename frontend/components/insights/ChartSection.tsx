import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { TransportOption } from '../../types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

type EmissionType = 'well_to_tank' | 'fuel_combustion';

interface ChartSectionProps {
  transportOptions: TransportOption[];
}

export const ChartSection: React.FC<ChartSectionProps> = ({ transportOptions }) => {
  const [emissionType, setEmissionType] = useState<EmissionType>('fuel_combustion');

  const formatConstituentGases = (gases: Record<string, number | null>) => {
    return Object.entries(gases)
      .filter(([, value]) => value !== null && value !== undefined)
      .map(([key, value]) => {
        let displayKey = key;
        if (key === 'co2e_total') displayKey = 'CO₂e (Total)';
        else if (key === 'co2e_other') displayKey = 'CO₂e (Other)';
        else if (key === 'co2') displayKey = 'CO₂';
        else if (key === 'ch4') displayKey = 'CH₄ (Methane)';
        else if (key === 'n2o') displayKey = 'N₂O (Nitrous Oxide)';
        
        return `${displayKey}: ${(value as number).toFixed(6)} kg`;
      })
      .join('\n');
  };

  return (
    <div className="bg-accent rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">CO₂ Emissions by Transport Mode</h3>
        <div className="w-48">
          <Select value={emissionType} onValueChange={(value) => setEmissionType(value as EmissionType)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select emission type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fuel_combustion">Fuel Combustion</SelectItem>
              <SelectItem value="well_to_tank">Well to Tank</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {transportOptions.map((option) => {
          const co2Data = option.co2 as any; // eslint-disable-line @typescript-eslint/no-explicit-any
          if (!co2Data || !co2Data[emissionType]) {
            return null;
          }

          const emission = co2Data[emissionType];
          const gases = emission.constituent_gases || {};

          return (
            <div key={option.id} className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-1">
                  <p className="font-medium text-sm">{option.name}</p>
                  <p className="text-xs text-gray-500">{emission.emission_factor_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right min-w-24">
                  <p className="text-lg font-bold">{emission.co2e.toFixed(2)} kg</p>
                  <p className="text-xs text-gray-500">CO₂e</p>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                        <Info className="w-4 h-4 text-gray-600" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-sm">
                      <div className="text-xs whitespace-pre-line">
                        <p className="font-semibold mb-2">Constituent Gases:</p>
                        {formatConstituentGases(gases).split('\n').map((line, idx) => (
                          <p key={idx}>{line}</p>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          );
        })}
      </div>

      {transportOptions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No transport options available</p>
        </div>
      )}
    </div>
  );
};