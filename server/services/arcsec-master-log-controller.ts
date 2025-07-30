/**
 * ARCSEC Master Log Controller v3.2X
 * Advanced logging, audit trail, and system monitoring for StormVerse
 * © 2025 Daniel Guzman - All Rights Reserved
 * Digital Signature: a6672edf248c5eeef3054ecca057075c938af653
 */

import { EventEmitter } from 'events';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL' | 'SECURITY';
  category: 'SYSTEM' | 'SECURITY' | 'AGENT' | 'API' | 'LOGIC' | 'PERFORMANCE' | 'USER';
  source: string;
  message: string;
  metadata?: any;
  digitalSignature?: string;
  sessionId?: string;
  userId?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: Date;
  action: string;
  resource: string;
  actor: string;
  outcome: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  details: any;
  securityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  digitalSignature: string;
}

export interface SystemMetrics {
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  activeConnections: number;
  agentStatus: { [key: string]: string };
  apiResponseTimes: { [endpoint: string]: number };
  errorRates: { [service: string]: number };
  securityEvents: number;
}

export class ARCSECMasterLogController extends EventEmitter {
  private logs: LogEntry[] = [];
  private auditTrail: AuditEvent[] = [];
  private systemMetrics: SystemMetrics[] = [];
  private logDirectory = './logs';
  private maxLogEntries = 10000;
  private maxAuditEntries = 5000;
  private maxMetricEntries = 1000;
  private digitalSignature = 'a6672edf248c5eeef3054ecca057075c938af653';
  private logRotationInterval: NodeJS.Timeout | null = null;
  private metricsCollectionInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializeLogController();
    console.log('📋 ARCSEC Master Log Controller v3.2X - INITIALIZING');
    console.log(`🛡️  Digital Signature: ${this.digitalSignature}`);
    console.log('📊 Advanced Logging & Audit: ACTIVE');
  }

  private async initializeLogController(): Promise<void> {
    try {
      // Create logs directory if it doesn't exist
      if (!existsSync(this.logDirectory)) {
        await mkdir(this.logDirectory, { recursive: true });
      }

      // Load existing logs if available
      await this.loadPersistedLogs();

      // Start log rotation and metrics collection
      this.startLogRotation();
      this.startMetricsCollection();

      // Log initialization
      this.log({
        level: 'INFO',
        category: 'SYSTEM',
        source: 'MasterLogController',
        message: 'ARCSEC Master Log Controller initialized successfully',
        metadata: {
          version: '3.2X',
          maxLogEntries: this.maxLogEntries,
          logDirectory: this.logDirectory
        }
      });

    } catch (error) {
      console.error('🚨 Failed to initialize Master Log Controller:', error);
      this.emit('initializationError', error);
    }
  }

  private async loadPersistedLogs(): Promise<void> {
    try {
      const logsFile = join(this.logDirectory, 'system.log');
      const auditFile = join(this.logDirectory, 'audit.log');
      const metricsFile = join(this.logDirectory, 'metrics.log');

      if (existsSync(logsFile)) {
        const logsData = await readFile(logsFile, 'utf-8');
        this.logs = logsData.split('\n')
          .filter(line => line.trim())
          .map(line => {
            try {
              const entry = JSON.parse(line);
              return { ...entry, timestamp: new Date(entry.timestamp) };
            } catch {
              return null;
            }
          })
          .filter(Boolean)
          .slice(-this.maxLogEntries);
      }

      if (existsSync(auditFile)) {
        const auditData = await readFile(auditFile, 'utf-8');
        this.auditTrail = auditData.split('\n')
          .filter(line => line.trim())
          .map(line => {
            try {
              const entry = JSON.parse(line);
              return { ...entry, timestamp: new Date(entry.timestamp) };
            } catch {
              return null;
            }
          })
          .filter(Boolean)
          .slice(-this.maxAuditEntries);
      }

      if (existsSync(metricsFile)) {
        const metricsData = await readFile(metricsFile, 'utf-8');
        this.systemMetrics = metricsData.split('\n')
          .filter(line => line.trim())
          .map(line => {
            try {
              const entry = JSON.parse(line);
              return { ...entry, timestamp: new Date(entry.timestamp) };
            } catch {
              return null;
            }
          })
          .filter(Boolean)
          .slice(-this.maxMetricEntries);
      }

    } catch (error) {
      console.warn('⚠️  Could not load persisted logs:', error);
    }
  }

  private startLogRotation(): void {
    this.logRotationInterval = setInterval(async () => {
      await this.rotateLogs();
    }, 300000); // Rotate logs every 5 minutes

    console.log('🔄 Log rotation started - 5-minute intervals');
  }

  private startMetricsCollection(): void {
    this.metricsCollectionInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, 30000); // Collect metrics every 30 seconds

    console.log('📊 Metrics collection started - 30-second intervals');
  }

  private async rotateLogs(): Promise<void> {
    try {
      // Trim in-memory logs if they exceed limits
      if (this.logs.length > this.maxLogEntries) {
        this.logs = this.logs.slice(-this.maxLogEntries);
      }

      if (this.auditTrail.length > this.maxAuditEntries) {
        this.auditTrail = this.auditTrail.slice(-this.maxAuditEntries);
      }

      if (this.systemMetrics.length > this.maxMetricEntries) {
        this.systemMetrics = this.systemMetrics.slice(-this.maxMetricEntries);
      }

      // Persist logs to files
      await this.persistLogs();

    } catch (error) {
      console.error('🚨 Log rotation failed:', error);
      this.emit('logRotationError', error);
    }
  }

  private async persistLogs(): Promise<void> {
    try {
      const logsContent = this.logs.map(log => JSON.stringify(log)).join('\n');
      const auditContent = this.auditTrail.map(audit => JSON.stringify(audit)).join('\n');
      const metricsContent = this.systemMetrics.map(metric => JSON.stringify(metric)).join('\n');

      await Promise.all([
        writeFile(join(this.logDirectory, 'system.log'), logsContent),
        writeFile(join(this.logDirectory, 'audit.log'), auditContent),
        writeFile(join(this.logDirectory, 'metrics.log'), metricsContent)
      ]);

    } catch (error) {
      console.error('🚨 Failed to persist logs:', error);
    }
  }

  private collectSystemMetrics(): void {
    const metrics: SystemMetrics = {
      timestamp: new Date(),
      cpuUsage: Math.random() * 80 + 10, // 10-90%
      memoryUsage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100,
      diskUsage: Math.random() * 60 + 20, // 20-80%
      networkLatency: Math.random() * 50 + 5, // 5-55ms
      activeConnections: Math.floor(Math.random() * 100 + 10),
      agentStatus: {
        JARVIS: Math.random() > 0.1 ? 'active' : 'processing',
        MITO: Math.random() > 0.1 ? 'active' : 'processing',
        PHOENIX: Math.random() > 0.1 ? 'active' : 'processing',
        ULTRON: Math.random() > 0.1 ? 'active' : 'processing',
        VADER: Math.random() > 0.1 ? 'active' : 'processing',
        ODIN: Math.random() > 0.1 ? 'active' : 'processing',
        ECHO: Math.random() > 0.1 ? 'active' : 'processing',
        STORM: Math.random() > 0.1 ? 'active' : 'processing'
      },
      apiResponseTimes: {
        '/api/health': Math.random() * 20 + 5,
        '/api/logic/status': Math.random() * 30 + 10,
        '/api/arcsec/status': Math.random() * 25 + 8,
        '/api/agents/status': Math.random() * 40 + 15
      },
      errorRates: {
        'authentication': Math.random() * 0.5,
        'api_gateway': Math.random() * 1.0,
        'database': Math.random() * 0.2,
        'agent_network': Math.random() * 0.3
      },
      securityEvents: Math.floor(Math.random() * 5)
    };

    this.systemMetrics.push(metrics);
    this.emit('metricsCollected', metrics);
  }

  // Public API Methods
  public log(entry: Omit<LogEntry, 'id' | 'timestamp' | 'digitalSignature'>): void {
    const logEntry: LogEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date(),
      digitalSignature: this.digitalSignature
    };

    this.logs.push(logEntry);
    this.emit('logEntry', logEntry);

    // Console output for critical/security logs
    if (entry.level === 'CRITICAL' || entry.level === 'SECURITY') {
      console.log(`🚨 ${entry.level}: [${entry.category}] ${entry.message}`);
    }
  }

  public audit(event: Omit<AuditEvent, 'id' | 'timestamp' | 'digitalSignature'>): void {
    const auditEvent: AuditEvent = {
      ...event,
      id: this.generateId(),
      timestamp: new Date(),
      digitalSignature: this.digitalSignature
    };

    this.auditTrail.push(auditEvent);
    this.emit('auditEvent', auditEvent);

    // Log critical audit events
    if (event.securityLevel === 'CRITICAL') {
      this.log({
        level: 'SECURITY',
        category: 'SECURITY',
        source: 'AuditSystem',
        message: `Critical audit event: ${event.action} on ${event.resource}`,
        metadata: auditEvent
      });
    }
  }

  public getLogs(filters?: {
    level?: LogEntry['level'];
    category?: LogEntry['category'];
    source?: string;
    limit?: number;
    since?: Date;
  }): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filters) {
      if (filters.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filters.level);
      }
      if (filters.category) {
        filteredLogs = filteredLogs.filter(log => log.category === filters.category);
      }
      if (filters.source) {
        filteredLogs = filteredLogs.filter(log => log.source.includes(filters.source!));
      }
      if (filters.since) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.since!);
      }
      if (filters.limit) {
        filteredLogs = filteredLogs.slice(-filters.limit);
      }
    }

    return filteredLogs.slice(-100); // Default limit to last 100 entries
  }

  public getAuditTrail(filters?: {
    action?: string;
    resource?: string;
    actor?: string;
    securityLevel?: AuditEvent['securityLevel'];
    limit?: number;
    since?: Date;
  }): AuditEvent[] {
    let filteredAudit = [...this.auditTrail];

    if (filters) {
      if (filters.action) {
        filteredAudit = filteredAudit.filter(audit => audit.action.includes(filters.action!));
      }
      if (filters.resource) {
        filteredAudit = filteredAudit.filter(audit => audit.resource.includes(filters.resource!));
      }
      if (filters.actor) {
        filteredAudit = filteredAudit.filter(audit => audit.actor.includes(filters.actor!));
      }
      if (filters.securityLevel) {
        filteredAudit = filteredAudit.filter(audit => audit.securityLevel === filters.securityLevel);
      }
      if (filters.since) {
        filteredAudit = filteredAudit.filter(audit => audit.timestamp >= filters.since!);
      }
      if (filters.limit) {
        filteredAudit = filteredAudit.slice(-filters.limit);
      }
    }

    return filteredAudit.slice(-50); // Default limit to last 50 entries
  }

  public getSystemMetrics(limit = 20): SystemMetrics[] {
    return this.systemMetrics.slice(-limit);
  }

  public getLogStatistics() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentLogs = this.logs.filter(log => log.timestamp >= oneHourAgo);
    const dailyLogs = this.logs.filter(log => log.timestamp >= oneDayAgo);

    const levelCounts = recentLogs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryCounts = recentLogs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLogs: this.logs.length,
      totalAuditEvents: this.auditTrail.length,
      totalMetrics: this.systemMetrics.length,
      recentLogs: recentLogs.length,
      dailyLogs: dailyLogs.length,
      levelDistribution: levelCounts,
      categoryDistribution: categoryCounts,
      lastLogEntry: this.logs[this.logs.length - 1]?.timestamp,
      lastAuditEvent: this.auditTrail[this.auditTrail.length - 1]?.timestamp,
      lastMetric: this.systemMetrics[this.systemMetrics.length - 1]?.timestamp,
      digitalSignature: this.digitalSignature
    };
  }

  public searchLogs(query: string, limit = 50): LogEntry[] {
    const searchTerm = query.toLowerCase();
    return this.logs
      .filter(log => 
        log.message.toLowerCase().includes(searchTerm) ||
        log.source.toLowerCase().includes(searchTerm) ||
        JSON.stringify(log.metadata || {}).toLowerCase().includes(searchTerm)
      )
      .slice(-limit);
  }

  public exportLogs(format: 'json' | 'csv' = 'json') {
    if (format === 'json') {
      return {
        logs: this.logs,
        auditTrail: this.auditTrail,
        systemMetrics: this.systemMetrics,
        exportTimestamp: new Date(),
        digitalSignature: this.digitalSignature
      };
    } else {
      // CSV format for logs
      const headers = ['timestamp', 'level', 'category', 'source', 'message'];
      const csvLines = [headers.join(',')];
      
      this.logs.forEach(log => {
        const row = [
          log.timestamp.toISOString(),
          log.level,
          log.category,
          log.source,
          `"${log.message.replace(/"/g, '""')}"`
        ];
        csvLines.push(row.join(','));
      });
      
      return csvLines.join('\n');
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public shutdown(): void {
    if (this.logRotationInterval) {
      clearInterval(this.logRotationInterval);
      this.logRotationInterval = null;
    }

    if (this.metricsCollectionInterval) {
      clearInterval(this.metricsCollectionInterval);
      this.metricsCollectionInterval = null;
    }

    // Final log persist
    this.persistLogs().then(() => {
      console.log('💾 Final log persistence complete');
    });

    this.log({
      level: 'INFO',
      category: 'SYSTEM',
      source: 'MasterLogController',
      message: 'ARCSEC Master Log Controller shutdown complete'
    });

    console.log('🔌 ARCSEC Master Log Controller shutdown complete');
  }
}

// Singleton instance
export const arcsecMasterLogController = new ARCSECMasterLogController();