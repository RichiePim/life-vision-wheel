import React, { useState } from 'react';
import { useLocalStorage } from 'react-use';
import { toast } from '@/components/ui/use-toast';
import WheelChart from './wheel/WheelChart';
import WheelControls from './wheel/WheelControls';
import { WheelData } from './wheel/types';
import { AREAS } from './wheel/constants';

const WheelOfLife = () => {
  const [showDesired, setShowDesired] = useState(true);
  const [data, setData] = useLocalStorage<WheelData[]>('wheel-of-life-data', 
    AREAS.map(name => ({
      name,
      currentValue: 5,
      desiredValue: 7,
    }))
  );

  const updateValue = (index: number, value: number, isDesired: boolean) => {
    if (!data) return;
    
    const newData = [...data];
    if (isDesired) {
      newData[index].desiredValue = value;
    } else {
      newData[index].currentValue = value;
    }
    setData(newData);
    
    toast({
      title: `Updated ${data[index].name}`,
      description: `${isDesired ? 'Desired' : 'Current'} value set to ${value}`,
    });
  };

  const handleReset = () => {
    localStorage.removeItem('wheel-of-life-data');
    setData(AREAS.map(name => ({
      name,
      currentValue: 5,
      desiredValue: 7,
    })));
    toast({
      title: "Reset Complete",
      description: "All values have been reset to default",
    });
  };

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Wheel of Life</h1>
          <p className="text-gray-600">Visualize and balance different areas of your life</p>
        </div>

        <div className="grid lg:grid-cols-[1fr,400px] gap-8">
          <div className="glass-panel rounded-xl p-8">
            <div className="flex justify-center">
              <WheelChart data={data} showDesired={showDesired} />
            </div>
          </div>

          <WheelControls
            data={data}
            showDesired={showDesired}
            onShowDesiredChange={setShowDesired}
            onValueChange={updateValue}
            onReset={handleReset}
          />
        </div>
      </div>
    </div>
  );
};

export default WheelOfLife;