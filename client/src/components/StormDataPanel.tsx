import React, { useEffect, useState } from 'react';
import CyberpunkPanel from './ui/cyberpunk-panel';

interface StormMetrics {
  status: string;
  platform: string;
  version: string;
  metrics: {
    totalFiles: number;
    categories: number;
    securityAudits: number;
    lastUpdated: string;
  };
  attribution: string;
}

export default function StormDataPanel() {
  const [metrics, setMetrics] = useState<StormMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStormMetrics = async () => {
      try {
        const response = await fetch('/api/storm/metrics');
        if (!response.ok) {
          throw new Error('Failed to fetch storm metrics');
        }
        const data = await response.json();
        setMetrics(data);
        setError(null);
      } catch (err) {
        console.error('Storm metrics error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStormMetrics();
    const interval = setInterval(fetchStormMetrics, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  if (loading) {
    return (
      <CyberpunkPanel title="STORM DATA" position="bottom-right" className="storm-data-panel">
        <div className="loading-text">Loading storm data...</div>
      </CyberpunkPanel>
    );
  }
  
  if (error || !metrics) {
    return (
      <CyberpunkPanel title="STORM DATA" position="bottom-right" className="storm-data-panel">
        <div className="error-text">Storm data unavailable</div>
      </CyberpunkPanel>
    );
  }
  
  return (
    <CyberpunkPanel title="STORM DATA" position="bottom-right" className="storm-data-panel">
      <div className="storm-metrics">
        <div className="metric-item">
          <span className="metric-label">Platform:</span>
          <span className="metric-value">{metrics.platform}</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Version:</span>
          <span className="metric-value text-cyan-400">v{metrics.version}</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Total Files:</span>
          <span className="metric-value text-green-400">{metrics.metrics.totalFiles}</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Categories:</span>
          <span className="metric-value text-purple-400">{metrics.metrics.categories}</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Security Audits:</span>
          <span className="metric-value text-yellow-400">{metrics.metrics.securityAudits}</span>
        </div>
        <div className="metric-item mt-2 pt-2 border-t border-cyan-800">
          <span className="attribution-text text-xs">{metrics.attribution}</span>
        </div>
      </div>
    </CyberpunkPanel>
  );
}