import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { SvgPresentationChartLine, SvgListBullet, SvgXMark, SvgCog } from './Icons'; // SvgCog for Simulator
import { STRATEGIES_DEFINITIONS } from '../constants';


export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const linkClass = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const activeLinkClass = "bg-accent text-neutral";
  const inactiveLinkClass = "text-gray-300 hover:bg-gray-700 hover:text-white";

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => 
    `${linkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`;
  
  const strategyLinks = STRATEGIES_DEFINITIONS.map(s => ({ path: s.path, label: s.name }));

  return (
    <header className="bg-primary shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center text-white hover:text-accent transition-colors">
            <SvgPresentationChartLine className="w-12 h-12 mr-2 md:mr-3" />
            <h1 className="text-xl md:text-3xl font-bold">SMC 策略測試器</h1>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <NavLink to="/" className={getNavLinkClass} end>首頁</NavLink>
            
            {/* Strategies Dropdown Concept (Simplified as direct links for now) */}
            {/* For a dropdown, you'd wrap this in a dropdown component */}
            <div className="relative group">
                <button className={`${linkClass} ${inactiveLinkClass} flex items-center`}>
                  策略介紹
                  <svg className="w-4 h-4 ml-1 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                </button>
                <div className="absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out z-50 invisible group-hover:visible">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {strategyLinks.map(link => (
                          <NavLink 
                            key={link.path} 
                            to={link.path} 
                            className={({ isActive }) => `${isActive ? 'bg-accent text-neutral' : 'text-gray-200 hover:bg-gray-600 hover:text-white'} block px-4 py-2 text-sm`}
                            onClick={() => setIsMobileMenuOpen(false)} // Close mobile menu if open
                          >
                            {link.label}
                          </NavLink>
                        ))}
                    </div>
                </div>
            </div>

            <NavLink to="/simulator" className={getNavLinkClass}>
              <div className="flex items-center">
                <SvgCog className="w-4 h-4 mr-1.5" /> 策略模擬器
              </div>
            </NavLink>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none focus:text-white p-2 rounded-md hover:bg-gray-700"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <SvgXMark className="h-6 w-6" /> : <SvgListBullet className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-primary shadow-lg py-2 z-40">
          <nav className="flex flex-col space-y-1 px-2 pt-2 pb-3">
            <NavLink to="/" className={getNavLinkClass} end onClick={() => setIsMobileMenuOpen(false)}>首頁</NavLink>
            <NavLink to="/simulator" className={getNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                <div className="flex items-center">
                    <SvgCog className="w-4 h-4 mr-1.5" /> 策略模擬器
                </div>
            </NavLink>
            <p className="px-3 pt-2 pb-1 text-xs text-gray-400 uppercase">策略介紹</p>
            {strategyLinks.map(link => (
              <NavLink key={link.path} to={link.path} className={getNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
