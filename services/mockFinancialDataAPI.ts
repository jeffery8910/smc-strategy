
import { FinancialInstrument, SimulatedDataPoint, TimeFrame, getPriceDecimals } from '../types';

interface MockPriceEntry {
  time: number; // JavaScript 時間戳 (自UTC 1970年1月1日以來的毫秒數) - 現在作為範本時間戳
  price: number;
}

// 這個常數現在定義了預生成數據的固定結束點，用於創建價格 *模式*
const TEMPLATE_DATA_END_TIMESTAMP = new Date('2025-12-31T16:00:00Z').getTime();
const MOCK_DATA_TOTAL_POINTS = 5000; // 增加預定義序列的總數據點數量以支持更長的回溯

export const getTimeframeIntervalMs = (timeframe: TimeFrame): number => {
  switch (timeframe) {
    case TimeFrame.M1: return 60 * 1000;
    case TimeFrame.M5: return 5 * 60 * 1000;
    case TimeFrame.M15: return 15 * 60 * 1000;
    case TimeFrame.H1: return 60 * 60 * 1000;
    case TimeFrame.H4: return 4 * 60 * 60 * 1000;
    case TimeFrame.D1: return 24 * 60 * 60 * 1000;
    default: return 60 * 60 * 1000; // 預設為 1 小時
  }
};

// 預先定義一些金融產品和時間週期的模擬數據
// mockDataStore 中的時間戳是基於 TEMPLATE_DATA_END_TIMESTAMP 的
const mockDataStore: Record<FinancialInstrument, Record<TimeFrame, MockPriceEntry[]>> = {
  [FinancialInstrument.EURUSD]: {
    [TimeFrame.M15]: (() => {
      const entries: MockPriceEntry[] = [];
      let price = 1.0800;
      const intervalMs = getTimeframeIntervalMs(TimeFrame.M15);
      const decimals = getPriceDecimals(FinancialInstrument.EURUSD);

      for (let i = 0; i < MOCK_DATA_TOTAL_POINTS; i++) {
        if (i > 0) price = entries[i-1].price; 
        
        let nextPrice = price;
        const change = (Math.random() - 0.49) * 0.0010; 
        if (i % 300 > 50 && i % 300 < 150) nextPrice += 0.00005 * Math.sin((i % 300 - 50)/20) + change*0.5; 
        else if (i % 300 > 200 && i % 300 < 300) nextPrice -= 0.00004 * Math.cos((i % 300 - 200)/15) + change*0.5; 
        else if (i % 500 > 350 && i % 500 < 450) nextPrice += (Math.random() - 0.5) * 0.0003; 
        else nextPrice += change; 

        if (nextPrice < 1.0500) nextPrice = 1.0500 + Math.random() * 0.0001;
        if (nextPrice > 1.1200) nextPrice = 1.1200 - Math.random() * 0.0001;
        
        const timestamp = TEMPLATE_DATA_END_TIMESTAMP - (MOCK_DATA_TOTAL_POINTS - 1 - i) * intervalMs;
        entries.push({ time: timestamp, price: parseFloat(nextPrice.toFixed(decimals)) });
      }
      return entries;
    })(),
    [TimeFrame.H1]: (() => {
        const entries: MockPriceEntry[] = [];
        let price = 1.1000;
        const intervalMs = getTimeframeIntervalMs(TimeFrame.H1);
        const decimals = getPriceDecimals(FinancialInstrument.EURUSD);

        for (let i = 0; i < MOCK_DATA_TOTAL_POINTS; i++) {
            if (i > 0) price = entries[i-1].price;
            let nextPrice = price;
            const volatility = 0.0020; 
            let change = (Math.random() - 0.5) * volatility;
            if (i % 100 < 40) { 
                change += volatility * 0.3 * Math.sin(i / 10);
            } else if (i % 100 < 80) { 
                change -= volatility * 0.2 * Math.cos(i/12);
            } 
            nextPrice += change;
            if (nextPrice <= 1.0600) nextPrice = 1.0600 + Math.random() * 0.0002;
            if (nextPrice >= 1.1500) nextPrice = 1.1500 - Math.random() * 0.0002;

            const timestamp = TEMPLATE_DATA_END_TIMESTAMP - (MOCK_DATA_TOTAL_POINTS - 1 - i) * intervalMs;
            entries.push({ time: timestamp, price: parseFloat(nextPrice.toFixed(decimals)) });
        }
        return entries;
    })(),
    [TimeFrame.M1]: [], [TimeFrame.M5]: [], [TimeFrame.H4]: [], [TimeFrame.D1]: [],
  },
  [FinancialInstrument.BTCUSD]: {
    [TimeFrame.H1]: (() => {
      const entries: MockPriceEntry[] = [];
      let price = 60000;
      const intervalMs = getTimeframeIntervalMs(TimeFrame.H1);
      const decimals = getPriceDecimals(FinancialInstrument.BTCUSD);

      for (let i = 0; i < MOCK_DATA_TOTAL_POINTS; i++) {
        if (i > 0) price = entries[i-1].price;
        let nextPrice = price;
        const volatility = 800; 
        if (i % 200 > 30 && i % 200 < 100) nextPrice += 50 * Math.sin((i % 200 - 30)/10) + (Math.random() - 0.5) * volatility * 0.7; 
        else if (i % 250 > 150 && i % 250 < 220) nextPrice -= 40 * Math.cos((i % 250 - 150)/8) + (Math.random() - 0.5) * volatility * 0.7; 
        else if (i % 400 > 300 && i % 400 < 400) nextPrice += (Math.random() - 0.5) * 300; 
        else nextPrice += (Math.random() - 0.5) * volatility; 
        if (nextPrice < 45000) nextPrice = 45000 + Math.random() * 100;
        if (nextPrice > 75000) nextPrice = 75000 - Math.random() * 100;

        const timestamp = TEMPLATE_DATA_END_TIMESTAMP - (MOCK_DATA_TOTAL_POINTS - 1 - i) * intervalMs;
        entries.push({ time: timestamp, price: parseFloat(nextPrice.toFixed(decimals)) });
      }
      return entries;
    })(),
    [TimeFrame.M1]: [], [TimeFrame.M5]: [], [TimeFrame.M15]: [], [TimeFrame.H4]: [], [TimeFrame.D1]: [],
  },
  [FinancialInstrument.GBPUSD]: {[TimeFrame.M1]: [], [TimeFrame.M5]: [], [TimeFrame.M15]: [], [TimeFrame.H1]: [], [TimeFrame.H4]: [], [TimeFrame.D1]: []},
  [FinancialInstrument.SPX500]: {[TimeFrame.M1]: [], [TimeFrame.M5]: [], [TimeFrame.M15]: [], [TimeFrame.H1]: [], [TimeFrame.H4]: [], [TimeFrame.D1]: []},
  [FinancialInstrument.NASDAQ100]: {[TimeFrame.M1]: [], [TimeFrame.M5]: [], [TimeFrame.M15]: [], [TimeFrame.H1]: [], [TimeFrame.H4]: [], [TimeFrame.D1]: []},
  [FinancialInstrument.GOLD]: {[TimeFrame.M1]: [], [TimeFrame.M5]: [], [TimeFrame.M15]: [], [TimeFrame.H1]: [], [TimeFrame.H4]: [], [TimeFrame.D1]: []},
  [FinancialInstrument.OIL]: {[TimeFrame.M1]: [], [TimeFrame.M5]: [], [TimeFrame.M15]: [], [TimeFrame.H1]: [], [TimeFrame.H4]: [], [TimeFrame.D1]: []},
  [FinancialInstrument.ETHUSD]: {[TimeFrame.M1]: [], [TimeFrame.M5]: [], [TimeFrame.M15]: [], [TimeFrame.H1]: [], [TimeFrame.H4]: [], [TimeFrame.D1]: []},
};

// 為空的時間週期陣列填充通用（較為隨機）的模擬數據
Object.values(FinancialInstrument).forEach(instrument => {
  if (!mockDataStore[instrument]) { 
    mockDataStore[instrument] = {} as Record<TimeFrame, MockPriceEntry[]>;
  }
  Object.values(TimeFrame).forEach(timeframe => {
    if (mockDataStore[instrument] && (!mockDataStore[instrument][timeframe] || mockDataStore[instrument][timeframe].length === 0)) {
      mockDataStore[instrument][timeframe] = (() => {
        const entries: MockPriceEntry[] = [];
        let initialP: number;
        const decimals = getPriceDecimals(instrument);
        const intervalMs = getTimeframeIntervalMs(timeframe);

        switch (instrument) {
            case FinancialInstrument.SPX500: initialP = 5000; break;
            case FinancialInstrument.NASDAQ100: initialP = 18000; break;
            case FinancialInstrument.GOLD: initialP = 2300; break;
            case FinancialInstrument.OIL: initialP = 80; break;
            case FinancialInstrument.BTCUSD: initialP = 60000; break; 
            case FinancialInstrument.ETHUSD: initialP = 3500; break;
            case FinancialInstrument.GBPUSD: initialP = 1.2700; break;
            case FinancialInstrument.EURUSD: initialP = 1.0800; break; 
            default: initialP = 100;
        }
        
        let price = initialP;
        for (let i = 0; i < MOCK_DATA_TOTAL_POINTS; i++) { 
          if (i > 0) price = entries[i-1].price;
          
          let nextPrice = price;
          const volatilityPercentage = (instrument === FinancialInstrument.BTCUSD || instrument === FinancialInstrument.ETHUSD) ? 0.025 : 0.01;
          const change = (Math.random() - 0.5) * nextPrice * volatilityPercentage; 
          nextPrice += change;

          if (instrument === FinancialInstrument.OIL || 
              instrument === FinancialInstrument.SPX500 || 
              instrument === FinancialInstrument.NASDAQ100 || 
              instrument === FinancialInstrument.GOLD) {
            if (nextPrice <= 0) {
              nextPrice = price * (0.5 + Math.random() * 0.1); 
            }
          }
          const timestamp = TEMPLATE_DATA_END_TIMESTAMP - (MOCK_DATA_TOTAL_POINTS - 1 - i) * intervalMs;
          entries.push({ time: timestamp, price: parseFloat(nextPrice.toFixed(decimals)) });
        }
        return entries;
      })();
    }
  });
});


export const fetchMockPriceData = async (
  instrument: FinancialInstrument,
  timeframe: TimeFrame,
  numDataPoints: number,
  userEndTimestamp: number,
  explicitStartTimestamp?: number // Optional: if provided, data should align to this start
): Promise<SimulatedDataPoint[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => { 
      const instrumentDataStore = mockDataStore[instrument];
      if (!instrumentDataStore) {
        return reject(new Error(`金融產品 ${instrument} 沒有模擬數據結構`));
      }
      const rawTimeframeData = instrumentDataStore[timeframe];
      const intervalMs = getTimeframeIntervalMs(timeframe);
      const decimals = getPriceDecimals(instrument);
      
      const generateEmergencyData = (count: number, endTs: number) => 
        Array.from({ length: count }, (_, i) => ({
            time: endTs - (count - 1 - i) * intervalMs,
            price: parseFloat((100 + (Math.random() - 0.5) * 10 * Math.sin(i / (5 + Math.random()*5))).toFixed(decimals))
        }));

      if (!rawTimeframeData || rawTimeframeData.length === 0) { 
        console.warn(`${instrument} ${timeframe} 沒有數據。使用緊急備援數據。`);
        resolve(generateEmergencyData(numDataPoints, userEndTimestamp));
        return;
      }
      
      let templateSelectedPoints: MockPriceEntry[];

      // If an explicit start timestamp is given, try to find data around that period
      if (explicitStartTimestamp) {
        // Find the closest point in template data to explicitStartTimestamp relative to TEMPLATE_DATA_END_TIMESTAMP
        // This is a simplification: assumes template data density matches request.
        // A more robust approach would involve finding the template point whose offset from TEMPLATE_DATA_END_TIMESTAMP
        // best matches explicitStartTimestamp's offset from userEndTimestamp.
        const timeOffsetFromUserEndToTemplateEnd = TEMPLATE_DATA_END_TIMESTAMP - userEndTimestamp;
        const targetTemplateStartTime = explicitStartTimestamp + timeOffsetFromUserEndToTemplateEnd;

        let startIndex = rawTimeframeData.findIndex(p => p.time >= targetTemplateStartTime);
        if (startIndex === -1) { // If no data at or after target, take from the end
            startIndex = Math.max(0, rawTimeframeData.length - numDataPoints);
        }
        const endIndex = Math.min(rawTimeframeData.length, startIndex + numDataPoints);
        templateSelectedPoints = rawTimeframeData.slice(startIndex, endIndex);

      } else {
        // Original logic: take numDataPoints from the end of template data
        const startIndexSlice = Math.max(0, rawTimeframeData.length - numDataPoints);
        templateSelectedPoints = rawTimeframeData.slice(startIndexSlice);
      }
      
      if (templateSelectedPoints.length === 0) {
           console.warn(`無法從 ${instrument} ${timeframe} 的模擬數據中提取點位。使用緊急備援數據。`);
            resolve(generateEmergencyData(numDataPoints, userEndTimestamp));
            return;
      }

      if (templateSelectedPoints.length < numDataPoints && !explicitStartTimestamp) { // Warning only if not explicit start, as explicit start might mean fewer points are fine.
        console.warn(`${instrument} ${timeframe} 的模擬數據長度 (${templateSelectedPoints.length}) 短於請求的 (${numDataPoints})。將使用所有可用數據 (${templateSelectedPoints.length} 個點)。`);
      }
      
      const lastTemplatePointTime = templateSelectedPoints[templateSelectedPoints.length - 1].time;
      const timeShift = userEndTimestamp - lastTemplatePointTime;

      const finalData: SimulatedDataPoint[] = templateSelectedPoints.map(point => ({
        time: point.time + timeShift,
        price: point.price,
      }));
      
      // Ensure the final data does not exceed numDataPoints, especially if explicitStartTimestamp was used.
      // And also ensure it doesn't go beyond userEndTimestamp or before explicitStartTimestamp (if provided)
      let resultData = finalData.filter(dp => dp.time <= userEndTimestamp);
      if(explicitStartTimestamp){
        resultData = resultData.filter(dp => dp.time >= explicitStartTimestamp);
      }
      
      // If after filtering, we still have more than numDataPoints (e.g. if intervalMs was small)
      // and explicitStartTimestamp was set, we might need to trim from the start.
      // However, the primary control for numDataPoints is handled in App.tsx before calling this.
      // This function's role is more about fetching the *correct window* of data.
      // If explicitStartTimestamp is set, numDataPoints defines the max count FROM that start time.

      if (resultData.length > numDataPoints) {
         // If explicitStartTimestamp was set, we prioritize keeping the start and trimming the end.
         // Otherwise, we take the latest numDataPoints.
         if (explicitStartTimestamp) {
            resultData = resultData.slice(0, numDataPoints);
         } else {
            resultData = resultData.slice(-numDataPoints);
         }
      }


      resolve(resultData);
    }, 500); 
  });
};
