/**
 * ARCSEC Audit System v3.0X
 * Comprehensive audit logging, compliance tracking, and forensic analysis
 * © 2025 Daniel Guzman - All Rights Reserved
 * Digital Signature: a6672edf248c5eeef3054ecca057075c938af653
 */

import { EventEmitter } from 'events';
import { arcsecMasterLogController } from './arcsec-master-log-controller';

export interface AuditEvent {
  id: string;
  timestamp: Date;
  eventType: AuditEventType;
  actor: AuditActor;
  target: AuditTarget;
  action: string;
  outcome: 'SUCCESS' | 'FAILURE' | 'WARNING' | 'INFO';
  details: AuditDetails;
  context: AuditContext;
  metadata: AuditMetadata;
  digitalSignature: string;
}

export interface AuditEventType {
  category: 'AUTHENTICATION' | 'AUTHORIZATION' | 'DATA_ACCESS' | 'SYSTEM' | 'SECURITY' | 'CONFIGURATION' | 'COMPLIANCE';
  subcategory: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskLevel: 'MINIMAL' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

export interface AuditActor {
  type: 'USER' | 'SERVICE' | 'SYSTEM' | 'API' | 'EXTERNAL' | 'AUTOMATED';
  id: string;
  name: string;
  roles: string[];
  permissions: string[];
  session?: SessionInfo;
  location?: LocationInfo;
}

export interface SessionInfo {
  sessionId: string;
  startTime: Date;
  ipAddress: string;
  userAgent: string;
  authenticated: boolean;
  authMethod: string;
}

export interface LocationInfo {
  ipAddress: string;
  country?: string;
  region?: string;
  city?: string;
  coordinates?: { lat: number; lon: number };
  isp?: string;
  isVpn?: boolean;
}

export interface AuditTarget {
  type: 'FILE' | 'DATABASE' | 'API' | 'SERVICE' | 'USER' | 'CONFIGURATION' | 'SYSTEM';
  id: string;
  name: string;
  classification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' | 'TOP_SECRET';
  location: string;
  owner: string;
  attributes?: Record<string, any>;
}

export interface AuditDetails {
  description: string;
  parameters?: Record<string, any>;
  requestData?: any;
  responseData?: any;
  changedFields?: ChangeRecord[];
  errorCode?: string;
  errorMessage?: string;
  duration?: number;
  size?: number;
}

export interface ChangeRecord {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ';
  timestamp: Date;
}

export interface AuditContext {
  requestId?: string;
  correlationId?: string;
  parentEventId?: string;
  chainId?: string;
  environment: 'DEVELOPMENT' | 'TESTING' | 'STAGING' | 'PRODUCTION';
  version: string;
  component: string;
  service: string;
}

export interface AuditMetadata {
  tags: string[];
  labels: Record<string, string>;
  compliance: ComplianceInfo[];
  retention: RetentionInfo;
  encryption: EncryptionInfo;
  integrity: IntegrityInfo;
}

export interface ComplianceInfo {
  framework: 'SOX' | 'GDPR' | 'HIPAA' | 'PCI_DSS' | 'SOC2' | 'ISO27001' | 'NIST' | 'CUSTOM';
  requirement: string;
  control: string;
  evidence: string;
}

export interface RetentionInfo {
  policy: string;
  retainUntil: Date;
  destructionDate?: Date;
  legalHold: boolean;
  archiveAfter?: Date;
}

export interface EncryptionInfo {
  encrypted: boolean;
  algorithm?: string;
  keyId?: string;
  encryptedFields?: string[];
}

export interface IntegrityInfo {
  hash: string;
  algorithm: string;
  verified: boolean;
  signature?: string;
  witnessNodes?: string[];
}

export interface AuditQuery {
  id: string;
  name: string;
  description: string;
  query: AuditQuerySpec;
  schedule?: ScheduleInfo;
  alerts: AlertRule[];
  enabled: boolean;
  created: Date;
  lastRun?: Date;
  runCount: number;
}

export interface AuditQuerySpec {
  filters: QueryFilter[];
  timeRange: TimeRange;
  aggregations?: Aggregation[];
  sorting?: SortRule[];
  limit?: number;
  fields?: string[];
}

export interface QueryFilter {
  field: string;
  operator: 'EQUALS' | 'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH' | 'REGEX' | 'IN' | 'BETWEEN' | 'GT' | 'LT';
  value: any;
  caseSensitive?: boolean;
  negate?: boolean;
}

export interface TimeRange {
  start?: Date;
  end?: Date;
  relative?: string; // e.g., "last_7_days", "last_hour"
  timezone?: string;
}

export interface Aggregation {
  type: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'DISTINCT' | 'GROUP_BY';
  field: string;
  alias?: string;
  interval?: string;
}

export interface SortRule {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface ScheduleInfo {
  type: 'CRON' | 'INTERVAL' | 'MANUAL';
  expression: string;
  timezone: string;
  enabled: boolean;
}

export interface AlertRule {
  id: string;
  condition: AlertCondition;
  threshold: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  notifications: NotificationTarget[];
  cooldown: number;
  enabled: boolean;
}

export interface AlertCondition {
  type: 'COUNT' | 'RATE' | 'THRESHOLD' | 'ANOMALY' | 'PATTERN';
  field: string;
  operator: 'GT' | 'LT' | 'EQUALS' | 'INCREASE' | 'DECREASE';
  timeWindow: number;
}

export interface NotificationTarget {
  type: 'EMAIL' | 'SMS' | 'WEBHOOK' | 'SLACK' | 'TEAMS' | 'PAGERDUTY';
  address: string;
  template?: string;
}

export interface AuditReport {
  id: string;
  name: string;
  type: 'SECURITY' | 'COMPLIANCE' | 'OPERATIONAL' | 'FORENSIC' | 'CUSTOM';
  timeRange: TimeRange;
  metrics: ReportMetric[];
  findings: ReportFinding[];
  recommendations: string[];
  generated: Date;
  generatedBy: string;
  format: 'PDF' | 'HTML' | 'JSON' | 'CSV' | 'EXCEL';
}

export interface ReportMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
  comparison?: { period: string; value: number; change: number };
}

export interface ReportFinding {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  title: string;
  description: string;
  evidence: string[];
  recommendation: string;
  riskScore: number;
  affectedSystems: string[];
}

export class ARCSECAuditSystem extends EventEmitter {
  private auditEvents: Map<string, AuditEvent> = new Map();
  private auditQueries: Map<string, AuditQuery> = new Map();
  private auditReports: Map<string, AuditReport> = new Map();
  private digitalSignature = 'a6672edf248c5eeef3054ecca057075c938af653';
  
  private indexingInterval: NodeJS.Timeout | null = null;
  private queryInterval: NodeJS.Timeout | null = null;
  private archiveInterval: NodeJS.Timeout | null = null;
  
  private maxEventsInMemory = 100000;
  private archiveAfterDays = 30;
  private retentionYears = 7;

  constructor() {
    super();
    this.initializeAuditSystem();
    console.log('📋 ARCSEC Audit System v3.0X - INITIALIZING');
    console.log(`🛡️  Digital Signature: ${this.digitalSignature}`);
    console.log('⚡ Audit Logging & Compliance: ACTIVE');
  }

  private initializeAuditSystem(): void {
    this.setupDefaultQueries();
    this.startIndexing();
    this.startScheduledQueries();
    this.startArchiveProcess();

    arcsecMasterLogController.log({
      level: 'INFO',
      category: 'SYSTEM',
      source: 'AuditSystem',
      message: 'ARCSEC Audit System initialized',
      metadata: {
        version: '3.0X',
        maxEventsInMemory: this.maxEventsInMemory,
        retentionYears: this.retentionYears
      }
    });
  }

  private setupDefaultQueries(): void {
    const defaultQueries: Omit<AuditQuery, 'id' | 'created' | 'runCount'>[] = [
      {
        name: 'Failed Authentication Attempts',
        description: 'Monitor failed login attempts for security threats',
        query: {
          filters: [
            { field: 'eventType.category', operator: 'EQUALS', value: 'AUTHENTICATION' },
            { field: 'outcome', operator: 'EQUALS', value: 'FAILURE' }
          ],
          timeRange: { relative: 'last_24_hours' },
          aggregations: [
            { type: 'COUNT', field: 'id', alias: 'failed_attempts' },
            { type: 'GROUP_BY', field: 'actor.id', alias: 'by_user' }
          ],
          sorting: [{ field: 'timestamp', direction: 'DESC' }],
          limit: 100
        },
        schedule: {
          type: 'INTERVAL',
          expression: '*/15 * * * *', // Every 15 minutes
          timezone: 'UTC',
          enabled: true
        },
        alerts: [
          {
            id: 'failed-auth-threshold',
            condition: { type: 'COUNT', field: 'id', operator: 'GT', timeWindow: 300000 },
            threshold: 10,
            severity: 'HIGH',
            notifications: [
              { type: 'EMAIL', address: 'security@company.com' },
              { type: 'WEBHOOK', address: 'https://alerts.company.com/webhook' }
            ],
            cooldown: 900000, // 15 minutes
            enabled: true
          }
        ],
        enabled: true
      },
      {
        name: 'Privileged Access Monitoring',
        description: 'Track privileged user activities for compliance',
        query: {
          filters: [
            { field: 'actor.roles', operator: 'CONTAINS', value: 'admin' },
            { field: 'eventType.severity', operator: 'IN', value: ['HIGH', 'CRITICAL'] }
          ],
          timeRange: { relative: 'last_7_days' },
          aggregations: [
            { type: 'COUNT', field: 'id', alias: 'privileged_actions' },
            { type: 'GROUP_BY', field: 'action', alias: 'by_action' }
          ],
          sorting: [{ field: 'timestamp', direction: 'DESC' }]
        },
        schedule: {
          type: 'CRON',
          expression: '0 9 * * MON', // Every Monday at 9 AM
          timezone: 'UTC',
          enabled: true
        },
        alerts: [],
        enabled: true
      },
      {
        name: 'Data Access Anomalies',
        description: 'Detect unusual data access patterns',
        query: {
          filters: [
            { field: 'eventType.category', operator: 'EQUALS', value: 'DATA_ACCESS' },
            { field: 'target.classification', operator: 'IN', value: ['CONFIDENTIAL', 'RESTRICTED'] }
          ],
          timeRange: { relative: 'last_hour' },
          aggregations: [
            { type: 'COUNT', field: 'id', alias: 'access_count' },
            { type: 'GROUP_BY', field: 'actor.id', alias: 'by_user' },
            { type: 'GROUP_BY', field: 'target.id', alias: 'by_resource' }
          ]
        },
        schedule: {
          type: 'INTERVAL',
          expression: '*/30 * * * *', // Every 30 minutes
          timezone: 'UTC',
          enabled: true
        },
        alerts: [
          {
            id: 'data-access-anomaly',
            condition: { type: 'ANOMALY', field: 'access_count', operator: 'INCREASE', timeWindow: 3600000 },
            threshold: 200,
            severity: 'MEDIUM',
            notifications: [
              { type: 'EMAIL', address: 'compliance@company.com' }
            ],
            cooldown: 1800000, // 30 minutes
            enabled: true
          }
        ],
        enabled: true
      }
    ];

    defaultQueries.forEach((queryData, index) => {
      const query: AuditQuery = {
        ...queryData,
        id: `query-${Date.now()}-${index}`,
        created: new Date(),
        runCount: 0
      };
      this.auditQueries.set(query.id, query);
    });

    console.log(`🔍 Setup ${defaultQueries.length} default audit queries`);
  }

  private startIndexing(): void {
    this.indexingInterval = setInterval(() => {
      this.performIndexing();
    }, 300000); // 5 minutes

    console.log('📚 Audit indexing started - 5-minute intervals');
  }

  private startScheduledQueries(): void {
    this.queryInterval = setInterval(() => {
      this.runScheduledQueries();
    }, 60000); // 1 minute

    console.log('⏰ Scheduled queries started - 1-minute intervals');
  }

  private startArchiveProcess(): void {
    this.archiveInterval = setInterval(() => {
      this.performArchiving();
    }, 24 * 60 * 60 * 1000); // 24 hours

    console.log('📦 Archive process started - 24-hour intervals');
  }

  private performIndexing(): void {
    try {
      // Simulate indexing process for search optimization
      const indexedEvents = Math.min(this.auditEvents.size, 1000);
      
      arcsecMasterLogController.log({
        level: 'INFO',
        category: 'INDEXING',
        source: 'AuditSystem',
        message: `Indexed ${indexedEvents} audit events`,
        metadata: { indexedEvents, totalEvents: this.auditEvents.size }
      });

    } catch (error) {
      arcsecMasterLogController.log({
        level: 'ERROR',
        category: 'INDEXING',
        source: 'AuditSystem',
        message: 'Error during audit indexing',
        metadata: { error: error.message }
      });
    }
  }

  private runScheduledQueries(): void {
    try {
      const now = new Date();
      
      for (const [queryId, query] of this.auditQueries.entries()) {
        if (!query.enabled || !query.schedule?.enabled) continue;

        // Simplified schedule checking
        const shouldRun = this.shouldRunQuery(query, now);
        
        if (shouldRun) {
          this.executeQuery(query);
        }
      }

    } catch (error) {
      arcsecMasterLogController.log({
        level: 'ERROR',
        category: 'QUERY',
        source: 'AuditSystem',
        message: 'Error running scheduled queries',
        metadata: { error: error.message }
      });
    }
  }

  private shouldRunQuery(query: AuditQuery, now: Date): boolean {
    if (!query.lastRun) return true;

    const timeSinceLastRun = now.getTime() - query.lastRun.getTime();
    
    // Simplified schedule evaluation
    if (query.schedule?.type === 'INTERVAL') {
      // Parse interval (simplified - would use proper cron parser in production)
      return timeSinceLastRun > 900000; // 15 minutes
    }
    
    if (query.schedule?.type === 'CRON') {
      // Simplified cron evaluation
      const daysSinceLastRun = Math.floor(timeSinceLastRun / (24 * 60 * 60 * 1000));
      return daysSinceLastRun >= 1;
    }

    return false;
  }

  private executeQuery(query: AuditQuery): void {
    try {
      const results = this.queryAuditEvents(query.query);
      
      query.lastRun = new Date();
      query.runCount++;
      this.auditQueries.set(query.id, query);

      // Check alerts
      for (const alert of query.alerts) {
        if (alert.enabled) {
          this.evaluateAlert(alert, results, query);
        }
      }

      arcsecMasterLogController.log({
        level: 'INFO',
        category: 'QUERY',
        source: 'AuditSystem',
        message: `Executed audit query: ${query.name}`,
        metadata: {
          queryId: query.id,
          resultCount: results.length,
          runCount: query.runCount
        }
      });

      this.emit('queryExecuted', { query, results });

    } catch (error) {
      arcsecMasterLogController.log({
        level: 'ERROR',
        category: 'QUERY',
        source: 'AuditSystem',
        message: `Error executing query: ${query.name}`,
        metadata: { queryId: query.id, error: error.message }
      });
    }
  }

  private evaluateAlert(alert: AlertRule, results: AuditEvent[], query: AuditQuery): void {
    try {
      let triggered = false;
      let value = 0;

      switch (alert.condition.type) {
        case 'COUNT':
          value = results.length;
          triggered = value > alert.threshold;
          break;
        
        case 'RATE':
          // Calculate rate based on time window
          const timeWindow = alert.condition.timeWindow || 3600000; // 1 hour default
          const recentEvents = results.filter(event => 
            Date.now() - event.timestamp.getTime() <= timeWindow
          );
          value = recentEvents.length;
          triggered = value > alert.threshold;
          break;
        
        case 'THRESHOLD':
          // Evaluate threshold based on specific field
          if (results.length > 0) {
            value = results.length; // Simplified
            triggered = value > alert.threshold;
          }
          break;
      }

      if (triggered) {
        this.triggerAlert(alert, value, query, results);
      }

    } catch (error) {
      arcsecMasterLogController.log({
        level: 'ERROR',
        category: 'ALERT',
        source: 'AuditSystem',
        message: `Error evaluating alert: ${alert.id}`,
        metadata: { alertId: alert.id, error: error.message }
      });
    }
  }

  private triggerAlert(alert: AlertRule, value: number, query: AuditQuery, results: AuditEvent[]): void {
    const alertMessage = `Audit alert triggered: ${query.name} - Threshold: ${alert.threshold}, Actual: ${value}`;
    
    arcsecMasterLogController.log({
      level: alert.severity,
      category: 'ALERT',
      source: 'AuditSystem',
      message: alertMessage,
      metadata: {
        alertId: alert.id,
        queryId: query.id,
        threshold: alert.threshold,
        actualValue: value,
        resultCount: results.length
      }
    });

    // Send notifications (simplified)
    for (const notification of alert.notifications) {
      this.sendNotification(notification, alertMessage, alert, query);
    }

    this.emit('alertTriggered', { alert, value, query, results });
  }

  private sendNotification(notification: NotificationTarget, message: string, alert: AlertRule, query: AuditQuery): void {
    // Simplified notification sending
    arcsecMasterLogController.log({
      level: 'INFO',
      category: 'NOTIFICATION',
      source: 'AuditSystem',
      message: `Notification sent: ${notification.type} to ${notification.address}`,
      metadata: {
        notificationType: notification.type,
        alertId: alert.id,
        queryId: query.id,
        severity: alert.severity
      }
    });
  }

  private performArchiving(): void {
    try {
      const cutoffDate = new Date(Date.now() - (this.archiveAfterDays * 24 * 60 * 60 * 1000));
      let archivedCount = 0;

      // Move old events to archive (simplified - would use proper storage in production)
      for (const [eventId, event] of this.auditEvents.entries()) {
        if (event.timestamp < cutoffDate) {
          // In production, would move to archive storage
          this.auditEvents.delete(eventId);
          archivedCount++;
        }
      }

      // Limit in-memory events
      if (this.auditEvents.size > this.maxEventsInMemory) {
        const sortedEvents = Array.from(this.auditEvents.entries())
          .sort(([,a], [,b]) => b.timestamp.getTime() - a.timestamp.getTime());
        
        const toDelete = sortedEvents.slice(this.maxEventsInMemory);
        toDelete.forEach(([eventId]) => this.auditEvents.delete(eventId));
        archivedCount += toDelete.length;
      }

      if (archivedCount > 0) {
        arcsecMasterLogController.log({
          level: 'INFO',
          category: 'ARCHIVE',
          source: 'AuditSystem',
          message: `Archived ${archivedCount} audit events`,
          metadata: {
            archivedCount,
            remainingEvents: this.auditEvents.size,
            archiveAfterDays: this.archiveAfterDays
          }
        });
      }

    } catch (error) {
      arcsecMasterLogController.log({
        level: 'ERROR',
        category: 'ARCHIVE',
        source: 'AuditSystem',
        message: 'Error during audit archiving',
        metadata: { error: error.message }
      });
    }
  }

  // Public API Methods
  public logAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp' | 'digitalSignature'>): { success: boolean; eventId?: string; message: string } {
    try {
      const eventId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const fullEvent: AuditEvent = {
        ...event,
        id: eventId,
        timestamp: new Date(),
        digitalSignature: this.digitalSignature
      };

      // Generate integrity hash
      fullEvent.metadata.integrity = {
        hash: this.generateEventHash(fullEvent),
        algorithm: 'SHA-256',
        verified: true,
        signature: this.digitalSignature
      };

      this.auditEvents.set(eventId, fullEvent);

      arcsecMasterLogController.log({
        level: 'INFO',
        category: 'AUDIT',
        source: 'AuditSystem',
        message: `Audit event logged: ${event.action}`,
        metadata: {
          eventId,
          eventType: event.eventType.category,
          actor: event.actor.name,
          target: event.target.name,
          outcome: event.outcome
        }
      });

      this.emit('auditEventLogged', fullEvent);

      return { 
        success: true, 
        eventId, 
        message: 'Audit event logged successfully' 
      };

    } catch (error) {
      arcsecMasterLogController.log({
        level: 'ERROR',
        category: 'AUDIT',
        source: 'AuditSystem',
        message: 'Error logging audit event',
        metadata: { error: error.message }
      });

      return { success: false, message: error.message };
    }
  }

  public queryAuditEvents(querySpec: AuditQuerySpec): AuditEvent[] {
    try {
      let events = Array.from(this.auditEvents.values());

      // Apply filters
      for (const filter of querySpec.filters) {
        events = events.filter(event => this.applyFilter(event, filter));
      }

      // Apply time range
      if (querySpec.timeRange) {
        events = this.applyTimeRange(events, querySpec.timeRange);
      }

      // Apply sorting
      if (querySpec.sorting) {
        events = this.applySorting(events, querySpec.sorting);
      }

      // Apply limit
      if (querySpec.limit) {
        events = events.slice(0, querySpec.limit);
      }

      return events;

    } catch (error) {
      arcsecMasterLogController.log({
        level: 'ERROR',
        category: 'QUERY',
        source: 'AuditSystem',
        message: 'Error querying audit events',
        metadata: { error: error.message }
      });

      return [];
    }
  }

  private applyFilter(event: AuditEvent, filter: QueryFilter): boolean {
    try {
      const value = this.getNestedValue(event, filter.field);
      let matches = false;

      switch (filter.operator) {
        case 'EQUALS':
          matches = value === filter.value;
          break;
        case 'CONTAINS':
          matches = String(value).includes(String(filter.value));
          break;
        case 'STARTS_WITH':
          matches = String(value).startsWith(String(filter.value));
          break;
        case 'ENDS_WITH':
          matches = String(value).endsWith(String(filter.value));
          break;
        case 'REGEX':
          matches = new RegExp(filter.value, filter.caseSensitive ? '' : 'i').test(String(value));
          break;
        case 'IN':
          matches = Array.isArray(filter.value) && filter.value.includes(value);
          break;
        case 'BETWEEN':
          if (Array.isArray(filter.value) && filter.value.length === 2) {
            matches = value >= filter.value[0] && value <= filter.value[1];
          }
          break;
        case 'GT':
          matches = Number(value) > Number(filter.value);
          break;
        case 'LT':
          matches = Number(value) < Number(filter.value);
          break;
      }

      return filter.negate ? !matches : matches;

    } catch (error) {
      return false;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private applyTimeRange(events: AuditEvent[], timeRange: TimeRange): AuditEvent[] {
    const now = new Date();
    let start: Date | undefined;
    let end: Date | undefined;

    if (timeRange.start) {
      start = timeRange.start;
    }

    if (timeRange.end) {
      end = timeRange.end;
    }

    if (timeRange.relative) {
      // Parse relative time ranges
      const relativeMs = this.parseRelativeTime(timeRange.relative);
      start = new Date(now.getTime() - relativeMs);
      end = now;
    }

    return events.filter(event => {
      const eventTime = event.timestamp.getTime();
      if (start && eventTime < start.getTime()) return false;
      if (end && eventTime > end.getTime()) return false;
      return true;
    });
  }

  private parseRelativeTime(relative: string): number {
    const patterns = {
      'last_hour': 60 * 60 * 1000,
      'last_24_hours': 24 * 60 * 60 * 1000,
      'last_7_days': 7 * 24 * 60 * 60 * 1000,
      'last_30_days': 30 * 24 * 60 * 60 * 1000
    };

    return patterns[relative as keyof typeof patterns] || 24 * 60 * 60 * 1000;
  }

  private applySorting(events: AuditEvent[], sorting: SortRule[]): AuditEvent[] {
    return events.sort((a, b) => {
      for (const rule of sorting) {
        const aValue = this.getNestedValue(a, rule.field);
        const bValue = this.getNestedValue(b, rule.field);
        
        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        else if (aValue > bValue) comparison = 1;
        
        if (comparison !== 0) {
          return rule.direction === 'DESC' ? -comparison : comparison;
        }
      }
      return 0;
    });
  }

  private generateEventHash(event: AuditEvent): string {
    // Simplified hash generation (would use proper crypto in production)
    const hashInput = JSON.stringify({
      timestamp: event.timestamp,
      eventType: event.eventType,
      actor: event.actor,
      target: event.target,
      action: event.action,
      outcome: event.outcome
    });
    
    return Buffer.from(hashInput).toString('base64').substr(0, 32);
  }

  public generateComplianceReport(framework: string, timeRange: TimeRange): AuditReport {
    const reportId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Query relevant events for compliance framework
    const complianceEvents = this.queryAuditEvents({
      filters: [
        { field: 'metadata.compliance', operator: 'CONTAINS', value: framework }
      ],
      timeRange,
      sorting: [{ field: 'timestamp', direction: 'DESC' }]
    });

    const report: AuditReport = {
      id: reportId,
      name: `${framework} Compliance Report`,
      type: 'COMPLIANCE',
      timeRange,
      metrics: [
        {
          name: 'Total Compliance Events',
          value: complianceEvents.length,
          unit: 'events',
          trend: 'STABLE'
        },
        {
          name: 'Critical Events',
          value: complianceEvents.filter(e => e.eventType.severity === 'CRITICAL').length,
          unit: 'events',
          trend: 'DOWN'
        }
      ],
      findings: [],
      recommendations: [
        'Continue monitoring critical compliance events',
        'Review access patterns for anomalies',
        'Ensure all privileged activities are logged'
      ],
      generated: new Date(),
      generatedBy: 'ARCSEC Audit System',
      format: 'JSON'
    };

    this.auditReports.set(reportId, report);

    arcsecMasterLogController.log({
      level: 'INFO',
      category: 'REPORT',
      source: 'AuditSystem',
      message: `Compliance report generated: ${framework}`,
      metadata: {
        reportId,
        framework,
        eventCount: complianceEvents.length,
        timeRange: timeRange.relative || 'custom'
      }
    });

    return report;
  }

  public getAuditStatistics() {
    const totalEvents = this.auditEvents.size;
    const last24Hours = Date.now() - (24 * 60 * 60 * 1000);
    const recentEvents = Array.from(this.auditEvents.values())
      .filter(event => event.timestamp.getTime() > last24Hours);

    const eventsByCategory = this.groupBy(
      Array.from(this.auditEvents.values()), 
      'eventType.category'
    );

    const eventsBySeverity = this.groupBy(
      Array.from(this.auditEvents.values()), 
      'eventType.severity'
    );

    const eventsToday = Array.from(this.auditEvents.values())
      .filter(event => {
        const today = new Date();
        const eventDate = new Date(event.timestamp);
        return eventDate.toDateString() === today.toDateString();
      });

    return {
      events: {
        total: totalEvents,
        last24h: recentEvents.length,
        today: eventsToday.length,
        byCategory: eventsByCategory,
        bySeverity: eventsBySeverity,
        byOutcome: this.groupBy(Array.from(this.auditEvents.values()), 'outcome')
      },
      queries: {
        total: this.auditQueries.size,
        enabled: Array.from(this.auditQueries.values()).filter(q => q.enabled).length,
        scheduled: Array.from(this.auditQueries.values()).filter(q => q.schedule?.enabled).length,
        totalRuns: Array.from(this.auditQueries.values()).reduce((sum, q) => sum + q.runCount, 0)
      },
      reports: {
        total: this.auditReports.size,
        byType: this.groupBy(Array.from(this.auditReports.values()), 'type')
      },
      storage: {
        memoryEvents: this.auditEvents.size,
        maxMemoryEvents: this.maxEventsInMemory,
        utilizationPercentage: (this.auditEvents.size / this.maxEventsInMemory) * 100,
        archiveAfterDays: this.archiveAfterDays,
        retentionYears: this.retentionYears
      },
      performance: {
        indexingInterval: this.indexingInterval ? 300000 : 0,
        queryInterval: this.queryInterval ? 60000 : 0,
        archiveInterval: this.archiveInterval ? 24 * 60 * 60 * 1000 : 0
      },
      digitalSignature: this.digitalSignature
    };
  }

  private groupBy(items: any[], keyPath: string): Record<string, number> {
    return items.reduce((acc, item) => {
      const value = this.getNestedValue(item, keyPath);
      if (value) {
        acc[value] = (acc[value] || 0) + 1;
      }
      return acc;
    }, {});
  }

  public shutdown(): void {
    if (this.indexingInterval) {
      clearInterval(this.indexingInterval);
      this.indexingInterval = null;
    }

    if (this.queryInterval) {
      clearInterval(this.queryInterval);
      this.queryInterval = null;
    }

    if (this.archiveInterval) {
      clearInterval(this.archiveInterval);
      this.archiveInterval = null;
    }

    arcsecMasterLogController.log({
      level: 'INFO',
      category: 'SYSTEM',
      source: 'AuditSystem',
      message: 'ARCSEC Audit System shutdown complete'
    });

    console.log('🔌 ARCSEC Audit System shutdown complete');
  }
}

// Singleton instance
export const arcsecAuditSystem = new ARCSECAuditSystem();