// NOAA API Integration for StormVerse
// Handles real-time data fetching from National Weather Service

class NOAAIntegration {
  constructor() {
    this.baseURL = 'https://api.weather.gov';
    this.nhcURL = 'https://www.nhc.noaa.gov';
    this.retryAttempts = 3;
    this.retryDelay = 2000;
  }

  async fetchActiveAlerts() {
    const endpoint = `${this.baseURL}/alerts/active`;
    
    try {
      const response = await this.fetchWithRetry(endpoint);
      const data = await response.json();
      
      console.log(`Fetched ${data.features?.length || 0} active weather alerts`);
      return this.processAlerts(data);
    } catch (error) {
      console.error('Failed to fetch NOAA alerts:', error);
      return this.getMockAlerts();
    }
  }

  async fetchCurrentStorms() {
    const endpoint = `${this.nhcURL}/CurrentStorms.json`;
    
    try {
      const response = await this.fetchWithRetry(endpoint);
      const data = await response.json();
      
      console.log(`Fetched current storm data`);
      return this.processStorms(data);
    } catch (error) {
      console.error('Failed to fetch current storms:', error);
      return this.getMockStorms();
    }
  }

  async fetchRadarData() {
    // NOAA radar imagery endpoint
    const endpoint = 'https://nowcoast.noaa.gov/arcgis/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer/WMSServer';
    
    try {
      console.log('Attempting to fetch radar imagery...');
      
      // Return WMS configuration for Cesium
      return {
        url: endpoint,
        layers: '1',
        parameters: {
          transparent: 'true',
          format: 'image/png',
          time: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Radar data unavailable:', error);
      return null;
    }
  }

  async fetchWithRetry(url, attempt = 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'StormVerse Environmental Intelligence Platform'
        },
        timeout: 10000
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      if (attempt < this.retryAttempts) {
        console.log(`Retry attempt ${attempt} for ${url}`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.fetchWithRetry(url, attempt + 1);
      }
      throw error;
    }
  }

  processAlerts(alertData) {
    if (!alertData.features) return [];
    
    return alertData.features.map(alert => ({
      id: alert.properties.id,
      title: alert.properties.headline,
      description: alert.properties.description,
      severity: alert.properties.severity?.toLowerCase() || 'minor',
      area: alert.properties.areaDesc,
      effective: alert.properties.effective,
      expires: alert.properties.expires,
      geometry: alert.geometry,
      arcsec: {
        source: 'NOAA/NWS',
        timestamp: alert.properties.sent,
        authorship: alert.properties.senderName,
        integrity_hash: this.generateHash(alert.properties.id)
      }
    }));
  }

  processStorms(stormData) {
    if (!Array.isArray(stormData)) return [];
    
    return stormData.map(storm => ({
      id: storm.id || `STORM_${Date.now()}`,
      name: storm.name || 'Unnamed System',
      status: storm.classification || 'active',
      category: storm.intensityCategory || 0,
      windSpeed: storm.intensity || 0,
      pressure: storm.pressure || 1013,
      coordinates: {
        latitude: storm.centerLat || 0,
        longitude: storm.centerLon || 0
      },
      movement: {
        direction: storm.movementDir || 0,
        speed: storm.movementSpeed || 0
      },
      lastUpdate: storm.lastUpdate || new Date().toISOString(),
      arcsec: {
        source: 'NOAA/NHC',
        timestamp: new Date().toISOString(),
        authorship: 'National Hurricane Center',
        integrity_hash: this.generateHash(storm.id || storm.name)
      }
    }));
  }

  getMockAlerts() {
    console.log('Using mock weather alert data');
    return [
      {
        id: 'MOCK_ALERT_001',
        title: 'Hurricane Watch - South Florida',
        description: 'Hurricane conditions possible within 48 hours',
        severity: 'severe',
        area: 'South Florida, Florida Keys',
        effective: new Date().toISOString(),
        expires: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        arcsec: {
          source: 'StormVerse Mock Data',
          timestamp: new Date().toISOString(),
          authorship: 'Demo System',
          integrity_hash: 'MOCK_HASH_001'
        }
      },
      {
        id: 'MOCK_ALERT_002',
        title: 'Storm Surge Warning - Gulf Coast',
        description: 'Life-threatening storm surge expected',
        severity: 'extreme',
        area: 'Gulf Coast Florida',
        effective: new Date().toISOString(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        arcsec: {
          source: 'StormVerse Mock Data',
          timestamp: new Date().toISOString(),
          authorship: 'Demo System',
          integrity_hash: 'MOCK_HASH_002'
        }
      }
    ];
  }

  getMockStorms() {
    console.log('Using mock storm data');
    return [
      {
        id: 'AL092024_MOCK',
        name: 'Hurricane Delta',
        status: 'active',
        category: 3,
        windSpeed: 115,
        pressure: 960,
        coordinates: {
          latitude: 25.2,
          longitude: -80.5
        },
        movement: {
          direction: 45,
          speed: 12
        },
        lastUpdate: new Date().toISOString(),
        arcsec: {
          source: 'StormVerse Mock Data',
          timestamp: new Date().toISOString(),
          authorship: 'Demo System',
          integrity_hash: 'MOCK_STORM_001'
        }
      }
    ];
  }

  generateHash(data) {
    // Simple hash function for demo purposes
    let hash = 0;
    const str = String(data);
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `NOAA_${Math.abs(hash).toString(16).toUpperCase()}`;
  }

  async initializeRealTimeFeeds() {
    console.log('Initializing NOAA real-time data feeds...');
    
    // Fetch initial data
    const alerts = await this.fetchActiveAlerts();
    const storms = await this.fetchCurrentStorms();
    const radar = await this.fetchRadarData();
    
    // Set up periodic updates
    setInterval(async () => {
      try {
        await this.fetchActiveAlerts();
        console.log('Weather alerts updated');
      } catch (error) {
        console.error('Failed to update alerts:', error);
      }
    }, 5 * 60 * 1000); // Every 5 minutes
    
    setInterval(async () => {
      try {
        await this.fetchCurrentStorms();
        console.log('Storm data updated');
      } catch (error) {
        console.error('Failed to update storms:', error);
      }
    }, 30 * 60 * 1000); // Every 30 minutes
    
    return { alerts, storms, radar };
  }
}

// Export for use in StormVerse system
window.NOAAIntegration = NOAAIntegration;