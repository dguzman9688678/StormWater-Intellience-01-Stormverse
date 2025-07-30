// Cesium.js - Local fallback for Cesium library
// This file provides a minimal Cesium implementation for offline/fallback scenarios

(function() {
  'use strict';
  
  console.log('Loading local Cesium fallback...');
  
  // Check if Cesium is already loaded from CDN
  if (window.Cesium && window.Cesium.Viewer) {
    console.log('Cesium already loaded from CDN, skipping local fallback');
    return;
  }
  
  // Create minimal Cesium namespace for fallback
  window.Cesium = window.Cesium || {};
  
  // Ion configuration
  window.Cesium.Ion = {
    defaultAccessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkYWJmMWMzOS04N2FhLTQwYzMtODdjNy04YmY2OWJmZGY4ZGUiLCJpZCI6MjU5LCJpYXQiOjE0OTY4MjA2MjR9.VnWyPb1YpKPgDhX4Y_LYNeM-C3CY6u5jvdXNq7ZxYlA'
  };
  
  // Basic math utilities
  window.Cesium.Math = {
    PI_OVER_TWO: Math.PI / 2,
    toRadians: function(degrees) {
      return degrees * Math.PI / 180;
    },
    toDegrees: function(radians) {
      return radians * 180 / Math.PI;
    }
  };
  
  // Color utilities
  window.Cesium.Color = function(red, green, blue, alpha) {
    this.red = red || 0;
    this.green = green || 0;
    this.blue = blue || 0;
    this.alpha = alpha !== undefined ? alpha : 1;
  };
  
  window.Cesium.Color.RED = new window.Cesium.Color(1, 0, 0, 1);
  window.Cesium.Color.GREEN = new window.Cesium.Color(0, 1, 0, 1);
  window.Cesium.Color.BLUE = new window.Cesium.Color(0, 0, 1, 1);
  window.Cesium.Color.CYAN = new window.Cesium.Color(0, 1, 1, 1);
  window.Cesium.Color.YELLOW = new window.Cesium.Color(1, 1, 0, 1);
  window.Cesium.Color.WHITE = new window.Cesium.Color(1, 1, 1, 1);
  window.Cesium.Color.BLACK = new window.Cesium.Color(0, 0, 0, 1);
  window.Cesium.Color.ORANGE = new window.Cesium.Color(1, 0.5, 0, 1);
  
  window.Cesium.Color.fromCssColorString = function(color) {
    // Basic CSS color parsing
    const hex = color.replace('#', '');
    if (hex.length === 6) {
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;
      return new window.Cesium.Color(r, g, b, 1);
    }
    return window.Cesium.Color.WHITE;
  };
  
  window.Cesium.Color.prototype.withAlpha = function(alpha) {
    return new window.Cesium.Color(this.red, this.green, this.blue, alpha);
  };
  
  // Cartesian3 utilities
  window.Cesium.Cartesian3 = function(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
  };
  
  window.Cesium.Cartesian3.fromDegrees = function(longitude, latitude, height) {
    // Simplified conversion for fallback
    const x = longitude * 111320 * Math.cos(latitude * Math.PI / 180);
    const y = latitude * 110540;
    const z = height || 0;
    return new window.Cesium.Cartesian3(x, y, z);
  };
  
  window.Cesium.Cartesian3.fromRadians = function(longitude, latitude, height) {
    return window.Cesium.Cartesian3.fromDegrees(
      longitude * 180 / Math.PI,
      latitude * 180 / Math.PI,
      height
    );
  };
  
  window.Cesium.Cartesian3.lerp = function(start, end, t, result) {
    result = result || new window.Cesium.Cartesian3();
    result.x = start.x + (end.x - start.x) * t;
    result.y = start.y + (end.y - start.y) * t;
    result.z = start.z + (end.z - start.z) * t;
    return result;
  };
  
  // Cartesian2 for screen coordinates
  window.Cesium.Cartesian2 = function(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  };
  
  // Cartographic utilities
  window.Cesium.Cartographic = function(longitude, latitude, height) {
    this.longitude = longitude || 0;
    this.latitude = latitude || 0;
    this.height = height || 0;
  };
  
  window.Cesium.Cartographic.fromCartesian = function(cartesian) {
    // Simplified conversion
    const longitude = Math.atan2(cartesian.y, cartesian.x);
    const latitude = Math.asin(cartesian.z / Math.sqrt(cartesian.x * cartesian.x + cartesian.y * cartesian.y + cartesian.z * cartesian.z));
    return new window.Cesium.Cartographic(longitude, latitude, cartesian.z);
  };
  
  // Basic viewer implementation
  window.Cesium.Viewer = function(container, options) {
    this.container = container;
    this.scene = {
      globe: {
        baseColor: window.Cesium.Color.BLUE,
        enableLighting: true,
        atmosphereHueShift: 0,
        atmosphereSaturationShift: 0,
        atmosphereBrightnessShift: 0,
        depthTestAgainstTerrain: false
      },
      fog: {
        enabled: false,
        density: 0.0002,
        minimumBrightness: 0.03
      },
      skyBox: null,
      camera: {
        setView: function(options) {
          console.log('Camera view set:', options);
        },
        flyTo: function(options) {
          console.log('Camera flying to:', options);
        }
      },
      canvas: container
    };
    
    this.entities = {
      values: [],
      add: function(entity) {
        entity.id = entity.id || 'entity_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.values.push(entity);
        console.log('Entity added:', entity.id);
        return entity;
      },
      remove: function(entity) {
        const index = this.values.indexOf(entity);
        if (index > -1) {
          this.values.splice(index, 1);
          console.log('Entity removed:', entity.id);
        }
      },
      getById: function(id) {
        return this.values.find(entity => entity.id === id);
      }
    };
    
    this.dataSources = {
      add: function(dataSource) {
        console.log('Data source added:', dataSource);
        return Promise.resolve(dataSource);
      },
      remove: function(dataSource) {
        console.log('Data source removed:', dataSource);
      },
      getByName: function(name) {
        return [];
      }
    };
    
    this.imageryLayers = {
      addImageryProvider: function(provider) {
        console.log('Imagery provider added:', provider);
      }
    };
    
    this.camera = this.scene.camera;
    
    // Create canvas fallback
    this.canvas = document.createElement('canvas');
    this.canvas.width = container.clientWidth || 800;
    this.canvas.height = container.clientHeight || 600;
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.background = 'linear-gradient(to bottom, #001122 0%, #003366 100%)';
    container.appendChild(this.canvas);
    
    // Add fallback message
    const fallbackMessage = document.createElement('div');
    fallbackMessage.style.cssText =
      'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); ' +
      'color: #00ffff; font-family: Inter, monospace; font-size: 1.2rem; ' +
      'text-align: center; text-shadow: 0 0 20px #00ffff; z-index: 1000; ' +
      'background: rgba(0, 0, 0, 0.8); padding: 2rem; border-radius: 8px; ' +
      'border: 2px solid #00ffff;';
    fallbackMessage.innerHTML = 
      'STORMVERSE FALLBACK MODE<br>' +
      '<small style="font-size: 0.8rem; opacity: 0.8;">Cesium 3D Globe unavailable<br>' +
      'Check network connection or use full CDN version</small>';
    container.appendChild(fallbackMessage);
    
    console.log('Cesium Viewer fallback initialized');
  };
  
  window.Cesium.Viewer.prototype.destroy = function() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    console.log('Cesium Viewer destroyed');
  };
  
  window.Cesium.Viewer.prototype.flyTo = function(target) {
    console.log('Flying to target:', target);
    return Promise.resolve();
  };
  
  // Material properties
  window.Cesium.PolylineGlowMaterialProperty = function(options) {
    this.glowPower = options.glowPower || 0.1;
    this.color = options.color || window.Cesium.Color.WHITE;
  };
  
  // Terrain provider
  window.Cesium.createWorldTerrain = function() {
    return {
      type: 'WorldTerrain'
    };
  };
  
  // KML data source
  window.Cesium.KmlDataSource = {
    load: function(file, options) {
      console.log('KML loading (fallback):', file);
      return Promise.resolve({
        entities: {
          values: []
        }
      });
    }
  };
  
  // WebMapService imagery provider
  window.Cesium.WebMapServiceImageryProvider = function(options) {
    this.url = options.url;
    this.layers = options.layers;
    this.parameters = options.parameters || {};
    console.log('WebMapService imagery provider created (fallback)');
  };
  
  // SkyBox
  window.Cesium.SkyBox = function(options) {
    this.sources = options.sources;
    console.log('SkyBox created (fallback)');
  };
  
  // Height reference
  window.Cesium.HeightReference = {
    NONE: 0,
    CLAMP_TO_GROUND: 1,
    RELATIVE_TO_GROUND: 2
  };
  
  // Near/Far scalar
  window.Cesium.NearFarScalar = function(near, nearValue, far, farValue) {
    this.near = near;
    this.nearValue = nearValue;
    this.far = far;
    this.farValue = farValue;
  };
  
  // Label style
  window.Cesium.LabelStyle = {
    FILL: 0,
    OUTLINE: 1,
    FILL_AND_OUTLINE: 2
  };
  
  console.log('Cesium fallback library loaded');
  
  // Load actual Cesium if network is available
  if (navigator.onLine) {
    setTimeout(() => {
      const script = document.createElement('script');
      script.src = 'https://cesium.com/downloads/cesiumjs/releases/1.118/Build/Cesium/Cesium.js';
      script.onload = () => {
        console.log('Full Cesium library loaded from CDN');
        // Trigger a custom event to notify the app
        window.dispatchEvent(new CustomEvent('cesium-loaded', { detail: 'cdn' }));
      };
      script.onerror = () => {
        console.log('CDN Cesium failed to load, using fallback');
        window.dispatchEvent(new CustomEvent('cesium-loaded', { detail: 'fallback' }));
      };
      document.head.appendChild(script);
    }, 100);
  } else {
    console.log('Offline mode detected, using Cesium fallback');
    window.dispatchEvent(new CustomEvent('cesium-loaded', { detail: 'fallback' }));
  }
})();
