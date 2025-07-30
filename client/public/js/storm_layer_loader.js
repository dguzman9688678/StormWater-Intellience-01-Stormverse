// StormVerse Storm Layer Loader
// Handles loading NOAA GIS data, KMZ files, and hurricane tracking data

class StormLayerLoader {
  constructor(viewer) {
    this.viewer = viewer;
    this.loadedLayers = new Map();
    this.dataDirectory = '/data/';
    
    console.log('Storm Layer Loader initialized');
  }

  /**
   * Load hurricane track data from NOAA KMZ files
   * @param {string} filename - KMZ file name (e.g., 'al052024_best_track.kmz')
   */
  async loadHurricaneTrack(filename) {
    try {
      const dataSource = await window.Cesium.KmlDataSource.load(
        this.dataDirectory + filename,
        {
          camera: this.viewer.scene.camera,
          canvas: this.viewer.scene.canvas,
          clampToGround: true
        }
      );

      // Apply cyberpunk styling to hurricane tracks
      dataSource.entities.values.forEach(entity => {
        if (entity.polyline) {
          entity.polyline.material = new window.Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.1,
            color: window.Cesium.Color.fromCssColorString('#ff6b6b')
          });
          entity.polyline.width = 3;
        }
        
        if (entity.point) {
          entity.point.color = window.Cesium.Color.fromCssColorString('#ff6b6b');
          entity.point.pixelSize = 8;
          entity.point.outlineColor = window.Cesium.Color.WHITE;
          entity.point.outlineWidth = 2;
          entity.point.heightReference = window.Cesium.HeightReference.CLAMP_TO_GROUND;
        }
      });

      await this.viewer.dataSources.add(dataSource);
      this.loadedLayers.set(filename, dataSource);
      
      // Add ARCSEC metadata
      this.addARCSECMetadata(dataSource, {
        source: 'NOAA/NHC',
        timestamp: new Date().toISOString(),
        authorship: 'National Hurricane Center',
        integrity_hash: this.generateHash(filename)
      });

      console.log(`Hurricane track loaded: ${filename}`);
      return dataSource;
    } catch (error) {
      console.error(`Failed to load hurricane track ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Load wind probability data from NOAA
   * @param {string} filename - Wind probability KMZ file
   */
  async loadWindProbabilities(filename) {
    try {
      const dataSource = await window.Cesium.KmlDataSource.load(
        this.dataDirectory + filename,
        {
          camera: this.viewer.scene.camera,
          canvas: this.viewer.scene.canvas
        }
      );

      // Style wind probability zones with transparency
      dataSource.entities.values.forEach(entity => {
        if (entity.polygon) {
          entity.polygon.material = window.Cesium.Color.fromCssColorString('#ffff00').withAlpha(0.3);
          entity.polygon.outline = true;
          entity.polygon.outlineColor = window.Cesium.Color.fromCssColorString('#ffff00');
          entity.polygon.height = 1000; // Slightly elevated for visibility
        }
      });

      await this.viewer.dataSources.add(dataSource);
      this.loadedLayers.set(filename, dataSource);
      
      console.log(`Wind probabilities loaded: ${filename}`);
      return dataSource;
    } catch (error) {
      console.error(`Failed to load wind probabilities ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Load custom GeoJSON data (BMP plans, flood zones, etc.)
   * @param {string} filename - GeoJSON file name
   */
  async loadGeoJSON(filename) {
    try {
      const dataSource = await window.Cesium.GeoJsonDataSource.load(
        this.dataDirectory + filename,
        {
          stroke: window.Cesium.Color.fromCssColorString('#00ffff'),
          fill: window.Cesium.Color.fromCssColorString('#00ffff').withAlpha(0.2),
          strokeWidth: 2,
          clampToGround: true
        }
      );

      await this.viewer.dataSources.add(dataSource);
      this.loadedLayers.set(filename, dataSource);
      
      // Add ARCSEC metadata
      this.addARCSECMetadata(dataSource, {
        source: 'User Upload',
        timestamp: new Date().toISOString(),
        authorship: 'StormVerse User',
        integrity_hash: this.generateHash(filename)
      });

      console.log(`GeoJSON loaded: ${filename}`);
      return dataSource;
    } catch (error) {
      console.error(`Failed to load GeoJSON ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Load weather imagery from NOAA WMS services
   */
  async loadWeatherImagery() {
    try {
      const imageryProvider = new window.Cesium.WebMapServiceImageryProvider({
        url: 'https://nowcoast.noaa.gov/arcgis/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer/WMSServer',
        layers: '1',
        parameters: {
          transparent: 'true',
          format: 'image/png'
        }
      });

      const layer = this.viewer.imageryLayers.addImageryProvider(imageryProvider);
      layer.alpha = 0.7; // Semi-transparent overlay
      
      this.loadedLayers.set('weather_radar', layer);
      console.log('Weather radar imagery loaded');
      return layer;
    } catch (error) {
      console.error('Failed to load weather imagery:', error);
      throw error;
    }
  }

  /**
   * Remove a loaded layer
   * @param {string} layerId - Layer identifier
   */
  removeLayer(layerId) {
    const layer = this.loadedLayers.get(layerId);
    if (layer) {
      if (layer.entities) {
        // Data source
        this.viewer.dataSources.remove(layer);
      } else {
        // Imagery layer
        this.viewer.imageryLayers.remove(layer);
      }
      this.loadedLayers.delete(layerId);
      console.log(`Layer removed: ${layerId}`);
    }
  }

  /**
   * Toggle layer visibility
   * @param {string} layerId - Layer identifier
   */
  toggleLayerVisibility(layerId) {
    const layer = this.loadedLayers.get(layerId);
    if (layer) {
      if (layer.show !== undefined) {
        layer.show = !layer.show;
      } else if (layer.alpha !== undefined) {
        layer.alpha = layer.alpha > 0 ? 0 : 0.7;
      }
      console.log(`Layer visibility toggled: ${layerId}`);
    }
  }

  /**
   * Add ARCSEC security metadata to data sources
   */
  addARCSECMetadata(dataSource, metadata) {
    dataSource.entities.values.forEach(entity => {
      entity.description = `
        <div class="arcsec-metadata">
          <h3>ARCSEC Data Verification</h3>
          <p><strong>Source:</strong> ${metadata.source}</p>
          <p><strong>Timestamp:</strong> ${metadata.timestamp}</p>
          <p><strong>Authorship:</strong> ${metadata.authorship}</p>
          <p><strong>Integrity Hash:</strong> ${metadata.integrity_hash}</p>
        </div>
      `;
    });
  }

  /**
   * Generate simple hash for data integrity
   */
  generateHash(data) {
    let hash = 0;
    const str = JSON.stringify(data);
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  /**
   * Get all loaded layers
   */
  getLoadedLayers() {
    return Array.from(this.loadedLayers.keys());
  }

  /**
   * Clear all layers
   */
  clearAllLayers() {
    this.loadedLayers.forEach((layer, layerId) => {
      this.removeLayer(layerId);
    });
    console.log('All layers cleared');
  }
}

// Export for use in StormVerse system
window.StormLayerLoader = StormLayerLoader;