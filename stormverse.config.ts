/**
 * StormVerse World Configuration
 * Central configuration for the entire StormVerse system
 * 
 * Copyright (c) 2025 Daniel Guzman - All Rights Reserved
 * ARCSEC Protocol v3.0X - WAR MODE ENFORCED
 */

export const STORMVERSE_CONFIG = {
  // World Identity
  identity: {
    creator: "Daniel Guzman",
    project: "StormVerse AI Network",
    version: "3.4.0",
    copyright: "© 2025 Daniel Guzman - All Rights Reserved",
    protocol: "ARCSEC v3.0X WAR MODE",
    imprint: "ARCSEC-IMPRINT-DG"
  },
  
  // World Environment
  world: {
    name: "StormVerse",
    description: "Environmental Intelligence Platform with AI Agent Network",
    dimensions: {
      globe: { radius: 6371000, segments: 64 },
      atmosphere: { height: 100000, layers: 5 },
      space: { orbitalRadius: 8000000, agentDistance: 1000000 }
    },
    theme: {
      primary: "cyberpunk",
      secondary: "environmental",
      mood: "dark-futuristic"
    }
  },
  
  // AI Agent System
  agents: {
    JARVIS: {
      id: "jarvis",
      name: "JARVIS",
      role: "Command Router & System Coordinator",
      color: "#00ffff",
      position: { lat: 0, lon: 0, altitude: 1000000 },
      capabilities: ["routing", "coordination", "command-processing"]
    },
    MITO: {
      id: "mito",
      name: "MITO",
      role: "Development & System Optimization",
      color: "#ff00ff",
      position: { lat: 45, lon: 0, altitude: 1000000 },
      capabilities: ["building", "optimization", "automation"]
    },
    PHOENIX: {
      id: "phoenix",
      name: "PHOENIX",
      role: "Memory & Data Resurrection",
      color: "#ff6600",
      position: { lat: -45, lon: 0, altitude: 1000000 },
      capabilities: ["memory", "recovery", "archival"]
    },
    ULTRON: {
      id: "ultron",
      name: "ULTRON",
      role: "Metadata Validation & Integrity",
      color: "#ff0000",
      position: { lat: 0, lon: 90, altitude: 1000000 },
      capabilities: ["validation", "verification", "metadata"]
    },
    VADER: {
      id: "vader",
      name: "VADER",
      role: "Surveillance & Network Resilience",
      color: "#330066",
      position: { lat: 0, lon: -90, altitude: 1000000 },
      capabilities: ["monitoring", "surveillance", "resilience"]
    },
    ODIN: {
      id: "odin",
      name: "ODIN",
      role: "Security & ARCSEC Enforcement",
      color: "#0066ff",
      position: { lat: 0, lon: 180, altitude: 1000000 },
      capabilities: ["security", "enforcement", "protection"]
    },
    ECHO: {
      id: "echo",
      name: "ECHO",
      role: "Audio Interface & Communication",
      color: "#9933ff",
      position: { lat: 0, lon: -180, altitude: 1000000 },
      capabilities: ["audio", "voice", "communication"]
    },
    STORM: {
      id: "storm",
      name: "STORM_CITADEL",
      role: "Weather Intelligence Core",
      color: "#00ff00",
      position: { lat: 90, lon: 0, altitude: 1500000 },
      capabilities: ["weather", "prediction", "environmental"]
    }
  },
  
  // Data Sources
  dataSources: {
    noaa: {
      name: "NOAA Weather Service",
      baseUrl: "https://api.weather.gov",
      endpoints: {
        alerts: "/alerts/active",
        radar: "/radar/stations",
        hurricanes: "/nhc/products"
      }
    },
    cesium: {
      name: "Cesium Ion",
      baseUrl: "https://api.cesium.com",
      assetIds: {
        terrain: 1,
        imagery: 2,
        buildings: 96188
      }
    }
  },
  
  // Quantum Configuration
  quantum: {
    dimensions: 19,
    qubits: 4.25,
    coherenceTime: 100,
    entanglementThreshold: 0.85,
    speedupFactor: 4,
    preservationRate: 0.741
  },
  
  // Security Protocols
  security: {
    protocol: "ARCSEC v3.0X",
    mode: "WAR MODE",
    hashAlgorithm: "SHA-256",
    signatureRequired: true,
    auditTrail: true,
    immutableIdentity: true
  },
  
  // Visualization Settings
  visualization: {
    cesiumToken: process.env.CESIUM_ION_TOKEN || "",
    defaultView: {
      lat: 28.5383,
      lon: -81.3792,
      altitude: 3000000
    },
    layers: {
      weather: true,
      hurricanes: true,
      radar: true,
      agents: true,
      quantum: true
    }
  },
  
  // System Settings
  system: {
    port: parseInt(process.env.PORT || "5000"),
    environment: process.env.NODE_ENV || "development",
    database: process.env.DATABASE_URL || "memory",
    logLevel: "info",
    maxFileSize: "50mb",
    sessionTimeout: 3600000
  }
};

export type StormVerseConfig = typeof STORMVERSE_CONFIG;
export type AgentConfig = typeof STORMVERSE_CONFIG.agents[keyof typeof STORMVERSE_CONFIG.agents];
export type WorldDimensions = typeof STORMVERSE_CONFIG.world.dimensions;