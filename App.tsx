import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { StrategyInfoPage } from './pages/StrategyInfoPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { STRATEGIES_DEFINITIONS } from './constants';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-neutral to-gray-800 text-gray-100">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/simulator" element={<SimulatorPage />} />
        
        {STRATEGIES_DEFINITIONS.map(strategyDef => (
          <Route 
            key={strategyDef.id}
            path={strategyDef.path} 
            element={
              <StrategyInfoPage
                strategyName={strategyDef.name}
                description={strategyDef.longDescription}
                icon={strategyDef.icon}
                originalName={strategyDef.id}
              />
            } 
          />
        ))}
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="text-center p-4 text-sm text-gray-400 border-t border-gray-700 mt-auto">
        SMC 策略測試器 &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
