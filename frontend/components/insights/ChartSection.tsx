import React from 'react';

export const ChartSection: React.FC = () => {
  return (
    <div className="bg-accent rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">CO₂ Emissions by Transport Mode</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Heathrow Express</span>
          <span>2.1 kg</span>
        </div>
        <div className="flex justify-between">
          <span>Piccadilly Line</span>
          <span>1.2 kg</span>
        </div>
      </div>
    </div>
  );
};