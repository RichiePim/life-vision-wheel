import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { WheelData } from './types';

interface WheelControlsProps {
  data: WheelData[];
  showDesired: boolean;
  onShowDesiredChange: (value: boolean) => void;
  onValueChange: (index: number, value: number, isDesired: boolean) => void;
  onReset: () => void;
}

const WheelControls: React.FC<WheelControlsProps> = ({
  data,
  showDesired,
  onShowDesiredChange,
  onValueChange,
  onReset,
}) => {
  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Controls</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Show Desired</span>
            <Switch
              checked={showDesired}
              onCheckedChange={onShowDesiredChange}
            />
          </div>
        </div>

        <div className="space-y-4">
          {data?.map((item, index) => (
            <div key={item.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{item.name}</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 min-w-[2.5rem]"
                  >
                    {item.currentValue}
                  </Button>
                  {showDesired && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 min-w-[2.5rem] border-green-500 text-green-600"
                    >
                      {item.desiredValue}
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Slider
                  value={[item.currentValue]}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                  onValueChange={([value]) => onValueChange(index, value, false)}
                />
                {showDesired && (
                  <Slider
                    value={[item.desiredValue]}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full [&_.text-primary]:text-green-500 [&_.bg-primary]:bg-green-500"
                    onValueChange={([value]) => onValueChange(index, value, true)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-xl p-6">
        <Button
          className="w-full"
          onClick={onReset}
        >
          Reset All Values
        </Button>
      </div>
    </div>
  );
};

export default WheelControls;