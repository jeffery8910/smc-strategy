
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { SvgCog, SvgInformationCircle } from '../components/Icons';
import { StrategyExplanationChart } from '../components/StrategyExplanationChart';
import { STRATEGIES_DEFINITIONS } from '../constants'; 
import { SMCStrategy } from '../types';

interface StrategyInfoPageProps {
  strategyName: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  originalName: string; 
}

export const StrategyInfoPage: React.FC<StrategyInfoPageProps> = ({ strategyName, description, icon: IconComponent, originalName }) => {
  // Find the full strategy definition which includes explanationChartData
  const currentStrategyDefinition = STRATEGIES_DEFINITIONS.find(def => def.id === originalName as SMCStrategy);

  return (
    <main className="flex-grow container mx-auto p-6 md:p-12">
      <div className="bg-gray-700 p-8 md:p-10 rounded-xl shadow-2xl">
        <div className="flex flex-col md:flex-row items-center mb-6 md:mb-8">
          <IconComponent className="w-12 h-12 md:w-16 md:h-16 text-accent mb-4 md:mb-0 md:mr-6" />
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-100">{strategyName}</h2>
            <p className="text-lg text-gray-400">{originalName}</p>
          </div>
        </div>
        
        <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed mb-10">
          {description.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph.split('\n').map((line, lineIdx) => <React.Fragment key={lineIdx}>{line}<br/></React.Fragment>)}</p>
          ))}
        </div>

        {currentStrategyDefinition && currentStrategyDefinition.explanationChartData && (
          <div className="mb-10">
            <h3 className="text-2xl font-semibold text-gray-200 mb-4 flex items-center">
              <SvgInformationCircle className="w-6 h-6 mr-2 text-blue-400" />
              策略圖解示例
            </h3>
            <StrategyExplanationChart data={currentStrategyDefinition.explanationChartData} />
            <p className="text-xs text-gray-400 mt-2 text-center">
              上圖為簡化示例，用於說明策略核心概念。實際市場情況可能更複雜。
            </p>
          </div>
        )}

        <div className="mt-10 md:mt-12 pt-8 border-t border-gray-600 text-center">
          <Link 
            to="/simulator"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-neutral bg-accent hover:bg-yellow-500 transition-colors shadow-lg transform hover:scale-105"
          >
            <SvgCog className="w-5 h-5 mr-2" />
            前往策略模擬器測試此概念
          </Link>
        </div>
      </div>
    </main>
  );
};
