
import { Trade, SimulatedDataPoint, SimulationParams, SMCStrategy, FinancialInstrument, TimeFrame, getPriceDecimals } from '../types';
import { fetchMockPriceData } from './mockFinancialDataAPI';

// 從(模擬的)API獲取市場數據的新函式
export const getMarketData = async (
  instrument: FinancialInstrument,
  timeframe: TimeFrame,
  numDataPoints: number,
  userEndTimestamp: number, // 新增使用者定義的結束時間戳
  explicitStartTimestamp?: number // 新增：可選的明確開始時間戳
): Promise<SimulatedDataPoint[]> => {
  try {
    // 將 explicitStartTimestamp 傳遞給 fetchMockPriceData
    const data = await fetchMockPriceData(instrument, timeframe, numDataPoints, userEndTimestamp, explicitStartTimestamp); 
    return data;
  } catch (error) {
    console.error("未能獲取市場數據:", error);
    // 發生錯誤時的備援機制，使用簡單陣列以防止崩潰
    const emergencyIntervalMs = 60 * 60 * 1000; // 假設1小時
    const fallbackStartTime = explicitStartTimestamp || (userEndTimestamp - (numDataPoints - 1) * emergencyIntervalMs);
    return Array.from({ length: numDataPoints }, (_, i) => ({ 
        time: fallbackStartTime + i * emergencyIntervalMs, // Ensure time progression
        price: 1 
    }));
  }
};

const formatTimeForExplanation = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

// 增強的SMC策略交易生成邏輯
export const generateSimulatedTrades = (params: SimulationParams, priceData: SimulatedDataPoint[]): Trade[] => {
  const trades: Trade[] = [];
  if (priceData.length < 20) return trades; 

  const riskRewardRatio = 2; 
  const lookbackPeriod = 15; 
  const priceDecimals = getPriceDecimals(params.instrument);

  for (let i = lookbackPeriod; i < priceData.length - 5; i++) { 
    const currentCandle = priceData[i];
    const historicalDataSlice = priceData.slice(0, i + 1); 

    let tradeSignal: Omit<Trade, 'id' | 'outcome' | 'instrument' | 'timeFrame' | 'strategy' | 'explanation'> | null = null;
    let explanation: string = "";

    const recentHighs = historicalDataSlice.slice(-lookbackPeriod).map(p => p.price).sort((a,b) => b-a);
    const recentLows = historicalDataSlice.slice(-lookbackPeriod).map(p => p.price).sort((a,b) => a-b);
    const swingHighLookback = priceData.slice(Math.max(0, i - 10), i);
    const swingLowLookback = priceData.slice(Math.max(0, i - 10), i);
    
    const swingHigh = swingHighLookback.length > 0 ? Math.max(...swingHighLookback.map(p => p.price)) : currentCandle.price; 
    const swingLow = swingLowLookback.length > 0 ? Math.min(...swingLowLookback.map(p => p.price)) : currentCandle.price;   


    switch (params.strategy) {
      case SMCStrategy.MARKET_STRUCTURE_SHIFT: {
        if (currentCandle.price > swingHigh && priceData[i-1].price <= swingHigh) { 
          const prevTrendSlice = historicalDataSlice.slice(Math.max(0, i - lookbackPeriod), i);
          if (prevTrendSlice.length > 5 && prevTrendSlice[0].price > prevTrendSlice[prevTrendSlice.length-1].price) { 
             tradeSignal = {
              entryTime: currentCandle.time, 
              entryPrice: currentCandle.price,
              type: 'LONG',
              stopLoss: swingLow, 
              takeProfit: currentCandle.price + (currentCandle.price - swingLow) * riskRewardRatio,
            };
            explanation = `市場結構向上轉變 (MSS)。價格 ${currentCandle.price.toFixed(priceDecimals)} 於 ${formatTimeForExplanation(currentCandle.time)} 突破先前位於 ${swingHigh.toFixed(priceDecimals)} 的擺動高點。進場做多。`;
          }
        }
        else if (currentCandle.price < swingLow && priceData[i-1].price >= swingLow) {
          const prevTrendSlice = historicalDataSlice.slice(Math.max(0, i - lookbackPeriod), i);
           if (prevTrendSlice.length > 5 && prevTrendSlice[0].price < prevTrendSlice[prevTrendSlice.length-1].price) { 
            tradeSignal = {
              entryTime: currentCandle.time, 
              entryPrice: currentCandle.price,
              type: 'SHORT',
              stopLoss: swingHigh, 
              takeProfit: currentCandle.price - (swingHigh - currentCandle.price) * riskRewardRatio,
            };
            explanation = `市場結構向下轉變 (MSS)。價格 ${currentCandle.price.toFixed(priceDecimals)} 於 ${formatTimeForExplanation(currentCandle.time)} 跌破先前位於 ${swingLow.toFixed(priceDecimals)} 的擺動低點。進場做空。`;
          }
        }
        break;
      }

      case SMCStrategy.ORDER_BLOCK: {
        const obLookback = 10;
        if (i < obLookback + 5) break; // Need sufficient lookback

        // Look for strong price movements that could indicate order block formation
        const recentSlice = priceData.slice(i - 5, i + 1);
        if (recentSlice.length < 4) break;

        // Check for bullish order block: strong upward movement after a period of consolidation/decline
        const strongMoveUp = recentSlice.some((candle, idx) => {
          if (idx === 0) return false;
          const prevCandle = recentSlice[idx - 1];
          return (candle.price - prevCandle.price) / prevCandle.price > 0.004; // 0.4% move
        });

        if (strongMoveUp) {
          // Find the last bearish/consolidation candle before the strong move (this forms the bullish OB)
          let obCandleIndex = -1;
          for (let j = i - 1; j >= i - obLookback; j--) {
            if (j > 0 && priceData[j].price <= priceData[j - 1].price) {
              // Check if this was followed by the strong move
              const nextCandlesSlice = priceData.slice(j + 1, Math.min(j + 4, priceData.length));
              const hasStrongMoveAfter = nextCandlesSlice.some(c => c.price > priceData[j].price * 1.003);
              
              if (hasStrongMoveAfter) {
                obCandleIndex = j;
                break;
              }
            }
          }

          if (obCandleIndex > -1) {
            const obCandle = priceData[obCandleIndex];
            const obLow = obCandle.price * 0.999; // Approximate OB low
            const obHigh = obCandle.price * 1.001; // Approximate OB high

            // Check if current price is retesting the order block
            if (currentCandle.price >= obLow && currentCandle.price <= obHigh && 
                currentCandle.price < priceData[i - 1].price) { // Confirming retest downward movement
              tradeSignal = {
                entryTime: currentCandle.time,
                entryPrice: currentCandle.price,
                type: 'LONG',
                stopLoss: obLow * 0.998,
                takeProfit: currentCandle.price + (currentCandle.price - obLow * 0.998) * riskRewardRatio,
              };
              explanation = `偵測到看漲訂單塊。於 ${formatTimeForExplanation(obCandle.time)} 形成訂單塊 (價格 ${obCandle.price.toFixed(priceDecimals)})，隨後出現強勁上漲。價格於 ${formatTimeForExplanation(currentCandle.time)} 回測此訂單塊區域 (${obLow.toFixed(priceDecimals)} - ${obHigh.toFixed(priceDecimals)})，於 ${currentCandle.price.toFixed(priceDecimals)} 進場做多。`;
            }
          }
        }

        // Check for bearish order block: strong downward movement after a period of consolidation/rise
        const strongMoveDown = recentSlice.some((candle, idx) => {
          if (idx === 0) return false;
          const prevCandle = recentSlice[idx - 1];
          return (prevCandle.price - candle.price) / prevCandle.price > 0.004; // 0.4% move
        });

        if (strongMoveDown) {
          // Find the last bullish/consolidation candle before the strong move (this forms the bearish OB)
          let obCandleIndex = -1;
          for (let j = i - 1; j >= i - obLookback; j--) {
            if (j > 0 && priceData[j].price >= priceData[j - 1].price) {
              // Check if this was followed by the strong move down
              const nextCandlesSlice = priceData.slice(j + 1, Math.min(j + 4, priceData.length));
              const hasStrongMoveAfter = nextCandlesSlice.some(c => c.price < priceData[j].price * 0.997);
              
              if (hasStrongMoveAfter) {
                obCandleIndex = j;
                break;
              }
            }
          }

          if (obCandleIndex > -1) {
            const obCandle = priceData[obCandleIndex];
            const obLow = obCandle.price * 0.999; // Approximate OB low
            const obHigh = obCandle.price * 1.001; // Approximate OB high

            // Check if current price is retesting the order block
            if (currentCandle.price >= obLow && currentCandle.price <= obHigh && 
                currentCandle.price > priceData[i - 1].price) { // Confirming retest upward movement
              tradeSignal = {
                entryTime: currentCandle.time,
                entryPrice: currentCandle.price,
                type: 'SHORT',
                stopLoss: obHigh * 1.002,
                takeProfit: currentCandle.price - (obHigh * 1.002 - currentCandle.price) * riskRewardRatio,
              };
              explanation = `偵測到看跌訂單塊。於 ${formatTimeForExplanation(obCandle.time)} 形成訂單塊 (價格 ${obCandle.price.toFixed(priceDecimals)})，隨後出現強勁下跌。價格於 ${formatTimeForExplanation(currentCandle.time)} 回測此訂單塊區域 (${obLow.toFixed(priceDecimals)} - ${obHigh.toFixed(priceDecimals)})，於 ${currentCandle.price.toFixed(priceDecimals)} 進場做空。`;
            }
          }
        }
        break;
      }
      
      case SMCStrategy.FAIR_VALUE_GAP: {
        if (i >= 2) {
          const p0Candle = priceData[i-2]; 
          const p1Candle = priceData[i-1]; 
          const p2Candle = currentCandle;  
          
          const isP1UpStrong = (p1Candle.price - p0Candle.price) / p0Candle.price > 0.003; 
          if (isP1UpStrong && p0Candle.price < p2Candle.price) { 
            const fvgLowApprox = p0Candle.price; // Simplified FVG low (K0 high approx)
            const fvgHighApprox = p1Candle.price; // Simplified FVG high (K1 low approx - for bullish FVG, this is not standard)
                                              // True bullish FVG: K0.high < K2.low. Gap is between K0.high and K2.low. Entry on retest of this gap.
                                              // Current simplified logic: p1 is strong up, p0 is below p1. Retest zone between p0 and p1.
            
            if (p2Candle.price < fvgHighApprox && p2Candle.price > fvgLowApprox && p2Candle.price < (fvgHighApprox+fvgLowApprox)/2) { 
              tradeSignal = {
                entryTime: p2Candle.time,
                entryPrice: p2Candle.price,
                type: 'LONG',
                stopLoss: fvgLowApprox * 0.998, 
                takeProfit: p2Candle.price + (p2Candle.price - (fvgLowApprox*0.998)) * riskRewardRatio,
              };
              explanation = `偵測到近似看漲公允價值缺口 (FVG)，由 ${formatTimeForExplanation(p0Candle.time)} 之K線 (價格 ${p0Candle.price.toFixed(priceDecimals)}) 與 ${formatTimeForExplanation(p1Candle.time)} 之K線 (價格 ${p1Candle.price.toFixed(priceDecimals)}) 界定 (近似範圍 ${fvgLowApprox.toFixed(priceDecimals)} - ${fvgHighApprox.toFixed(priceDecimals)})。價格於 ${formatTimeForExplanation(p2Candle.time)} 進入此區域並於 ${p2Candle.price.toFixed(priceDecimals)} 進場做多。`;
            }
          }

          const isP1DownStrong = (p0Candle.price - p1Candle.price) / p0Candle.price > 0.003;
          if (isP1DownStrong && p0Candle.price > p2Candle.price) { 
            const fvgHighApprox = p0Candle.price; // Simplified FVG high (K0 low approx)
            const fvgLowApprox = p1Candle.price;  // Simplified FVG low (K1 high approx)
            
             if (p2Candle.price > fvgLowApprox && p2Candle.price < fvgHighApprox && p2Candle.price > (fvgHighApprox+fvgLowApprox)/2) { 
              tradeSignal = {
                entryTime: p2Candle.time,
                entryPrice: p2Candle.price,
                type: 'SHORT',
                stopLoss: fvgHighApprox * 1.002, 
                takeProfit: p2Candle.price - ((fvgHighApprox*1.002) - p2Candle.price) * riskRewardRatio,
              };
              explanation = `偵測到近似看跌公允價值缺口 (FVG)，由 ${formatTimeForExplanation(p0Candle.time)} 之K線 (價格 ${p0Candle.price.toFixed(priceDecimals)}) 與 ${formatTimeForExplanation(p1Candle.time)} 之K線 (價格 ${p1Candle.price.toFixed(priceDecimals)}) 界定 (近似範圍 ${fvgLowApprox.toFixed(priceDecimals)} - ${fvgHighApprox.toFixed(priceDecimals)})。價格於 ${formatTimeForExplanation(p2Candle.time)} 進入此區域並於 ${p2Candle.price.toFixed(priceDecimals)} 進場做空。`;
            }
          }
        }
        break;
      }

      case SMCStrategy.BREAKER_BLOCK: {
        const breakerLookback = 12;
        if (i < breakerLookback + 5) break; // Need sufficient lookback

        // Find previous swing high and low in the lookback period
        const swingLookbackSlice = priceData.slice(i - breakerLookback, i - 3);
        if (swingLookbackSlice.length < 5) break;

        const swingHighPrice = Math.max(...swingLookbackSlice.map(p => p.price));
        const swingLowPrice = Math.min(...swingLookbackSlice.map(p => p.price));
        
        // Find the index of swing high and low in the original data
        const swingHighIndex = priceData.findIndex((p, idx) => 
          idx >= i - breakerLookback && idx < i - 3 && p.price === swingHighPrice);
        const swingLowIndex = priceData.findIndex((p, idx) => 
          idx >= i - breakerLookback && idx < i - 3 && p.price === swingLowPrice);

        // Check for bearish breaker: price breaks above swing high, then fails and breaks swing low
        const recentHigh = Math.max(...priceData.slice(i - 5, i).map(p => p.price));
        const brokeSwingHighRecently = recentHigh > swingHighPrice;
        const currentlyBelowSwingLow = currentCandle.price < swingLowPrice;

        if (brokeSwingHighRecently && currentlyBelowSwingLow && swingHighIndex > -1) {
          // The swing high area becomes a bearish breaker
          const breakerLow = swingHighPrice * 0.999; // Slightly below the original swing high
          const breakerHigh = swingHighPrice * 1.001; // Slightly above the original swing high
          
          // Check if price is retesting the breaker zone
          if (currentCandle.price >= breakerLow && currentCandle.price <= breakerHigh) {
            tradeSignal = {
              entryTime: currentCandle.time,
              entryPrice: currentCandle.price,
              type: 'SHORT',
              stopLoss: breakerHigh * 1.002,
              takeProfit: currentCandle.price - (breakerHigh * 1.002 - currentCandle.price) * riskRewardRatio,
            };
            explanation = `偵測到看跌破壞塊。價格先前突破 ${swingHighPrice.toFixed(priceDecimals)} 擺動高點但未能維持，隨後跌破 ${swingLowPrice.toFixed(priceDecimals)} 擺動低點形成市場結構轉變。原擺動高點區域 (${breakerLow.toFixed(priceDecimals)} - ${breakerHigh.toFixed(priceDecimals)}) 現轉為阻力。於 ${formatTimeForExplanation(currentCandle.time)} 回測此破壞塊，於 ${currentCandle.price.toFixed(priceDecimals)} 進場做空。`;
          }
        }

        // Check for bullish breaker: price breaks below swing low, then fails and breaks swing high
        const recentLow = Math.min(...priceData.slice(i - 5, i).map(p => p.price));
        const brokeSwingLowRecently = recentLow < swingLowPrice;
        const currentlyAboveSwingHigh = currentCandle.price > swingHighPrice;

        if (brokeSwingLowRecently && currentlyAboveSwingHigh && swingLowIndex > -1) {
          // The swing low area becomes a bullish breaker
          const breakerLow = swingLowPrice * 0.999; // Slightly below the original swing low
          const breakerHigh = swingLowPrice * 1.001; // Slightly above the original swing low
          
          // Check if price is retesting the breaker zone
          if (currentCandle.price >= breakerLow && currentCandle.price <= breakerHigh) {
            tradeSignal = {
              entryTime: currentCandle.time,
              entryPrice: currentCandle.price,
              type: 'LONG',
              stopLoss: breakerLow * 0.998,
              takeProfit: currentCandle.price + (currentCandle.price - breakerLow * 0.998) * riskRewardRatio,
            };
            explanation = `偵測到看漲破壞塊。價格先前跌破 ${swingLowPrice.toFixed(priceDecimals)} 擺動低點但未能維持，隨後突破 ${swingHighPrice.toFixed(priceDecimals)} 擺動高點形成市場結構轉變。原擺動低點區域 (${breakerLow.toFixed(priceDecimals)} - ${breakerHigh.toFixed(priceDecimals)}) 現轉為支撐。於 ${formatTimeForExplanation(currentCandle.time)} 回測此破壞塊，於 ${currentCandle.price.toFixed(priceDecimals)} 進場做多。`;
          }
        }
        break;
      }

      case SMCStrategy.LIQUIDITY_SWEEP: {
        const sweepLookback = 10;
        if (i < sweepLookback + 1) break; // Need at least `sweepLookback` candles before the sweep candle.

        // Look for the high/low in the candles *before* the sweep candle.
        const prevDataForSweep = priceData.slice(i - sweepLookback - 1, i - 1);
        if (prevDataForSweep.length < sweepLookback) break;

        const prevHigh = Math.max(...prevDataForSweep.map(p => p.price));
        const prevLow = Math.min(...prevDataForSweep.map(p => p.price));
        const sweepCandle = priceData[i - 1];

        // Bearish sweep: sweep candle takes out prevHigh, current candle reverses below prevHigh.
        if (sweepCandle.price > prevHigh && currentCandle.price < prevHigh) {
          tradeSignal = {
            entryTime: currentCandle.time,
            entryPrice: currentCandle.price,
            type: 'SHORT',
            stopLoss: sweepCandle.price, // Stop is placed at the high of the sweep candle
            takeProfit: currentCandle.price - (sweepCandle.price - currentCandle.price) * riskRewardRatio,
          };
          explanation = `價格於 ${formatTimeForExplanation(sweepCandle.time)} (K線高點 ${sweepCandle.price.toFixed(priceDecimals)}) 掃蕩先前位於 ${prevHigh.toFixed(priceDecimals)} 之高點流動性。隨後於 ${formatTimeForExplanation(currentCandle.time)} 出現反轉結構，於 ${currentCandle.price.toFixed(priceDecimals)} 進場做空。`;
        }
        // Bullish sweep: sweep candle takes out prevLow, current candle reverses above prevLow.
        else if (sweepCandle.price < prevLow && currentCandle.price > prevLow) {
          tradeSignal = {
            entryTime: currentCandle.time,
            entryPrice: currentCandle.price,
            type: 'LONG',
            stopLoss: sweepCandle.price, // Stop is placed at the low of the sweep candle
            takeProfit: currentCandle.price + (currentCandle.price - sweepCandle.price) * riskRewardRatio,
          };
          explanation = `價格於 ${formatTimeForExplanation(sweepCandle.time)} (K線低點 ${sweepCandle.price.toFixed(priceDecimals)}) 掃蕩先前位於 ${prevLow.toFixed(priceDecimals)} 之低點流動性。隨後於 ${formatTimeForExplanation(currentCandle.time)} 出現反轉結構，於 ${currentCandle.price.toFixed(priceDecimals)} 進場做多。`;
        }
        break;
      }
      default:
        break;
    }


    if (tradeSignal && trades.length < 30) { 
      if ((tradeSignal.type === 'LONG' && tradeSignal.entryPrice > tradeSignal.stopLoss && tradeSignal.entryPrice < tradeSignal.takeProfit) ||
          (tradeSignal.type === 'SHORT' && tradeSignal.entryPrice < tradeSignal.stopLoss && tradeSignal.entryPrice > tradeSignal.takeProfit)) {
        
        let trade: Trade = {
          ...tradeSignal,
          id: `trade-${params.instrument}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          outcome: 'PENDING',
          strategy: params.strategy,
          instrument: params.instrument,
          timeFrame: params.timeframe,
          explanation: explanation, // 加入解釋
        };

        for (let j = i + 1; j < priceData.length; j++) {
          const futureCandle = priceData[j];
          if (trade.type === 'LONG') {
            if (futureCandle.price >= trade.takeProfit) {
              trade.outcome = 'WIN';
              trade.exitTime = futureCandle.time;
              trade.exitPrice = trade.takeProfit;
              break;
            }
            if (futureCandle.price <= trade.stopLoss) {
              trade.outcome = 'LOSS';
              trade.exitTime = futureCandle.time;
              trade.exitPrice = trade.stopLoss;
              break;
            }
          } else { 
            if (futureCandle.price <= trade.takeProfit) {
              trade.outcome = 'WIN';
              trade.exitTime = futureCandle.time;
              trade.exitPrice = trade.takeProfit;
              break;
            }
            if (futureCandle.price >= trade.stopLoss) {
              trade.outcome = 'LOSS';
              trade.exitTime = futureCandle.time;
              trade.exitPrice = trade.stopLoss;
              break;
            }
          }
          if (j === priceData.length - 1) { 
            trade.outcome = (trade.type === 'LONG' && futureCandle.price > trade.entryPrice) || (trade.type === 'SHORT' && futureCandle.price < trade.entryPrice) ? 'WIN' : 'LOSS'; 
            if (Math.abs(futureCandle.price - trade.entryPrice) < Math.abs(trade.stopLoss - trade.entryPrice) * 0.1) trade.outcome = 'PENDING';
            trade.exitTime = futureCandle.time;
            trade.exitPrice = futureCandle.price;
          }
        }
        
        if (trade.exitPrice !== undefined) { 
             trade.profit = trade.type === 'LONG' ? trade.exitPrice - trade.entryPrice : trade.entryPrice - trade.exitPrice;
        }

        if (trade.outcome !== 'PENDING') {
          trades.push(trade);
          i += 5; 
        }
      }
    }
  }
  return trades;
};
