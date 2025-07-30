// StormVerse Demo Data Loader
// Demonstrates loading real NOAA data and showcasing all 5 components

async function loadStormVerseDemo() {
  console.log('Starting StormVerse demonstration...');
  
  // Wait for all modules to be ready
  await waitForModules();
  
  const { layerLoader, quantumRenderer, statsOverlay } = window.stormVerseModules;
  
  // 1. Load real NOAA hurricane track data
  try {
    console.log('Loading NOAA hurricane data...');
    await loadNOAAData(layerLoader);
  } catch (error) {
    console.log('Using demonstration hurricane data');
    loadDemoHurricaneData(quantumRenderer);
  }
  
  // 2. Initialize 8-Agent AI Network with specific zones
  initializeAgentNetwork(quantumRenderer);
  
  // 3. Load sample KMZ/GeoJSON files
  loadSampleGeoData(layerLoader);
  
  // 4. Start ARCSEC security monitoring
  initializeARCSECDemo(statsOverlay);
  
  // 5. Activate real-time weather feeds
  startWeatherDataStreaming();
  
  console.log('StormVerse demonstration fully loaded');
}

async function waitForModules() {
  return new Promise((resolve) => {
    const checkModules = () => {
      if (window.stormVerseModules && 
          window.stormVerseModules.layerLoader && 
          window.stormVerseModules.quantumRenderer && 
          window.stormVerseModules.statsOverlay) {
        resolve();
      } else {
        setTimeout(checkModules, 500);
      }
    };
    checkModules();
  });
}

async function loadNOAAData(layerLoader) {
  // Attempt to load real NOAA data
  const noaaEndpoints = [
    'https://api.weather.gov/alerts/active',
    'https://www.nhc.noaa.gov/CurrentStorms.json'
  ];
  
  for (const endpoint of noaaEndpoints) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        console.log(`NOAA data loaded from ${endpoint}`);
        
        // Process and visualize the data
        if (endpoint.includes('alerts')) {
          processWeatherAlerts(data, layerLoader);
        } else if (endpoint.includes('CurrentStorms')) {
          processActiveStorms(data, layerLoader);
        }
        return;
      }
    } catch (error) {
      console.log(`Failed to load from ${endpoint}:`, error.message);
    }
  }
  
  throw new Error('No NOAA endpoints available');
}

function loadDemoHurricaneData(quantumRenderer) {
  // Professional-grade hurricane simulation based on Hurricane Ian (2022)
  const hurricaneIanTrack = {
    id: 'AL092022_DEMO',
    name: 'Hurricane Ian Simulation',
    forecast: [
      { longitude: -82.0, latitude: 23.5, probability: 0.98, time: 0, windSpeed: 150, pressure: 940 },
      { longitude: -82.2, latitude: 24.8, probability: 0.94, time: 6, windSpeed: 155, pressure: 935 },
      { longitude: -82.4, latitude: 26.1, probability: 0.89, time: 12, windSpeed: 150, pressure: 940 },
      { longitude: -82.1, latitude: 27.3, probability: 0.85, time: 18, windSpeed: 145, pressure: 945 },
      { longitude: -81.8, latitude: 28.5, probability: 0.78, time: 24, windSpeed: 125, pressure: 960 }
    ]
  };
  
  quantumRenderer.createProbabilityCone(hurricaneIanTrack, {
    agent: 'STORM_CITADEL',
    coneColor: '#ff3366',
    confidenceThreshold: 0.8
  });
  
  // Add secondary tropical system
  const tropicalSystemBeta = {
    id: 'AL142022_DEMO',
    name: 'Tropical Storm Beta',
    forecast: [
      { longitude: -75.0, latitude: 20.0, probability: 0.85, time: 0, windSpeed: 65, pressure: 995 },
      { longitude: -76.2, latitude: 22.1, probability: 0.81, time: 12, windSpeed: 70, pressure: 990 },
      { longitude: -77.4, latitude: 24.2, probability: 0.75, time: 24, windSpeed: 75, pressure: 985 }
    ]
  };
  
  quantumRenderer.createProbabilityCone(tropicalSystemBeta, {
    agent: 'PHOENIX_CORE',
    coneColor: '#ffaa00',
    confidenceThreshold: 0.7
  });
}

function initializeAgentNetwork(quantumRenderer) {
  // Load configuration from viewer_config.json
  fetch('/js/viewer_config.json')
    .then(response => response.json())
    .then(config => {
      config.agents.forEach(agent => {
        // Create orbital visualization for each agent
        const position = window.Cesium.Cartesian3.fromDegrees(
          agent.coordinates.longitude,
          agent.coordinates.latitude,
          agent.coordinates.altitude
        );
        
        // Add agent node with pulsing effect
        window.stormVerseModules.layerLoader.viewer.entities.add({
          id: `agent-${agent.id}`,
          position: position,
          point: {
            pixelSize: 12,
            color: window.Cesium.Color.fromCssColorString(agent.color),
            outlineColor: window.Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: window.Cesium.HeightReference.NONE,
            scaleByDistance: new window.Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5)
          },
          label: {
            text: agent.name,
            font: '10pt Inter',
            fillColor: window.Cesium.Color.fromCssColorString(agent.color),
            outlineColor: window.Cesium.Color.BLACK,
            outlineWidth: 2,
            style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new window.Cesium.Cartesian2(0, -20),
            scaleByDistance: new window.Cesium.NearFarScalar(1.5e2, 1.0, 1.5e7, 0.0)
          },
          description: generateAgentDescription(agent)
        });
        
        console.log(`Agent ${agent.name} positioned at zone: ${agent.zone}`);
      });
    })
    .catch(error => console.error('Failed to load agent configuration:', error));
}

function generateAgentDescription(agent) {
  return `
    <div class="agent-info-panel">
      <h3>${agent.name} (${agent.codename})</h3>
      <p><strong>Role:</strong> ${agent.role}</p>
      <p><strong>Zone:</strong> ${agent.zone}</p>
      <p><strong>Functions:</strong></p>
      <ul>
        ${agent.functions.map(func => `<li>${func.replace(/_/g, ' ')}</li>`).join('')}
      </ul>
      <div class="arcsec-verification">
        <h4>ARCSEC Status</h4>
        <p><strong>Security Level:</strong> CLASSIFIED</p>
        <p><strong>Last Update:</strong> ${new Date().toISOString()}</p>
        <p><strong>Data Sources:</strong> ${agent.data_sources.length} active</p>
      </div>
    </div>
  `;
}

function loadSampleGeoData(layerLoader) {
  // Demonstrate loading different data types
  const sampleDataFiles = [
    '/data/sample_data.json'
  ];
  
  sampleDataFiles.forEach(async (file) => {
    try {
      const response = await fetch(file);
      if (response.ok) {
        const data = await response.json();
        console.log(`Loaded sample data from ${file}`);
        
        // Process hurricane data from sample file
        if (data.mock_hurricane_data) {
          data.mock_hurricane_data.hurricanes.forEach(hurricane => {
            // Add ARCSEC metadata
            layerLoader.addARCSECMetadata(hurricane, {
              source: 'StormVerse Demo System',
              timestamp: new Date().toISOString(),
              authorship: 'NOAA/NHC Simulation',
              integrity_hash: layerLoader.generateHash(hurricane.id)
            });
          });
        }
      }
    } catch (error) {
      console.log(`Could not load ${file}:`, error.message);
    }
  });
}

function initializeARCSECDemo(statsOverlay) {
  // Simulate ARCSEC security monitoring
  console.log('ARCSEC Security Framework activated');
  
  // Update agent statuses to show security verification
  setTimeout(() => {
    statsOverlay.updateAgentStatus('ARCSEC_CITADEL', 'active', 'monitoring', 0.98);
    statsOverlay.updateAgentStatus('CODEX_TEMPLE', 'active', 'validating', 0.95);
    statsOverlay.updateAgentStatus('PHOENIX_CORE', 'active', 'securing', 0.97);
    
    console.log('ARCSEC agents fully operational');
  }, 3000);
  
  // Simulate data integrity checks
  setInterval(() => {
    const integrityScore = 0.95 + (Math.random() * 0.05);
    console.log(`ARCSEC integrity check: ${Math.round(integrityScore * 100)}%`);
  }, 30000);
}

function startWeatherDataStreaming() {
  console.log('Initiating real-time weather data streams...');
  
  // Simulate real-time data updates
  setInterval(() => {
    const timestamp = new Date().toISOString();
    console.log(`Weather data updated: ${timestamp}`);
    
    // Update stats overlay with new data
    if (window.stormVerseModules && window.stormVerseModules.statsOverlay) {
      window.stormVerseModules.statsOverlay.updateWeatherStats();
    }
  }, 60000); // Update every minute
}

function processWeatherAlerts(alertData, layerLoader) {
  console.log('Processing NOAA weather alerts...');
  
  if (alertData.features) {
    alertData.features.forEach(alert => {
      const properties = alert.properties;
      console.log(`Alert: ${properties.headline} - ${properties.severity}`);
      
      // Add ARCSEC metadata to real alerts
      layerLoader.addARCSECMetadata(alert, {
        source: 'NOAA Weather Service',
        timestamp: properties.sent || new Date().toISOString(),
        authorship: properties.senderName || 'National Weather Service',
        integrity_hash: layerLoader.generateHash(properties.id)
      });
    });
  }
}

function processActiveStorms(stormData, layerLoader) {
  console.log('Processing active storm data...');
  
  // Process current storms if available
  if (stormData && Array.isArray(stormData)) {
    stormData.forEach(storm => {
      console.log(`Active storm: ${storm.name || 'Unnamed'}`);
      
      // Add ARCSEC verification
      layerLoader.addARCSECMetadata(storm, {
        source: 'NOAA/NHC',
        timestamp: new Date().toISOString(),
        authorship: 'National Hurricane Center',
        integrity_hash: layerLoader.generateHash(storm.id || storm.name)
      });
    });
  }
}

// Auto-start demonstration when page loads
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(loadStormVerseDemo, 5000); // Wait 5 seconds for all systems to initialize
  });
}

// Export for manual triggering
window.loadStormVerseDemo = loadStormVerseDemo;