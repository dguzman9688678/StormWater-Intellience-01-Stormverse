// StormVerse Quantum Arc Renderer
// Handles AI-generated probability cones and prediction visualizations

class QuantumArcRenderer {
  constructor(viewer) {
    this.viewer = viewer;
    this.probabilityCones = [];
    this.predictionPaths = [];
    this.quantumEntities = new Map();
    
    console.log('Quantum Arc Renderer initialized');
  }

  /**
   * Create probability cone for hurricane track predictions
   * @param {Object} track - Hurricane track data with forecast points
   * @param {Object} options - Rendering options
   */
  createProbabilityCone(track, options = {}) {
    const {
      coneColor = '#ff6b6b',
      confidenceThreshold = 0.7,
      maxRadius = 300000, // 300km max uncertainty
      agent = 'STORM_CITADEL'
    } = options;

    track.forecast.forEach((point, index) => {
      const position = window.Cesium.Cartesian3.fromDegrees(
        point.longitude, 
        point.latitude, 
        50000 // 50km altitude
      );
      
      // Calculate cone size based on uncertainty and time
      const timeWeight = index * 0.1; // Uncertainty increases with time
      const uncertaintyRadius = (1.0 - point.probability) * maxRadius + (timeWeight * 50000);
      
      // Create cylinder for probability cone
      const coneEntity = this.viewer.entities.add({
        id: `quantum-cone-${track.id}-${index}`,
        position: position,
        cylinder: {
          length: 80000,
          topRadius: uncertaintyRadius * 0.3,
          bottomRadius: uncertaintyRadius,
          material: window.Cesium.Color.fromCssColorString(coneColor).withAlpha(0.25),
          outline: true,
          outlineColor: window.Cesium.Color.fromCssColorString(coneColor).withAlpha(0.6),
          heightReference: window.Cesium.HeightReference.CLAMP_TO_GROUND
        },
        label: {
          text: `${Math.round(point.probability * 100)}%`,
          font: '12pt Inter',
          fillColor: window.Cesium.Color.fromCssColorString('#00ffff'),
          outlineColor: window.Cesium.Color.BLACK,
          outlineWidth: 2,
          style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new window.Cesium.Cartesian2(0, -50),
          scaleByDistance: new window.Cesium.NearFarScalar(1.5e2, 1.0, 8.0e6, 0.0)
        },
        description: this.generateConeDescription(point, agent)
      });

      // Add quantum glow effect
      this.addQuantumGlow(coneEntity, point.probability);
      
      this.quantumEntities.set(coneEntity.id, {
        entity: coneEntity,
        type: 'probability_cone',
        confidence: point.probability,
        agent: agent,
        timestamp: new Date().toISOString()
      });
    });

    console.log(`Probability cone created for track: ${track.id}`);
  }

  /**
   * Create prediction path with uncertainty bands
   * @param {Array} pathPoints - Array of prediction points
   * @param {Object} options - Rendering options
   */
  createPredictionPath(pathPoints, options = {}) {
    const {
      pathColor = '#00ffff',
      uncertaintyBand = true,
      agent = 'ULTRON'
    } = options;

    const positions = pathPoints.map(point => 
      window.Cesium.Cartesian3.fromDegrees(point.longitude, point.latitude, 30000)
    );

    // Main prediction path
    const pathEntity = this.viewer.entities.add({
      id: `prediction-path-${Date.now()}`,
      polyline: {
        positions: positions,
        width: 4,
        material: new window.Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.2,
          color: window.Cesium.Color.fromCssColorString(pathColor)
        }),
        clampToGround: false
      },
      description: this.generatePathDescription(pathPoints, agent)
    });

    // Uncertainty bands if requested
    if (uncertaintyBand) {
      this.createUncertaintyBands(pathPoints, pathColor);
    }

    this.quantumEntities.set(pathEntity.id, {
      entity: pathEntity,
      type: 'prediction_path',
      agent: agent,
      timestamp: new Date().toISOString()
    });

    console.log('Prediction path created');
    return pathEntity;
  }

  /**
   * Create uncertainty bands around prediction paths
   */
  createUncertaintyBands(pathPoints, baseColor) {
    const bandWidths = [100000, 200000, 300000]; // 100km, 200km, 300km
    const alphas = [0.15, 0.1, 0.05];

    bandWidths.forEach((width, index) => {
      const leftBand = pathPoints.map(point => 
        this.offsetPosition(point, -width, point.bearing || 0)
      );
      const rightBand = pathPoints.map(point => 
        this.offsetPosition(point, width, point.bearing || 0)
      );

      // Create polygon for uncertainty band
      const bandPositions = [
        ...leftBand.map(p => window.Cesium.Cartesian3.fromDegrees(p.longitude, p.latitude, 25000)),
        ...rightBand.reverse().map(p => window.Cesium.Cartesian3.fromDegrees(p.longitude, p.latitude, 25000))
      ];

      this.viewer.entities.add({
        id: `uncertainty-band-${index}-${Date.now()}`,
        polygon: {
          hierarchy: bandPositions,
          material: window.Cesium.Color.fromCssColorString(baseColor).withAlpha(alphas[index]),
          outline: false,
          height: 25000
        }
      });
    });
  }

  /**
   * Add quantum glow effect to entities based on confidence
   */
  addQuantumGlow(entity, confidence) {
    // Higher confidence = brighter glow
    const glowIntensity = confidence * 0.5;
    
    if (entity.cylinder && entity.cylinder.material) {
      entity.cylinder.material = window.Cesium.Color.fromCssColorString('#ff6b6b')
        .withAlpha(0.2 + glowIntensity);
    }
  }

  /**
   * Create swirling quantum visualization around high-confidence predictions
   * @param {Object} centerPoint - Center coordinates
   * @param {number} confidence - Confidence level (0-1)
   */
  createQuantumSwirl(centerPoint, confidence) {
    const position = window.Cesium.Cartesian3.fromDegrees(
      centerPoint.longitude, 
      centerPoint.latitude, 
      60000
    );

    const swirlPoints = [];
    const numPoints = 64;
    const radius = confidence * 150000; // Larger swirl for higher confidence

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 4; // 2 full rotations
      const spiralRadius = radius * (i / numPoints);
      const x = Math.cos(angle) * spiralRadius;
      const y = Math.sin(angle) * spiralRadius;
      const height = 60000 + (i * 1000); // Ascending spiral
      
      swirlPoints.push(
        window.Cesium.Cartesian3.fromDegrees(
          centerPoint.longitude + (x / 111320), // Convert meters to degrees
          centerPoint.latitude + (y / 110540),
          height
        )
      );
    }

    const swirlEntity = this.viewer.entities.add({
      id: `quantum-swirl-${Date.now()}`,
      polyline: {
        positions: swirlPoints,
        width: 3,
        material: new window.Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.3,
          color: window.Cesium.Color.fromCssColorString('#00ffff')
        })
      }
    });

    // Animate the swirl
    this.animateQuantumSwirl(swirlEntity, confidence);
    
    return swirlEntity;
  }

  /**
   * Animate quantum swirl effects
   */
  animateQuantumSwirl(entity, confidence) {
    let time = 0;
    const animationSpeed = confidence * 2; // Faster animation for higher confidence

    const animateFrame = () => {
      if (entity.polyline && entity.polyline.material) {
        const currentColor = entity.polyline.material.color.getValue();
        const alpha = 0.3 + Math.sin(time * animationSpeed) * 0.2;
        entity.polyline.material.color = currentColor.withAlpha(alpha);
      }
      time += 0.1;
      
      setTimeout(animateFrame, 100);
    };

    animateFrame();
  }

  /**
   * Generate description for probability cones with ARCSEC metadata
   */
  generateConeDescription(point, agent) {
    return `
      <div class="quantum-cone-info">
        <h3>Quantum Probability Cone</h3>
        <p><strong>Agent:</strong> ${agent}</p>
        <p><strong>Confidence:</strong> ${Math.round(point.probability * 100)}%</p>
        <p><strong>Time:</strong> +${point.time} hours</p>
        <p><strong>Wind Speed:</strong> ${point.windSpeed || 'Unknown'} mph</p>
        <div class="arcsec-data">
          <h4>ARCSEC Verification</h4>
          <p><strong>Generated:</strong> ${new Date().toISOString()}</p>
          <p><strong>Algorithm:</strong> Quantum Weather Prediction</p>
          <p><strong>Data Hash:</strong> ${this.generateQuantumHash(point)}</p>
        </div>
      </div>
    `;
  }

  /**
   * Generate description for prediction paths
   */
  generatePathDescription(pathPoints, agent) {
    return `
      <div class="prediction-path-info">
        <h3>AI Prediction Path</h3>
        <p><strong>Agent:</strong> ${agent}</p>
        <p><strong>Path Points:</strong> ${pathPoints.length}</p>
        <p><strong>Duration:</strong> ${pathPoints.length * 6} hours</p>
        <div class="arcsec-data">
          <h4>ARCSEC Verification</h4>
          <p><strong>Generated:</strong> ${new Date().toISOString()}</p>
          <p><strong>Model:</strong> Ensemble Prediction System</p>
        </div>
      </div>
    `;
  }

  /**
   * Calculate offset position for uncertainty bands
   */
  offsetPosition(point, distance, bearing) {
    const lat1 = point.latitude * Math.PI / 180;
    const lon1 = point.longitude * Math.PI / 180;
    const bearingRad = bearing * Math.PI / 180;
    const earthRadius = 6371000; // Earth radius in meters

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(distance / earthRadius) +
      Math.cos(lat1) * Math.sin(distance / earthRadius) * Math.cos(bearingRad)
    );

    const lon2 = lon1 + Math.atan2(
      Math.sin(bearingRad) * Math.sin(distance / earthRadius) * Math.cos(lat1),
      Math.cos(distance / earthRadius) - Math.sin(lat1) * Math.sin(lat2)
    );

    return {
      latitude: lat2 * 180 / Math.PI,
      longitude: lon2 * 180 / Math.PI,
      bearing: bearing
    };
  }

  /**
   * Generate quantum hash for integrity verification
   */
  generateQuantumHash(data) {
    const quantum_seed = Math.floor(Date.now() / 1000);
    let hash = quantum_seed;
    const str = JSON.stringify(data);
    
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 7) - hash + str.charCodeAt(i)) & 0xffffffff;
    }
    
    return `QX${hash.toString(16).toUpperCase()}`;
  }

  /**
   * Clear all quantum visualizations
   */
  clearQuantumVisualizations() {
    this.quantumEntities.forEach((item, id) => {
      this.viewer.entities.remove(item.entity);
    });
    this.quantumEntities.clear();
    console.log('Quantum visualizations cleared');
  }

  /**
   * Update quantum visualization in real-time
   */
  updateQuantumVisualization(newData) {
    // Clear existing visualizations
    this.clearQuantumVisualizations();
    
    // Re-render with new data
    newData.tracks.forEach(track => {
      this.createProbabilityCone(track, {
        agent: newData.agent || 'STORM_CITADEL'
      });
    });
    
    console.log('Quantum visualization updated');
  }

  /**
   * Get quantum visualization statistics
   */
  getQuantumStats() {
    const stats = {
      totalEntities: this.quantumEntities.size,
      types: {},
      agents: {},
      averageConfidence: 0
    };

    let totalConfidence = 0;
    let confidenceCount = 0;

    this.quantumEntities.forEach(item => {
      stats.types[item.type] = (stats.types[item.type] || 0) + 1;
      stats.agents[item.agent] = (stats.agents[item.agent] || 0) + 1;
      
      if (item.confidence) {
        totalConfidence += item.confidence;
        confidenceCount++;
      }
    });

    if (confidenceCount > 0) {
      stats.averageConfidence = totalConfidence / confidenceCount;
    }

    return stats;
  }
}

// Export for use in StormVerse system
window.QuantumArcRenderer = QuantumArcRenderer;