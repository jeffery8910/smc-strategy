
import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceArea, ReferenceDot, ReferenceLine, Label
} from 'recharts';
import { SimulatedDataPoint, ExplanationChartData, HighlightType, HighlightElement, HighlightArea, HighlightDot, HighlightLine, getPriceDecimals, TimeFrame } from '../types';

interface StrategyExplanationChartProps {
  data: ExplanationChartData;
}

const formatTimestampForExplanationAxis = (timestamp: number): string => {
  return `T${timestamp}`;
};

const CustomExplanationTooltip: React.FC<any> = ({ active, payload, label, instrument }) => {
  if (active && payload && payload.length) {
    const priceDecimals = getPriceDecimals(instrument);
    return (
      <div className="p-2 bg-gray-900 text-white rounded shadow-lg border border-gray-700 opacity-90">
        <p className="label">{`時間點: ${formatTimestampForExplanationAxis(label)}`}</p>
        <p className="intro">{`價格: ${payload[0].value.toFixed(priceDecimals)}`}</p>
      </div>
    );
  }
  return null;
};

export const StrategyExplanationChart: React.FC<StrategyExplanationChartProps> = ({ data }) => {
  if (!data || !data.priceData || data.priceData.length === 0) {
    return <div className="text-center p-4 text-gray-400">無法載入策略解釋圖表示範。</div>;
  }

  const { priceData, highlights, instrument, timeframe } = data;
  const priceDecimals = getPriceDecimals(instrument);

  const yDomain = [
    Math.min(...priceData.map(p => p.price)) * 0.995, // Increased padding
    Math.max(...priceData.map(p => p.price)) * 1.005  // Increased padding
  ];
  
  const xDomain = [
    Math.min(...priceData.map(p => p.time)),
    Math.max(...priceData.map(p => p.time))
  ];

  const labelStyle = {
    fill: '#E5E7EB', // Light gray for better contrast and consistency
    fontSize: 11,
  };


  return (
    <div className="h-72 md:h-96 w-full bg-gray-800/50 rounded-lg shadow-inner relative p-4 border border-gray-600">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={priceData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
          <XAxis
            dataKey="time"
            stroke="#9CA3AF"
            tickFormatter={formatTimestampForExplanationAxis}
            type="number"
            domain={['dataMin', 'dataMax']}
            allowDuplicatedCategory={false}
            tickCount={Math.min(10, priceData.length)}
          />
          <YAxis
            domain={yDomain}
            stroke="#9CA3AF"
            tickFormatter={(value) => typeof value === 'number' ? value.toFixed(priceDecimals) : ''}
            allowDataOverflow={true}
            width={80}
            type="number"
          />
          <Tooltip content={<CustomExplanationTooltip instrument={instrument} />} />
          <Legend wrapperStyle={{ color: '#E5E7EB', paddingTop: '10px' }} />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#60A5FA" // Blue for price line
            strokeWidth={2}
            dot={{ r: 3, fill: '#60A5FA' }}
            activeDot={{ r: 5, fill: '#60A5FA', stroke: '#fff', strokeWidth: 1 }}
            name="示例價格"
          />

          {highlights && highlights.map(highlight => {
            const key = `${highlight.type}-${highlight.id}`;
            const highlightColor = highlight.color || '#F59E0B'; // Default accent color (Amber)

            if (highlight.type === HighlightType.AREA) {
              const area = highlight as HighlightArea;
              return (
                <ReferenceArea
                  key={key}
                  x1={area.x1}
                  x2={area.x2}
                  y1={area.y1}
                  y2={area.y2}
                  stroke={highlightColor}
                  fill={highlightColor}
                  fillOpacity={area.id.includes('ob-area') ? 0.35 : 0.2} // Slightly more opaque for OB
                  ifOverflow="visible"
                >
                  {area.label && <Label value={area.label} position="insideTopLeft" dx={5} dy={5} {...labelStyle} />}
                </ReferenceArea>
              );
            }
            if (highlight.type === HighlightType.DOT) {
              const dot = highlight as HighlightDot;
              return (
                <ReferenceDot
                  key={key}
                  x={dot.x}
                  y={dot.y}
                  r={dot.radius || 4}
                  fill={highlightColor}
                  stroke={dot.id.includes('mss-break') || dot.id.includes('sweep-dot') || dot.id.includes('mss-dot') ? highlightColor : "#fff" } // Use highlight color for specific important dots
                  strokeWidth={1}
                  isFront={true}
                >
                   {dot.label && <Label value={dot.label} position="top" dy={-8} {...labelStyle} />}
                </ReferenceDot>
              );
            }
            if (highlight.type === HighlightType.LINE) {
              const line = highlight as HighlightLine;
              let labelPosition: any = "center"; 
              let dx = 0, dy = 0;

              if (line.isHorizontal) {
                labelPosition = "right";
                dx = 5;
              } else if (line.isVertical) {
                labelPosition = "top";
                dy = -5;
              }
              
              return (
                <ReferenceLine
                  key={key}
                  x={line.isVertical ? line.x1 : undefined} 
                  y={line.isHorizontal ? line.y1 : undefined} 
                  segment={!line.isHorizontal && !line.isVertical ? [{x:line.x1, y:line.y1}, {x:line.x2, y:line.y2}] : undefined}
                  stroke={highlightColor}
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  ifOverflow="visible"
                >
                  {line.label && <Label value={line.label} position={labelPosition} dx={dx} dy={dy} {...labelStyle} />}
                </ReferenceLine>
              );
            }
            return null;
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
