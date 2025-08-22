import { Server as SocketServer } from 'socket.io';
import { Server } from 'http';
import { mlEngine } from './arcsec-ml-engine.js';
import { agentCoordinator } from './arcsec-agent-coordinator.js';
import { getErrorMessage } from './error-utils';

export interface WebSocketMessage {
  type: 'agent_prediction' | 'task_update' | 'system_status' | 'ml_training' | 'webhook_data';
  data: any;
  timestamp: Date;
  source?: string;
}

export interface WebhookData {
  id: string;
  source: string;
  event: string;
  payload: any;
  timestamp: Date;
  headers: Record<string, string>;
}

export class WebSocketService {
  private io: SocketServer;
  private connectedClients: Map<string, any> = new Map();
  private webhooks: Map<string, WebhookData[]> = new Map();
  private realtimeData: Map<string, any> = new Map();

  constructor(server: Server) {
    this.io = new SocketServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      transports: ['websocket', 'polling']
    });

    this.setupSocketHandlers();
    this.startRealtimeUpdates();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
      this.connectedClients.set(socket.id, {
        id: socket.id,
        connectedAt: new Date(),
        subscriptions: new Set()
      });

      // Handle client subscriptions
      socket.on('subscribe', (channels: string[]) => {
        const client = this.connectedClients.get(socket.id);
        if (client) {
          channels.forEach(channel => {
            client.subscriptions.add(channel);
            socket.join(channel);
          });
          
          socket.emit('subscribed', { channels, timestamp: new Date() });
        }
      });

      // Handle agent task requests
      socket.on('agent_task', async (taskData) => {
        try {
          const taskId = await agentCoordinator.assignTask({
            id: `task_${Date.now()}`,
            type: taskData.type,
            priority: taskData.priority || 'medium',
            payload: taskData.payload,
            status: 'pending',
            createdAt: new Date()
          });

          socket.emit('task_assigned', { taskId, timestamp: new Date() });
          
          // Monitor task progress
          this.monitorTask(taskId, socket.id);
        } catch (error) {
          socket.emit('task_error', { error: getErrorMessage(error), timestamp: new Date() });
        }
      });

      // Handle ML training requests
      socket.on('ml_train', async (trainingData) => {
        try {
          const result = await mlEngine.trainAgent(trainingData.agentId, trainingData.data);
          socket.emit('training_complete', { 
            agentId: trainingData.agentId, 
            success: result, 
            timestamp: new Date() 
          });
        } catch (error) {
          socket.emit('training_error', {
            agentId: trainingData.agentId,
            error: getErrorMessage(error),
            timestamp: new Date()
          });
        }
      });

      // Handle ML prediction requests
      socket.on('ml_predict', async (predictionData) => {
        try {
          const prediction = await mlEngine.predict(predictionData.agentId, predictionData.input);
          socket.emit('prediction_result', {
            agentId: predictionData.agentId,
            prediction,
            timestamp: new Date()
          });
        } catch (error) {
          socket.emit('prediction_error', {
            agentId: predictionData.agentId,
            error: getErrorMessage(error),
            timestamp: new Date()
          });
        }
      });

      // Handle real-time data requests
      socket.on('get_realtime_data', (dataType: string) => {
        const data = this.realtimeData.get(dataType);
        if (data) {
          socket.emit('realtime_data', { type: dataType, data, timestamp: new Date() });
        }
      });

      // Handle webhook registration
      socket.on('register_webhook', (webhookConfig) => {
        this.registerWebhook(webhookConfig.source, webhookConfig.events);
        socket.emit('webhook_registered', { 
          source: webhookConfig.source, 
          events: webhookConfig.events,
          timestamp: new Date() 
        });
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        this.connectedClients.delete(socket.id);
      });
    });
  }

  private async monitorTask(taskId: string, socketId: string) {
    const checkInterval = setInterval(async () => {
      try {
        const task = await agentCoordinator.getTaskStatus(taskId);
        if (task) {
          this.io.to(socketId).emit('task_update', {
            taskId,
            status: task.status,
            results: task.results,
            timestamp: new Date()
          });

          if (task.status === 'completed' || task.status === 'failed') {
            clearInterval(checkInterval);
          }
        }
      } catch (error) {
        clearInterval(checkInterval);
      }
    }, 1000);
  }

  private startRealtimeUpdates() {
    // System status updates every 5 seconds
    setInterval(async () => {
      try {
        const systemStatus = await agentCoordinator.getSystemOverview();
        const mlStatus = mlEngine.getSystemStatus();
        
        const statusUpdate = {
          system: systemStatus,
          ml: mlStatus,
          timestamp: new Date()
        };

        this.realtimeData.set('system_status', statusUpdate);
        this.broadcast('system_status', statusUpdate);
      } catch (error) {
        console.error('System status update error:', error);
      }
    }, 5000);

    // Agent workload updates every 10 seconds
    setInterval(async () => {
      try {
        const agentIds = ['JARVIS', 'STORM_CITADEL', 'ULTRON', 'PHOENIX', 'ODIN', 'ECHO', 'MITO', 'VADER'];
        const workloads = await Promise.all(
          agentIds.map(id => agentCoordinator.getAgentWorkload(id))
        );

        const workloadUpdate = {
          agents: workloads,
          timestamp: new Date()
        };

        this.realtimeData.set('agent_workloads', workloadUpdate);
        this.broadcast('agent_workloads', workloadUpdate);
      } catch (error) {
        console.error('Agent workload update error:', error);
      }
    }, 10000);
  }

  public broadcast(channel: string, data: any) {
    this.io.to(channel).emit('broadcast', {
      channel,
      data,
      timestamp: new Date()
    });
  }

  public broadcastToAll(message: WebSocketMessage) {
    this.io.emit('message', message);
  }

  public sendToClient(clientId: string, message: WebSocketMessage) {
    this.io.to(clientId).emit('message', message);
  }

  // Webhook handling
  public registerWebhook(source: string, events: string[]) {
    if (!this.webhooks.has(source)) {
      this.webhooks.set(source, []);
    }
    console.log(`Webhook registered for ${source}: ${events.join(', ')}`);
  }

  public handleWebhook(webhookData: WebhookData) {
    const sourceWebhooks = this.webhooks.get(webhookData.source) || [];
    sourceWebhooks.push(webhookData);
    this.webhooks.set(webhookData.source, sourceWebhooks.slice(-100)); // Keep last 100

    // Broadcast webhook data to subscribed clients
    this.broadcast(`webhook_${webhookData.source}`, webhookData);
    
    // Process webhook data based on source
    this.processWebhookData(webhookData);
  }

  private async processWebhookData(webhookData: WebhookData) {
    try {
      switch (webhookData.source) {
        case 'noaa':
          await this.processNOAAWebhook(webhookData);
          break;
        case 'github':
          await this.processGitHubWebhook(webhookData);
          break;
        case 'weather':
          await this.processWeatherWebhook(webhookData);
          break;
        default:
          console.log(`Unhandled webhook source: ${webhookData.source}`);
      }
    } catch (error) {
      console.error(`Webhook processing error for ${webhookData.source}:`, error);
    }
  }

  private async processNOAAWebhook(webhookData: WebhookData) {
    // Process NOAA weather data updates
    if (webhookData.event === 'weather_alert') {
      const taskId = await agentCoordinator.assignTask({
        id: `noaa_alert_${Date.now()}`,
        type: 'weather_analysis',
        priority: 'high',
        payload: webhookData.payload,
        status: 'pending',
        createdAt: new Date()
      });
      
      this.broadcast('weather_alert', {
        alert: webhookData.payload,
        taskId,
        timestamp: new Date()
      });
    }
  }

  private async processGitHubWebhook(webhookData: WebhookData) {
    // Process GitHub repository updates
    if (webhookData.event === 'push') {
      const taskId = await agentCoordinator.assignTask({
        id: `github_push_${Date.now()}`,
        type: 'optimization',
        priority: 'medium',
        payload: webhookData.payload,
        status: 'pending',
        createdAt: new Date()
      });
      
      this.broadcast('code_update', {
        commit: webhookData.payload,
        taskId,
        timestamp: new Date()
      });
    }
  }

  private async processWeatherWebhook(webhookData: WebhookData) {
    // Process general weather service updates
    const prediction = await mlEngine.predict('STORM_CITADEL', webhookData.payload);
    
    this.broadcast('weather_prediction', {
      prediction,
      originalData: webhookData.payload,
      timestamp: new Date()
    });
  }

  // Dynamic data fetching with caching
  public async fetchDynamicData(url: string, options: any = {}): Promise<any> {
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    const cached = this.realtimeData.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < (options.cacheTTL || 300000)) {
      return cached.data;
    }

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'StormVerse/3.5.0',
          ...options.headers
        },
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the result
      this.realtimeData.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error(`Dynamic data fetch error for ${url}:`, error);
      throw error;
    }
  }

  public getConnectedClients(): number {
    return this.connectedClients.size;
  }

  public getWebhookStats(): Record<string, { totalWebhooks: number; lastWebhook: Date | null }> {
    const stats: Record<string, { totalWebhooks: number; lastWebhook: Date | null }> = {};
    for (const [source, webhooks] of this.webhooks.entries()) {
      stats[source] = {
        totalWebhooks: webhooks.length,
        lastWebhook: webhooks.length > 0 ? webhooks[webhooks.length - 1].timestamp : null
      };
    }
    return stats;
  }
}

let websocketService: WebSocketService | null = null;

export function initializeWebSocketService(server: Server): WebSocketService {
  if (!websocketService) {
    websocketService = new WebSocketService(server);
  }
  return websocketService;
}

export function getWebSocketService(): WebSocketService | null {
  return websocketService;
}