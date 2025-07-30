// Quantum Arc Renderer for probability visualization

export interface ProbabilityData {
  centerLat: number;
  centerLon: number;
  probability: number;
  radius: number;
  timeOffset: number;
}

export interface QuantumArc {
  startPoint: ProbabilityData;
  endPoint: ProbabilityData;
  probability: number;
  uncertainty: number;
}

export class QuantumRenderer {
  private viewer: any;
  private probabilityEntities: any[] = [];
  private animationFrame: number | null = null;

  constructor(viewer: any) {
    this.viewer = viewer;
  }

  createProbabilityCone(data: ProbabilityData): any {
    if (!this.viewer || !window.Cesium) return null;

    const position = window.Cesium.Cartesian3.fromDegrees(
      data.centerLon,
      data.centerLat,
      50000
    );

    // Calculate cone dimensions based on probability
    const baseRadius = data.radius * (1.0 - data.probability);
    const topRadius = baseRadius * 0.3;
    const height = 100000 + (data.probability * 50000);

    // Create probability cone
    const cone = this.viewer.entities.add({
      position: position,
      cylinder: {
        length: height,
        topRadius: topRadius,
        bottomRadius: baseRadius,
        material: this.getProbabilityMaterial(data.probability),
        outline: true,
        outlineColor: this.getProbabilityColor(data.probability)
      }
    });

    this.probabilityEntities.push(cone);
    return cone;
  }

  createQuantumArc(arc: QuantumArc): any {
    if (!this.viewer || !window.Cesium) return null;

    const startPos = window.Cesium.Cartesian3.fromDegrees(
      arc.startPoint.centerLon,
      arc.startPoint.centerLat,
      50000
    );

    const endPos = window.Cesium.Cartesian3.fromDegrees(
      arc.endPoint.centerLon,
      arc.endPoint.centerLat,
      50000
    );

    // Create curved arc between points
    const arcEntity = this.viewer.entities.add({
      polyline: {
        positions: this.generateArcPositions(startPos, endPos, arc.uncertainty),
        width: 3 + (arc.probability * 5),
        material: new window.Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.3 + (arc.probability * 0.4),
          color: this.getProbabilityColor(arc.probability).withAlpha(0.8)
        }),
        clampToGround: false
      }
    });

    this.probabilityEntities.push(arcEntity);
    return arcEntity;
  }

  private generateArcPositions(start: any, end: any, uncertainty: number): any[] {
    const positions = [];
    const steps = 20;
    
    // Calculate midpoint with height variation based on uncertainty
    const midHeight = 100000 + (uncertainty * 200000);
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      
      // Interpolate between start and end
      const interpolated = window.Cesium.Cartesian3.lerp(start, end, t, new window.Cesium.Cartesian3());
      
      // Add arc curve
      const heightMultiplier = Math.sin(t * Math.PI) * midHeight;
      const cartographic = window.Cesium.Cartographic.fromCartesian(interpolated);
      cartographic.height += heightMultiplier;
      
      positions.push(window.Cesium.Cartesian3.fromRadians(
        cartographic.longitude,
        cartographic.latitude,
        cartographic.height
      ));
    }
    
    return positions;
  }

  private getProbabilityMaterial(probability: number): any {
    const alpha = 0.2 + (probability * 0.3);
    
    if (probability > 0.8) {
      return window.Cesium.Color.RED.withAlpha(alpha);
    } else if (probability > 0.6) {
      return window.Cesium.Color.ORANGE.withAlpha(alpha);
    } else if (probability > 0.4) {
      return window.Cesium.Color.YELLOW.withAlpha(alpha);
    } else {
      return window.Cesium.Color.GREEN.withAlpha(alpha);
    }
  }

  private getProbabilityColor(probability: number): any {
    if (probability > 0.8) {
      return window.Cesium.Color.RED;
    } else if (probability > 0.6) {
      return window.Cesium.Color.ORANGE;
    } else if (probability > 0.4) {
      return window.Cesium.Color.YELLOW;
    } else {
      return window.Cesium.Color.GREEN;
    }
  }

  animateQuantumField(): void {
    let time = 0;
    
    const animate = () => {
      time += 0.02;
      
      this.probabilityEntities.forEach((entity, index) => {
        if (entity.cylinder) {
          // Pulsing animation
          const pulse = Math.sin(time + index * 0.5) * 0.1 + 0.9;
          const currentMaterial = entity.cylinder.material;
          
          if (currentMaterial && currentMaterial.color) {
            const baseColor = currentMaterial.color.getValue();
            entity.cylinder.material = baseColor.withAlpha(baseColor.alpha * pulse);
          }
        }
        
        if (entity.polyline && entity.polyline.material) {
          // Flowing animation for arcs
          const flow = Math.sin(time * 2 + index) * 0.2 + 0.8;
          entity.polyline.material.glowPower = flow;
        }
      });
      
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    this.animationFrame = requestAnimationFrame(animate);
  }

  stopAnimation(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  clearVisualization(): void {
    this.probabilityEntities.forEach(entity => {
      this.viewer.entities.remove(entity);
    });
    this.probabilityEntities = [];
  }

  dispose(): void {
    this.stopAnimation();
    this.clearVisualization();
  }
}

export function createProbabilityCone(viewer: any, data: ProbabilityData): any {
  const renderer = new QuantumRenderer(viewer);
  return renderer.createProbabilityCone(data);
}

export function updateQuantumVisualization(viewer: any, probabilityData: ProbabilityData[]): void {
  const renderer = new QuantumRenderer(viewer);
  
  // Clear existing visualization
  renderer.clearVisualization();
  
  // Create new probability cones
  probabilityData.forEach(data => {
    renderer.createProbabilityCone(data);
  });
  
  // Create quantum arcs between related points
  for (let i = 0; i < probabilityData.length - 1; i++) {
    const arc: QuantumArc = {
      startPoint: probabilityData[i],
      endPoint: probabilityData[i + 1],
      probability: (probabilityData[i].probability + probabilityData[i + 1].probability) / 2,
      uncertainty: Math.abs(probabilityData[i].probability - probabilityData[i + 1].probability)
    };
    
    renderer.createQuantumArc(arc);
  }
  
  // Start animation
  renderer.animateQuantumField();
}
