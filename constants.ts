
import React from 'react';
import { SMCStrategy, FinancialInstrument, TimeFrame, ExplanationChartData, HighlightType } from './types';
import { SvgCog, SvgChartBar, SvgCurrencyDollar, SvgDocumentText, SvgLightBulb } from './components/Icons';

export interface StrategyDefinition {
  id: SMCStrategy;
  name: string; // User-friendly name, e.g., "訂單塊"
  path: string; // e.g., "/strategy/order-block"
  shortDescription: string; // For HomePage cards
  longDescription: string; // For StrategyInfoPage
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  explanationChartData?: ExplanationChartData;
}

const placeholderExplanationTimeframe = TimeFrame.M15;
const placeholderExplanationInstrument = FinancialInstrument.EURUSD;

export const STRATEGIES_DEFINITIONS: StrategyDefinition[] = [
  {
    id: SMCStrategy.ORDER_BLOCK,
    name: "訂單塊",
    path: "/strategy/order-block",
    icon: SvgCog,
    shortDescription: "識別機構訂單累積的關鍵區域。",
    longDescription: "訂單塊 (Order Block) 策略專注於識別在價格發生大幅度、快速移動之前形成的特定看漲或看跌K線（或K線區域）。這些區域被認為是大型機構參與者（“聰明錢”）建立頭寸的地方。\n\n當價格後續回測到這些訂單塊時，它們可能充當強勁的支撐（看漲OB）或阻力（看跌OB），提供潛在的交易進場點。識別有效的訂單塊通常需要結合市場结构分析、流動性掃蕩確認以及訂單塊形成時的成交量（如果可用）。一個有效的訂單塊通常會導致市場結構的轉變 (MSS)。",
    explanationChartData: {
      instrument: placeholderExplanationInstrument,
      timeframe: placeholderExplanationTimeframe,
      priceData: [
        { time: 1, price: 1.1000 },
        { time: 2, price: 1.0995 },
        { time: 3, price: 1.0985 },
        { time: 4, price: 1.0980 }, // Start of OB (bearish candle before upmove for bullish OB)
        { time: 5, price: 1.0970 }, // OB Low
        { time: 6, price: 1.0975 }, // OB High (end of bearish candle)
        { time: 7, price: 1.0985 },
        { time: 8, price: 1.1020 }, // Strong move up (MSS)
        { time: 9, price: 1.1015 },
        { time: 10, price: 1.1010 },
        { time: 11, price: 1.1005 },
        { time: 12, price: 1.0990 }, // Retest starts
        { time: 13, price: 1.0985 },
        { time: 14, price: 1.0978 }, // Enters OB
        { time: 15, price: 1.0982 },
        { time: 16, price: 1.1005 },
        { time: 17, price: 1.1030 }, // Bounce from OB
        { time: 18, price: 1.1035 },
        { time: 19, price: 1.1040 },
        { time: 20, price: 1.1045 },
      ],
      highlights: [
        { id: 'ob-area', type: HighlightType.AREA, x1: 4.5, x2: 6.5, y1: 1.0970, y2: 1.0980, label: '看漲訂單塊 (Bullish OB)', color: 'rgba(74, 222, 128, 0.35)' },
        { id: 'mss-line', type: HighlightType.LINE, y1: 1.1000, isHorizontal: true, x1: 0.5, x2: 7.8, label: '先前高點 (結構)', color: '#FBBF24', },
        { id: 'mss-break', type: HighlightType.DOT, x: 8, y: 1.1020, label: '市場結構轉變 (MSS)', color: '#FBBF24' },
        { id: 'entry-dot', type: HighlightType.DOT, x: 14, y: 1.0978, label: '回測OB進場', color: '#60A5FA' },
      ],
    },
  },
  {
    id: SMCStrategy.BREAKER_BLOCK,
    name: "破壞塊",
    path: "/strategy/breaker-block",
    icon: SvgChartBar,
    shortDescription: "觀察先前支撐/阻力轉換的區域。",
    longDescription: "破壞塊 (Breaker Block) 策略關注的是當一個支撐位被跌破並轉化為阻力位，或一個阻力位被突破並轉化為支撐位時形成的交易機會。更具體地說，當價格突破一個擺動高點（形成更高高點）後，未能守住該高點並跌破先前的擺動低點（形成市場結構轉變），那麼導致最初突破的那個擺動低點區域（或看跌蠟燭）就可能成為一個看跌破壞塊。反之亦然，適用於看漲破壞塊。\n\n交易者會尋找價格回測到這個“破壞”區域的機會，預期它會阻止價格進一步朝原有趨勢發展。",
    explanationChartData: {
      instrument: placeholderExplanationInstrument,
      timeframe: placeholderExplanationTimeframe,
      priceData: [ // Bearish Breaker example
        { time: 1, price: 1.1000 },
        { time: 2, price: 1.1010 },
        { time: 3, price: 1.1020 }, // Initial high (Swing High 1)
        { time: 4, price: 1.1015 },
        { time: 5, price: 1.1010 }, // Swing Low 1
        { time: 6, price: 1.1018 },
        { time: 7, price: 1.1025 },
        { time: 8, price: 1.1030 }, // Higher High (Swing High 2 - Liquidity taken)
        { time: 9, price: 1.1020 },
        { time: 10, price: 1.1005 },
        { time: 11, price: 1.0990 }, // Price drops, breaks Swing Low 1 (MSS)
        { time: 12, price: 1.0995 },
        { time: 13, price: 1.1000 }, // Retest towards breaker
        { time: 14, price: 1.1005 },
        { time: 15, price: 1.1008 }, // Enters breaker zone
        { time: 16, price: 1.1002 },
        { time: 17, price: 1.0985 },
        { time: 18, price: 1.0980 }, // Rejects from breaker
        { time: 19, price: 1.0975 },
        { time: 20, price: 1.0970 },
      ],
      highlights: [
        { id: 'swing-low-1', type: HighlightType.LINE, y1: 1.1010, isHorizontal: true, x1: 4.5, x2: 10.8, label: '擺動低點', color: '#FBBF24' },
        { id: 'mss-breaker', type: HighlightType.DOT, x: 11, y: 1.0990, label: '跌破結構 (MSS)', color: '#F87171' },
        { id: 'breaker-area', type: HighlightType.AREA, x1: 13, x2: 16.5, y1: 1.1005, y2: 1.1015, label: '看跌破壞塊', color: 'rgba(248, 113, 113, 0.3)' },
        { id: 'entry-breaker', type: HighlightType.DOT, x: 15, y: 1.1008, label: '回測進場', color: '#60A5FA' },
      ],
    },
  },
  {
    id: SMCStrategy.FAIR_VALUE_GAP,
    name: "公允價值缺口",
    path: "/strategy/fvg",
    icon: SvgCurrencyDollar,
    shortDescription: "利用價格回補K線圖中不平衡區域的傾向。",
    longDescription: "公允價值缺口 (Fair Value Gap, FVG)，也稱為價格不平衡 (Imbalance)，是指在三根連續K線模式中，第一根K線的影線末端與第三根K線的影線始端之間存在的價格空隙。這表示市場在某個方向上快速移動，導致買賣訂單不平衡。\n\n此策略基於價格傾向於回測並“填補”這些FVG區域的理念，因為市場尋求效率。交易者可能會在價格回測到FVG的邊緣或中間點時尋找進場機會，預期價格會從FVG反彈並繼續原有趨勢，或者完全填補FVG後反轉。",
    explanationChartData: {
      instrument: placeholderExplanationInstrument,
      timeframe: placeholderExplanationTimeframe,
      priceData: [ // Bullish FVG example
        { time: 1, price: 1.1000 }, // Candle 0
        { time: 2, price: 1.1005 },
        { time: 3, price: 1.1008 },
        { time: 4, price: 1.1010 }, // Candle 1 (its high forms FVG top)
        { time: 5, price: 1.1025 },
        { time: 6, price: 1.1040 }, // Candle 2 (strong move, creates gap)
        { time: 7, price: 1.1035 },
        { time: 8, price: 1.1025 }, // Candle 3 (its low forms FVG bottom)
        { time: 9, price: 1.1022 },
        { time: 10, price: 1.1020 },
        { time: 11, price: 1.1015 }, // Retest starts
        { time: 12, price: 1.1016 },
        { time: 13, price: 1.1018 }, // Enters FVG
        { time: 14, price: 1.1022 },
        { time: 15, price: 1.1030 },
        { time: 16, price: 1.1035 }, // Bounce from FVG
        { time: 17, price: 1.1042 },
        { time: 18, price: 1.1045 },
        { time: 19, price: 1.1048 },
        { time: 20, price: 1.1050 },
      ],
      highlights: [
        { id: 'fvg-area', type: HighlightType.AREA, x1: 6.5, x2: 14.5, y1: 1.1010, y2: 1.1025, label: '看漲FVG (Bullish FVG)', color: 'rgba(96, 165, 250, 0.3)' },
        { id: 'c1-high', type: HighlightType.LINE, x1: 3.5, x2: 4.5, y1: 1.1010, isHorizontal: true, color: 'gray', label: 'K線1高點' },
        { id: 'c3-low', type: HighlightType.LINE, x1: 7.5, x2: 8.5, y1: 1.1025, isHorizontal: true, color: 'gray', label: 'K線3低點' },
        { id: 'entry-fvg', type: HighlightType.DOT, x: 13, y: 1.1018, label: '回測FVG進場', color: '#34D399' },
      ],
    },
  },
  {
    id: SMCStrategy.LIQUIDITY_SWEEP,
    name: "流動性掃蕩",
    path: "/strategy/liquidity-sweep",
    icon: SvgDocumentText,
    shortDescription: "關注價格突破關鍵高低點後的反轉。",
    longDescription: "流動性掃蕩 (Liquidity Sweep) 策略觀察價格突破市場中明顯的先前高點或低點的行為。這些高低點下方或上方通常累積了大量的止損單和掛單（即流動性）。當價格“掃蕩”這些流動性後（即觸發這些訂單），如果它未能持續朝掃蕩方向發展，而是迅速反轉，這可能是一個強烈的信號，表明市場的真實意圖與掃蕩方向相反。\n\n交易者會尋找掃蕩後的反轉結構，例如形成訂單塊或市場結構轉變，作為進場的確認。",
    explanationChartData: {
      instrument: placeholderExplanationInstrument,
      timeframe: placeholderExplanationTimeframe,
      priceData: [ // Liquidity sweep of high, then bearish reversal
        { time: 1, price: 1.1000 },
        { time: 2, price: 1.1005 },
        { time: 3, price: 1.1015 },
        { time: 4, price: 1.1020 }, // Previous High
        { time: 5, price: 1.1012 },
        { time: 6, price: 1.1010 },
        { time: 7, price: 1.1008 },
        { time: 8, price: 1.1015 },
        { time: 9, price: 1.1018 },
        { time: 10, price: 1.1025 }, // Sweeps above prev high
        { time: 11, price: 1.1018 },
        { time: 12, price: 1.1005 }, // Reverses below prev high
        { time: 13, price: 1.1000 },
        { time: 14, price: 1.0995 },
        { time: 15, price: 1.0990 }, // Confirms reversal
        { time: 16, price: 1.0985 },
        { time: 17, price: 1.0980 },
        { time: 18, price: 1.0975 },
      ],
      highlights: [
        { id: 'prev-high', type: HighlightType.LINE, y1: 1.1020, isHorizontal: true, x1: 3.5, x2: 9.8, label: '先前高點 (流動性池)', color: '#FBBF24' },
        { id: 'sweep-dot', type: HighlightType.DOT, x: 10, y: 1.1025, label: '掃蕩高點流動性', radius: 5, color: '#EF4444' },
        { id: 'reversal-entry', type: HighlightType.DOT, x: 13, y: 1.1000, label: '反轉進場 (做空)', color: '#60A5FA' },
      ],
    },
  },
  {
    id: SMCStrategy.MARKET_STRUCTURE_SHIFT,
    name: "市場結構轉變",
    path: "/strategy/mss",
    icon: SvgLightBulb,
    shortDescription: "尋找市場趨勢方向改變的早期信號。",
    longDescription: "市場結構轉變 (Market Structure Shift, MSS)，有時也稱為市場結構突破 (Market Structure Break, MSB)，是SMC分析中的核心概念。它指的是市場從一個趨勢（例如上升趨勢，特徵是連續創出更高的高點HH和更高的低點HL）轉變為另一個趨勢（例如下降趨勢，特徵是連續創出更低的高點LH和更低的低點LL）的過程中所發生的關鍵價格行為。\n\n在上升趨勢中，當價格未能創出新的更高高點，反而跌破了先前的更高低點時，即發生了看跌的MSS。反之，在下降趨勢中，當價格未能創出新的更低低點，反而突破了先前的更低高點時，即發生了看漲的MSS。MSS通常是趨勢可能反轉或至少進入回調的第一個信號。",
    explanationChartData: {
        instrument: placeholderExplanationInstrument,
        timeframe: placeholderExplanationTimeframe,
        priceData: [ // Bullish MSS example (from downtrend to uptrend)
            { time: 1, price: 1.1050 }, // Start of downtrend LH
            { time: 2, price: 1.1035 },
            { time: 3, price: 1.1025 },
            { time: 4, price: 1.1020 }, // LL
            { time: 5, price: 1.1030 },
            { time: 6, price: 1.1040 }, // LH2 (Previous Swing High for MSS)
            { time: 7, price: 1.1025 },
            { time: 8, price: 1.1015 },
            { time: 9, price: 1.1010 }, // Lower Low 2
            { time: 10, price: 1.1020 },
            { time: 11, price: 1.1030 }, // Higher Low (Failure to make new LL)
            { time: 12, price: 1.1045 },
            { time: 13, price: 1.1055 }, // Breaks LH2 (MSS confirmed)
            { time: 14, price: 1.1050 },
            { time: 15, price: 1.1045 }, // Retest (optional)
            { time: 16, price: 1.1052 },
            { time: 17, price: 1.1060 }, // Continues up
            { time: 18, price: 1.1065 },
        ],
        highlights: [
            { id: 'prev-lh', type: HighlightType.LINE, y1: 1.1040, isHorizontal: true, x1: 5.5, x2: 12.8, label: '先前擺動高點 (LH)', color: '#FBBF24'},
            { id: 'mss-dot', type: HighlightType.DOT, x: 13, y: 1.1055, label: '市場結構轉變 (MSS)', radius: 5, color: '#34D399' },
            { id: 'potential-entry', type: HighlightType.DOT, x: 15, y: 1.1045, label: '潛在進場點', color: '#60A5FA' }
        ]
    }
  },
];

export const STRATEGY_OPTIONS: { value: SMCStrategy; label: string }[] = STRATEGIES_DEFINITIONS.map(s => ({
  value: s.id,
  label: `${s.name} (${s.id.split('(')[1].replace(')','')})`, // e.g. "訂單塊 (Order Block)"
}));


export const INSTRUMENT_OPTIONS: { value: FinancialInstrument; label: string }[] = Object.values(FinancialInstrument).map(instrument => ({
  value: instrument,
  label: instrument,
}));

export const TIMEFRAME_OPTIONS: { value: TimeFrame; label: string }[] = Object.values(TimeFrame).map(timeframe => ({
  value: timeframe,
  label: timeframe,
}));
