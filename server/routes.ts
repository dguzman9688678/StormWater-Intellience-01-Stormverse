import { storage } from "./storage";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { NOAAService } from "./services/noaa-service";
import { KMZProcessor } from "./services/kmz-processor";
import { TripleStoreService } from "./services/triple-store-service";
import { ARCSECService } from "./services/arcsec-security";
import { stormDataProcessor } from "./services/storm-data-processor";
import { metadataProcessor } from "./services/metadata-processor";
import { diagnosticsService } from "./services/diagnostics-service";
import { quantumService } from "./services/quantum-service";
import { agentService } from "./services/agent-service";
import { databaseService } from "./services/database-service";

const noaaService = new NOAAService();
const kmzProcessor = new KMZProcessor();
const tripleStoreService = new TripleStoreService();
const arcsecService = new ARCSECService();

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check route
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Weather data routes
  app.get('/api/weather/hurricanes', async (req, res) => {
    try {
      const data = await noaaService.getHurricaneData();
      res.json(data);
    } catch (error) {
      console.error('Hurricane data error:', error);
      
      // Professional fallback data
      const fallbackData = {
        hurricanes: [
          {
            id: 'demo_001',
            name: 'DEMO_HURRICANE_ALPHA',
            latitude: 25.5,
            longitude: -70.0,
            category: 3,
            windSpeed: 115,
            pressure: 945,
            movementSpeed: 12,
            movementDirection: 315,
            timestamp: new Date().toISOString(),
            arcsec: {
              source: 'FALLBACK_DATA',
              timestamp: new Date().toISOString(),
              authorship: 'STORM_CITADEL_AGENT',
              integrity_hash: 'sha256:demo_hurricane_v1'
            }
          }
        ],
        alerts: [
          {
            id: 'alert_001',
            type: 'HURRICANE_WARNING',
            severity: 'HIGH',
            headline: 'DEMONSTRATION MODE ACTIVE',
            description: 'API credentials needed for live NOAA data. Contact support@stormverse.ai for access.',
            areas: ['DEMO_REGION'],
            expires: new Date(Date.now() + 86400000).toISOString()
          }
        ],
        pressureSystems: [
          { 
            id: 'high_001', 
            type: 'high', 
            latitude: 35.0, 
            longitude: -75.0, 
            pressure: 1025,
            arcsec: {
              source: 'FALLBACK_DATA',
              timestamp: new Date().toISOString(),
              authorship: 'STORM_CITADEL_AGENT',
              integrity_hash: 'sha256:pressure_system_v1'
            }
          }
        ],
        timestamp: new Date().toISOString(),
        source: 'DEMO_MODE',
        status: 'fallback_active'
      };
      
      res.json(fallbackData);
    }
  });

  // KMZ processing routes
  app.post('/api/kmz/upload', async (req, res) => {
    try {
      // Handle KMZ file upload and processing
      const processedData = await kmzProcessor.processKMZ(req.body);
      
      // Transform to semantic entity format
      const semanticEntity = {
        '@context': 'https://schema.org/',
        '@type': 'GeoCoordinates',
        '@id': `kmz_${Date.now()}`,
        ...processedData
      };
      
      // Store in triple store
      await tripleStoreService.storeSemanticData(semanticEntity);
      
      res.json({ success: true, data: processedData });
    } catch (error) {
      console.error('KMZ processing error:', error);
      res.status(500).json({ error: 'Failed to process KMZ file' });
    }
  });

  // Triple store routes
  app.get('/api/data/semantic/:type', async (req, res) => {
    try {
      const { type } = req.params;
      const data = await tripleStoreService.queryByType(type);
      res.json(data);
    } catch (error) {
      console.error('Semantic data error:', error);
      res.status(500).json({ error: 'Failed to fetch semantic data' });
    }
  });

  app.post('/api/data/semantic', async (req, res) => {
    try {
      const result = await tripleStoreService.storeSemanticData(req.body);
      res.json({ success: true, id: result.id });
    } catch (error) {
      console.error('Semantic data storage error:', error);
      res.status(500).json({ error: 'Failed to store semantic data' });
    }
  });

  // Storm Data Integration routes
  app.get('/api/storm/metrics', async (req, res) => {
    try {
      const metrics = await stormDataProcessor.getStormMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('Storm metrics error:', error);
      res.status(500).json({ error: 'Failed to fetch storm metrics' });
    }
  });
  
  // ARCSEC security routes
  app.post('/api/security/verify', async (req, res) => {
    try {
      const verification = await arcsecService.verifyDataIntegrity(req.body);
      res.json(verification);
    } catch (error) {
      console.error('ARCSEC verification error:', error);
      res.status(500).json({ error: 'Security verification failed' });
    }
  });

  // System Metadata routes
  app.get('/api/metadata/system', async (req, res) => {
    try {
      const metadata = await metadataProcessor.getSystemMetadata();
      res.json(metadata);
    } catch (error) {
      console.error('System metadata error:', error);
      res.status(500).json({ error: 'Failed to fetch system metadata' });
    }
  });

  app.get('/api/metadata/session', async (req, res) => {
    try {
      const session = await metadataProcessor.getSessionStatus();
      res.json(session);
    } catch (error) {
      console.error('Session status error:', error);
      res.status(500).json({ error: 'Failed to fetch session status' });
    }
  });

  app.get('/api/metadata/arcsec', async (req, res) => {
    try {
      const arcsecStatus = await metadataProcessor.getARCSECStatus();
      res.json(arcsecStatus);
    } catch (error) {
      console.error('ARCSEC status error:', error);
      res.status(500).json({ error: 'Failed to fetch ARCSEC status' });
    }
  });

  // System Diagnostics routes
  app.get('/api/diagnostics', async (req, res) => {
    try {
      const diagnostics = await diagnosticsService.getDiagnostics();
      res.json(diagnostics);
    } catch (error) {
      console.error('Diagnostics error:', error);
      res.status(500).json({ error: 'Failed to fetch diagnostics' });
    }
  });

  app.get('/api/diagnostics/health', async (req, res) => {
    try {
      const health = await diagnosticsService.getSystemHealth();
      res.json(health);
    } catch (error) {
      console.error('System health error:', error);
      res.status(500).json({ error: 'Failed to fetch system health' });
    }
  });

  // Quantum Analysis routes
  app.get('/api/quantum/states', async (req, res) => {
    try {
      const states = await quantumService.getQuantumStates();
      res.json(states);
    } catch (error) {
      console.error('Quantum states error:', error);
      res.status(500).json({ error: 'Failed to fetch quantum states' });
    }
  });

  app.get('/api/quantum/entanglement', async (req, res) => {
    try {
      const entanglement = await quantumService.getEntanglement();
      res.json(entanglement);
    } catch (error) {
      console.error('Entanglement error:', error);
      res.status(500).json({ error: 'Failed to fetch entanglement data' });
    }
  });

  app.get('/api/quantum/metrics', async (req, res) => {
    try {
      const metrics = await quantumService.getQuantumMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('Quantum metrics error:', error);
      res.status(500).json({ error: 'Failed to fetch quantum metrics' });
    }
  });

  app.get('/api/quantum/analysis', async (req, res) => {
    try {
      const analysis = await quantumService.getQuantumAnalysis();
      res.json(analysis);
    } catch (error) {
      console.error('Quantum analysis error:', error);
      res.status(500).json({ error: 'Failed to fetch quantum analysis' });
    }
  });

  // AI Agent routes
  app.get('/api/agents', async (req, res) => {
    try {
      const agents = await agentService.getAgents();
      res.json(agents);
    } catch (error) {
      console.error('Agents error:', error);
      res.status(500).json({ error: 'Failed to fetch agents' });
    }
  });

  app.get('/api/agents/status', async (req, res) => {
    try {
      const status = await agentService.getAgentStatus();
      res.json(status);
    } catch (error) {
      console.error('Agent status error:', error);
      res.status(500).json({ error: 'Failed to fetch agent status' });
    }
  });

  app.get('/api/agents/:id', async (req, res) => {
    try {
      const agent = await agentService.getAgent(req.params.id);
      if (!agent) {
        res.status(404).json({ error: 'Agent not found' });
      } else {
        res.json(agent);
      }
    } catch (error) {
      console.error('Agent fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch agent' });
    }
  });

  app.put('/api/agents/:id/status', async (req, res) => {
    try {
      const { status } = req.body;
      const success = await agentService.updateAgentStatus(req.params.id, status);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Agent not found' });
      }
    } catch (error) {
      console.error('Agent update error:', error);
      res.status(500).json({ error: 'Failed to update agent status' });
    }
  });

  // Database Status routes
  app.get('/api/database/status', async (req, res) => {
    try {
      const status = await databaseService.getDatabaseStatus();
      res.json(status);
    } catch (error) {
      console.error('Database status error:', error);
      res.status(500).json({ error: 'Failed to fetch database status' });
    }
  });

  app.get('/api/database/schema/:table', async (req, res) => {
    try {
      const schema = await databaseService.getTableSchema(req.params.table);
      if (!schema) {
        res.status(404).json({ error: 'Table not found' });
      } else {
        res.json(schema);
      }
    } catch (error) {
      console.error('Table schema error:', error);
      res.status(500).json({ error: 'Failed to fetch table schema' });
    }
  });

  // System Status route (comprehensive)
  app.get('/api/system/status', async (req, res) => {
    try {
      const [health, agents, database, metadata, arcsec] = await Promise.all([
        diagnosticsService.getSystemHealth(),
        agentService.getAgentStatus(),
        databaseService.getDatabaseStatus(),
        metadataProcessor.getSystemMetadata(),
        metadataProcessor.getARCSECStatus()
      ]);
      
      res.json({
        health,
        agents: agents.agents,
        database: {
          connected: database.connected,
          type: database.type,
          tables: database.tables.length
        },
        project: metadata.metadata.project,
        creator: metadata.metadata.creator,
        arcsec: {
          status: arcsec.status,
          mode: arcsec.mode,
          protocol: arcsec.protocol
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('System status error:', error);
      res.status(500).json({ error: 'Failed to fetch system status' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}