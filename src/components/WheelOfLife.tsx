import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useLocalStorage } from 'react-use';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';

interface WheelData {
  name: string;
  currentValue: number;
  desiredValue: number;
}

const AREAS = [
  'Career',
  'Family & Friends',
  'Significant Other/Romance',
  'Fun & Recreation',
  'Health',
  'Money',
  'Personal Growth',
  'Physical Environment',
];

const WheelOfLife = () => {
  const svgRef = useRef<SVGSVGElement>(null);
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

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const width = 600;
    const height = 600;
    const radius = Math.min(width, height) / 2 - 40;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Create scales
    const angleScale = d3.scaleLinear()
      .domain([0, AREAS.length])
      .range([0, 2 * Math.PI]);

    const radiusScale = d3.scaleLinear()
      .domain([0, 10])
      .range([0, radius]);

    // Draw background circles and labels
    const circles = [2, 4, 6, 8, 10];
    circles.forEach(value => {
      svg.append("circle")
        .attr("r", radiusScale(value))
        .attr("fill", "none")
        .attr("stroke", "#e2e8f0")
        .attr("stroke-width", 1);

      // Add value labels
      if (value % 2 === 0) {
        svg.append("text")
          .attr("y", -radiusScale(value) - 5)
          .attr("text-anchor", "middle")
          .attr("class", "text-xs text-gray-400")
          .text(value.toString());
      }
    });

    // Draw area lines and labels
    AREAS.forEach((_, i) => {
      const angle = angleScale(i);
      const x2 = radius * Math.cos(angle - Math.PI / 2);
      const y2 = radius * Math.sin(angle - Math.PI / 2);

      svg.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", "#e2e8f0")
        .attr("stroke-width", 1);

      // Add area labels
      const labelRadius = radius + 20;
      const labelX = labelRadius * Math.cos(angle - Math.PI / 2);
      const labelY = labelRadius * Math.sin(angle - Math.PI / 2);

      svg.append("text")
        .attr("x", labelX)
        .attr("y", labelY)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("transform", `rotate(${(angle * 180) / Math.PI - 90} ${labelX} ${labelY})`)
        .attr("class", "text-sm font-medium")
        .text(AREAS[i]);
    });

    // Draw current values
    const lineGenerator = d3.lineRadial<WheelData>()
      .angle((d, i) => angleScale(i) - Math.PI / 2)
      .radius(d => radiusScale(d.currentValue))
      .curve(d3.curveLinearClosed);

    svg.append("path")
      .datum(data)
      .attr("d", lineGenerator)
      .attr("fill", "rgba(59, 130, 246, 0.2)")
      .attr("stroke", "rgb(59, 130, 246)")
      .attr("stroke-width", 2)
      .attr("class", "transition-all duration-300");

    // Draw desired values if enabled
    if (showDesired) {
      const desiredLineGenerator = d3.lineRadial<WheelData>()
        .angle((d, i) => angleScale(i) - Math.PI / 2)
        .radius(d => radiusScale(d.desiredValue))
        .curve(d3.curveLinearClosed);

      svg.append("path")
        .datum(data)
        .attr("d", desiredLineGenerator)
        .attr("fill", "rgba(99, 102, 241, 0.1)")
        .attr("stroke", "rgb(99, 102, 241)")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,4")
        .attr("class", "transition-all duration-300");
    }

  }, [data, showDesired]);

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
              <svg ref={svgRef} className="w-full max-w-[600px] h-auto" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-panel rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Controls</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Show Desired</span>
                  <Switch
                    checked={showDesired}
                    onCheckedChange={setShowDesired}
                  />
                </div>
              </div>

              <div className="space-y-4">
                {data?.map((item, index) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm text-gray-500">
                        {item.currentValue} / {showDesired && `${item.desiredValue}`}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <Slider
                        value={[item.currentValue]}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                        onValueChange={([value]) => updateValue(index, value, false)}
                      />
                      {showDesired && (
                        <Slider
                          value={[item.desiredValue]}
                          min={1}
                          max={10}
                          step={1}
                          className="w-full"
                          onValueChange={([value]) => updateValue(index, value, true)}
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
                onClick={() => {
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
                }}
              >
                Reset All Values
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WheelOfLife;