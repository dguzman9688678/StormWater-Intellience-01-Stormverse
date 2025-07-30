import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAgents } from '../lib/stores/useAgents';
import { useStormVerse } from '../lib/stores/useStormVerse';

// TypeScript declaration for Cesium on window
declare global {
  interface Window {
    Cesium: any;
  }
}

interface AgentNode {
  id: string;
  name: string;
  codename: string;
  position: {
    longitude: number;
    latitude: number;
    altitude: number;
  };
  status: 'active' | 'idle' | 'processing' | 'alert';
  color: string;
  role: string;
  zone: string;
  performance: number;
  lastActivity: string;
}

interface InteractiveAgentGlobeProps {
  viewer?: any;
  onAgentSelect?: (agent: AgentNode) => void;
}

export function InteractiveAgentGlobe({ viewer, onAgentSelect }: InteractiveAgentGlobeProps) {
  const { agents, updateAgentStatus } = useAgents();
  const { isInitialized } = useStormVerse();
  const [selectedAgent, setSelectedAgent] = useState<AgentNode | null>(null);
  const [agentEntities, setAgentEntities] = useState<Map<string, any>>(new Map());
  const animationRef = useRef<number>();
  const agentNodesRef = useRef<Map<string, any>>(new Map());

  // Agent configuration with precise global positioning
  const agentConfiguration: AgentNode[] = [
    {
      id: 'STORM_CITADEL',
      name: 'STORM CITADEL',
      codename: 'STORM',
      position: { longitude: -75.0, latitude: 25.0, altitude: 500000 },
      status: 'active',
      color: '#ff3366',
      role: 'Weather Prediction & Hurricane Tracking',
      zone: 'Atlantic Hurricane Basin',
      performance: 0.96,
      lastActivity: 'Hurricane intensity modeling'
    },
    {
      id: 'CODEX_TEMPLE',
      name: 'CODEX TEMPLE',
      codename: 'ULTRON',
      position: { longitude: 10.0, latitude: 50.0, altitude: 600000 },
      status: 'active',
      color: '#0099ff',
      role: 'Metadata Validation & Data Integrity',
      zone: 'European Data Centers',
      performance: 0.98,
      lastActivity: 'Data quality verification'
    },
    {
      id: 'WATERSHED_REALMS',
      name: 'WATERSHED REALMS',
      codename: 'JARVIS',
      position: { longitude: -100.0, latitude: 40.0, altitude: 550000 },
      status: 'active',
      color: '#ffaa00',
      role: 'Command Routing & System Coordination',
      zone: 'North American Command',
      performance: 0.94,
      lastActivity: 'Task distribution management'
    },
    {
      id: 'MIRRORFIELD',
      name: 'MIRRORFIELD',
      codename: 'PHOENIX',
      position: { longitude: -150.0, latitude: 30.0, altitude: 500000 },
      status: 'processing',
      color: '#ff9900',
      role: 'Memory Management & Data Recovery',
      zone: 'Pacific Analysis Zone',
      performance: 0.92,
      lastActivity: 'Historical pattern analysis'
    },
    {
      id: 'ARCSEC_CITADEL',
      name: 'ARCSEC CITADEL',
      codename: 'ODIN',
      position: { longitude: 0.0, latitude: 80.0, altitude: 700000 },
      status: 'active',
      color: '#9966ff',
      role: 'Security Protocols & System Protection',
      zone: 'Arctic Security Zone',
      performance: 0.99,
      lastActivity: 'Security monitoring'
    },
    {
      id: 'SANCTUM_OF_SELF',
      name: 'SANCTUM OF SELF',
      codename: 'ECHO',
      position: { longitude: -120.0, latitude: 35.0, altitude: 500000 },
      status: 'idle',
      color: '#00ff88',
      role: 'Audio Interface & Human Communication',
      zone: 'West Coast Communications',
      performance: 0.88,
      lastActivity: 'Voice command processing'
    },
    {
      id: 'SKYWALL',
      name: 'SKYWALL',
      codename: 'MITO',
      position: { longitude: 120.0, latitude: 35.0, altitude: 550000 },
      status: 'processing',
      color: '#ff66cc',
      role: 'Development Automation & System Updates',
      zone: 'Asian Tech Hub',
      performance: 0.91,
      lastActivity: 'Performance optimization'
    },
    {
      id: 'PHOENIX_CORE',
      name: 'PHOENIX CORE',
      codename: 'VADER',
      position: { longitude: 0.0, latitude: -70.0, altitude: 800000 },
      status: 'alert',
      color: '#ff0066',
      role: 'Surveillance & System Resilience',
      zone: 'Antarctic Surveillance',
      performance: 0.97,
      lastActivity: 'Threat assessment scanning'
    }
  ];

  // Initialize agent entities on the globe
  useEffect(() => {
    if (!viewer || !window.Cesium || !isInitialized) return;

    const newEntities = new Map();
    const newNodes = new Map();

    agentConfiguration.forEach(agent => {
      // Create agent position
      const position = window.Cesium.Cartesian3.fromDegrees(
        agent.position.longitude,
        agent.position.latitude,
        agent.position.altitude
      );

      // Create main agent node entity
      const agentEntity = viewer.entities.add({
        id: `agent-${agent.id}`,
        position: position,
        point: {
          pixelSize: 15,
          color: window.Cesium.Color.fromCssColorString(agent.color),
          outlineColor: window.Cesium.Color.WHITE,
          outlineWidth: 3,
          heightReference: window.Cesium.HeightReference.NONE,
          scaleByDistance: new window.Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5),
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        label: {
          text: agent.name,
          font: '12pt Inter, Arial, sans-serif',
          fillColor: window.Cesium.Color.fromCssColorString(agent.color),
          outlineColor: window.Cesium.Color.BLACK,
          outlineWidth: 2,
          style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new window.Cesium.Cartesian2(0, -25),
          scaleByDistance: new window.Cesium.NearFarScalar(1.5e2, 1.0, 1.5e7, 0.0),
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        description: generateAgentDescription(agent)
      });

      // Create orbital ring around agent
      const ringPoints = [];
      const ringRadius = 50000; // 50km radius
      for (let i = 0; i <= 360; i += 10) {
        const angle = window.Cesium.Math.toRadians(i);
        const ringPosition = window.Cesium.Cartesian3.fromDegrees(
          agent.position.longitude + (ringRadius / 111320) * Math.cos(angle),
          agent.position.latitude + (ringRadius / 110540) * Math.sin(angle),
          agent.position.altitude
        );
        ringPoints.push(ringPosition);
      }

      const orbitalRing = viewer.entities.add({
        id: `ring-${agent.id}`,
        polyline: {
          positions: ringPoints,
          width: 2,
          material: new window.Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.3,
            color: window.Cesium.Color.fromCssColorString(agent.color).withAlpha(0.6)
          }),
          clampToGround: false
        }
      });

      // Create status indicator
      const statusIndicator = viewer.entities.add({
        id: `status-${agent.id}`,
        position: window.Cesium.Cartesian3.fromDegrees(
          agent.position.longitude,
          agent.position.latitude,
          agent.position.altitude + 20000
        ),
        point: {
          pixelSize: 8,
          color: getStatusColor(agent.status),
          heightReference: window.Cesium.HeightReference.NONE,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      });

      newEntities.set(agent.id, {
        main: agentEntity,
        ring: orbitalRing,
        status: statusIndicator
      });

      newNodes.set(agent.id, agent);
    });

    setAgentEntities(newEntities);
    agentNodesRef.current = newNodes;

    // Setup click handler
    const clickHandler = viewer.cesiumWidget.canvas.addEventListener('click', handleAgentClick);

    return () => {
      newEntities.forEach(entities => {
        viewer.entities.remove(entities.main);
        viewer.entities.remove(entities.ring);
        viewer.entities.remove(entities.status);
      });
      
      if (clickHandler) {
        viewer.cesiumWidget.canvas.removeEventListener('click', clickHandler);
      }
    };
  }, [viewer, isInitialized]);

  // Handle agent clicks
  const handleAgentClick = useCallback((event: MouseEvent) => {
    if (!viewer) return;

    const pickedObject = viewer.scene.pick(new window.Cesium.Cartesian2(event.clientX, event.clientY));
    
    if (pickedObject && pickedObject.id && typeof pickedObject.id.id === 'string') {
      const entityId = pickedObject.id.id;
      const agentId = entityId.replace('agent-', '').replace('ring-', '').replace('status-', '');
      
      const agent = agentNodesRef.current.get(agentId);
      if (agent) {
        setSelectedAgent(agent);
        onAgentSelect?.(agent);
        
        // Animate camera to agent
        const position = window.Cesium.Cartesian3.fromDegrees(
          agent.position.longitude,
          agent.position.latitude,
          agent.position.altitude + 200000
        );
        
        viewer.camera.flyTo({
          destination: position,
          duration: 2.0,
          orientation: {
            heading: 0.0,
            pitch: -window.Cesium.Math.PI_OVER_FOUR,
            roll: 0.0
          }
        });
      }
    }
  }, [viewer, onAgentSelect]);

  // Update agent status animations
  useEffect(() => {
    if (!viewer || agentEntities.size === 0) return;

    const animate = () => {
      const currentTime = Date.now() / 1000;
      
      agentEntities.forEach((entities, agentId) => {
        const agent = agentNodesRef.current.get(agentId);
        if (!agent || !entities.main) return;

        // Pulsing effect based on status
        const pulseSpeed = agent.status === 'processing' ? 2.0 : 
                          agent.status === 'alert' ? 4.0 : 1.0;
        const pulseIntensity = 0.3 + 0.2 * Math.sin(currentTime * pulseSpeed);
        
        // Update point size based on pulse
        if (entities.main.point) {
          entities.main.point.pixelSize = 15 + 5 * pulseIntensity;
        }

        // Update status indicator
        if (entities.status && entities.status.point) {
          entities.status.point.color = getStatusColor(agent.status).withAlpha(pulseIntensity);
        }

        // Orbital animation for active agents
        if (agent.status === 'active' && entities.ring) {
          const orbitSpeed = 0.1;
          const orbitAngle = currentTime * orbitSpeed;
          
          // Update orbital ring rotation (visual effect only)
          if (entities.ring.polyline && entities.ring.polyline.material) {
            const material = entities.ring.polyline.material;
            if (material.glowPower) {
              material.glowPower = 0.3 + 0.2 * Math.sin(orbitAngle);
            }
          }
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [viewer, agentEntities]);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return window.Cesium.Color.GREEN;
      case 'processing': return window.Cesium.Color.YELLOW;
      case 'alert': return window.Cesium.Color.RED;
      case 'idle': return window.Cesium.Color.GRAY;
      default: return window.Cesium.Color.WHITE;
    }
  };

  const generateAgentDescription = (agent: AgentNode) => {
    return `
      <div class="agent-details-panel" style="
        background: rgba(10, 10, 15, 0.95);
        border: 2px solid ${agent.color};
        border-radius: 8px;
        padding: 15px;
        color: #e0e0e0;
        font-family: 'Inter', sans-serif;
        max-width: 300px;
      ">
        <h3 style="color: ${agent.color}; margin: 0 0 10px 0;">
          ${agent.name} (${agent.codename})
        </h3>
        <div style="margin-bottom: 10px;">
          <strong>Role:</strong> ${agent.role}
        </div>
        <div style="margin-bottom: 10px;">
          <strong>Zone:</strong> ${agent.zone}
        </div>
        <div style="margin-bottom: 10px;">
          <strong>Status:</strong> 
          <span style="color: ${getStatusColor(agent.status).toCssColorString()}">
            ${agent.status.toUpperCase()}
          </span>
        </div>
        <div style="margin-bottom: 10px;">
          <strong>Performance:</strong> ${Math.round(agent.performance * 100)}%
        </div>
        <div style="margin-bottom: 10px;">
          <strong>Last Activity:</strong> ${agent.lastActivity}
        </div>
        <div style="margin-bottom: 10px;">
          <strong>Coordinates:</strong> 
          ${agent.position.latitude.toFixed(1)}°, ${agent.position.longitude.toFixed(1)}°
        </div>
        <div style="
          background: rgba(0, 0, 0, 0.3);
          padding: 8px;
          border-radius: 4px;
          margin-top: 10px;
          font-size: 0.8em;
        ">
          <strong style="color: #00ffff;">ARCSEC Status:</strong> VERIFIED<br/>
          <strong>Security Level:</strong> CLASSIFIED<br/>
          <strong>Last Update:</strong> ${new Date().toLocaleTimeString()}
        </div>
      </div>
    `;
  };

  // Agent interaction commands
  const sendCommandToAgent = useCallback((agentId: string, command: string) => {
    const agent = agentNodesRef.current.get(agentId);
    if (!agent) return;

    console.log(`Sending command to ${agent.name}: ${command}`);
    
    // Update agent status to processing
    updateAgentStatus(agentId, 'processing', command, agent.performance);
    
    // Simulate command execution
    setTimeout(() => {
      updateAgentStatus(agentId, 'active', `Completed: ${command}`, agent.performance);
    }, 3000);
  }, [updateAgentStatus]);

  // Communication line visualization
  const showAgentCommunication = useCallback((fromAgentId: string, toAgentId: string) => {
    if (!viewer) return;

    const fromAgent = agentNodesRef.current.get(fromAgentId);
    const toAgent = agentNodesRef.current.get(toAgentId);
    
    if (!fromAgent || !toAgent) return;

    const fromPosition = window.Cesium.Cartesian3.fromDegrees(
      fromAgent.position.longitude,
      fromAgent.position.latitude,
      fromAgent.position.altitude
    );
    
    const toPosition = window.Cesium.Cartesian3.fromDegrees(
      toAgent.position.longitude,
      toAgent.position.latitude,
      toAgent.position.altitude
    );

    const commLine = viewer.entities.add({
      id: `comm-${fromAgentId}-${toAgentId}`,
      polyline: {
        positions: [fromPosition, toPosition],
        width: 3,
        material: new window.Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.8,
          color: window.Cesium.Color.CYAN.withAlpha(0.8)
        }),
        clampToGround: false
      }
    });

    // Remove communication line after 3 seconds
    setTimeout(() => {
      viewer.entities.remove(commLine);
    }, 3000);
  }, [viewer]);

  return (
    <div className="interactive-agent-globe">
      {selectedAgent && (
        <div className="agent-control-panel" style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          width: '320px',
          background: 'rgba(10, 10, 15, 0.95)',
          border: `2px solid ${selectedAgent.color}`,
          borderRadius: '12px',
          padding: '20px',
          color: '#e0e0e0',
          fontFamily: 'Inter, sans-serif',
          zIndex: 1001
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: selectedAgent.color, margin: 0 }}>{selectedAgent.name}</h3>
            <button 
              onClick={() => setSelectedAgent(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ff6b6b',
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <div><strong>Status:</strong> {selectedAgent.status}</div>
            <div><strong>Performance:</strong> {Math.round(selectedAgent.performance * 100)}%</div>
            <div><strong>Zone:</strong> {selectedAgent.zone}</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => sendCommandToAgent(selectedAgent.id, 'Status Report')}
              style={{
                padding: '8px 12px',
                background: selectedAgent.color,
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Request Status Report
            </button>
            <button
              onClick={() => sendCommandToAgent(selectedAgent.id, 'Data Analysis')}
              style={{
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: `1px solid ${selectedAgent.color}`,
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Start Data Analysis
            </button>
            <button
              onClick={() => showAgentCommunication(selectedAgent.id, 'WATERSHED_REALMS')}
              style={{
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: `1px solid ${selectedAgent.color}`,
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Communicate with JARVIS
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default InteractiveAgentGlobe;