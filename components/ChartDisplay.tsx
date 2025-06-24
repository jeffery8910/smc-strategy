import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } from 'recharts';
import { SimulatedDataPoint, Trade, TimeFrame, FinancialInstrument, getPriceDecimals } from '../types';

interface ChartDisplayProps {
  priceData: SimulatedDataPoint[];
  trades: Trade[];
  timeframe: TimeFrame;
  instrument: FinancialInstrument;
}

const formatTimestampForDisplay = (timestamp: number, timeframe: TimeFrame): string => {
  const date = new Date(timestamp);
  switch (timeframe) {
    case TimeFrame.M1:
    case TimeFrame.M5:
    case TimeFrame.M15:
      return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
    case TimeFrame.H1:
    case TimeFrame.H4:
      return `${date.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })} ${date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    case TimeFrame.D1:
      return date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
    default:
      return new Date(timestamp).toLocaleString('zh-TW');
  }
};

const CustomTooltip: React.FC<any> = ({ active, payload, label, timeframe, instrument }) => {
  if (active && payload && payload.length) {
    const priceDecimals = getPriceDecimals(instrument);
    return (
      <div className="p-2 bg-gray-900 text-white rounded shadow-lg border border-gray-700">
        <p className="label">{`時間: ${formatTimestampForDisplay(label, timeframe)}`}</p>
        <p className="intro">{`價格: ${payload[0].value.toFixed(priceDecimals)}`}</p>
      </div>
    );
  }
  return null;
};

interface TradeLabelProps {
  cx?: number;
  cy?: number;
  tradeData: Trade; 
}

const TradeLabel: React.FC<TradeLabelProps> = (props) => {
  const { cx, cy, tradeData } = props;

  if (typeof cx !== 'number' || typeof cy !== 'number' || !tradeData) {
    return null;
  }
  
  const isLong = tradeData.type === 'LONG';
  const color = isLong ? '#10B981' : '#EF4444'; 
  const labelText = isLong ? '做多' : '做空';
  
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill={color} stroke="#fff" strokeWidth={1}/>
      <text x={cx} y={cy - 10} dy={-4} fill={color} fontSize="10" textAnchor="middle">
        {labelText}
      </text>
    </g>
  );
};


export const ChartDisplay: React.FC<ChartDisplayProps> = ({ priceData, trades, timeframe, instrument }) => {
  if (!priceData || priceData.length === 0) {
    return <div className="text-center p-10 text-gray-400">無數據可顯示。請運行測試。</div>;
  }

  // chartData is already in SimulatedDataPoint format, which now has time as timestamp
  // const chartData = priceData.map(p => ({ time: p.time, price: p.price }));
  const priceDecimals = getPriceDecimals(instrument);

  return (
    <div className="h-96 md:h-[500px] w-full bg-gray-800 rounded-lg shadow-inner relative p-4">
      <div 
        className="absolute top-2 right-2 text-xs uppercase text-gray-500 bg-gray-900 px-2 py-1 rounded opacity-75"
        aria-hidden="true"
      >
        策略測試模式
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={priceData} // Use priceData directly as its 'time' is now a timestamp
          margin={{ top: 5, right: 30, left: 20, bottom: 20 }} 
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" /> 
          <XAxis 
            dataKey="time" 
            stroke="#9CA3AF" 
            tickFormatter={(timestamp) => formatTimestampForDisplay(timestamp, timeframe)}
            type="number"
            domain={['dataMin', 'dataMax']}
            tickCount={priceData.length > 100 ? 7 : undefined} // Adjust tick count for readability
            allowDuplicatedCategory={false}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            stroke="#9CA3AF" 
            tickFormatter={(value) => typeof value === 'number' ? value.toFixed(priceDecimals) : ''}
            allowDataOverflow={true}
            width={80} // Give YAxis more space for formatted numbers
          />
          <Tooltip content={<CustomTooltip timeframe={timeframe} instrument={instrument} />} />
          <Legend wrapperStyle={{ color: '#E5E7EB', paddingTop: '10px' }} />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#60A5FA" 
            strokeWidth={2} 
            dot={false} 
            activeDot={{ r: 6, fill: '#60A5FA', stroke: '#fff', strokeWidth: 2 }} 
            name="歷史價格"
          />
          
          {trades.map(trade => (
            <ReferenceDot
              key={`entry-${trade.id}`}
              x={trade.entryTime} // This is now a timestamp
              y={trade.entryPrice}
              r={5}
              isFront={true}
              shape={(shapeProps) => <TradeLabel {...shapeProps} tradeData={trade} />} 
            />
          ))}
          {trades.map(trade => {
            if (trade.outcome !== 'PENDING' && trade.exitTime && trade.exitPrice) {
               return (
                <ReferenceDot
                    key={`exit-${trade.id}`}
                    x={trade.exitTime} // This is now a timestamp
                    y={trade.exitPrice}
                    r={4}
                    fill={trade.outcome === 'WIN' ? '#34D399' : '#F87171'} 
                    stroke="#fff"
                    strokeWidth={1}
                    isFront={true}
                />
               )
            }
            return null;
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};