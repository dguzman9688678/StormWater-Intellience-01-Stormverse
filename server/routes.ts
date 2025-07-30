import { storage } from "./storage";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { NOAAService } from "./services/noaa-service";
import { KMZProcessor } from "./services/kmz-processor";
import { TripleStoreService } from "./services/triple-store-service";
import { ARCSECService } from "./services/arcsec-security";
import { stormDataProcessor } from "./services/storm-data-processor";
import { metadataProcessor } from "./services/metadata-processor";

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

  const httpServer = createServer(app);
  return httpServer;
}