import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { WheelData } from './types';
import { AREAS } from './constants';

interface WheelChartProps {
  data: WheelData[];
  showDesired: boolean;
}

const WheelChart: React.FC<WheelChartProps> = ({ data, showDesired }) => {
  const svgRef = useRef<SVGSVGElement>(null);

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

      // Add curved area labels with increased radius and arc length
      const labelRadius = radius + 30; // Increased from 20 to 30
      const labelAngle = angle - Math.PI / 2;
      const arcLength = 0.2; // Increased arc length for text

      // Create an arc path for the text to follow
      const startAngle = labelAngle - arcLength / 2;
      const endAngle = labelAngle + arcLength / 2;
      
      const arcPath = d3.arc()({
        innerRadius: labelRadius,
        outerRadius: labelRadius,
        startAngle: startAngle,
        endAngle: endAngle
      });

      if (arcPath) {
        svg.append("defs")
          .append("path")
          .attr("id", `textPath-${i}`)
          .attr("d", arcPath);

        svg.append("text")
          .append("textPath")
          .attr("href", `#textPath-${i}`)
          .attr("startOffset", "50%")
          .attr("text-anchor", "middle")
          .attr("class", "text-sm font-medium")
          .text(AREAS[i]);
      }
    });

    // Draw values with slight offset
    const drawValues = (data: WheelData[], isDesired: boolean) => {
      const offset = isDesired ? 0.05 : -0.05;
      const lineGenerator = d3.lineRadial<WheelData>()
        .angle((d, i) => angleScale(i) - Math.PI / 2 + offset)
        .radius(d => radiusScale(isDesired ? d.desiredValue : d.currentValue))
        .curve(d3.curveLinearClosed);

      const color = isDesired ? "rgb(34, 197, 94)" : "rgb(59, 130, 246)";
      const fillColor = isDesired ? "rgba(34, 197, 94, 0.2)" : "rgba(59, 130, 246, 0.2)";

      svg.append("path")
        .datum(data)
        .attr("d", lineGenerator)
        .attr("fill", fillColor)
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", isDesired ? "4,4" : "none")
        .attr("class", "transition-all duration-300");

      // Add points
      data.forEach((d, i) => {
        const angle = angleScale(i) - Math.PI / 2 + offset;
        const value = isDesired ? d.desiredValue : d.currentValue;
        const x = radiusScale(value) * Math.cos(angle);
        const y = radiusScale(value) * Math.sin(angle);

        svg.append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 4)
          .attr("fill", color)
          .attr("class", "transition-all duration-300")
          .on("mouseover", (event) => {
            const tooltip = d3.select("#wheel-tooltip");
            tooltip
              .style("display", "block")
              .style("left", `${event.pageX + 10}px`)
              .style("top", `${event.pageY - 10}px`)
              .text(`${isDesired ? "Desired" : "Actual"}: ${d.name} - ${value}`);
          })
          .on("mouseout", () => {
            d3.select("#wheel-tooltip").style("display", "none");
          });
      });
    };

    // Draw current values
    drawValues(data, false);

    // Draw desired values if enabled
    if (showDesired) {
      drawValues(data, true);
    }

  }, [data, showDesired]);

  return (
    <>
      <svg ref={svgRef} className="w-full max-w-[600px] h-auto" />
      <div
        id="wheel-tooltip"
        className="fixed hidden bg-white px-2 py-1 rounded shadow-lg text-sm z-50"
      />
    </>
  );
};

export default WheelChart;