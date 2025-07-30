import React, { useEffect, useState } from 'react';
import { useStormVerse } from '../lib/stores/useStormVerse';
import { useWeatherData } from '../lib/stores/useWeatherData';
import { useAgents } from '../lib/stores/useAgents';
import { stormWaterIntegration } from '../lib/stormwater-integration';
import CyberpunkPanel from './ui/cyberpunk-panel';

interface SystemMetrics {
  apiStatus: 'connected' | 'fallback' | 'error';
  dataSource: string;
  lastUpdate: Date | null;
  agentCount: number;
  activeConnections: number;
}

export default function SystemMonitor() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    apiStatus: 'fallback',
    dataSource: 'Initializing...',
    lastUpdate: null,
    agentCount: 0,
    activeConnections: 0
  });

  const { isInitialized } = useStormVerse();
  const { weatherData, error: weatherError, lastUpdated } = useWeatherData();
  const { activeAgents } = useAgents();

  useEffect(() => {
    // Update system metrics based on current state
    const updateMetrics = () => {
      const apiStatus = weatherError ? 'error' : 
                       weatherData?.source?.includes('DEMO') ? 'fallback' : 'connected';
      
      setMetrics({
        apiStatus,
        dataSource: weatherData?.source || 'No data',
        lastUpdate: weatherData?.lastUpdated || lastUpdated || null,
        agentCount: activeAgents.length,
        activeConnections: activeAgents.filter(agent => agent.status === 'active').length
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [weatherData, weatherError, activeAgents]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'fallback': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'LIVE DATA';
      case 'fallback': return 'DEMO MODE';
      case 'error': return 'OFFLINE';
      default: return 'UNKNOWN';
    }
  };

  if (!isInitialized) return null;

  return (
    <CyberpunkPanel 
      title="SYSTEM STATUS" 
      position="top-right"
      className="system-monitor"
    >
      <div className="system-metrics space-y-2">
        <div className="metric-row">
          <span className="metric-label">API Status:</span>
          <span className={`metric-value ${getStatusColor(metrics.apiStatus)}`}>
            {getStatusText(metrics.apiStatus)}
          </span>
        </div>
        
        <div className="metric-row">
          <span className="metric-label">Data Source:</span>
          <span className="metric-value text-cyan-400">
            {metrics.dataSource}
          </span>
        </div>
        
        {metrics.lastUpdate && (
          <div className="metric-row">
            <span className="metric-label">Last Update:</span>
            <span className="metric-value text-blue-400">
              {metrics.lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        )}
        
        <div className="metric-row">
          <span className="metric-label">Agents:</span>
          <span className="metric-value text-purple-400">
            {metrics.activeConnections}/{metrics.agentCount}
          </span>
        </div>
        
        {weatherError && (
          <div className="metric-row">
            <span className="metric-label text-red-400">Error:</span>
            <span className="metric-value text-red-300 text-xs">
              {weatherError}
            </span>
          </div>
        )}
        
        <div className="metric-row mt-2 pt-2 border-t border-cyan-800">
          <span className="metric-label text-xs">Platform:</span>
          <span className="metric-value text-xs text-gray-400">
            StormWater v{stormWaterIntegration.getMetadata().version}
          </span>
        </div>
      </div>
    </CyberpunkPanel>
  );
}