import React from 'react';
import { Link } from 'react-router-dom';

const navigationItems = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/globe', label: 'Globe View', icon: '🌍' },
  { path: '/monitor', label: 'System Monitor', icon: '📊' },
  { path: '/diagnostics', label: 'Diagnostics', icon: '🔍' },
  { path: '/quantum', label: 'Quantum Analysis', icon: '⚛️' },
  { path: '/database', label: 'Database', icon: '💾' },
  { path: '/metadata', label: 'Metadata', icon: '📋' },
  { path: '/analysis', label: 'Analysis Docs', icon: '📄' },
  { path: '/agents', label: 'AI Agents', icon: '🤖' }
];

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-black/90 backdrop-blur-sm border-b border-cyan-800 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <span className="text-cyan-400 font-bold text-xl">StormVerse</span>
            <span className="text-xs text-gray-500">© 2025 Daniel Guzman</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {navigationItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-300 hover:text-cyan-400 transition-colors rounded hover:bg-cyan-900/20"
              >
                <span>{item.icon}</span>
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            ))}
          </div>
          
          <div className="flex items-center">
            <span className="text-xs text-red-400 font-mono animate-pulse">
              ARCSEC v3.0X
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}