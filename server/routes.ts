import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { NOAAService } from "./services/noaa-service";
import { KMZProcessor } from "./services/kmz-processor";
import { TripleStoreService } from "./services/triple-store-service";
import { ARCSECService } from "./services/arcsec-security";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize services
  const noaaService = new NOAAService();
  const kmzProcessor = new KMZProcessor();
  const tripleStoreService = new TripleStoreService();
  const arcsecService = new ARCSECService();

  // Weather data routes
  app.get('/api/weather/hurricanes', async (req, res) => {
    try {
      const hurricanes = await noaaService.getActiveHurricanes();
      res.json(hurricanes);
    } catch (error) {
      console.error('Hurricane data error:', error);
      res.status(500).json({ error: 'Failed to fetch hurricane data' });
    }
  });

  app.get('/api/weather/hurricanes/:id/track', async (req, res) => {
    try {
      const { id } = req.params;
      const track = await noaaService.getHurricaneTrack(id);
      res.json(track);
    } catch (error) {
      console.error('Hurricane track error:', error);
      res.status(500).json({ error: 'Failed to fetch hurricane track' });
    }
  });

  app.get('/api/weather/alerts', async (req, res) => {
    try {
      const alerts = await noaaService.getWeatherAlerts();
      res.json(alerts);
    } catch (error) {
      console.error('Weather alerts error:', error);
      res.status(500).json({ error: 'Failed to fetch weather alerts' });
    }
  });

  // KMZ processing routes
  app.post('/api/kmz/upload', async (req, res) => {
    try {
      // Handle KMZ file upload and processing
      const processedData = await kmzProcessor.processKMZ(req.body);
      
      // Store in triple store
      await tripleStoreService.storeSemanticData(processedData);
      
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

  // ARCSEC security routes
  app.post('/api/security/verify', async (req, res) => {
    try {
      const verification = await arcsecService.verifyDataIntegrity(req.body);
      res.json(verification);
    } catch (error) {
      console.error('Security verification error:', error);
      res.status(500).json({ error: 'Failed to verify data integrity' });
    }
  });

  app.get('/api/security/audit/:dataId', async (req, res) => {
    try {
      const { dataId } = req.params;
      const audit = await arcsecService.getAuditTrail(dataId);
      res.json(audit);
    } catch (error) {
      console.error('Audit trail error:', error);
      res.status(500).json({ error: 'Failed to fetch audit trail' });
    }
  });

  // Agent status routes
  app.get('/api/agents/status', async (req, res) => {
    try {
      // Return current agent statuses
      const agentStatuses = {
        'storm-citadel': { status: 'active', activity: 'AI CONTROL TOWERS OPERATIONAL' },
        'codex-temple': { status: 'active', activity: 'POLICY SIMULATIONS RUNNING' },
        'skywall': { status: 'active', activity: 'ATMOSPHERIC MONITORING' },
        'mirrorfield': { status: 'active', activity: 'POLICY SIMULATIONS ACTIVE' },
        'watershed-realms': { status: 'active', activity: 'HYDROLOGICAL ANALYSIS' },
        'sanctum-of-self': { status: 'active', activity: 'MEMORY CORE PROCESSING' },
        'arcsec-citadel': { status: 'active', activity: 'SECURITY PROTOCOLS ACTIVE' },
        'phoenix-core': { status: 'active', activity: 'QUANTUM RENDERING' }
      };
      
      res.json(agentStatuses);
    } catch (error) {
      console.error('Agent status error:', error);
      res.status(500).json({ error: 'Failed to fetch agent status' });
    }
  });

  // Real-time data feed route
  app.get('/api/feed/live', async (req, res) => {
    try {
      const liveData = {
        hurricanes: await noaaService.getActiveHurricanes(),
        alerts: await noaaService.getWeatherAlerts(),
        timestamp: new Date().toISOString(),
        systemStatus: 'operational'
      };
      
      res.json(liveData);
    } catch (error) {
      console.error('Live feed error:', error);
      res.status(500).json({ error: 'Failed to fetch live data' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
