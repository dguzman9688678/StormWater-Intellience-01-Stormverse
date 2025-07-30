import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import StormVerse from '../components/StormVerse';
import CesiumGlobe from '../components/CesiumGlobe';
import SystemMonitor from '../components/SystemMonitor';
import DiagnosticsPanel from '../components/DiagnosticsPanel';
import QuantumAnalysisPanel from '../components/QuantumAnalysisPanel';
import DatabasePanel from '../components/DatabasePanel';
import MetadataPanel from '../components/MetadataPanel';
import AnalysisPanel from '../components/AnalysisPanel';
import AgentNetwork from '../components/AgentNetwork';
import WorldStatus from '../components/WorldStatus';
import PodcastPlayer from '../components/PodcastPlayer';
import EnvironmentalImpactVisualizer from '../components/EnvironmentalImpactVisualizer';
import Navigation from '../components/Navigation';
import NotFound from '../pages/not-found';

// Layout wrapper for standalone panels
const PanelLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <div className="pt-16 p-8">
        <div className="container mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// Create router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <StormVerse />,
    errorElement: <NotFound />
  },
  {
    path: '/globe',
    element: <CesiumGlobe />
  },
  {
    path: '/monitor',
    element: (
      <PanelLayout>
        <SystemMonitor />
      </PanelLayout>
    )
  },
  {
    path: '/diagnostics',
    element: (
      <PanelLayout>
        <DiagnosticsPanel />
      </PanelLayout>
    )
  },
  {
    path: '/quantum',
    element: (
      <PanelLayout>
        <QuantumAnalysisPanel />
      </PanelLayout>
    )
  },
  {
    path: '/database',
    element: (
      <PanelLayout>
        <DatabasePanel />
      </PanelLayout>
    )
  },
  {
    path: '/monitor',
    element: (
      <PanelLayout>
        <SystemMonitor />
      </PanelLayout>
    )
  },
  {
    path: '/metadata',
    element: (
      <PanelLayout>
        <MetadataPanel />
      </PanelLayout>
    )
  },
  {
    path: '/analysis',
    element: (
      <PanelLayout>
        <AnalysisPanel />
      </PanelLayout>
    )
  },
  {
    path: '/agents',
    element: (
      <PanelLayout>
        <AgentNetwork />
      </PanelLayout>
    )
  },
  {
    path: '/world',
    element: (
      <PanelLayout>
        <WorldStatus />
      </PanelLayout>
    )
  },
  {
    path: '/podcasts',
    element: (
      <PanelLayout>
        <PodcastPlayer />
      </PanelLayout>
    )
  },
  {
    path: '/control',
    element: (
      <PanelLayout>
        <div className="control-center-grid">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="control-panel">
              <h2 className="text-xl font-bold text-cyan-400 mb-4">System Monitor</h2>
              <SystemMonitor />
            </div>
            <div className="control-panel">
              <h2 className="text-xl font-bold text-cyan-400 mb-4">Diagnostics</h2>
              <DiagnosticsPanel />
            </div>
            <div className="control-panel">
              <h2 className="text-xl font-bold text-cyan-400 mb-4">Quantum Analysis</h2>
              <QuantumAnalysisPanel />
            </div>
            <div className="control-panel">
              <h2 className="text-xl font-bold text-cyan-400 mb-4">Database</h2>
              <DatabasePanel />
            </div>
          </div>
        </div>
      </PanelLayout>
    )
  },
  {
    path: '/graph',
    element: (
      <PanelLayout>
        <div className="graph-visualization">
          <h1 className="text-2xl font-bold text-cyan-400 mb-6">StormVerse Network Graph</h1>
          <div className="graph-container bg-gray-900 border border-cyan-500 rounded-lg p-6">
            <div className="graph-nodes">
              <div className="network-diagram">
                <div className="node-cluster">
                  <div className="central-node">STORMVERSE</div>
                  <div className="agent-nodes">
                    <div className="agent-node jarvis">JARVIS</div>
                    <div className="agent-node storm">STORM</div>
                    <div className="agent-node ultron">ULTRON</div>
                    <div className="agent-node phoenix">PHOENIX</div>
                    <div className="agent-node odin">ODIN</div>
                    <div className="agent-node echo">ECHO</div>
                    <div className="agent-node mito">MITO</div>
                    <div className="agent-node vader">VADER</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PanelLayout>
    )
  },
  {
    path: '/environmental',
    element: (
      <PanelLayout>
        <EnvironmentalImpactVisualizer />
      </PanelLayout>
    )
  },
  {
    path: '*',
    element: <NotFound />
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}