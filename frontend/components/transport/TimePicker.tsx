import React from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange }) => {
  const parts = value.split(':');
  const hours = parseInt(parts[0] || '0', 10);
  const minutes = parseInt(parts[1] || '0', 10);
  
  const incrementHours = () => {
    const newHours = (hours + 1) % 24;
    onChange(`${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
  };
  
  const decrementHours = () => {
    const newHours = (hours - 1 + 24) % 24;
    onChange(`${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
  };
  
  const incrementMinutes = () => {
    const newMinutes = (minutes + 15) % 60;
    onChange(`${String(hours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`);
  };
  
  const decrementMinutes = () => {
    const newMinutes = (minutes - 15 + 60) % 60;
    onChange(`${String(hours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`);
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') return;
    const numVal = parseInt(val);
    if (numVal >= 0 && numVal <= 23) {
      onChange(`${String(numVal).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') return;
    const numVal = parseInt(val);
    if (numVal >= 0 && numVal <= 59) {
      onChange(`${String(hours).padStart(2, '0')}:${String(numVal).padStart(2, '0')}`);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal">
          <Clock className="mr-2 h-4 w-4" />
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4">
          <div className="text-sm font-medium mb-3">Select Departure Time</div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <Button size="icon" variant="ghost" onClick={incrementHours}>
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={String(hours).padStart(2, '0')}
                onChange={handleHoursChange}
                className="w-16 text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <Button size="icon" variant="ghost" onClick={decrementHours}>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-2xl">:</span>
            <div className="flex flex-col items-center">
              <Button size="icon" variant="ghost" onClick={incrementMinutes}>
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={String(minutes).padStart(2, '0')}
                onChange={handleMinutesChange}
                className="w-16 text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <Button size="icon" variant="ghost" onClick={decrementMinutes}>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};