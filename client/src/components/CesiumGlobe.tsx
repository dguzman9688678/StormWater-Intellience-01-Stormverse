import { useEffect, useRef } from "react";
import { useStormVerse } from "../lib/stores/useStormVerse";
import { initializeCesium, createGlobeViewer } from "../lib/cesium-utils";

interface CesiumGlobeProps {
  className?: string;
  onViewerReady?: (viewer: any) => void;
}

export default function CesiumGlobe({ className, onViewerReady }: CesiumGlobeProps) {
  const cesiumContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const { setViewer, addLayer } = useStormVerse();

  useEffect(() => {
    if (!cesiumContainerRef.current) return;

    // Initialize Cesium
    initializeCesium().then(() => {
      const viewer = createGlobeViewer(cesiumContainerRef.current!);
      viewerRef.current = viewer;
      setViewer(viewer);
      
      // Notify parent component that viewer is ready
      if (onViewerReady) {
        onViewerReady(viewer);
      }

      // Configure globe appearance for cyberpunk theme
      viewer.scene.globe.baseColor = window.Cesium.Color.fromCssColorString('#0a0a0f');
      viewer.scene.skyBox = new window.Cesium.SkyBox({
        sources: {
          positiveX: '/textures/sky.png',
          negativeX: '/textures/sky.png',
          positiveY: '/textures/sky.png',
          negativeY: '/textures/sky.png',
          positiveZ: '/textures/sky.png',
          negativeZ: '/textures/sky.png'
        }
      });

      // Add atmospheric effects
      viewer.scene.fog.enabled = true;
      viewer.scene.fog.density = 0.0002;
      viewer.scene.fog.minimumBrightness = 0.03;

      // Set initial camera position
      viewer.camera.setView({
        destination: window.Cesium.Cartesian3.fromDegrees(-95.0, 40.0, 15000000.0),
        orientation: {
          heading: 0.0,
          pitch: -window.Cesium.Math.PI_OVER_TWO,
          roll: 0.0
        }
      });

      // Add base layers
      addLayer({
        id: 'weather-base',
        type: 'imagery',
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
        alpha: 0.7
      });

      // Initialize StormVerse WebGL modules
      if (window.StormLayerLoader && window.QuantumArcRenderer && window.StatsOverlay) {
        try {
          // Initialize Storm Layer Loader
          const layerLoader = new window.StormLayerLoader(viewer);
          
          // Initialize Quantum Arc Renderer
          const quantumRenderer = new window.QuantumArcRenderer(viewer);
          
          // Initialize Stats Overlay
          const statsOverlay = new window.StatsOverlay(viewer);
          
          // Store references globally for access from other components
          window.stormVerseModules = {
            layerLoader,
            quantumRenderer,
            statsOverlay
          };
          
          console.log('StormVerse WebGL modules initialized successfully');
          
          // Load sample hurricane data to demonstrate functionality
          setTimeout(() => {
            loadSampleHurricaneData(quantumRenderer);
          }, 2000);
          
        } catch (error) {
          console.error('Failed to initialize StormVerse modules:', error);
        }
      } else {
        console.warn('StormVerse WebGL modules not available yet');
      }
    });

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }
    };
  }, [setViewer, addLayer]);

  // Function to load sample hurricane data for demonstration
  const loadSampleHurricaneData = (quantumRenderer: any) => {
    const sampleHurricaneTrack = {
      id: 'AL052024',
      name: 'Hurricane Delta Demo',
      forecast: [
        { longitude: -80.0, latitude: 25.0, probability: 0.95, time: 0, windSpeed: 115 },
        { longitude: -78.5, latitude: 27.0, probability: 0.88, time: 6, windSpeed: 120 },
        { longitude: -77.0, latitude: 29.0, probability: 0.82, time: 12, windSpeed: 125 },
        { longitude: -75.5, latitude: 31.0, probability: 0.75, time: 18, windSpeed: 130 },
        { longitude: -74.0, latitude: 33.0, probability: 0.68, time: 24, windSpeed: 135 }
      ]
    };

    quantumRenderer.createProbabilityCone(sampleHurricaneTrack, {
      agent: 'STORM_CITADEL',
      coneColor: '#ff6b6b'
    });

    console.log('Sample hurricane prediction data loaded');
  };

  return (
    <div 
      ref={cesiumContainerRef}
      className={`cesium-container ${className || ''}`}
      style={{
        width: '100%',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        fontFamily: 'Inter, sans-serif'
      }}
    />
  );
}
