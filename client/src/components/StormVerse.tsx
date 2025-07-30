import { useEffect, useRef, useState } from "react";
import CesiumGlobe from "./CesiumGlobe";
import AgentNetwork from "./AgentNetwork";
import QuantumArcRenderer from "./QuantumArcRenderer";
import WeatherOverlay from "./WeatherOverlay";
import KMZLoader from "./KMZLoader";
import InteractiveAgentGlobe from "./InteractiveAgentGlobe";
import AgentDeploymentShell from "./AgentDeploymentShell";
import SystemMonitor from "./SystemMonitor";
import StormDataPanel from "./StormDataPanel";
import AttributionFooter from "./AttributionFooter";
import CyberpunkPanel from "./ui/cyberpunk-panel";
import { useStormVerse } from "../lib/stores/useStormVerse";
import { useWeatherData } from "../lib/stores/useWeatherData";
import { useAgents } from "../lib/stores/useAgents";

// TypeScript declarations for WebGL modules
declare global {
  interface Window {
    StormLayerLoader: any;
    QuantumArcRenderer: any;
    StatsOverlay: any;
    stormVerseModules: {
      layerLoader: any;
      quantumRenderer: any;
      statsOverlay: any;
    };
  }
}

export default function StormVerse() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cesiumViewer, setCesiumViewer] = useState<any>(null);
  const { initializeSystem, isInitialized } = useStormVerse();
  const { fetchWeatherData } = useWeatherData();
  const { initializeAgents, activeAgents } = useAgents();

  useEffect(() => {
    initializeSystem();
    initializeAgents();
    
    // Initialize StormVerse modules when available
    const initializeModules = () => {
      if (window.StormLayerLoader && window.QuantumArcRenderer && window.StatsOverlay) {
        console.log('StormVerse WebGL modules loaded');
        
        // These will be initialized when the Cesium viewer is ready
        window.stormVerseModules = {
          layerLoader: null,
          quantumRenderer: null,
          statsOverlay: null
        };
      }
    };
    
    // Check if modules are available
    if (typeof window !== 'undefined') {
      setTimeout(initializeModules, 1000);
    }
    
    // Start real-time weather data fetching
    const weatherInterval = setInterval(() => {
      fetchWeatherData();
    }, 300000); // 5 minutes

    return () => clearInterval(weatherInterval);
  }, [initializeSystem, initializeAgents, fetchWeatherData]);

  if (!isInitialized) {
    return (
      <div className="cyber-loading">
        <div className="loading-matrix">
          <div className="matrix-text">STORM NEXUS INITIALIZING...</div>
        </div>
      </div>
    );
  }

  const handleCesiumViewerReady = (viewer: any) => {
    setCesiumViewer(viewer);
  };

  return (
    <div ref={containerRef} className="stormverse-container">
      {/* Main 3D Globe */}
      <CesiumGlobe onViewerReady={handleCesiumViewerReady} />
      
      {/* Interactive Agent Globe */}
      {cesiumViewer && (
        <InteractiveAgentGlobe 
          viewer={cesiumViewer}
          onAgentSelect={(agent) => console.log('Selected agent:', agent.name)}
        />
      )}
      
      {/* Agent Network Overlay */}
      <AgentNetwork />
      
      {/* Quantum Probability Visualization */}
      <QuantumArcRenderer />
      
      {/* Weather Data Overlay */}
      <WeatherOverlay />
      
      {/* KMZ File Loader */}
      <KMZLoader />
      
      {/* Agent Deployment Shell */}
      <AgentDeploymentShell />
      
      {/* System Monitoring */}
      <SystemMonitor />
      
      {/* Storm Data Integration */}
      <StormDataPanel />
      
      {/* Control Panels */}
      <div className="control-panels">
        <CyberpunkPanel 
          title="STORM CITADEL" 
          position="top-left"
          className="agent-panel"
        >
          <div className="agent-status">
            <div className="status-line">AI CONTROL TOWERS</div>
            <div className="status-indicator active">OPERATIONAL</div>
          </div>
        </CyberpunkPanel>
        
        <CyberpunkPanel 
          title="ARCSEC SECURITY" 
          position="top-right"
          className="security-panel"
        >
          <div className="security-status">
            <div className="status-line">DATA INTEGRITY</div>
            <div className="status-indicator secure">SECURED</div>
          </div>
        </CyberpunkPanel>
        
        <CyberpunkPanel 
          title="NOAA FEED" 
          position="bottom-left"
          className="weather-panel"
        >
          <div className="weather-status">
            <div className="status-line">LIVE WEATHER INTEL</div>
            <div className="status-indicator streaming">STREAMING</div>
          </div>
        </CyberpunkPanel>
        
        <CyberpunkPanel 
          title="QUANTUM ARC" 
          position="bottom-right"
          className="quantum-panel"
        >
          <div className="quantum-status">
            <div className="status-line">PROBABILITY CONES</div>
            <div className="status-indicator computing">COMPUTING</div>
          </div>
        </CyberpunkPanel>
      </div>
      
      {/* Agent Status HUD */}
      <div className="agent-hud">
        {activeAgents.map((agent) => (
          <div key={agent.id} className={`agent-node ${agent.status}`}>
            <div className="agent-name">{agent.name}</div>
            <div className="agent-activity">{agent.activity}</div>
          </div>
        ))}
      </div>
      
      {/* Attribution Footer */}
      <AttributionFooter />
    </div>
  );
}
