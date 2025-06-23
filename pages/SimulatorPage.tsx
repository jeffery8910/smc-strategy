import React, { useState, useCallback, useEffect } from 'react';
import { ControlPanel } from '../components/ControlPanel';
import { ChartDisplay } from '../components/ChartDisplay';
import { ResultsDisplay } from '../components/ResultsDisplay';
import { SMCStrategy, FinancialInstrument, TimeFrame, Trade, SimulatedDataPoint, SimulationParams } from '../types';
import { generateSimulatedTrades, getMarketData } from '../services/simulationService';
import { getTimeframeIntervalMs } from '../services/mockFinancialDataAPI';
import { STRATEGY_OPTIONS } from '../constants'; // For default strategy
import { SvgChartBar, SvgCog, SvgCurrencyDollar, SvgDocumentText, SvgLightBulb } from '../components/Icons';


// Constants for lookback duration (in milliseconds)
const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;
const MIN_LOOKBACK_MS = ONE_HOUR_MS;
const MAX_LOOKBACK_MS = 90 * ONE_DAY_MS;
const DEFAULT_LOOKBACK_MS = 7 * ONE_DAY_MS;
const MAX_DATA_POINTS_ALLOWED = 1000;


export const SimulatorPage: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<SMCStrategy>(STRATEGY_OPTIONS[0].value);
  const [selectedInstrument, setSelectedInstrument] = useState<FinancialInstrument>(FinancialInstrument.EURUSD);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>(TimeFrame.H1);
  const [startTimestamp, setStartTimestamp] = useState<number>(() => new Date().getTime() - DEFAULT_LOOKBACK_MS);

  const [simulatedTrades, setSimulatedTrades] = useState<Trade[]>([]);
  const [priceData, setPriceData] = useState<SimulatedDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Optional: Reset chart/results if major params change, or let user re-run
    setSimulatedTrades([]);
    setPriceData([]);
    setMessage(null);
  }, [selectedStrategy, selectedInstrument, selectedTimeFrame]);


  const runTest = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);
    setSimulatedTrades([]);
    setPriceData([]);

    let startTsForTest: number = startTimestamp;
    let endTsForTest: number;
    let numDataPointsCalc: number;
    let originalEstimatedDataPoints: number;

    try {
        endTsForTest = new Date().getTime(); 

        if (startTsForTest >= endTsForTest) {
            throw new Error('選定的開始時間必須早於目前時間。');
        }
        if (endTsForTest - startTsForTest < MIN_LOOKBACK_MS) {
            throw new Error(`回溯期間過短。至少需要 ${MIN_LOOKBACK_MS / ONE_HOUR_MS} 小時。`);
        }
        if (endTsForTest - startTsForTest > MAX_LOOKBACK_MS) {
            startTsForTest = endTsForTest - MAX_LOOKBACK_MS; // Corrected this line
            setStartTimestamp(startTsForTest); // Update state as well
            setMessage(`資訊：請求的回溯期間超過最大 ${MAX_LOOKBACK_MS / ONE_DAY_MS} 天限制。已自動調整開始時間。`);
        } else {
            // Ensure any previous auto-adjustment message is cleared if now within limits
            if (message?.includes("已自動調整開始時間")) setMessage(null);
        }


        const intervalMs = getTimeframeIntervalMs(selectedTimeFrame);
        if (intervalMs <= 0) throw new Error('無效的時間週期導致時間間隔為零或負數。');
        
        const currentLookbackMs = endTsForTest - startTsForTest;
        originalEstimatedDataPoints = Math.max(1, Math.floor(currentLookbackMs / intervalMs) + 1);
        numDataPointsCalc = originalEstimatedDataPoints;
        
        let actualTestStartTime = new Date(startTsForTest);

        if (numDataPointsCalc > MAX_DATA_POINTS_ALLOWED) {
            actualTestStartTime = new Date(endTsForTest - (MAX_DATA_POINTS_ALLOWED - 1) * intervalMs);
            const newStartTimestamp = actualTestStartTime.getTime();
            setStartTimestamp(newStartTimestamp); // Update state
            startTsForTest = newStartTimestamp; // Use the adjusted timestamp for the API call

            setMessage(prev => (prev && !prev.includes("已自動調整開始時間") ? prev + "\n" : "") + `資訊：請求的回溯期間 (${originalEstimatedDataPoints} 個點)過長。已自動縮短以符合最大 ${MAX_DATA_POINTS_ALLOWED} 個點的限制。實際測試開始時間約為 ${actualTestStartTime.toLocaleString('zh-TW')}。`);
            numDataPointsCalc = MAX_DATA_POINTS_ALLOWED;
        }

    } catch (e: any) {
        setMessage(`日期設定錯誤: ${e.message}`);
        setIsLoading(false);
        return;
    }

    const params: SimulationParams = {
      strategy: selectedStrategy,
      instrument: selectedInstrument,
      timeframe: selectedTimeFrame,
      numDataPoints: numDataPointsCalc, 
    };

    try {
      const newPriceData = await getMarketData(
        params.instrument,
        params.timeframe,
        params.numDataPoints,
        endTsForTest, // User defined end timestamp (current time)
        startTsForTest // Explicit start timestamp (user defined or adjusted)
      );

      if (newPriceData && newPriceData.length > 0) {
        setPriceData(newPriceData);
        const actualNumDataPoints = newPriceData.length;
        if (actualNumDataPoints < params.numDataPoints && !message?.includes("已自動縮短")) { 
             setMessage(prev => (prev && !prev.includes("已自動調整開始時間") ? prev + "\n" : "") + `資訊：實際獲取到的市場數據點 (${actualNumDataPoints}) 少於請求的數量 (${params.numDataPoints})。可能是由於模擬數據源的限制。`);
        }
        const tradesParams = {...params, numDataPoints: actualNumDataPoints}; 
        const newTrades = generateSimulatedTrades(tradesParams, newPriceData);
        setSimulatedTrades(newTrades);
        if (newTrades.length === 0 && priceData.length > 0 && !message) {
            setMessage("測試完成。本次參數設定未產生任何交易。");
        }
      } else {
        setMessage("未能接收到市場數據。請嘗試不同的參數或檢查模擬數據源。");
        setPriceData([]);
        setSimulatedTrades([]);
      }
    } catch (err: any) {
      console.error(`策略 ${selectedStrategy} 測試錯誤:`, err);
      setMessage(`策略測試運行失敗: ${err.message || '未知錯誤'}`);
      setPriceData([]);
      setSimulatedTrades([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStrategy, selectedInstrument, selectedTimeFrame, startTimestamp, message]); // Added message to dependencies

  const now = new Date().getTime();
  const minAllowedStartTimestamp = now - MAX_LOOKBACK_MS;
  const maxAllowedStartTimestamp = now - MIN_LOOKBACK_MS;

  return (
    <main className="flex-grow flex flex-col p-4 gap-4">
      <div className="bg-gray-700 p-6 rounded-xl shadow-xl mb-2 text-center">
        <h2 className="text-3xl font-bold text-accent mb-3 flex items-center justify-center">
          <SvgCog className="w-8 h-8 mr-3 text-yellow-400 animate-spin-slow" />
          策略模擬器
        </h2>
        <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto">
          選擇一個交易策略和市場參數，然後運行測試以在歷史數據上模擬其表現。
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3 lg:w-1/4 bg-gray-700 p-6 rounded-xl shadow-2xl space-y-6 transform transition-all duration-300 hover:scale-[1.02]">
          <h3 className="text-2xl font-semibold text-accent mb-6 border-b-2 border-accent pb-2 flex items-center">
            <SvgLightBulb className="w-7 h-7 mr-2" />
            測試參數
          </h3>
          <ControlPanel
            selectedStrategy={selectedStrategy}
            setSelectedStrategy={setSelectedStrategy}
            isStrategyLocked={false} // Strategy is selectable
            selectedInstrument={selectedInstrument}
            setSelectedInstrument={setSelectedInstrument}
            selectedTimeFrame={selectedTimeFrame}
            setSelectedTimeFrame={setSelectedTimeFrame}
            startTimestamp={startTimestamp}
            setStartTimestamp={setStartTimestamp}
            minAllowedStartTimestamp={minAllowedStartTimestamp}
            maxAllowedStartTimestamp={maxAllowedStartTimestamp}
            onRunTest={runTest}
            isLoading={isLoading}
          />
          {message && (
            <div className={`text-sm p-3 rounded-md ${message.startsWith("日期設定錯誤") || message.startsWith("策略測試運行失敗") || message.startsWith("未能接收到市場數據") ? 'text-red-300 bg-red-800/60' : (message.startsWith("資訊") || message.startsWith("測試完成") ? 'text-blue-300 bg-blue-800/60' : 'text-yellow-300 bg-yellow-800/50')}`}>
                {message.split('\n').map((line, index) => <p key={index}>{line}</p>)}
            </div>
           )}
          <div className="text-xs text-gray-400 mt-2 text-center">
            測試結束時間點為目前最新時間。
          </div>
        </div>

        <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col gap-4">
            <div className="bg-gray-700 p-6 rounded-xl shadow-2xl flex-grow transform transition-all duration-300 hover:shadow-accent/50">
              <h3 className="text-2xl font-semibold text-accent mb-4 border-b-2 border-accent pb-2 flex items-center">
                 <SvgChartBar className="w-7 h-7 mr-2" />
                 歷史價格圖表與策略交易
              </h3>
              {isLoading && (
                <div className="flex justify-center items-center h-64" role="status" aria-label="正在載入圖表數據">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-secondary"></div>
                  <p className="ml-4 text-xl">正在載入市場數據...</p>
                </div>
              )}
              {!isLoading && !message?.startsWith("日期設定錯誤") && !message?.startsWith("未能接收到市場數據") && priceData.length > 0 && (
                <ChartDisplay 
                  priceData={priceData} 
                  trades={simulatedTrades} 
                  timeframe={selectedTimeFrame}
                  instrument={selectedInstrument}
                />
              )}
              {!isLoading && (priceData.length === 0 || message?.startsWith("日期設定錯誤") || message?.startsWith("未能接收到市場數據") ) && (
                 <div className="flex flex-col justify-center items-center h-64 text-gray-400">
                   <SvgCurrencyDollar className="w-24 h-24 mb-4 opacity-50" />
                   <p className="text-xl">{message && (message.startsWith("日期設定錯誤") || message.startsWith("未能接收到市場數據")) ? "無法載入數據。" : "選擇參數並運行測試以檢視圖表。"}</p> 
                   {message && (message.startsWith("日期設定錯誤") || message.startsWith("未能接收到市場數據")) && !message.includes("已自動縮短") && <p className="text-sm mt-2">{message.split('\n')[0]}</p>}
                 </div>
              )}
            </div>
            <div className="bg-gray-700 p-6 rounded-xl shadow-2xl transform transition-all duration-300 hover:shadow-secondary/50">
               <h3 className="text-2xl font-semibold text-secondary mb-4 border-b-2 border-secondary pb-2 flex items-center">
                  <SvgDocumentText className="w-7 h-7 mr-2" />
                  測試結果
               </h3>
              {isLoading && (
                 <div className="flex justify-center items-center h-32" role="status" aria-label="正在計算測試結果">
                   <p className="text-lg">正在計算結果...</p>
                 </div>
              )}
              {!isLoading && !message?.startsWith("日期設定錯誤") && !message?.startsWith("未能接收到市場數據") && simulatedTrades.length > 0 && (
                <ResultsDisplay trades={simulatedTrades} instrument={selectedInstrument} />
              )}
               {!isLoading && !message?.startsWith("日期設定錯誤") && !message?.startsWith("未能接收到市場數據") && simulatedTrades.length === 0 && priceData.length > 0 && !message?.startsWith("測試完成") &&(
                <p className="text-center text-gray-400 py-4">本次測試未執行任何交易。</p>
              )}
               {!isLoading && (priceData.length === 0 || message?.startsWith("日期設定錯誤") || message?.startsWith("未能接收到市場數據")) && (
                 <div className="flex flex-col justify-center items-center h-32 text-gray-400">
                   <SvgCurrencyDollar className="w-16 h-16 mb-2 opacity-50" />
                   <p className="text-lg">{message && (message.startsWith("日期設定錯誤") || message.startsWith("未能接收到市場數據")) ? "結果無法使用。" : "測試結果將在此處顯示。"}</p>
                 </div>
              )}
            </div>
        </div>
      </div>
    </main>
  );
};
