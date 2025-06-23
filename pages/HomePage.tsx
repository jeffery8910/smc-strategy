import React from 'react';
import { Link } from 'react-router-dom';
import { STRATEGIES_DEFINITIONS } from '../constants';
import { SvgArrowRightCircle, SvgCog } from '../components/Icons';

export const HomePage: React.FC = () => {
  return (
    <main className="flex-grow container mx-auto p-6 md:p-12">
      <section className="text-center bg-gray-700 p-8 md:p-12 rounded-xl shadow-2xl mb-12 transform hover:scale-[1.02] transition-transform duration-300">
        <h2 className="text-4xl md:text-5xl font-bold text-accent mb-6">歡迎使用 SMC 策略測試器</h2>
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          探索各種基於智能貨幣概念 (Smart Money Concepts) 的交易策略，並在模擬的歷史數據上互動測試它們的表現。
        </p>
        <Link 
          to="/simulator" 
          className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-neutral bg-accent hover:bg-yellow-500 transition-colors shadow-lg transform hover:scale-105"
        >
          <SvgCog className="w-5 h-5 mr-2" /> 前往策略模擬器
        </Link>
      </section>

      <section>
        <h3 className="text-3xl font-semibold text-gray-200 mb-8 text-center">了解交易策略</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {STRATEGIES_DEFINITIONS.map((strategy) => {
            const IconComponent = strategy.icon;
            return (
              <Link 
                to={strategy.path} 
                key={strategy.id} 
                className="block bg-gray-750 p-6 rounded-lg shadow-xl hover:shadow-accent/50 hover:bg-gray-600 transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <div className="flex items-center mb-4">
                  <IconComponent className="w-8 h-8 text-accent" />
                  <h4 className="text-xl font-semibold text-gray-100 ml-4">{strategy.name}</h4>
                </div>
                <p className="text-gray-300 mb-4 text-sm">{strategy.shortDescription}</p>
                <div className="flex items-center text-accent group-hover:text-yellow-300 transition-colors">
                  <span>閱讀策略詳情</span>
                  <SvgArrowRightCircle className="w-5 h-5 ml-2" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      
      <section className="mt-16 text-center bg-gray-700 p-8 rounded-xl shadow-xl">
        <h3 className="text-2xl font-semibold text-gray-200 mb-4">如何使用？</h3>
        <div className="text-gray-300 max-w-3xl mx-auto space-y-3 text-left">
            <p>1. <strong>了解策略：</strong> 從上方導覽欄的「策略介紹」或主頁的卡片中選擇您感興趣的SMC策略，閱讀其詳細說明和原理。</p>
            <p>2. <strong>前往模擬器：</strong> 點擊導覽欄中的「策略模擬器」或主頁上的按鈕進入測試環境。</p>
            <p>3. <strong>設定參數：</strong> 在模擬器頁面，您可以選擇要測試的交易策略、金融產品、時間週期和回溯開始時間。</p>
            <p>4. <strong>運行測試：</strong> 點擊「運行測試」按鈕，系統將在模擬數據上執行所選策略。</p>
            <p>5. <strong>分析結果：</strong> 在圖表上觀察交易信號，並在結果區域分析績效指標和詳細的交易日誌。</p>
        </div>
      </section>
    </main>
  );
};
