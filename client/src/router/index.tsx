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
import NotFound from '../pages/not-found';

// Layout wrapper for standalone panels
const PanelLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="container mx-auto">
        {children}
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
    path: '*',
    element: <NotFound />
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}