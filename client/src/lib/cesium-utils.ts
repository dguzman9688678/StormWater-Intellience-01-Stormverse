// Cesium utility functions for StormVerse

export async function initializeCesium(): Promise<void> {
  // Load Cesium from CDN if not already loaded
  if (typeof window.Cesium === 'undefined') {
    await loadCesiumFromCDN();
  }
  
  // Set Cesium Ion access token (use environment variable or default)
  window.Cesium.Ion.defaultAccessToken = process.env.CESIUM_ION_TOKEN || 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkYWJmMWMzOS04N2FhLTQwYzMtODdjNy04YmY2OWJmZGY4ZGUiLCJpZCI6MjU5LCJpYXQiOjE0OTY4MjA2MjR9.VnWyPb1YpKPgDhX4Y_LYNeM-C3CY6u5jvdXNq7ZxYlA';
}

async function loadCesiumFromCDN(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Load Cesium CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://cesium.com/downloads/cesiumjs/releases/1.118/Build/Cesium/Widgets/widgets.css';
    document.head.appendChild(cssLink);

    // Load Cesium JS
    const script = document.createElement('script');
    script.src = 'https://cesium.com/downloads/cesiumjs/releases/1.118/Build/Cesium/Cesium.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Cesium'));
    document.head.appendChild(script);
  });
}

export function createGlobeViewer(container: HTMLElement): any {
  const viewer = new window.Cesium.Viewer(container, {
    terrainProvider: window.Cesium.createWorldTerrain(),
    timeline: false,
    animation: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    baseLayerPicker: false,
    navigationHelpButton: false,
    fullscreenButton: false,
    vrButton: false,
    infoBox: false,
    selectionIndicator: false,
    shadows: true,
    shouldAnimate: true
  });

  // Configure globe for cyberpunk styling
  viewer.scene.globe.enableLighting = true;
  viewer.scene.globe.atmosphereHueShift = -0.8;
  viewer.scene.globe.atmosphereSaturationShift = 0.1;
  viewer.scene.globe.atmosphereBrightnessShift = -0.4;

  // Enable depth testing for better 3D visualization
  viewer.scene.globe.depthTestAgainstTerrain = true;

  return viewer;
}

export function addWeatherLayer(viewer: any, layerConfig: any): void {
  const imageryProvider = new window.Cesium.WebMapServiceImageryProvider({
    url: layerConfig.url,
    layers: layerConfig.layers,
    parameters: {
      transparent: 'true',
      format: 'image/png'
    }
  });

  viewer.imageryLayers.addImageryProvider(imageryProvider);
}

export function createHurricaneVisualization(viewer: any, hurricaneData: any): void {
  const position = window.Cesium.Cartesian3.fromDegrees(
    hurricaneData.longitude,
    hurricaneData.latitude,
    hurricaneData.altitude || 10000
  );

  // Create hurricane eye
  viewer.entities.add({
    id: `hurricane-${hurricaneData.id}`,
    position: position,
    cylinder: {
      length: 50000,
      topRadius: hurricaneData.eyeRadius || 10000,
      bottomRadius: hurricaneData.eyeRadius || 10000,
      material: window.Cesium.Color.RED.withAlpha(0.4),
      outline: true,
      outlineColor: window.Cesium.Color.RED
    }
  });

  // Create wind field
  const windRadius = hurricaneData.windRadius || 100000;
  viewer.entities.add({
    id: `hurricane-wind-${hurricaneData.id}`,
    position: position,
    ellipse: {
      semiMajorAxis: windRadius,
      semiMinorAxis: windRadius,
      material: window.Cesium.Color.YELLOW.withAlpha(0.2),
      height: 5000,
      outline: true,
      outlineColor: window.Cesium.Color.YELLOW
    }
  });
}

export function animateCameraToLocation(viewer: any, longitude: number, latitude: number): void {
  viewer.camera.flyTo({
    destination: window.Cesium.Cartesian3.fromDegrees(longitude, latitude, 15000000),
    duration: 3.0
  });
}
