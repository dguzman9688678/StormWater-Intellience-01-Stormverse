// StormVerse Stats Overlay
// Handles real-time statistics and agent status monitoring

class StatsOverlay {
  constructor(viewer) {
    this.viewer = viewer;
    this.overlayElement = null;
    this.agents = new Map();
    this.weatherStats = {};
    this.systemMetrics = {};
    this.updateInterval = null;
    
    this.initializeOverlay();
    console.log('Stats Overlay initialized');
  }

  /**
   * Initialize the stats overlay DOM element
   */
  initializeOverlay() {
    // Create overlay container
    this.overlayElement = document.createElement('div');
    this.overlayElement.id = 'stormverse-stats-overlay';
    this.overlayElement.className = 'stats-overlay cyberpunk-panel';
    
    // Add to viewer container
    const viewerContainer = this.viewer.container;
    viewerContainer.appendChild(this.overlayElement);
    
    // Initialize agent monitoring
    this.initializeAgents();
    
    // Start real-time updates
    this.startRealTimeUpdates();
  }

  /**
   * Initialize the 8-agent AI system monitoring
   */
  initializeAgents() {
    const agentConfig = [
      { 
        id: 'STORM_CITADEL', 
        name: 'Storm Citadel',
        role: 'Forecast Logic & Weather Prediction',
        zone: 'Global Weather Analysis',
        coordinates: { lat: 25.0, lon: -80.0 }
      },
      { 
        id: 'CODEX_TEMPLE', 
        name: 'Codex Temple',
        role: 'Metadata Validation (ULTRON)',
        zone: 'Data Integrity Systems',
        coordinates: { lat: 40.0, lon: -74.0 }
      },
      { 
        id: 'SKYWALL', 
        name: 'SkyWall',
        role: 'Development Automation (MITO)',
        zone: 'System Automation',
        coordinates: { lat: 37.0, lon: -122.0 }
      },
      { 
        id: 'MIRRORFIELD', 
        name: 'MirrorField',
        role: 'Memory & Data Resurrection (PHOENIX)',
        zone: 'Data Recovery Systems',
        coordinates: { lat: 51.5, lon: -0.1 }
      },
      { 
        id: 'WATERSHED_REALMS', 
        name: 'Watershed Realms',
        role: 'Command Routing (JARVIS)',
        zone: 'Command & Control',
        coordinates: { lat: 35.0, lon: 139.0 }
      },
      { 
        id: 'SANCTUM_OF_SELF', 
        name: 'Sanctum of Self',
        role: 'Audio/Voice Interface (ECHO)',
        zone: 'Human-AI Interface',
        coordinates: { lat: -33.9, lon: 151.2 }
      },
      { 
        id: 'ARCSEC_CITADEL', 
        name: 'ARCSEC Citadel',
        role: 'Security Protocols (ODIN)',
        zone: 'Data Security & Verification',
        coordinates: { lat: 55.7, lon: 12.6 }
      },
      { 
        id: 'PHOENIX_CORE', 
        name: 'Phoenix Core',
        role: 'Surveillance & System Resilience (VADER)',
        zone: 'System Monitoring',
        coordinates: { lat: -22.9, lon: -43.2 }
      }
    ];

    agentConfig.forEach(agent => {
      this.agents.set(agent.id, {
        ...agent,
        status: 'active',
        activity: 'monitoring',
        lastUpdate: new Date(),
        performance: Math.random() * 0.3 + 0.7, // 70-100% performance
        tasksCompleted: 0,
        dataProcessed: 0
      });
    });
  }

  /**
   * Start real-time statistics updates
   */
  startRealTimeUpdates() {
    this.updateInterval = setInterval(() => {
      this.updateAgentStats();
      this.updateWeatherStats();
      this.updateSystemMetrics();
      this.renderOverlay();
    }, 2000); // Update every 2 seconds
  }

  /**
   * Update agent statistics
   */
  updateAgentStats() {
    this.agents.forEach((agent, id) => {
      // Simulate agent activity
      agent.lastUpdate = new Date();
      agent.performance = Math.max(0.5, agent.performance + (Math.random() - 0.5) * 0.1);
      
      // Simulate task completion
      if (Math.random() < 0.3) {
        agent.tasksCompleted++;
      }
      
      // Simulate data processing
      agent.dataProcessed += Math.floor(Math.random() * 1000);
      
      // Update activity status
      const activities = ['monitoring', 'analyzing', 'processing', 'predicting', 'securing'];
      if (Math.random() < 0.2) {
        agent.activity = activities[Math.floor(Math.random() * activities.length)];
      }
    });
  }

  /**
   * Update weather statistics
   */
  updateWeatherStats() {
    this.weatherStats = {
      activeStorms: Math.floor(Math.random() * 5) + 1,
      weatherAlerts: Math.floor(Math.random() * 12) + 3,
      dataPoints: Math.floor(Math.random() * 10000) + 50000,
      lastNOAAUpdate: new Date(),
      predictionAccuracy: Math.random() * 0.15 + 0.85, // 85-100%
      probabilityModels: Math.floor(Math.random() * 3) + 8
    };
  }

  /**
   * Update system performance metrics
   */
  updateSystemMetrics() {
    this.systemMetrics = {
      cpuUsage: Math.random() * 0.4 + 0.3, // 30-70%
      memoryUsage: Math.random() * 0.3 + 0.4, // 40-70%
      networkLatency: Math.floor(Math.random() * 50) + 25, // 25-75ms
      cesiumFPS: Math.floor(Math.random() * 20) + 40, // 40-60 FPS
      quantumRendering: Math.random() * 0.2 + 0.8, // 80-100%
      arcsecIntegrity: Math.random() * 0.05 + 0.95 // 95-100%
    };
  }

  /**
   * Render the statistics overlay
   */
  renderOverlay() {
    const agentStatuses = Array.from(this.agents.values())
      .map(agent => this.renderAgentStatus(agent))
      .join('');

    this.overlayElement.innerHTML = `
      <div class="stats-container">
        <!-- Header -->
        <div class="stats-header">
          <h2 class="stats-title">STORMVERSE NEXUS</h2>
          <div class="system-time">${new Date().toISOString()}</div>
        </div>

        <!-- Agent Network Status -->
        <div class="stats-section">
          <h3 class="section-title">AI AGENT NETWORK</h3>
          <div class="agents-grid">
            ${agentStatuses}
          </div>
        </div>

        <!-- Weather Intelligence -->
        <div class="stats-section">
          <h3 class="section-title">WEATHER INTELLIGENCE</h3>
          <div class="weather-metrics">
            <div class="metric">
              <span class="metric-label">Active Storms</span>
              <span class="metric-value storm-count">${this.weatherStats.activeStorms}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Weather Alerts</span>
              <span class="metric-value alert-count">${this.weatherStats.weatherAlerts}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Data Points</span>
              <span class="metric-value data-count">${this.weatherStats.dataPoints.toLocaleString()}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Prediction Accuracy</span>
              <span class="metric-value accuracy">${Math.round(this.weatherStats.predictionAccuracy * 100)}%</span>
            </div>
          </div>
        </div>

        <!-- System Performance -->
        <div class="stats-section">
          <h3 class="section-title">SYSTEM PERFORMANCE</h3>
          <div class="performance-metrics">
            <div class="performance-bar">
              <span class="perf-label">CPU Usage</span>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${this.systemMetrics.cpuUsage * 100}%"></div>
              </div>
              <span class="perf-value">${Math.round(this.systemMetrics.cpuUsage * 100)}%</span>
            </div>
            <div class="performance-bar">
              <span class="perf-label">Memory</span>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${this.systemMetrics.memoryUsage * 100}%"></div>
              </div>
              <span class="perf-value">${Math.round(this.systemMetrics.memoryUsage * 100)}%</span>
            </div>
            <div class="performance-bar">
              <span class="perf-label">Quantum Rendering</span>
              <div class="progress-bar">
                <div class="progress-fill quantum" style="width: ${this.systemMetrics.quantumRendering * 100}%"></div>
              </div>
              <span class="perf-value">${Math.round(this.systemMetrics.quantumRendering * 100)}%</span>
            </div>
          </div>
        </div>

        <!-- ARCSEC Security -->
        <div class="stats-section">
          <h3 class="section-title">ARCSEC SECURITY</h3>
          <div class="security-status">
            <div class="security-metric">
              <span class="sec-label">Data Integrity</span>
              <span class="sec-value secure">${Math.round(this.systemMetrics.arcsecIntegrity * 100)}%</span>
            </div>
            <div class="security-metric">
              <span class="sec-label">Network Latency</span>
              <span class="sec-value">${this.systemMetrics.networkLatency}ms</span>
            </div>
            <div class="security-metric">
              <span class="sec-label">Cesium FPS</span>
              <span class="sec-value">${this.systemMetrics.cesiumFPS}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render individual agent status
   */
  renderAgentStatus(agent) {
    const statusClass = agent.status === 'active' ? 'status-active' : 'status-inactive';
    const performanceClass = agent.performance > 0.8 ? 'perf-excellent' : 
                            agent.performance > 0.6 ? 'perf-good' : 'perf-low';

    return `
      <div class="agent-status ${statusClass}">
        <div class="agent-header">
          <span class="agent-name">${agent.name}</span>
          <span class="agent-indicator ${statusClass}"></span>
        </div>
        <div class="agent-role">${agent.role}</div>
        <div class="agent-metrics">
          <div class="agent-metric">
            <span class="agent-metric-label">Performance</span>
            <span class="agent-metric-value ${performanceClass}">
              ${Math.round(agent.performance * 100)}%
            </span>
          </div>
          <div class="agent-metric">
            <span class="agent-metric-label">Activity</span>
            <span class="agent-activity">${agent.activity}</span>
          </div>
          <div class="agent-metric">
            <span class="agent-metric-label">Tasks</span>
            <span class="agent-metric-value">${agent.tasksCompleted}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get current statistics summary
   */
  getStatsSummary() {
    return {
      agents: {
        total: this.agents.size,
        active: Array.from(this.agents.values()).filter(a => a.status === 'active').length,
        averagePerformance: Array.from(this.agents.values())
          .reduce((sum, a) => sum + a.performance, 0) / this.agents.size
      },
      weather: this.weatherStats,
      system: this.systemMetrics,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Update agent status (called from external systems)
   */
  updateAgentStatus(agentId, status, activity, performance) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status || agent.status;
      agent.activity = activity || agent.activity;
      agent.performance = performance !== undefined ? performance : agent.performance;
      agent.lastUpdate = new Date();
    }
  }

  /**
   * Toggle overlay visibility
   */
  toggleVisibility() {
    if (this.overlayElement) {
      this.overlayElement.style.display = 
        this.overlayElement.style.display === 'none' ? 'block' : 'none';
    }
  }

  /**
   * Destroy the overlay
   */
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (this.overlayElement && this.overlayElement.parentNode) {
      this.overlayElement.parentNode.removeChild(this.overlayElement);
    }
    console.log('Stats Overlay destroyed');
  }
}

// Export for use in StormVerse system
window.StatsOverlay = StatsOverlay;