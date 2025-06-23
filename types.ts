
export enum SMCStrategy {
  ORDER_BLOCK = '訂單塊 (Order Block)',
  BREAKER_BLOCK = '破壞塊 (Breaker Block)',
  FAIR_VALUE_GAP = '公允價值缺口 (FVG)',
  LIQUIDITY_SWEEP = '流動性掃蕩 (Liquidity Sweep)',
  MARKET_STRUCTURE_SHIFT = '市場結構轉變 (MSS)',
}

export enum FinancialInstrument {
  EURUSD = '歐元/美元 (EUR/USD)',
  GBPUSD = '英鎊/美元 (GBP/USD)',
  SPX500 = '標準普爾500指數 (S&P 500)',
  NASDAQ100 = '那斯達克100指數 (NASDAQ 100)',
  GOLD = '黃金 (XAU/USD)',
  OIL = 'WTI原油',
  BTCUSD = '比特幣/美元 (BTC/USD)',
  ETHUSD = '以太坊/美元 (ETH/USD)',
}

export enum TimeFrame {
  M1 = '1 分鐘',
  M5 = '5 分鐘',
  M15 = '15 分鐘',
  H1 = '1 小時',
  H4 = '4 小時',
  D1 = '日線 (1 天)',
}

export interface Trade {
  id: string;
  entryTime: number; // 時間戳 (自UTC 1970年1月1日以來的毫秒數)
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  type: 'LONG' | 'SHORT';
  outcome: 'WIN' | 'LOSS' | 'PENDING'; // PENDING 如果尚未解決
  strategy: SMCStrategy;
  instrument: FinancialInstrument;
  timeFrame: TimeFrame;
  exitTime?: number; // 時間戳
  exitPrice?: number;
  profit?: number; // 可以是R倍數或價格點數
  explanation?: string; // 新增：交易原因的詳細說明
}

export interface SimulatedDataPoint {
  time: number; // JavaScript 時間戳 (自UTC 1970年1月1日以來的毫秒數)
  price: number;
  // 對於更複雜的圖表，可能包含開盤價、最高價、最低價、收盤價
  // open: number;
  // high: number;
  // low: number;
  // close: number;
}

export interface SimulationParams { // 應考慮重命名為 TestParams
  strategy: SMCStrategy;
  instrument: FinancialInstrument;
  timeframe: TimeFrame;
  numDataPoints: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
}

// Types for Strategy Explanation Charts
export enum HighlightType {
  AREA = 'AREA',
  DOT = 'DOT',
  LINE = 'LINE',
}

interface HighlightElementBase {
  id: string;
  type: HighlightType;
  label?: string;
  color?: string;
}

export interface HighlightArea extends HighlightElementBase {
  type: HighlightType.AREA;
  x1: number; // time start
  x2: number; // time end
  y1: number; // price start
  y2: number; // price end
}

export interface HighlightDot extends HighlightElementBase {
  type: HighlightType.DOT;
  x: number; // time
  y: number; // price
  radius?: number;
}

export interface HighlightLine extends HighlightElementBase {
  type: HighlightType.LINE;
  x1?: number; // time start (for vertical line or segment)
  x2?: number; // time end (for vertical line or segment)
  y1?: number; // price start (for horizontal line or segment)
  y2?: number; // price end (for horizontal line or segment)
  isVertical?: boolean; // True for a vertical line spanning y-axis
  isHorizontal?: boolean; // True for a horizontal line spanning x-axis
}

export type HighlightElement = HighlightArea | HighlightDot | HighlightLine;

export interface ExplanationChartData {
  priceData: SimulatedDataPoint[];
  highlights: HighlightElement[];
  timeframe: TimeFrame; // For context if needed, e.g., axis formatting
  instrument: FinancialInstrument; // For context, e.g. price formatting
}


// 輔助函數：根據金融產品獲取價格應顯示的小數位數
export const getPriceDecimals = (instrument: FinancialInstrument): number => {
  switch (instrument) {
    case FinancialInstrument.EURUSD:
    case FinancialInstrument.GBPUSD:
      return 5;
    case FinancialInstrument.SPX500:
    case FinancialInstrument.NASDAQ100:
    case FinancialInstrument.GOLD:
    case FinancialInstrument.OIL:
    case FinancialInstrument.BTCUSD:
    case FinancialInstrument.ETHUSD:
      return 2;
    default:
      // 對於任何其他未明確列出的金融產品的通用備援
      // 檢查產品名稱中是否包含 'JPY' (日圓對通常沒有小數)
      // TypeScript infers 'instrument' as 'never' here because all enum members are covered above.
      // Cast to string to allow string methods, as enum values are strings at runtime.
      if ((instrument as string).includes('JPY')) {
        return 3; // 例如 USDJPY 通常是 3 位小數
      }
      return 4; // 通用預設值
  }
};
