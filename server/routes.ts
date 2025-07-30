import { storage } from "./storage";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketServer } from "socket.io";
import rateLimit from "express-rate-limit";
import axios from "axios";
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
import { mlEngine } from "./services/ml-engine.js";
import { agentCoordinator } from "./services/agent-coordinator.js";
import { arcsecHandler } from "./services/arcsec-universal-handler.js";

const noaaService = new NOAAService();
const kmzProcessor = new KMZProcessor();
const tripleStoreService = new TripleStoreService();
const arcsecService = new ARCSECService();

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' }
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs for ML endpoints
  message: { error: 'Rate limit exceeded for ML operations.' }
});

export async function registerRoutes(app: Express): Promise<Server> {
  const server = createServer(app);
  
  // Initialize WebSocket service
  const { initializeWebSocketService } = await import('./services/websocket-service.js');
  const wsService = initializeWebSocketService(server);

  // Apply rate limiting to API routes
  app.use('/api', apiLimiter);
  app.use('/api/ml', strictLimiter);
  app.use('/api/webhook', strictLimiter);

  // Health check route
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      connectedClients: wsService.getConnectedClients(),
      webhookStats: wsService.getWebhookStats()
    });
  });

  // Machine Learning API Routes
  app.get('/api/ml/models', async (req, res) => {
    try {
      const models = mlEngine.getAllModels();
      const modelArray = Array.from(models.entries()).map(([id, config]) => ({
        agentId: id,
        ...config
      }));
      res.json({ models: modelArray, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/ml/system-status', async (req, res) => {
    try {
      const status = mlEngine.getSystemStatus();
      res.json({ status, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/ml/agent/:agentId/metrics', async (req, res) => {
    try {
      const { agentId } = req.params;
      const metrics = await mlEngine.getModelMetrics(agentId);
      res.json({ metrics, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ml/agent/:agentId/train', async (req, res) => {
    try {
      const { agentId } = req.params;
      const { trainingData } = req.body;
      
      if (!trainingData) {
        return res.status(400).json({ error: 'Training data is required' });
      }

      const result = await mlEngine.trainAgent(agentId, trainingData);
      res.json({ success: result, agentId, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ml/agent/:agentId/predict', async (req, res) => {
    try {
      const { agentId } = req.params;
      const { input } = req.body;
      
      if (!input) {
        return res.status(400).json({ error: 'Input data is required' });
      }

      const prediction = await mlEngine.predict(agentId, input);
      res.json({ prediction, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ml/agent/:agentId/optimize', async (req, res) => {
    try {
      const { agentId } = req.params;
      const result = await mlEngine.optimizeModel(agentId);
      res.json({ optimized: result, agentId, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Agent Coordination API Routes
  app.get('/api/agents/overview', async (req, res) => {
    try {
      const overview = await agentCoordinator.getSystemOverview();
      res.json({ overview, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/agents/:agentId/workload', async (req, res) => {
    try {
      const { agentId } = req.params;
      const workload = await agentCoordinator.getAgentWorkload(agentId);
      res.json({ workload, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/agents/task', async (req, res) => {
    try {
      const { type, priority, payload } = req.body;
      
      if (!type || !payload) {
        return res.status(400).json({ error: 'Task type and payload are required' });
      }

      const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const assignedAgent = await agentCoordinator.assignTask({
        id: taskId,
        type,
        priority: priority || 'medium',
        payload,
        status: 'pending',
        createdAt: new Date()
      });

      res.json({ taskId, assignedAgent, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/agents/task/:taskId', async (req, res) => {
    try {
      const { taskId } = req.params;
      const task = await agentCoordinator.getTaskStatus(taskId);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json({ task, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Webhook endpoints
  app.post('/api/webhook/:source', async (req, res) => {
    try {
      const { source } = req.params;
      const webhookData = {
        id: `webhook_${Date.now()}`,
        source,
        event: req.headers['x-event-type'] || 'unknown',
        payload: req.body,
        timestamp: new Date(),
        headers: req.headers
      };

      wsService.handleWebhook(webhookData);
      res.json({ received: true, webhookId: webhookData.id, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Dynamic data fetching endpoint
  app.post('/api/fetch', async (req, res) => {
    try {
      const { url, options } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      const data = await wsService.fetchDynamicData(url, options);
      res.json({ data, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ARCSEC Logic Master Controller Routes
  app.get('/api/logic/status', async (req, res) => {
    try {
      const { arcsecLogicController } = await import('./services/arcsec-logic-master-controller');
      const status = arcsecLogicController.getLogicStatus();
      res.json({ status, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/logic/rules', async (req, res) => {
    try {
      const { arcsecLogicController } = await import('./services/arcsec-logic-master-controller');
      const rules = arcsecLogicController.getLogicRules();
      res.json({ rules, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/logic/decisions', async (req, res) => {
    try {
      const { arcsecLogicController } = await import('./services/arcsec-logic-master-controller');
      const limit = parseInt(req.query.limit as string) || 10;
      const decisions = arcsecLogicController.getDecisionHistory(limit);
      res.json({ decisions, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/logic/manual-decision', async (req, res) => {
    try {
      const { arcsecLogicController } = await import('./services/arcsec-logic-master-controller');
      const decision = await arcsecLogicController.executeManualDecision(req.body.context);
      res.json({ decision, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/logic/add-rule', async (req, res) => {
    try {
      const { arcsecLogicController } = await import('./services/arcsec-logic-master-controller');
      const success = arcsecLogicController.addLogicRule(req.body);
      res.json({ success, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ARCSEC Server Management Routes
  app.get('/api/server/status', async (req, res) => {
    try {
      const { arcsecServer } = await import('./services/arcsec-server');
      const statistics = arcsecServer.getServerStatistics();
      res.json({ statistics, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/server/instances', async (req, res) => {
    try {
      const { arcsecServer } = await import('./services/arcsec-server');
      const filters = {
        type: req.query.type as any,
        status: req.query.status as any,
        minHealthScore: req.query.minHealthScore ? parseInt(req.query.minHealthScore as string) : undefined
      };
      const instances = arcsecServer.getServerInstances(filters);
      res.json({ instances, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/server/restart/:serverId', async (req, res) => {
    try {
      const { arcsecServer } = await import('./services/arcsec-server');
      const result = await arcsecServer.restartServer(req.params.serverId);
      res.json({ result, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/server/deploy', async (req, res) => {
    try {
      const { arcsecServer } = await import('./services/arcsec-server');
      const result = await arcsecServer.deployServer(req.body.deploymentId);
      res.json({ result, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ARCSEC Environment Management Routes
  app.get('/api/environment/status', async (req, res) => {
    try {
      const { arcsecEnvironment } = await import('./services/arcsec-environment');
      const statistics = arcsecEnvironment.getEnvironmentStatistics();
      res.json({ statistics, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/environment/configs', async (req, res) => {
    try {
      const { arcsecEnvironment } = await import('./services/arcsec-environment');
      const filters = {
        type: req.query.type as any,
        status: req.query.status as any
      };
      const environments = arcsecEnvironment.getEnvironments(filters);
      res.json({ environments, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/environment/compare', async (req, res) => {
    try {
      const { arcsecEnvironment } = await import('./services/arcsec-environment');
      const { sourceId, targetId } = req.body;
      const comparison = arcsecEnvironment.compareEnvironments(sourceId, targetId);
      res.json({ comparison, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ARCSEC Sandbox Routes
  app.get('/api/sandbox/status', async (req, res) => {
    try {
      const { arcsecSandbox } = await import('./services/arcsec-sandbox');
      const statistics = arcsecSandbox.getSandboxStatistics();
      res.json({ statistics, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/sandbox/instances', async (req, res) => {
    try {
      const { arcsecSandbox } = await import('./services/arcsec-sandbox');
      const filters = {
        type: req.query.type as any,
        status: req.query.status as any,
        environment: req.query.environment as string
      };
      const sandboxes = arcsecSandbox.getSandboxes(filters);
      res.json({ sandboxes, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/sandbox/templates', async (req, res) => {
    try {
      const { arcsecSandbox } = await import('./services/arcsec-sandbox');
      const filters = { type: req.query.type as any };
      const templates = arcsecSandbox.getTemplates(filters);
      res.json({ templates, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/sandbox/create', async (req, res) => {
    try {
      const { arcsecSandbox } = await import('./services/arcsec-sandbox');
      const sandbox = arcsecSandbox.createSandbox(req.body);
      res.json({ sandbox, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/sandbox/start/:sandboxId', async (req, res) => {
    try {
      const { arcsecSandbox } = await import('./services/arcsec-sandbox');
      const result = await arcsecSandbox.startSandbox(req.params.sandboxId);
      res.json({ result, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/sandbox/terminate/:sandboxId', async (req, res) => {
    try {
      const { arcsecSandbox } = await import('./services/arcsec-sandbox');
      const result = await arcsecSandbox.terminateSandbox(req.params.sandboxId, req.body.reason);
      res.json({ result, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ARCSEC Security API Routes
  app.get('/api/arcsec/status', async (req, res) => {
    try {
      const status = arcsecHandler.getSystemStatus();
      res.json({ status, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/arcsec/protected-files', async (req, res) => {
    try {
      const files = arcsecHandler.getProtectedFiles();
      const fileList = Array.from(files.entries()).map(([path, file]) => ({
        filepath: path,
        protectionLevel: file.protectionLevel,
        lastModified: file.lastModified,
        immutable: file.immutable,
        signature: file.signature
      }));
      res.json({ protectedFiles: fileList, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/arcsec/protect-file', async (req, res) => {
    try {
      const { filepath, protectionLevel } = req.body;
      
      if (!filepath) {
        return res.status(400).json({ error: 'Filepath is required' });
      }

      const protectedFile = await arcsecHandler.protectFile(filepath, protectionLevel || 'WAR_MODE');
      res.json({ 
        success: true, 
        protectedFile: {
          filepath: protectedFile.filepath,
          protectionLevel: protectedFile.protectionLevel,
          signature: protectedFile.signature
        },
        timestamp: new Date() 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/arcsec/verify-file/:filepath(*)', async (req, res) => {
    try {
      const { filepath } = req.params;
      const isValid = await arcsecHandler.verifyFile(filepath);
      res.json({ filepath, isValid, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/arcsec/verify-system', async (req, res) => {
    try {
      const systemState = await arcsecHandler.verifySystemIntegrity();
      res.json({ systemState, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/arcsec/emergency-lockdown', async (req, res) => {
    try {
      await arcsecHandler.emergencyLockdown();
      res.json({ lockdownCompleted: true, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/arcsec/compliance-report', async (req, res) => {
    try {
      const report = await arcsecHandler.generateComplianceReport();
      res.json({ report, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/arcsec/create-snapshot', async (req, res) => {
    try {
      const snapshotPath = await arcsecHandler.createSystemSnapshot();
      res.json({ snapshotPath, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
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