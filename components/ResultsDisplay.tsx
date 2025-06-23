
import React from 'react';
import { Trade, FinancialInstrument, getPriceDecimals } from '../types';

interface ResultsDisplayProps {
  trades: Trade[];
  instrument: FinancialInstrument;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ trades, instrument }) => {
  if (trades.length === 0) {
    return <p className="text-center text-gray-400 py-4">沒有可供顯示結果的交易。</p>;
  }

  const priceDecimals = getPriceDecimals(instrument);

  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.outcome === 'WIN').length;
  const losingTrades = trades.filter(t => t.outcome === 'LOSS').length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  
  const totalProfit = trades.reduce((acc, trade) => {
    const tradeProfit = typeof trade.profit === 'number' ? trade.profit : 0;
    return acc + tradeProfit;
  }, 0);

  const grossProfit = trades.filter(t => t.outcome === 'WIN').reduce((sum, t) => sum + (t.profit || 0), 0);
  const grossLoss = trades.filter(t => t.outcome === 'LOSS').reduce((sum, t) => sum + Math.abs(t.profit || 0), 0); 

  const averageWin = winningTrades > 0 ? grossProfit / winningTrades : 0;
  const averageLoss = losingTrades > 0 ? grossLoss / losingTrades : 0;
  
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? Infinity : 0) ;

  const getOutcomeText = (outcome: 'WIN' | 'LOSS' | 'PENDING'): string => {
    switch (outcome) {
      case 'WIN': return '盈利';
      case 'LOSS': return '虧損';
      case 'PENDING': return '處理中';
      default: return outcome;
    }
  };
  
  const formatTimeFromTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  };


  const StatCard: React.FC<{title: string; value: string | number; color?: string; unit?: string}> = ({ title, value, color = 'text-accent', unit='' }) => (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <p className={`text-2xl font-semibold ${color}`}>{typeof value === 'number' ? value.toFixed(2) : value}{unit}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="總交易數" value={totalTrades} />
        <StatCard title="盈利交易" value={winningTrades} color="text-green-400" />
        <StatCard title="虧損交易" value={losingTrades} color="text-red-400" />
        <StatCard title="勝率" value={winRate} unit="%" color={winRate >= 50 ? "text-green-400" : "text-red-400"}/>
        <StatCard title="淨利潤 (點數/價格)" value={totalProfit.toFixed(priceDecimals)} color={totalProfit >=0 ? "text-green-400" : "text-red-400"} />
        <StatCard title="獲利因子" value={isFinite(profitFactor) ? profitFactor : 'N/A'} color={profitFactor >=1 ? "text-green-400" : (profitFactor === 0 ? "text-gray-400" : "text-red-400")} />
      </div>

      <div className="mt-6 max-h-96 overflow-y-auto bg-gray-800 p-4 rounded-lg shadow-inner">
        <h3 className="text-lg font-semibold text-gray-200 mb-3">交易日誌</h3>
        {trades.map(trade => (
          <div key={trade.id} className={`p-3 mb-3 rounded-md text-sm ${trade.outcome === 'WIN' ? 'bg-green-700/30 text-green-300 border-l-4 border-green-500' : (trade.outcome === 'LOSS' ? 'bg-red-700/30 text-red-300 border-l-4 border-red-500' : 'bg-gray-700/30 text-gray-400 border-l-4 border-gray-500')}`}>
            <p><strong>ID:</strong> {trade.id.substring(0,8)} | <strong>策略:</strong> {trade.strategy}</p>
            <p><strong>類型:</strong> {trade.type === 'LONG' ? '做多' : '做空'} | <strong>進場:</strong> {trade.entryPrice.toFixed(priceDecimals)} 於 {formatTimeFromTimestamp(trade.entryTime)}</p>
            <p><strong>停損:</strong> {trade.stopLoss.toFixed(priceDecimals)} | <strong>停利:</strong> {trade.takeProfit.toFixed(priceDecimals)}</p>
            <p><strong>結果:</strong> <span className={`font-semibold ${trade.outcome === 'WIN' ? 'text-green-400' : (trade.outcome === 'LOSS' ? 'text-red-400' : 'text-yellow-400')}`}>{getOutcomeText(trade.outcome)}</span>
            {trade.exitTime && trade.exitPrice && ` 於 ${formatTimeFromTimestamp(trade.exitTime)} (價格: ${trade.exitPrice.toFixed(priceDecimals)})`}
            {trade.profit !== undefined && ` | 利潤: ${trade.profit.toFixed(priceDecimals)}`}
            </p>
            {trade.explanation && (
              <p className="mt-2 pt-2 border-t border-gray-600/50 text-xs text-gray-300">
                <strong>原因說明:</strong> {trade.explanation}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
