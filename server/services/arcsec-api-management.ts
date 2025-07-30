/**
 * ARCSEC API Management v3.0X
 * Advanced API gateway, rate limiting, and endpoint management
 * © 2025 Daniel Guzman - All Rights Reserved
 * Digital Signature: a6672edf248c5eeef3054ecca057075c938af653
 */

import { EventEmitter } from 'events';
import { arcsecMasterLogController } from './arcsec-master-log-controller';

export interface APIEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
  handler: string;
  authentication: AuthConfig;
  rateLimit: RateLimitConfig;
  validation: ValidationConfig;
  caching: CacheConfig;
  monitoring: MonitoringConfig;
  metadata: EndpointMetadata;
  enabled: boolean;
}

export interface AuthConfig {
  required: boolean;
  type: 'NONE' | 'API_KEY' | 'JWT' | 'OAUTH' | 'BASIC' | 'CUSTOM';
  roles: string[];
  permissions: string[];
  scopes: string[];
}

export interface RateLimitConfig {
  enabled: boolean;
  windowMs: number;
  maxRequests: number;
  skipIf?: string;
  keyGenerator?: string;
  strategy: 'FIXED' | 'SLIDING' | 'TOKEN_BUCKET' | 'LEAKY_BUCKET';
}

export interface ValidationConfig {
  enabled: boolean;
  requestSchema?: any;
  responseSchema?: any;
  headers?: Record<string, string>;
  queryParams?: Record<string, any>;
  bodyValidation?: boolean;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number;
  strategy: 'MEMORY' | 'REDIS' | 'DATABASE' | 'DISTRIBUTED';
  keyPattern?: string;
  tags?: string[];
  invalidationEvents?: string[];
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics: string[];
  alerts: AlertConfig[];
  logging: LoggingConfig;
  tracing: TracingConfig;
}

export interface AlertConfig {
  type: 'LATENCY' | 'ERROR_RATE' | 'THROUGHPUT' | 'AVAILABILITY';
  threshold: number;
  window: number;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  notifications: string[];
}

export interface LoggingConfig {
  level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';
  includeRequest: boolean;
  includeResponse: boolean;
  includeHeaders: boolean;
  maskSensitive: boolean;
}

export interface TracingConfig {
  enabled: boolean;
  sampleRate: number;
  includeDatabase: boolean;
  includeExternal: boolean;
}

export interface EndpointMetadata {
  name: string;
  description: string;
  version: string;
  category: string;
  tags: string[];
  created: Date;
  updated: Date;
  owner: string;
  deprecated: boolean;
  deprecationDate?: Date;
  replacement?: string;
}

export interface APIRequest {
  id: string;
  endpoint: string;
  method: string;
  timestamp: Date;
  clientId?: string;
  userAgent: string;
  ip: string;
  headers: Record<string, string>;
  queryParams: Record<string, any>;
  body?: any;
  responseTime?: number;
  statusCode?: number;
  error?: string;
  cached: boolean;
}

export interface APIMetrics {
  endpoint: string;
  method: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  errorRate: number;
  throughput: number;
  lastRequest?: Date;
  cacheHitRate: number;
}

export class ARCSECAPIManagement extends EventEmitter {
  private endpoints: Map<string, APIEndpoint> = new Map();
  private requests: APIRequest[] = [];
  private metrics: Map<string, APIMetrics> = new Map();
  private rateLimitStore: Map<string, any> = new Map();
  private cache: Map<string, any> = new Map();
  private digitalSignature = 'a6672edf248c5eeef3054ecca057075c938af653';
  
  private metricsInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private alertingInterval: NodeJS.Timeout | null = null;
  
  private maxRequestHistory = 10000;
  private maxCacheSize = 1000;
  private requestRetention = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor() {
    super();
    this.initializeAPIManagement();
    console.log('🔌 ARCSEC API Management v3.0X - INITIALIZING');
    console.log(`🛡️  Digital Signature: ${this.digitalSignature}`);
    console.log('⚡ API Gateway & Management: ACTIVE');
  }

  private initializeAPIManagement(): void {
    this.registerDefaultEndpoints();
    this.startMetricsCollection();
    this.startCleanupProcess();
    this.startAlertingSystem();

    arcsecMasterLogController.log({
      level: 'INFO',
      category: 'SYSTEM',
      source: 'APIManagement',
      message: 'ARCSEC API Management initialized',
      metadata: {
        version: '3.0X',
        endpoints: this.endpoints.size,
        maxRequestHistory: this.maxRequestHistory
      }
    });
  }

  private registerDefaultEndpoints(): void {
    const defaultEndpoints: Omit<APIEndpoint, 'id'>[] = [
      {
        path: '/api/health',
        method: 'GET',
        handler: 'health.check',
        authentication: { required: false, type: 'NONE', roles: [], permissions: [], scopes: [] },
        rateLimit: { enabled: true, windowMs: 60000, maxRequests: 100, strategy: 'FIXED' },
        validation: { enabled: false },
        caching: { enabled: true, ttl: 30000, strategy: 'MEMORY' },
        monitoring: {
          enabled: true,
          metrics: ['latency', 'throughput', 'errors'],
          alerts: [],
          logging: { level: 'INFO', includeRequest: false, includeResponse: false, includeHeaders: false, maskSensitive: true },
          tracing: { enabled: false, sampleRate: 0.1, includeDatabase: false, includeExternal: false }
        },
        metadata: {
          name: 'Health Check',
          description: 'System health status endpoint',
          version: '1.0.0',
          category: 'system',
          tags: ['health', 'monitoring'],
          created: new Date(),
          updated: new Date(),
          owner: 'system',
          deprecated: false
        },
        enabled: true
      },
      {
        path: '/api/arcsec/status',
        method: 'GET',
        handler: 'arcsec.status',
        authentication: { required: true, type: 'API_KEY', roles: ['admin'], permissions: ['read'], scopes: ['system'] },
        rateLimit: { enabled: true, windowMs: 60000, maxRequests: 50, strategy: 'SLIDING' },
        validation: { enabled: true, headers: { 'X-API-Key': 'required' } },
        caching: { enabled: true, ttl: 60000, strategy: 'MEMORY', tags: ['arcsec', 'status'] },
        monitoring: {
          enabled: true,
          metrics: ['latency', 'throughput', 'errors', 'auth_failures'],
          alerts: [
            { type: 'ERROR_RATE', threshold: 0.1, window: 300000, severity: 'WARNING', notifications: ['admin'] }
          ],
          logging: { level: 'INFO', includeRequest: true, includeResponse: false, includeHeaders: true, maskSensitive: true },
          tracing: { enabled: true, sampleRate: 1.0, includeDatabase: false, includeExternal: false }
        },
        metadata: {
          name: 'ARCSEC Status',
          description: 'ARCSEC system status and metrics',
          version: '3.0.0',
          category: 'security',
          tags: ['arcsec', 'status', 'security'],
          created: new Date(),
          updated: new Date(),
          owner: 'arcsec',
          deprecated: false
        },
        enabled: true
      },
      {
        path: '/api/research/queries',
        method: 'POST',
        handler: 'research.createQuery',
        authentication: { required: true, type: 'JWT', roles: ['analyst', 'admin'], permissions: ['research:create'], scopes: ['research'] },
        rateLimit: { enabled: true, windowMs: 300000, maxRequests: 20, strategy: 'TOKEN_BUCKET' },
        validation: { enabled: true, bodyValidation: true, requestSchema: 'research-query-schema' },
        caching: { enabled: false, ttl: 0, strategy: 'MEMORY' },
        monitoring: {
          enabled: true,
          metrics: ['latency', 'throughput', 'errors', 'validation_failures'],
          alerts: [
            { type: 'LATENCY', threshold: 5000, window: 300000, severity: 'WARNING', notifications: ['research-team'] },
            { type: 'ERROR_RATE', threshold: 0.05, window: 300000, severity: 'ERROR', notifications: ['admin'] }
          ],
          logging: { level: 'INFO', includeRequest: true, includeResponse: true, includeHeaders: false, maskSensitive: true },
          tracing: { enabled: true, sampleRate: 0.5, includeDatabase: true, includeExternal: true }
        },
        metadata: {
          name: 'Create Research Query',
          description: 'Create new research and intelligence queries',
          version: '4.0.0',
          category: 'research',
          tags: ['research', 'intelligence', 'query'],
          created: new Date(),
          updated: new Date(),
          owner: 'research',
          deprecated: false
        },
        enabled: true
      },
      {
        path: '/api/weather/current',
        method: 'GET',
        handler: 'weather.current',
        authentication: { required: false, type: 'NONE', roles: [], permissions: [], scopes: [] },
        rateLimit: { enabled: true, windowMs: 60000, maxRequests: 200, strategy: 'LEAKY_BUCKET' },
        validation: { enabled: true, queryParams: { location: 'required' } },
        caching: { enabled: true, ttl: 300000, strategy: 'MEMORY', tags: ['weather'], invalidationEvents: ['weather:update'] },
        monitoring: {
          enabled: true,
          metrics: ['latency', 'throughput', 'cache_hits'],
          alerts: [],
          logging: { level: 'INFO', includeRequest: false, includeResponse: false, includeHeaders: false, maskSensitive: true },
          tracing: { enabled: false, sampleRate: 0.1, includeDatabase: false, includeExternal: true }
        },
        metadata: {
          name: 'Current Weather',
          description: 'Get current weather conditions',
          version: '2.1.0',
          category: 'weather',
          tags: ['weather', 'current', 'public'],
          created: new Date(),
          updated: new Date(),
          owner: 'weather',
          deprecated: false
        },
        enabled: true
      }
    ];

    defaultEndpoints.forEach((endpointData, index) => {
      const endpoint: APIEndpoint = {
        ...endpointData,
        id: `endpoint-${Date.now()}-${index}`
      };
      
      const key = `${endpoint.method}:${endpoint.path}`;
      this.endpoints.set(key, endpoint);
      
      // Initialize metrics
      this.metrics.set(key, {
        endpoint: endpoint.path,
        method: endpoint.method,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        minResponseTime: Infinity,
        maxResponseTime: 0,
        errorRate: 0,
        throughput: 0,
        cacheHitRate: 0
      });
    });

    console.log(`🎯 Registered ${defaultEndpoints.length} default API endpoints`);
  }

  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      this.calculateMetrics();
    }, 60000); // 1 minute

    console.log('📊 Metrics collection started - 1-minute intervals');
  }

  private startCleanupProcess(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldData();
    }, 3600000); // 1 hour

    console.log('🧹 Data cleanup started - 1-hour intervals');
  }

  private startAlertingSystem(): void {
    this.alertingInterval = setInterval(() => {
      this.checkAlerts();
    }, 300000); // 5 minutes

    console.log('🚨 Alert monitoring started - 5-minute intervals');
  }

  private calculateMetrics(): void {
    try {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;

      for (const [key, endpoint] of this.endpoints.entries()) {
        const recentRequests = this.requests.filter(req => 
          `${req.method}:${req.endpoint}` === key && 
          req.timestamp.getTime() > oneMinuteAgo
        );

        const metrics = this.metrics.get(key);
        if (metrics && recentRequests.length > 0) {
          const responseTimes = recentRequests
            .filter(req => req.responseTime)
            .map(req => req.responseTime!);

          const successfulRequests = recentRequests.filter(req => 
            req.statusCode && req.statusCode >= 200 && req.statusCode < 400
          );

          const cachedRequests = recentRequests.filter(req => req.cached);

          // Update metrics
          metrics.totalRequests += recentRequests.length;
          metrics.successfulRequests += successfulRequests.length;
          metrics.failedRequests += (recentRequests.length - successfulRequests.length);
          
          if (responseTimes.length > 0) {
            metrics.averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
            metrics.minResponseTime = Math.min(metrics.minResponseTime, ...responseTimes);
            metrics.maxResponseTime = Math.max(metrics.maxResponseTime, ...responseTimes);
          }

          metrics.errorRate = metrics.totalRequests > 0 ? 
            metrics.failedRequests / metrics.totalRequests : 0;
          
          metrics.throughput = recentRequests.length; // requests per minute
          
          metrics.cacheHitRate = recentRequests.length > 0 ? 
            cachedRequests.length / recentRequests.length : 0;

          if (recentRequests.length > 0) {
            metrics.lastRequest = new Date(Math.max(...recentRequests.map(r => r.timestamp.getTime())));
          }

          this.metrics.set(key, metrics);
        }
      }

    } catch (error) {
      arcsecMasterLogController.log({
        level: 'ERROR',
        category: 'METRICS',
        source: 'APIManagement',
        message: 'Error calculating metrics',
        metadata: { error: error.message }
      });
    }
  }

  private cleanupOldData(): void {
    try {
      const cutoff = Date.now() - this.requestRetention;
      
      // Clean old requests
      const oldLength = this.requests.length;
      this.requests = this.requests.filter(req => req.timestamp.getTime() > cutoff);
      const cleanedRequests = oldLength - this.requests.length;

      // Limit request history size
      if (this.requests.length > this.maxRequestHistory) {
        this.requests = this.requests.slice(-this.maxRequestHistory);
      }

      // Clean rate limit store
      const rateLimitKeys = Array.from(this.rateLimitStore.keys());
      for (const key of rateLimitKeys) {
        const data = this.rateLimitStore.get(key);
        if (data && data.resetTime && data.resetTime < Date.now()) {
          this.rateLimitStore.delete(key);
        }
      }

      // Clean cache
      if (this.cache.size > this.maxCacheSize) {
        const keys = Array.from(this.cache.keys());
        const toDelete = keys.slice(0, keys.length - this.maxCacheSize);
        toDelete.forEach(key => this.cache.delete(key));
      }

      if (cleanedRequests > 0) {
        arcsecMasterLogController.log({
          level: 'INFO',
          category: 'MAINTENANCE',
          source: 'APIManagement',
          message: `Cleaned up ${cleanedRequests} old requests`,
          metadata: { cleanedRequests, remainingRequests: this.requests.length }
        });
      }

    } catch (error) {
      arcsecMasterLogController.log({
        level: 'ERROR',
        category: 'MAINTENANCE',
        source: 'APIManagement',
        message: 'Error during data cleanup',
        metadata: { error: error.message }
      });
    }
  }

  private checkAlerts(): void {
    try {
      for (const [key, endpoint] of this.endpoints.entries()) {
        if (!endpoint.monitoring.enabled) continue;

        const metrics = this.metrics.get(key);
        if (!metrics) continue;

        for (const alert of endpoint.monitoring.alerts) {
          let shouldAlert = false;
          let value = 0;

          switch (alert.type) {
            case 'LATENCY':
              value = metrics.averageResponseTime;
              shouldAlert = value > alert.threshold;
              break;
            case 'ERROR_RATE':
              value = metrics.errorRate;
              shouldAlert = value > alert.threshold;
              break;
            case 'THROUGHPUT':
              value = metrics.throughput;
              shouldAlert = value < alert.threshold; // Alert if throughput is too low
              break;
            case 'AVAILABILITY':
              // Calculate availability based on successful requests in window
              const windowStart = Date.now() - alert.window;
              const windowRequests = this.requests.filter(req => 
                `${req.method}:${req.endpoint}` === key && 
                req.timestamp.getTime() > windowStart
              );
              const successfulInWindow = windowRequests.filter(req => 
                req.statusCode && req.statusCode >= 200 && req.statusCode < 400
              );
              value = windowRequests.length > 0 ? 
                successfulInWindow.length / windowRequests.length : 1;
              shouldAlert = value < alert.threshold;
              break;
          }

          if (shouldAlert) {
            this.triggerAlert(endpoint, alert, value);
          }
        }
      }

    } catch (error) {
      arcsecMasterLogController.log({
        level: 'ERROR',
        category: 'ALERTING',
        source: 'APIManagement',
        message: 'Error checking alerts',
        metadata: { error: error.message }
      });
    }
  }

  private triggerAlert(endpoint: APIEndpoint, alert: AlertConfig, value: number): void {
    const alertMessage = `API Alert: ${alert.type} threshold exceeded for ${endpoint.path}`;
    
    arcsecMasterLogController.log({
      level: alert.severity,
      category: 'ALERT',
      source: 'APIManagement',
      message: alertMessage,
      metadata: {
        endpoint: endpoint.path,
        method: endpoint.method,
        alertType: alert.type,
        threshold: alert.threshold,
        currentValue: value,
        severity: alert.severity
      }
    });

    this.emit('alert', {
      endpoint,
      alert,
      value,
      timestamp: new Date()
    });
  }

  // Public API Methods
  public registerEndpoint(endpoint: Omit<APIEndpoint, 'id'>): { success: boolean; endpointId?: string; message: string } {
    try {
      const endpointId = `endpoint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const key = `${endpoint.method}:${endpoint.path}`;

      if (this.endpoints.has(key)) {
        return { success: false, message: 'Endpoint already exists' };
      }

      const fullEndpoint: APIEndpoint = {
        ...endpoint,
        id: endpointId
      };

      this.endpoints.set(key, fullEndpoint);

      // Initialize metrics
      this.metrics.set(key, {
        endpoint: endpoint.path,
        method: endpoint.method,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        minResponseTime: Infinity,
        maxResponseTime: 0,
        errorRate: 0,
        throughput: 0,
        cacheHitRate: 0
      });

      arcsecMasterLogController.log({
        level: 'INFO',
        category: 'ENDPOINT',
        source: 'APIManagement',
        message: `Endpoint registered: ${endpoint.method} ${endpoint.path}`,
        metadata: { endpointId, method: endpoint.method, path: endpoint.path }
      });

      this.emit('endpointRegistered', fullEndpoint);

      return { 
        success: true, 
        endpointId, 
        message: `Endpoint ${endpoint.method} ${endpoint.path} registered successfully` 
      };

    } catch (error) {
      arcsecMasterLogController.log({
        level: 'ERROR',
        category: 'ENDPOINT',
        source: 'APIManagement',
        message: 'Error registering endpoint',
        metadata: { error: error.message }
      });

      return { success: false, message: error.message };
    }
  }

  public recordRequest(request: Omit<APIRequest, 'id' | 'timestamp'>): string {
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const fullRequest: APIRequest = {
      ...request,
      id: requestId,
      timestamp: new Date()
    };

    this.requests.push(fullRequest);

    // Limit size to prevent memory issues
    if (this.requests.length > this.maxRequestHistory) {
      this.requests.shift();
    }

    this.emit('requestRecorded', fullRequest);

    return requestId;
  }

  public checkRateLimit(endpoint: string, clientId: string): { allowed: boolean; remaining: number; resetTime: number } {
    const key = `${endpoint}:${endpoint}`;
    const endpointConfig = this.endpoints.get(key);
    
    if (!endpointConfig || !endpointConfig.rateLimit.enabled) {
      return { allowed: true, remaining: Infinity, resetTime: 0 };
    }

    const rateLimitKey = `${endpoint}:${clientId}`;
    const now = Date.now();
    
    let rateLimitData = this.rateLimitStore.get(rateLimitKey);
    
    if (!rateLimitData || rateLimitData.resetTime < now) {
      // Initialize or reset
      rateLimitData = {
        count: 1,
        resetTime: now + endpointConfig.rateLimit.windowMs,
        maxRequests: endpointConfig.rateLimit.maxRequests
      };
    } else {
      rateLimitData.count++;
    }

    this.rateLimitStore.set(rateLimitKey, rateLimitData);

    const allowed = rateLimitData.count <= rateLimitData.maxRequests;
    const remaining = Math.max(0, rateLimitData.maxRequests - rateLimitData.count);

    return {
      allowed,
      remaining,
      resetTime: rateLimitData.resetTime
    };
  }

  public getFromCache(key: string): { found: boolean; value?: any; ttl?: number } {
    if (this.cache.has(key)) {
      const cached = this.cache.get(key);
      if (cached.expiry > Date.now()) {
        return { 
          found: true, 
          value: cached.value, 
          ttl: cached.expiry - Date.now() 
        };
      } else {
        this.cache.delete(key);
      }
    }
    
    return { found: false };
  }

  public setCache(key: string, value: any, ttl: number): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  public getEndpoints(): APIEndpoint[] {
    return Array.from(this.endpoints.values());
  }

  public getMetrics(endpoint?: string): APIMetrics[] {
    if (endpoint) {
      const metrics = Array.from(this.metrics.values())
        .filter(m => m.endpoint === endpoint);
      return metrics;
    }
    
    return Array.from(this.metrics.values());
  }

  public getRequests(filters?: {
    endpoint?: string;
    method?: string;
    since?: Date;
    status?: number;
    limit?: number;
  }): APIRequest[] {
    let requests = [...this.requests];

    if (filters) {
      if (filters.endpoint) {
        requests = requests.filter(req => req.endpoint === filters.endpoint);
      }
      if (filters.method) {
        requests = requests.filter(req => req.method === filters.method);
      }
      if (filters.since) {
        requests = requests.filter(req => req.timestamp >= filters.since!);
      }
      if (filters.status) {
        requests = requests.filter(req => req.statusCode === filters.status);
      }
    }

    requests.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (filters?.limit) {
      requests = requests.slice(0, filters.limit);
    }

    return requests;
  }

  public getStatistics() {
    const totalEndpoints = this.endpoints.size;
    const enabledEndpoints = Array.from(this.endpoints.values())
      .filter(endpoint => endpoint.enabled).length;

    const totalRequests = this.requests.length;
    const last24Hours = Date.now() - (24 * 60 * 60 * 1000);
    const recent24hRequests = this.requests.filter(req => 
      req.timestamp.getTime() > last24Hours
    );

    const successfulRequests = recent24hRequests.filter(req => 
      req.statusCode && req.statusCode >= 200 && req.statusCode < 400
    );

    const averageResponseTime = recent24hRequests.length > 0 ?
      recent24hRequests
        .filter(req => req.responseTime)
        .reduce((sum, req) => sum + req.responseTime!, 0) / recent24hRequests.length
      : 0;

    return {
      endpoints: {
        total: totalEndpoints,
        enabled: enabledEndpoints,
        disabled: totalEndpoints - enabledEndpoints,
        byCategory: this.groupBy(Array.from(this.endpoints.values()), 'metadata.category'),
        byMethod: this.groupBy(Array.from(this.endpoints.values()), 'method')
      },
      requests: {
        total: totalRequests,
        last24h: recent24hRequests.length,
        successful24h: successfulRequests.length,
        errorRate24h: recent24hRequests.length > 0 ? 
          (recent24hRequests.length - successfulRequests.length) / recent24hRequests.length : 0,
        averageResponseTime
      },
      performance: {
        cacheSize: this.cache.size,
        rateLimitEntries: this.rateLimitStore.size,
        maxRequestHistory: this.maxRequestHistory,
        requestRetentionDays: this.requestRetention / (24 * 60 * 60 * 1000)
      },
      monitoring: {
        metricsInterval: this.metricsInterval ? 60000 : 0,
        cleanupInterval: this.cleanupInterval ? 3600000 : 0,
        alertingInterval: this.alertingInterval ? 300000 : 0
      },
      digitalSignature: this.digitalSignature
    };
  }

  private groupBy(items: any[], keyPath: string): Record<string, number> {
    return items.reduce((acc, item) => {
      const keys = keyPath.split('.');
      let value = item;
      for (const key of keys) {
        value = value?.[key];
      }
      
      if (value) {
        acc[value] = (acc[value] || 0) + 1;
      }
      return acc;
    }, {});
  }

  public shutdown(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    if (this.alertingInterval) {
      clearInterval(this.alertingInterval);
      this.alertingInterval = null;
    }

    arcsecMasterLogController.log({
      level: 'INFO',
      category: 'SYSTEM',
      source: 'APIManagement',
      message: 'ARCSEC API Management shutdown complete'
    });

    console.log('🔌 ARCSEC API Management shutdown complete');
  }
}

// Singleton instance
export const arcsecAPIManagement = new ARCSECAPIManagement();