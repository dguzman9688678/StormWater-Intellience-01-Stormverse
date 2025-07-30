import { useEffect, useCallback } from "react";
import { useStormVerse } from "../lib/stores/useStormVerse";
import { createProbabilityCone, updateQuantumVisualization } from "../lib/quantum-renderer";

export default function QuantumArcRenderer() {
  const { viewer } = useStormVerse();

  const renderProbabilityCones = useCallback(() => {
    if (!viewer || !window.Cesium) return;

    // Sample hurricane prediction data points
    const hurricaneTrack = [
      { lon: -80.0, lat: 25.0, probability: 0.9, time: 0 },
      { lon: -78.0, lat: 27.0, probability: 0.8, time: 6 },
      { lon: -76.0, lat: 29.0, probability: 0.7, time: 12 },
      { lon: -74.0, lat: 31.0, probability: 0.6, time: 18 },
      { lon: -72.0, lat: 33.0, probability: 0.5, time: 24 }
    ];

    hurricaneTrack.forEach((point, index) => {
      const position = window.Cesium.Cartesian3.fromDegrees(point.lon, point.lat, 50000);
      
      // Create probability cone
      const coneRadius = (1.0 - point.probability) * 200000; // Larger cone = less certainty
      const coneHeight = 100000;
      
      viewer.entities.add({
        id: `probability-cone-${index}`,
        position: position,
        cylinder: {
          length: coneHeight,
          topRadius: coneRadius * 0.5,
          bottomRadius: coneRadius,
          material: window.Cesium.Color.fromCssColorString('#ff6b6b').withAlpha(0.3),
          outline: true,
          outlineColor: window.Cesium.Color.fromCssColorString('#ff6b6b')
        }
      });

      // Add probability percentage label
      viewer.entities.add({
        id: `probability-label-${index}`,
        position: window.Cesium.Cartesian3.fromDegrees(point.lon, point.lat, coneHeight + 50000),
        label: {
          text: `${Math.round(point.probability * 100)}%`,
          font: '14pt Inter',
          fillColor: window.Cesium.Color.fromCssColorString('#ff6b6b'),
          outlineColor: window.Cesium.Color.BLACK,
          outlineWidth: 2,
          style: window.Cesium.LabelStyle.FILL_AND_OUTLINE
        }
      });

      // Connect points with quantum arc
      if (index > 0) {
        const prevPoint = hurricaneTrack[index - 1];
        const prevPosition = window.Cesium.Cartesian3.fromDegrees(prevPoint.lon, prevPoint.lat, 50000);
        
        viewer.entities.add({
          id: `quantum-arc-${index}`,
          polyline: {
            positions: [prevPosition, position],
            width: 3,
            material: new window.Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.3,
              color: window.Cesium.Color.fromCssColorString('#ff6b6b').withAlpha(0.8)
            }),
            clampToGround: false
          }
        });
      }
    });

    // Add animated quantum field visualization
    let fieldOpacity = 0.1;
    let increasing = true;
    
    setInterval(() => {
      if (increasing) {
        fieldOpacity += 0.02;
        if (fieldOpacity >= 0.3) increasing = false;
      } else {
        fieldOpacity -= 0.02;
        if (fieldOpacity <= 0.1) increasing = true;
      }

      hurricaneTrack.forEach((point, index) => {
        const entity = viewer.entities.getById(`probability-cone-${index}`);
        if (entity && entity.cylinder) {
          entity.cylinder.material = window.Cesium.Color.fromCssColorString('#ff6b6b').withAlpha(fieldOpacity);
        }
      });
    }, 100);

  }, [viewer]);

  useEffect(() => {
    if (viewer) {
      renderProbabilityCones();
    }
  }, [viewer, renderProbabilityCones]);

  return null;
}
