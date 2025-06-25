import React, { useMemo } from 'react';
import { SMCStrategy, FinancialInstrument, TimeFrame } from '../types';
import { STRATEGY_OPTIONS, INSTRUMENT_OPTIONS, TIMEFRAME_OPTIONS } from '../constants';
import { SvgPlay } from './Icons';

interface ControlPanelProps {
  selectedStrategy: SMCStrategy;
  setSelectedStrategy: (strategy: SMCStrategy) => void;
  isStrategyLocked?: boolean; // Will be false for SimulatorPage
  selectedInstrument: FinancialInstrument;
  setSelectedInstrument: (instrument: FinancialInstrument) => void;
  selectedTimeFrame: TimeFrame;
  setSelectedTimeFrame: (timeframe: TimeFrame) => void;
  startTimestamp: number;
  setStartTimestamp: (timestamp: number) => void;
  minAllowedStartTimestamp: number;
  maxAllowedStartTimestamp: number;
  onRunTest: () => void;
  isLoading: boolean;
}

export const formatMillisecondsToDHMS = (milliseconds: number): string => {
  if (milliseconds < 0) return "0 小時";
  
  const totalSeconds = Math.floor(milliseconds / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  let result = "";
  if (days > 0) {
    result += `${days} 天 `;
  }
  if (hours > 0 || days === 0) { 
    result += `${hours} 小時`;
  }
  
  if (result.trim() === "") { 
    if (milliseconds < 60000 && totalMinutes < 1) return "少於 1 分鐘";
    if (totalMinutes > 0 && totalHours === 0 && days === 0) return `${totalMinutes} 分鐘`;
    return "0 小時"; 
  }

  return result.trim();
};

const formatTimestampForDateTimeLocal = (timestamp: number): string => {
  const date = new Date(timestamp);
  // Adjust for local timezone for display in datetime-local input
  const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  return localDate.toISOString().slice(0, 16);
};

const parseDateTimeLocalToTimestamp = (dateTimeLocal: string): number => {
  // Input string is YYYY-MM-DDTHH:mm, which JS Date constructor interprets as local time
  return new Date(dateTimeLocal).getTime();
};


export const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedStrategy,
  setSelectedStrategy,
  isStrategyLocked = false, // Default to false, so simulator page has it unlocked
  selectedInstrument,
  setSelectedInstrument,
  selectedTimeFrame,
  setSelectedTimeFrame,
  startTimestamp,
  setStartTimestamp,
  minAllowedStartTimestamp,
  maxAllowedStartTimestamp,
  onRunTest,
  isLoading,
}) => {
  const selectStyle = "w-full p-3 bg-gray-600 border border-gray-500 rounded-lg shadow-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors text-white placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-500";
  
  const calculatedTestPeriodDisplay = useMemo(() => {
    const endDate = new Date(); // Current time is always the end
    const startDate = new Date(startTimestamp);

    if (startDate.getTime() >= endDate.getTime()) { 
        return { start: "開始時間無效", end: endDate.toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) };
    }
    return { 
        start: startDate.toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }), 
        end: endDate.toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) 
    };
  }, [startTimestamp]);

  const handleStartTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newTimestamp = parseDateTimeLocalToTimestamp(event.target.value);
    
    // Clamp to min/max allowed
    if (newTimestamp < minAllowedStartTimestamp) {
        newTimestamp = minAllowedStartTimestamp;
    } else if (newTimestamp > maxAllowedStartTimestamp) {
        newTimestamp = maxAllowedStartTimestamp;
    }
    setStartTimestamp(newTimestamp);
  };

  const currentLookbackDurationMs = useMemo(() => {
    return new Date().getTime() - startTimestamp;
  }, [startTimestamp]);


  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="strategy" className="block text-sm font-medium text-gray-300 mb-1">交易策略</label>
        <select
          id="strategy"
          value={selectedStrategy}
          onChange={(e) => setSelectedStrategy(e.target.value as SMCStrategy)}
          className={selectStyle}
          disabled={isLoading || isStrategyLocked}
          aria-disabled={isLoading || isStrategyLocked}
        >
          {STRATEGY_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
         {isStrategyLocked && <p className="text-xs text-gray-400 mt-1">此頁面策略已固定。</p>}
      </div>

      <div>
        <label htmlFor="instrument" className="block text-sm font-medium text-gray-300 mb-1">金融產品</label>
        <select
          id="instrument"
          value={selectedInstrument}
          onChange={(e) => setSelectedInstrument(e.target.value as FinancialInstrument)}
          className={selectStyle}
          disabled={isLoading}
        >
          {INSTRUMENT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="timeframe" className="block text-sm font-medium text-gray-300 mb-1">時間週期</label>
        <select
          id="timeframe"
          value={selectedTimeFrame}
          onChange={(e) => setSelectedTimeFrame(e.target.value as TimeFrame)}
          className={selectStyle}
          disabled={isLoading}
        >
          {TIMEFRAME_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      
      <div className="p-5 bg-gray-800 rounded-xl shadow-xl border border-gray-700 space-y-3 transform hover:scale-[1.01] transition-transform duration-300">
        <label htmlFor="start-datetime" className="block text-sm font-medium text-gray-300 text-center tracking-wider mb-4">
          回溯開始時間
        </label>
        <input
            type="datetime-local"
            id="start-datetime"
            value={formatTimestampForDateTimeLocal(startTimestamp)}
            min={formatTimestampForDateTimeLocal(minAllowedStartTimestamp)}
            max={formatTimestampForDateTimeLocal(maxAllowedStartTimestamp)}
            onChange={handleStartTimeChange}
            className={`${selectStyle} text-center tabular-nums py-4`}
            disabled={isLoading}
            aria-label="選擇回溯開始日期與時間"
        />
        <div 
            className="text-center text-sm font-medium py-2 px-3 bg-neutral-focus rounded-lg shadow-inner border border-gray-600 text-yellow-400"
            aria-live="polite" 
        >
            測試時長: {formatMillisecondsToDHMS(currentLookbackDurationMs)}
        </div>
         <div className="text-xs text-white mt-2 px-1 pt-2 border-t border-gray-700/50 space-y-1">
            <p>最早可選: {new Date(minAllowedStartTimestamp).toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12:false })}</p>
            <p>最晚可選: {new Date(maxAllowedStartTimestamp).toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12:false })}</p>
        </div>
      </div>

      <div className="text-xs text-white p-3 bg-gray-600 rounded-md shadow">
        <p>預計測試開始: {calculatedTestPeriodDisplay.start}</p>
        <p>預計測試結束: {calculatedTestPeriodDisplay.end} (目前時間)</p>
      </div>

      <button
        onClick={onRunTest}
        disabled={isLoading}
        className="w-full flex items-center justify-center py-3 px-4 bg-accent text-neutral font-semibold rounded-lg shadow-md hover:bg-yellow-500 transition duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-neutral mr-2"></div>
            測試中... 
          </>
        ) : (
          <>
            <SvgPlay className="w-5 h-5 mr-2" />
            運行測試
          </>
        )}
      </button>
    </div>
  );
};
