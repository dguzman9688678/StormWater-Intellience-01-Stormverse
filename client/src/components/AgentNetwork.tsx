import { useEffect, useCallback } from "react";
import { useAgents } from "../lib/stores/useAgents";
import { useStormVerse } from "../lib/stores/useStormVerse";

export default function AgentNetwork() {
  const { agents, updateAgentStatus, setAgentActivity } = useAgents();
  const { viewer } = useStormVerse();

  const createAgentNodes = useCallback(() => {
    if (!viewer || !window.Cesium) return;

    // Agent positions around the globe
    const agentPositions = [
      { name: "STORM CITADEL", lon: -95.0, lat: 50.0, height: 2000000 },
      { name: "CODEX TEMPLE", lon: -75.0, lat: 40.0, height: 1800000 },
      { name: "SKYWALL", lon: -120.0, lat: 35.0, height: 2200000 },
      { name: "MIRRORFIELD", lon: -85.0, lat: 30.0, height: 1900000 },
      { name: "WATERSHED REALMS", lon: -110.0, lat: 45.0, height: 2100000 },
      { name: "SANCTUM OF SELF", lon: -100.0, lat: 25.0, height: 1700000 },
      { name: "ARCSEC CITADEL", lon: -90.0, lat: 55.0, height: 2300000 },
      { name: "PHOENIX CORE", lon: -105.0, lat: 35.0, height: 2000000 }
    ];

    agentPositions.forEach((pos, index) => {
      const position = window.Cesium.Cartesian3.fromDegrees(pos.lon, pos.lat, pos.height);
      
      // Create glowing node for each agent
      viewer.entities.add({
        id: `agent-${index}`,
        position: position,
        point: {
          pixelSize: 20,
          color: window.Cesium.Color.CYAN,
          outlineColor: window.Cesium.Color.WHITE,
          outlineWidth: 2,
          heightReference: window.Cesium.HeightReference.NONE,
          scaleByDistance: new window.Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5)
        },
        label: {
          text: pos.name,
          font: '12pt Inter',
          fillColor: window.Cesium.Color.CYAN,
          outlineColor: window.Cesium.Color.BLACK,
          outlineWidth: 2,
          style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new window.Cesium.Cartesian2(0, -40),
          scaleByDistance: new window.Cesium.NearFarScalar(1.5e2, 1.0, 1.5e7, 0.3)
        }
      });

      // Create connecting lines to center
      const centerPosition = window.Cesium.Cartesian3.fromDegrees(-95.0, 40.0, 0);
      
      viewer.entities.add({
        id: `connection-${index}`,
        polyline: {
          positions: [position, centerPosition],
          width: 2,
          material: new window.Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.2,
            color: window.Cesium.Color.CYAN.withAlpha(0.5)
          }),
          clampToGround: false
        }
      });

      // Update agent activity periodically
      setInterval(() => {
        const activities = [
          "ANALYZING WEATHER PATTERNS",
          "PROCESSING NOAA DATA",
          "COMPUTING PROBABILITIES",
          "MONITORING SYSTEMS",
          "SECURING DATA STREAMS"
        ];
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        setAgentActivity(pos.name, randomActivity);
      }, 5000 + Math.random() * 10000);
    });
  }, [viewer, setAgentActivity]);

  useEffect(() => {
    if (viewer) {
      createAgentNodes();
    }
  }, [viewer, createAgentNodes]);

  return null; // This component only manages 3D entities
}
