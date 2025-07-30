import { useEffect, useRef } from "react";
import { useStormVerse } from "../lib/stores/useStormVerse";
import { initializeCesium, createGlobeViewer } from "../lib/cesium-utils";

export default function CesiumGlobe() {
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
    });

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }
    };
  }, [setViewer, addLayer]);

  return (
    <div 
      ref={cesiumContainerRef}
      className="cesium-container"
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
