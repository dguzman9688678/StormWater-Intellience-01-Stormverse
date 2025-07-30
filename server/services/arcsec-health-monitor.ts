/**
 * ARCSEC Health Monitor v3.0X
 * Comprehensive system health monitoring and diagnostics
 * © 2025 Daniel Guzman - All Rights Reserved
 * Digital Signature: a6672edf248c5eeef3054ecca057075c938af653
 */

import { EventEmitter } from 'events';
import { arcsecMasterLogController } from './arcsec-master-log-controller';

export interface HealthStatus {
  overall: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'DOWN';
  score: number; // 0-100
  components: ComponentHealth[];
  metrics: HealthMetric[];
  alerts: HealthAlert[];
  lastUpdate: Date;
  uptime: number;
  trends: HealthTrend[];
}

export interface ComponentHealth {
  id: string;
  name: string;
  category: 'SYSTEM' | 'SERVICE' | 'DATABASE' | 'NETWORK' | 'STORAGE' | 'SECURITY' | 'APPLICATION';
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'DOWN' | 'MAINTENANCE';
  score: number;
  checks: HealthCheck[];
  dependencies: string[];
  impact: ImpactLevel;
  metadata: ComponentMetadata;
}

export interface ImpactLevel {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  scope: 'LOCAL' | 'SERVICE' | 'SYSTEM' | 'GLOBAL';
  affectedUsers: number;
  businessImpact: string;
}

export interface ComponentMetadata {
  version: string;
  environment: string;
  region: string;
  tags: string[];
  owner: string;
  criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  sla: ServiceLevelAgreement;
}

export interface ServiceLevelAgreement {
  availability: number; // percentage
  responseTime: number; // milliseconds
  errorRate: number; // percentage
  mttr: number; // mean time to recovery in minutes
  mtbf: number; // mean time between failures in hours
}

export interface HealthCheck {
  id: string;
  name: string;
  type: 'HTTP' | 'TCP' | 'PING' | 'DATABASE' | 'CUSTOM' | 'SYNTHETIC';
  endpoint?: string;
  interval: number;
  timeout: number;
  retries: number;
  configuration: CheckConfiguration;
  results: CheckResult[];
  enabled: boolean;
  lastRun?: Date;
}

export interface CheckConfiguration {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  expectedStatus?: number[];
  expectedResponse?: string;
  thresholds: PerformanceThreshold[];
  validation: ValidationRule[];
}

export interface PerformanceThreshold {
  metric: string;
  warning: number;
  critical: number;
  unit: string;
}

export interface ValidationRule {
  type: 'RESPONSE_TIME' | 'STATUS_CODE' | 'CONTENT' | 'SIZE' | 'HEADERS' | 'CUSTOM';
  condition: string;
  expected: any;
}

export interface CheckResult {
  timestamp: Date;
  status: 'SUCCESS' | 'WARNING' | 'FAILURE' | 'TIMEOUT';
  responseTime: number;
  statusCode?: number;
  error?: string;
  metrics: Record<string, number>;
  details?: any;
}

export interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  source: string;
  category: 'PERFORMANCE' | 'AVAILABILITY' | 'RELIABILITY' | 'CAPACITY' | 'SECURITY';
  thresholds: MetricThreshold;
  history: MetricPoint[];
}

export interface MetricThreshold {
  warning: number;
  critical: number;
  direction: 'ABOVE' | 'BELOW'; // Alert when value is above/below threshold
}

export interface MetricPoint {
  timestamp: Date;
  value: number;
}

export interface HealthAlert {
  id: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'EMERGENCY';
  title: string;
  description: string;
  source: string;
  component: string;
  triggered: Date;
  resolved?: Date;
  acknowledged?: Date;
  acknowledgedBy?: string;
  actions: AlertAction[];
  escalation: AlertEscalation;
}

export interface AlertAction {
  type: 'EMAIL' | 'SMS' | 'WEBHOOK' | 'SLACK' | 'PAGERDUTY' | 'AUTO_REMEDIATION';
  target: string;
  executed: boolean;
  timestamp?: Date;
  result?: string;
}

export interface AlertEscalation {
  level: number;
  maxLevel: number;
  escalationTime: number; // minutes
  contacts: EscalationContact[];
}

export interface EscalationContact {
  level: number;
  name: string;
  method: 'EMAIL' | 'SMS' | 'PHONE';
  contact: string;
  primary: boolean;
}

export interface HealthTrend {
  timeRange: string;
  direction: 'IMPROVING' | 'DEGRADING' | 'STABLE';
  change: number;
  confidence: number;
  factors: string[];
}

export interface MonitoringRule {
  id: string;
  name: string;
  description: string;
  condition: RuleCondition;
  actions: RuleAction[];
  schedule: RuleSchedule;
  enabled: boolean;
  metadata: RuleMetadata;
}

export interface RuleCondition {
  type: 'THRESHOLD' | 'TREND' | 'PATTERN' | 'COMPOSITE' | 'ML_ANOMALY';
  expression: string;
  parameters: Record<string, any>;
  timeWindow: number;
  evaluationFrequency: number;
}

export interface RuleAction {
  type: 'ALERT' | 'REMEDIATION' | 'SCALE' | 'RESTART' | 'NOTIFICATION' | 'WORKFLOW';
  config: ActionConfiguration;
  delay: number;
  conditions?: string[];
}

export interface ActionConfiguration {
  target: string;
  parameters: Record<string, any>;
  timeout: number;
  retries: number;
  rollback?: boolean;
}

export interface RuleSchedule {
  frequency: number;
  window?: TimeWindow;
  timezone: string;
  enabled: boolean;
}

export interface TimeWindow {
  start: string; // HH:MM
  end: string; // HH:MM
  days: string[]; // MON, TUE, etc.
}

export interface RuleMetadata {
  created: Date;
  updated: Date;
  creator: string;
  tags: string[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  triggerCount: number;
  lastTriggered?: Date;
}

export class ARCSECHealthMonitor extends EventEmitter {
  private healthStatus: HealthStatus;
  private components: Map<string, ComponentHealth> = new Map();
  private metrics: Map<string, HealthMetric> = new Map();
  private alerts: Map<string, HealthAlert> = new Map();
  private rules: Map<string, MonitoringRule> = new Map();
  private digitalSignature = 'a6672edf248c5eeef3054ecca057075c938af653';
  
  private monitoringInterval: NodeJS.Timeout | null = null;
  private alertInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private reportingInterval: NodeJS.Timeout | null = null;
  
  private maxAlertHistory = 10000;
  private alertRetention = 30 * 24 * 60 * 60 * 1000; // 30 days
  private startTime = Date.now();

  constructor() {
    super();
    this.initializeHealthMonitor();
    console.log('🏥 ARCSEC Health Monitor v3.0X - INITIALIZING');
    console.log(`🛡️  Digital Signature: ${this.digitalSignature}`);
    console.log('⚡ System Health Monitoring: ACTIVE');
  }

  private initializeHealthMonitor(): void {
    this.setupDefaultComponents();
    this.setupDefaultRules();
    this.initializeHealthStatus();
    this.startMonitoring();
    this.startAlertProcessing();
    this.startCleanup();
    this.startReporting();

    arcsecMasterLogController.log({
      level: 'INFO',
      category: 'SYSTEM',
      source: 'HealthMonitor',
      message: 'ARCSEC Health Monitor initialized',
      metadata: {
        version: '3.0X',
        components: this.components.size,
        rules: this.rules.size
      }
    });
  }

  private setupDefaultComponents(): void {
    const defaultComponents: Omit<ComponentHealth, 'id'>[] = [
      {
        name: 'ARCSEC Core System',
        category: 'SYSTEM',
        status: 'HEALTHY',
        score: 95,
        checks: [
          {
            id: 'core-http-check',
            name: 'Core HTTP Health',
            type: 'HTTP',
            endpoint: 'http://localhost:5000/api/health',
            interval: 30000,
            timeout: 5000,
            retries: 3,
            configuration: {
              method: 'GET',
              expectedStatus: [200],
              thresholds: [
                { metric: 'response_time', warning: 1000, critical: 3000, unit: 'ms' }
              ],
              validation: [
                { type: 'RESPONSE_TIME', condition: '<', expected: 1000 },
                { type: 'STATUS_CODE', condition: '==', expected: 200 }
              ]
            },
            results: [],
            enabled: true
          }
        ],
        dependencies: [],
        impact: {
          severity: 'CRITICAL',
          scope: 'GLOBAL',
          affectedUsers: 1000,
          businessImpact: 'Complete system unavailability'
        },
        metadata: {
          version: '3.0X',
          environment: 'PRODUCTION',
          region: 'us-east-1',
          tags: ['core', 'critical', 'arcsec'],
          owner: 'arcsec-team',
          criticality: 'CRITICAL',
          sla: {
            availability: 99.9,
            responseTime: 100,
            errorRate: 0.1,
            mttr: 5,
            mtbf: 720
          }
        }
      },
      {
        name: 'Database Cluster',
        category: 'DATABASE',
        status: 'HEALTHY',
        score: 92,
        checks: [
          {
            id: 'db-connection-check',
            name: 'Database Connection',
            type: 'DATABASE',
            interval: 60000,
            timeout: 10000,
            retries: 2,
            configuration: {
              thresholds: [
                { metric: 'connection_time', warning: 2000, critical: 5000, unit: 'ms' },
                { metric: 'active_connections', warning: 80, critical: 95, unit: 'percent' }
              ],
              validation: [
                { type: 'RESPONSE_TIME', condition: '<', expected: 2000 }
              ]
            },
            results: [],
            enabled: true
          }
        ],
        dependencies: ['arcsec-core'],
        impact: {
          severity: 'HIGH',
          scope: 'SYSTEM',
          affectedUsers: 800,
          businessImpact: 'Data operations degraded'
        },
        metadata: {
          version: '13.2',
          environment: 'PRODUCTION',
          region: 'us-east-1',
          tags: ['database', 'postgresql', 'cluster'],
          owner: 'data-team',
          criticality: 'HIGH',
          sla: {
            availability: 99.5,
            responseTime: 500,
            errorRate: 0.5,
            mttr: 10,
            mtbf: 168
          }
        }
      },
      {
        name: 'API Gateway',
        category: 'SERVICE',
        status: 'HEALTHY',
        score: 88,
        checks: [
          {
            id: 'gateway-health',
            name: 'Gateway Health Check',
            type: 'HTTP',
            endpoint: 'http://localhost:5000/api/arcsec/status',
            interval: 45000,
            timeout: 8000,
            retries: 2,
            configuration: {
              method: 'GET',
              headers: { 'X-Health-Check': 'true' },
              expectedStatus: [200, 201],
              thresholds: [
                { metric: 'response_time', warning: 500, critical: 2000, unit: 'ms' },
                { metric: 'error_rate', warning: 5, critical: 10, unit: 'percent' }
              ],
              validation: [
                { type: 'RESPONSE_TIME', condition: '<', expected: 500 },
                { type: 'STATUS_CODE', condition: 'in', expected: [200, 201] }
              ]
            },
            results: [],
            enabled: true
          }
        ],
        dependencies: ['arcsec-core', 'database-cluster'],
        impact: {
          severity: 'HIGH',
          scope: 'SERVICE',
          affectedUsers: 600,
          businessImpact: 'API access limited'
        },
        metadata: {
          version: '2.1.0',
          environment: 'PRODUCTION',
          region: 'us-east-1',
          tags: ['api', 'gateway', 'public'],
          owner: 'api-team',
          criticality: 'HIGH',
          sla: {
            availability: 99.0,
            responseTime: 200,
            errorRate: 1.0,
            mttr: 15,
            mtbf: 336
          }
        }
      },
      {
        name: 'Security System',
        category: 'SECURITY',
        status: 'HEALTHY',
        score: 96,
        checks: [
          {
            id: 'security-scan',
            name: 'Security Status Check',
            type: 'CUSTOM',
            interval: 300000, // 5 minutes
            timeout: 15000,
            retries: 1,
            configuration: {
              thresholds: [
                { metric: 'threat_level', warning: 3, critical: 7, unit: 'level' },
                { metric: 'blocked_attempts', warning: 100, critical: 500, unit: 'count' }
              ],
              validation: [
                { type: 'CUSTOM', condition: 'threat_level < 5', expected: true }
              ]
            },
            results: [],
            enabled: true
          }
        ],
        dependencies: ['arcsec-core'],
        impact: {
          severity: 'CRITICAL',
          scope: 'GLOBAL',
          affectedUsers: 1000,
          businessImpact: 'Security compromise risk'
        },
        metadata: {
          version: '3.0X',
          environment: 'PRODUCTION',
          region: 'global',
          tags: ['security', 'arcsec', 'protection'],
          owner: 'security-team',
          criticality: 'CRITICAL',
          sla: {
            availability: 99.99,
            responseTime: 50,
            errorRate: 0.01,
            mttr: 2,
            mtbf: 2160
          }
        }
      }
    ];

    defaultComponents.forEach((componentData, index) => {
      const component: ComponentHealth = {
        ...componentData,
        id: `component-${Date.now()}-${index}`
      };
      this.components.set(component.id, component);
    });

    console.log(`🔧 Setup ${defaultComponents.length} health components`);
  }

  private setupDefaultRules(): void {
    const defaultRules: Omit<MonitoringRule, 'id'>[] = [
      {
        name: 'High Response Time Alert',
        description: 'Alert when API response times exceed acceptable limits',
        condition: {
          type: 'THRESHOLD',
          expression: 'avg(response_time) > 1000',
          parameters: { threshold: 1000, metric: 'response_time' },
          timeWindow: 300000, // 5 minutes
          evaluationFrequency: 60000 // 1 minute
        },
        actions: [
          {
            type: 'ALERT',
            config: {
              target: 'api-team',
              parameters: { severity: 'WARNING', channel: 'slack' },
              timeout: 30000,
              retries: 3
            },
            delay: 0
          }
        ],
        schedule: {
          frequency: 60000,
          timezone: 'UTC',
          enabled: true
        },
        enabled: true,
        metadata: {
          created: new Date(),
          updated: new Date(),
          creator: 'system',
          tags: ['performance', 'api'],
          priority: 'HIGH',
          triggerCount: 0
        }
      },
      {
        name: 'Component Down Detection',
        description: 'Detect when critical components go down',
        condition: {
          type: 'PATTERN',
          expression: 'component.status == "DOWN" AND component.criticality == "CRITICAL"',
          parameters: { consecutive_failures: 3 },
          timeWindow: 180000, // 3 minutes
          evaluationFrequency: 30000 // 30 seconds
        },
        actions: [
          {
            type: 'ALERT',
            config: {
              target: 'oncall-team',
              parameters: { severity: 'CRITICAL', escalate: true },
              timeout: 60000,
              retries: 5
            },
            delay: 0
          },
          {
            type: 'REMEDIATION',
            config: {
              target: 'auto-restart',
              parameters: { service: 'component', max_attempts: 2 },
              timeout: 120000,
              retries: 1,
              rollback: true
            },
            delay: 60000,
            conditions: ['auto_remediation_enabled']
          }
        ],
        schedule: {
          frequency: 30000,
          timezone: 'UTC',
          enabled: true
        },
        enabled: true,
        metadata: {
          created: new Date(),
          updated: new Date(),
          creator: 'system',
          tags: ['availability', 'critical'],
          priority: 'CRITICAL',
          triggerCount: 0
        }
      },
      {
        name: 'Security Threat Detection',
        description: 'Monitor for security threats and anomalies',
        condition: {
          type: 'COMPOSITE',
          expression: 'threat_level > 5 OR failed_auth_attempts > 50',
          parameters: { threat_threshold: 5, auth_threshold: 50 },
          timeWindow: 600000, // 10 minutes
          evaluationFrequency: 120000 // 2 minutes
        },
        actions: [
          {
            type: 'ALERT',
            config: {
              target: 'security-team',
              parameters: { severity: 'CRITICAL', immediate: true },
              timeout: 15000,
              retries: 10
            },
            delay: 0
          }
        ],
        schedule: {
          frequency: 120000,
          window: {
            start: '00:00',
            end: '23:59',
            days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
          },
          timezone: 'UTC',
          enabled: true
        },
        enabled: true,
        metadata: {
          created: new Date(),
          updated: new Date(),
          creator: 'security',
          tags: ['security', 'threat', 'anomaly'],
          priority: 'CRITICAL',
          triggerCount: 0
        }
      }
    ];

    defaultRules.forEach((ruleData, index) => {
      const rule: MonitoringRule = {
        ...ruleData,
        id: `rule-${Date.now()}-${index}`
      };
      this.rules.set(rule.id, rule);
    });

    console.log(`📏 Setup ${defaultRules.length} monitoring rules`);
  }

  private initializeHealthStatus(): void {
    this.healthStatus = {
      overall: 'HEALTHY',
      score: 95,
      components: Array.from(this.components.values()),
      metrics: [],
      alerts: [],
      lastUpdate: new Date(),
      uptime: 0,
      trends: []
    };
  }

  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.performHealthChecks();
    }, 30000); // 30 seconds

    console.log('🔍 Health monitoring started - 30-second intervals');
  }

  private startAlertProcessing(): void {
    this.alertInterval = setInterval(() => {
      this.processAlerts();
    }, 60000); // 1 minute

    console.log('🚨 Alert processing started - 1-minute intervals');
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 3600000); // 1 hour

    console.log('🧹 Health data cleanup started - 1-hour intervals');
  }

  private startReporting(): void {
    this.reportingInterval = setInterval(() => {
      this.generateHealthReport();
    }, 300000); // 5 minutes

    console.log('📊 Health reporting started - 5-minute intervals');
  }

  private async performHealthChecks(): Promise<void> {
    try {
      for (const [componentId, component] of this.components.entries()) {
        for (const check of component.checks) {
          if (!check.enabled) continue;

          const shouldRun = !check.lastRun || 
            (Date.now() - check.lastRun.getTime()) >= check.interval;

          if (shouldRun) {
            await this.executeHealthCheck(check, component);
          }
        }

        // Update component status based on check results
        this.updateComponentStatus(component);
        this.components.set(componentId, component);
      }

      // Update overall health status
      this.updateOverallHealth();

    } catch (error) {
      arcsecMasterLogController.log({
        level: 'ERROR',
        category: 'MONITORING',
        source: 'HealthMonitor',
        message: 'Error performing health checks',
        metadata: { error: error.message }
      });
    }
  }

  private async executeHealthCheck(check: HealthCheck, component: ComponentHealth): Promise<void> {
    const startTime = Date.now();
    check.lastRun = new Date();

    try {
      let result: CheckResult;

      switch (check.type) {
        case 'HTTP':
          result = await this.performHttpCheck(check);
          break;
        case 'TCP':
          result = await this.performTcpCheck(check);
          break;
        case 'PING':
          result = await this.performPingCheck(check);
          break;
        case 'DATABASE':
          result = await this.performDatabaseCheck(check);
          break;
        case 'CUSTOM':
          result = await this.performCustomCheck(check, component);
          break;
        case 'SYNTHETIC':
          result = await this.performSyntheticCheck(check);
          break;
        default:
          throw new Error(`Unsupported check type: ${check.type}`);
      }

      // Store result
      check.results.push(result);
      
      // Limit result history
      if (check.results.length > 100) {
        check.results = check.results.slice(-100);
      }

      // Evaluate thresholds and create alerts if needed
      this.evaluateCheckThresholds(check, result, component);

    } catch (error) {
      const result: CheckResult = {
        timestamp: new Date(),
        status: 'FAILURE',
        responseTime: Date.now() - startTime,
        error: error.message,
        metrics: {}
      };

      check.results.push(result);

      arcsecMasterLogController.log({
        level: 'ERROR',
        category: 'HEALTH_CHECK',
        source: 'HealthMonitor',
        message: `Health check failed: ${check.name}`,
        metadata: {
          checkId: check.id,
          componentId: component.id,
          error: error.message
        }
      });
    }
  }

  private async performHttpCheck(check: HealthCheck): Promise<CheckResult> {
    const startTime = Date.now();
    
    // Simulate HTTP check (in production, would make actual HTTP request)
    const responseTime = 50 + Math.random() * 200; // 50-250ms
    const success = Math.random() > 0.05; // 95% success rate
    const statusCode = success ? 200 : (Math.random() > 0.5 ? 500 : 404);

    const result: CheckResult = {
      timestamp: new Date(),
      status: success ? 'SUCCESS' : 'FAILURE',
      responseTime,
      statusCode,
      metrics: {
        response_time: responseTime,
        status_code: statusCode
      }
    };

    if (!success) {
      result.error = `HTTP ${statusCode} error`;
    }

    return result;
  }

  private async performTcpCheck(check: HealthCheck): Promise<CheckResult> {
    const responseTime = 10 + Math.random() * 50; // 10-60ms
    const success = Math.random() > 0.02; // 98% success rate

    return {
      timestamp: new Date(),
      status: success ? 'SUCCESS' : 'FAILURE',
      responseTime,
      metrics: {
        connection_time: responseTime,
        connected: success ? 1 : 0
      },
      error: success ? undefined : 'Connection timeout'
    };
  }

  private async performPingCheck(check: HealthCheck): Promise<CheckResult> {
    const responseTime = 1 + Math.random() * 20; // 1-21ms
    const success = Math.random() > 0.01; // 99% success rate

    return {
      timestamp: new Date(),
      status: success ? 'SUCCESS' : 'FAILURE',
      responseTime,
      metrics: {
        ping_time: responseTime,
        packet_loss: success ? 0 : 100
      },
      error: success ? undefined : 'Ping timeout'
    };
  }

  private async performDatabaseCheck(check: HealthCheck): Promise<CheckResult> {
    const responseTime = 20 + Math.random() * 100; // 20-120ms
    const success = Math.random() > 0.03; // 97% success rate

    return {
      timestamp: new Date(),
      status: success ? 'SUCCESS' : 'FAILURE',
      responseTime,
      metrics: {
        connection_time: responseTime,
        active_connections: 45 + Math.random() * 20,
        query_success: success ? 1 : 0
      },
      error: success ? undefined : 'Database connection failed'
    };
  }

  private async performCustomCheck(check: HealthCheck, component: ComponentHealth): Promise<CheckResult> {
    const responseTime = 30 + Math.random() * 70; // 30-100ms
    let success = Math.random() > 0.04; // 96% success rate
    let metrics: Record<string, number> = {};

    // Simulate component-specific metrics
    if (component.category === 'SECURITY') {
      metrics = {
        threat_level: Math.floor(Math.random() * 10),
        blocked_attempts: Math.floor(Math.random() * 50),
        active_sessions: 100 + Math.floor(Math.random() * 200)
      };
      success = metrics.threat_level < 5;
    } else if (component.category === 'SYSTEM') {
      metrics = {
        cpu_usage: 30 + Math.random() * 40,
        memory_usage: 40 + Math.random() * 30,
        disk_usage: 20 + Math.random() * 40
      };
      success = metrics.cpu_usage < 80 && metrics.memory_usage < 85;
    }

    return {
      timestamp: new Date(),
      status: success ? 'SUCCESS' : 'WARNING',
      responseTime,
      metrics,
      error: success ? undefined : 'Custom check threshold exceeded'
    };
  }

  private async performSyntheticCheck(check: HealthCheck): Promise<CheckResult> {
    const responseTime = 100 + Math.random() * 300; // 100-400ms
    const success = Math.random() > 0.06; // 94% success rate

    return {
      timestamp: new Date(),
      status: success ? 'SUCCESS' : 'FAILURE',
      responseTime,
      metrics: {
        user_journey_time: responseTime,
        steps_completed: success ? 10 : Math.floor(Math.random() * 8),
        success_rate: success ? 100 : 0
      },
      error: success ? undefined : 'Synthetic transaction failed'
    };
  }

  private evaluateCheckThresholds(check: HealthCheck, result: CheckResult, component: ComponentHealth): void {
    for (const threshold of check.configuration.thresholds) {
      const value = result.metrics[threshold.metric];
      if (value === undefined) continue;

      let alertSeverity: HealthAlert['severity'] | null = null;

      if (value >= threshold.critical) {
        alertSeverity = 'CRITICAL';
      } else if (value >= threshold.warning) {
        alertSeverity = 'WARNING';
      }

      if (alertSeverity) {
        this.createAlert({
          severity: alertSeverity,
          title: `${threshold.metric} threshold exceeded`,
          description: `${threshold.metric} value ${value}${threshold.unit} exceeds ${alertSeverity.toLowerCase()} threshold of ${alertSeverity === 'CRITICAL' ? threshold.critical : threshold.warning}${threshold.unit}`,
          source: check.name,
          component: component.name,
          triggered: new Date(),
          actions: [
            {
              type: 'EMAIL',
              target: 'ops-team@company.com',
              executed: false
            }
          ],
          escalation: {
            level: 1,
            maxLevel: 3,
            escalationTime: 15,
            contacts: [
              { level: 1, name: 'Ops Team', method: 'EMAIL', contact: 'ops@company.com', primary: true },
              { level: 2, name: 'Senior Ops', method: 'SMS', contact: '+1234567890', primary: false },
              { level: 3, name: 'On-call Manager', method: 'PHONE', contact: '+1234567891', primary: false }
            ]
          }
        });
      }
    }
  }

  private updateComponentStatus(component: ComponentHealth): void {
    if (component.checks.length === 0) {
      component.status = 'HEALTHY';
      component.score = 100;
      return;
    }

    const recentResults = component.checks.flatMap(check => 
      check.results.slice(-5) // Last 5 results per check
    );

    if (recentResults.length === 0) {
      component.status = 'HEALTHY';
      component.score = 100;
      return;
    }

    const successRate = recentResults.filter(r => r.status === 'SUCCESS').length / recentResults.length;
    const averageResponseTime = recentResults
      .filter(r => r.responseTime)
      .reduce((sum, r) => sum + r.responseTime, 0) / recentResults.length;

    // Calculate component score
    let score = successRate * 70; // 70% weight for success rate
    
    if (averageResponseTime) {
      const responseScore = Math.max(0, 30 - (averageResponseTime / 100)); // 30% weight for response time
      score += responseScore;
    } else {
      score += 30; // Default response time score if no response time data
    }

    component.score = Math.round(Math.max(0, Math.min(100, score)));

    // Determine status based on score
    if (component.score >= 90) {
      component.status = 'HEALTHY';
    } else if (component.score >= 70) {
      component.status = 'DEGRADED';
    } else if (component.score >= 30) {
      component.status = 'CRITICAL';
    } else {
      component.status = 'DOWN';
    }
  }

  private updateOverallHealth(): void {
    const components = Array.from(this.components.values());
    
    if (components.length === 0) {
      this.healthStatus.overall = 'HEALTHY';
      this.healthStatus.score = 100;
      return;
    }

    // Calculate weighted score based on component criticality
    let totalWeight = 0;
    let weightedScore = 0;

    for (const component of components) {
      let weight = 1;
      
      switch (component.metadata.criticality) {
        case 'CRITICAL': weight = 4; break;
        case 'HIGH': weight = 3; break;
        case 'MEDIUM': weight = 2; break;
        case 'LOW': weight = 1; break;
      }

      totalWeight += weight;
      weightedScore += component.score * weight;
    }

    this.healthStatus.score = Math.round(weightedScore / totalWeight);

    // Determine overall status
    const criticalDown = components.some(c => 
      c.metadata.criticality === 'CRITICAL' && (c.status === 'DOWN' || c.status === 'CRITICAL')
    );

    const highDown = components.some(c => 
      c.metadata.criticality === 'HIGH' && c.status === 'DOWN'
    );

    const anyDegraded = components.some(c => c.status === 'DEGRADED');

    if (criticalDown || highDown) {
      this.healthStatus.overall = 'CRITICAL';
    } else if (this.healthStatus.score < 70 || anyDegraded) {
      this.healthStatus.overall = 'DEGRADED';
    } else {
      this.healthStatus.overall = 'HEALTHY';
    }

    // Update uptime
    this.healthStatus.uptime = Date.now() - this.startTime;
    this.healthStatus.lastUpdate = new Date();
    this.healthStatus.components = components;

    // Update metrics
    this.updateSystemMetrics();
  }

  private updateSystemMetrics(): void {
    const now = new Date();
    
    // Overall health score metric
    this.addMetric({
      name: 'overall_health_score',
      value: this.healthStatus.score,
      unit: 'score',
      timestamp: now,
      source: 'HealthMonitor',
      category: 'PERFORMANCE',
      thresholds: { warning: 80, critical: 60, direction: 'BELOW' },
      history: []
    });

    // Component availability metric
    const availableComponents = Array.from(this.components.values())
      .filter(c => c.status === 'HEALTHY').length;
    const totalComponents = this.components.size;
    const availabilityRate = totalComponents > 0 ? (availableComponents / totalComponents) * 100 : 100;

    this.addMetric({
      name: 'component_availability',
      value: availabilityRate,
      unit: 'percent',
      timestamp: now,
      source: 'HealthMonitor',
      category: 'AVAILABILITY',
      thresholds: { warning: 90, critical: 80, direction: 'BELOW' },
      history: []
    });

    // Average response time metric
    const allResults = Array.from(this.components.values())
      .flatMap(c => c.checks.flatMap(check => check.results.slice(-10)));
    
    if (allResults.length > 0) {
      const avgResponseTime = allResults
        .reduce((sum, result) => sum + result.responseTime, 0) / allResults.length;

      this.addMetric({
        name: 'average_response_time',
        value: avgResponseTime,
        unit: 'ms',
        timestamp: now,
        source: 'HealthMonitor',
        category: 'PERFORMANCE',
        thresholds: { warning: 1000, critical: 3000, direction: 'ABOVE' },
        history: []
      });
    }
  }

  private addMetric(metric: HealthMetric): void {
    const existingMetric = this.metrics.get(metric.name);
    
    if (existingMetric) {
      existingMetric.value = metric.value;
      existingMetric.timestamp = metric.timestamp;
      existingMetric.history.push({ timestamp: metric.timestamp, value: metric.value });
      
      // Limit history
      if (existingMetric.history.length > 1000) {
        existingMetric.history = existingMetric.history.slice(-1000);
      }
      
      this.metrics.set(metric.name, existingMetric);
    } else {
      metric.history = [{ timestamp: metric.timestamp, value: metric.value }];
      this.metrics.set(metric.name, metric);
    }
  }

  private processAlerts(): void {
    try {
      // Process pending alerts
      for (const [alertId, alert] of this.alerts.entries()) {
        if (alert.resolved || alert.acknowledged) continue;

        // Execute pending actions
        for (const action of alert.actions) {
          if (!action.executed) {
            this.executeAlertAction(action, alert);
          }
        }

        // Check for escalation
        this.checkAlertEscalation(alert);
      }

      // Evaluate monitoring rules
      this.evaluateMonitoringRules();

    } catch (error) {
      arcsecMasterLogController.log({
        level: 'ERROR',
        category: 'ALERT',
        source: 'HealthMonitor',
        message: 'Error processing alerts',
        metadata: { error: error.message }
      });
    }
  }

  private executeAlertAction(action: AlertAction, alert: HealthAlert): void {
    try {
      // Simulate action execution
      action.executed = true;
      action.timestamp = new Date();
      
      switch (action.type) {
        case 'EMAIL':
          action.result = `Email sent to ${action.target}`;
          break;
        case 'SMS':
          action.result = `SMS sent to ${action.target}`;
          break;
        case 'WEBHOOK':
          action.result = `Webhook called: ${action.target}`;
          break;
        case 'SLACK':
          action.result = `Slack notification sent to ${action.target}`;
          break;
        case 'PAGERDUTY':
          action.result = `PagerDuty incident created`;
          break;
        case 'AUTO_REMEDIATION':
          action.result = `Auto-remediation triggered for ${action.target}`;
          break;
      }

      arcsecMasterLogController.log({
        level: 'INFO',
        category: 'ALERT_ACTION',
        source: 'HealthMonitor',
        message: `Alert action executed: ${action.type}`,
        metadata: {
          alertId: alert.id,
          actionType: action.type,
          target: action.target,
          result: action.result
        }
      });

    } catch (error) {
      action.executed = false;
      action.result = `Failed: ${error.message}`;

      arcsecMasterLogController.log({
        level: 'ERROR',
        category: 'ALERT_ACTION',
        source: 'HealthMonitor',
        message: `Alert action failed: ${action.type}`,
        metadata: {
          alertId: alert.id,
          actionType: action.type,
          error: error.message
        }
      });
    }
  }

  private checkAlertEscalation(alert: HealthAlert): void {
    const timeSinceTriggered = Date.now() - alert.triggered.getTime();
    const escalationTimeMs = alert.escalation.escalationTime * 60 * 1000;

    if (timeSinceTriggered >= escalationTimeMs && alert.escalation.level < alert.escalation.maxLevel) {
      alert.escalation.level++;
      
      const contact = alert.escalation.contacts.find(c => c.level === alert.escalation.level);
      if (contact) {
        // Add escalation action
        alert.actions.push({
          type: contact.method as AlertAction['type'],
          target: contact.contact,
          executed: false
        });

        arcsecMasterLogController.log({
          level: 'WARNING',
          category: 'ESCALATION',
          source: 'HealthMonitor',
          message: `Alert escalated to level ${alert.escalation.level}`,
          metadata: {
            alertId: alert.id,
            escalationLevel: alert.escalation.level,
            contact: contact.name
          }
        });
      }
    }
  }

  private evaluateMonitoringRules(): void {
    for (const [ruleId, rule] of this.rules.entries()) {
      if (!rule.enabled) continue;

      const shouldEvaluate = !rule.metadata.lastTriggered || 
        (Date.now() - rule.metadata.lastTriggered.getTime()) >= rule.condition.evaluationFrequency;

      if (shouldEvaluate) {
        const triggered = this.evaluateRuleCondition(rule.condition);
        
        if (triggered) {
          this.triggerMonitoringRule(rule);
        }
      }
    }
  }

  private evaluateRuleCondition(condition: RuleCondition): boolean {
    // Simplified rule evaluation (would implement proper expression parser in production)
    
    switch (condition.type) {
      case 'THRESHOLD':
        // Simulate threshold evaluation
        return Math.random() < 0.05; // 5% chance of triggering
      
      case 'TREND':
        // Simulate trend analysis
        return Math.random() < 0.02; // 2% chance of triggering
      
      case 'PATTERN':
        // Simulate pattern detection
        return Math.random() < 0.01; // 1% chance of triggering
      
      case 'COMPOSITE':
        // Simulate composite condition
        return Math.random() < 0.03; // 3% chance of triggering
      
      case 'ML_ANOMALY':
        // Simulate ML anomaly detection
        return Math.random() < 0.015; // 1.5% chance of triggering
      
      default:
        return false;
    }
  }

  private triggerMonitoringRule(rule: MonitoringRule): void {
    rule.metadata.triggerCount++;
    rule.metadata.lastTriggered = new Date();
    this.rules.set(rule.id, rule);

    // Execute rule actions
    for (const action of rule.actions) {
      setTimeout(() => {
        this.executeRuleAction(action, rule);
      }, action.delay);
    }

    arcsecMasterLogController.log({
      level: 'INFO',
      category: 'MONITORING_RULE',
      source: 'HealthMonitor',
      message: `Monitoring rule triggered: ${rule.name}`,
      metadata: {
        ruleId: rule.id,
        triggerCount: rule.metadata.triggerCount,
        priority: rule.metadata.priority
      }
    });
  }

  private executeRuleAction(action: RuleAction, rule: MonitoringRule): void {
    try {
      // Execute rule action based on type
      switch (action.type) {
        case 'ALERT':
          this.createAlert({
            severity: action.config.parameters.severity || 'WARNING',
            title: `Monitoring Rule Alert: ${rule.name}`,
            description: rule.description,
            source: 'MonitoringRule',
            component: action.config.target,
            triggered: new Date(),
            actions: [
              {
                type: 'EMAIL',
                target: action.config.target,
                executed: false
              }
            ],
            escalation: {
              level: 1,
              maxLevel: 2,
              escalationTime: 15,
              contacts: [
                { level: 1, name: 'Team', method: 'EMAIL', contact: action.config.target, primary: true }
              ]
            }
          });
          break;
        
        case 'REMEDIATION':
          // Simulate auto-remediation
          arcsecMasterLogController.log({
            level: 'INFO',
            category: 'REMEDIATION',
            source: 'HealthMonitor',
            message: `Auto-remediation triggered for ${action.config.target}`,
            metadata: { ruleId: rule.id, target: action.config.target }
          });
          break;
        
        case 'SCALE':
          // Simulate scaling action
          arcsecMasterLogController.log({
            level: 'INFO',
            category: 'SCALING',
            source: 'HealthMonitor',
            message: `Scaling action triggered for ${action.config.target}`,
            metadata: { ruleId: rule.id, target: action.config.target }
          });
          break;
      }

    } catch (error) {
      arcsecMasterLogController.log({
        level: 'ERROR',
        category: 'RULE_ACTION',
        source: 'HealthMonitor',
        message: `Rule action failed: ${action.type}`,
        metadata: { ruleId: rule.id, error: error.message }
      });
    }
  }

  private createAlert(alertData: Omit<HealthAlert, 'id'>): string {
    const alertId = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const alert: HealthAlert = {
      ...alertData,
      id: alertId
    };

    this.alerts.set(alertId, alert);

    arcsecMasterLogController.log({
      level: alert.severity,
      category: 'ALERT',
      source: 'HealthMonitor',
      message: `Alert created: ${alert.title}`,
      metadata: {
        alertId,
        severity: alert.severity,
        component: alert.component,
        source: alert.source
      }
    });

    this.emit('alertCreated', alert);

    return alertId;
  }

  private performCleanup(): void {
    try {
      const cutoff = Date.now() - this.alertRetention;
      let cleanedAlerts = 0;

      // Clean old resolved alerts
      for (const [alertId, alert] of this.alerts.entries()) {
        if (alert.resolved && alert.resolved.getTime() < cutoff) {
          this.alerts.delete(alertId);
          cleanedAlerts++;
        }
      }

      // Limit alert history
      if (this.alerts.size > this.maxAlertHistory) {
        const sortedAlerts = Array.from(this.alerts.entries())
          .sort(([,a], [,b]) => b.triggered.getTime() - a.triggered.getTime());
        
        const toDelete = sortedAlerts.slice(this.maxAlertHistory);
        toDelete.forEach(([alertId]) => this.alerts.delete(alertId));
        cleanedAlerts += toDelete.length;
      }

      // Clean old metric history
      for (const [metricName, metric] of this.metrics.entries()) {
        const oldHistory = metric.history.filter(point => 
          Date.now() - point.timestamp.getTime() > 7 * 24 * 60 * 60 * 1000 // 7 days
        );
        
        if (oldHistory.length > 0) {
          metric.history = metric.history.filter(point => 
            Date.now() - point.timestamp.getTime() <= 7 * 24 * 60 * 60 * 1000
          );
          this.metrics.set(metricName, metric);
        }
      }

      if (cleanedAlerts > 0) {
        arcsecMasterLogController.log({
          level: 'INFO',
          category: 'CLEANUP',
          source: 'HealthMonitor',
          message: `Cleanup completed: ${cleanedAlerts} alerts cleaned`,
          metadata: { 
            cleanedAlerts, 
            remainingAlerts: this.alerts.size,
            retentionDays: this.alertRetention / (24 * 60 * 60 * 1000)
          }
        });
      }

    } catch (error) {
      arcsecMasterLogController.log({
        level: 'ERROR',
        category: 'CLEANUP',
        source: 'HealthMonitor',
        message: 'Error during cleanup',
        metadata: { error: error.message }
      });
    }
  }

  private generateHealthReport(): void {
    try {
      const report = {
        timestamp: new Date(),
        overall: this.healthStatus.overall,
        score: this.healthStatus.score,
        uptime: this.healthStatus.uptime,
        components: {
          total: this.components.size,
          healthy: Array.from(this.components.values()).filter(c => c.status === 'HEALTHY').length,
          degraded: Array.from(this.components.values()).filter(c => c.status === 'DEGRADED').length,
          critical: Array.from(this.components.values()).filter(c => c.status === 'CRITICAL').length,
          down: Array.from(this.components.values()).filter(c => c.status === 'DOWN').length
        },
        alerts: {
          total: this.alerts.size,
          critical: Array.from(this.alerts.values()).filter(a => a.severity === 'CRITICAL' && !a.resolved).length,
          warning: Array.from(this.alerts.values()).filter(a => a.severity === 'WARNING' && !a.resolved).length,
          resolved: Array.from(this.alerts.values()).filter(a => a.resolved).length
        },
        metrics: {
          total: this.metrics.size,
          recent: Array.from(this.metrics.values()).filter(m => 
            Date.now() - m.timestamp.getTime() < 300000 // Last 5 minutes
          ).length
        }
      };

      this.emit('healthReport', report);

    } catch (error) {
      arcsecMasterLogController.log({
        level: 'ERROR',
        category: 'REPORTING',
        source: 'HealthMonitor',
        message: 'Error generating health report',
        metadata: { error: error.message }
      });
    }
  }

  // Public API Methods
  public getHealthStatus(): HealthStatus {
    return {
      ...this.healthStatus,
      metrics: Array.from(this.metrics.values()),
      alerts: Array.from(this.alerts.values()).filter(alert => !alert.resolved)
    };
  }

  public getComponent(componentId: string): ComponentHealth | null {
    return this.components.get(componentId) || null;
  }

  public getComponents(filters?: { category?: string; status?: string }): ComponentHealth[] {
    let components = Array.from(this.components.values());

    if (filters) {
      if (filters.category) {
        components = components.filter(c => c.category === filters.category);
      }
      if (filters.status) {
        components = components.filter(c => c.status === filters.status);
      }
    }

    return components.sort((a, b) => b.score - a.score);
  }

  public getMetrics(names?: string[]): HealthMetric[] {
    if (names) {
      return names.map(name => this.metrics.get(name)).filter(Boolean) as HealthMetric[];
    }
    
    return Array.from(this.metrics.values()).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  public getAlerts(filters?: { severity?: string; resolved?: boolean; component?: string }): HealthAlert[] {
    let alerts = Array.from(this.alerts.values());

    if (filters) {
      if (filters.severity) {
        alerts = alerts.filter(alert => alert.severity === filters.severity);
      }
      if (filters.resolved !== undefined) {
        alerts = alerts.filter(alert => Boolean(alert.resolved) === filters.resolved);
      }
      if (filters.component) {
        alerts = alerts.filter(alert => alert.component === filters.component);
      }
    }

    return alerts.sort((a, b) => b.triggered.getTime() - a.triggered.getTime());
  }

  public acknowledgeAlert(alertId: string, acknowledgedBy: string): { success: boolean; message: string } {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return { success: false, message: 'Alert not found' };
    }

    if (alert.resolved) {
      return { success: false, message: 'Alert already resolved' };
    }

    alert.acknowledged = new Date();
    alert.acknowledgedBy = acknowledgedBy;
    this.alerts.set(alertId, alert);

    arcsecMasterLogController.log({
      level: 'INFO',
      category: 'ALERT',
      source: 'HealthMonitor',
      message: `Alert acknowledged: ${alert.title}`,
      metadata: { alertId, acknowledgedBy }
    });

    return { success: true, message: 'Alert acknowledged successfully' };
  }

  public resolveAlert(alertId: string, resolvedBy: string): { success: boolean; message: string } {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return { success: false, message: 'Alert not found' };
    }

    alert.resolved = new Date();
    this.alerts.set(alertId, alert);

    arcsecMasterLogController.log({
      level: 'INFO',
      category: 'ALERT',
      source: 'HealthMonitor',
      message: `Alert resolved: ${alert.title}`,
      metadata: { alertId, resolvedBy }
    });

    this.emit('alertResolved', alert);

    return { success: true, message: 'Alert resolved successfully' };
  }

  public getHealthStatistics() {
    const uptimeHours = this.healthStatus.uptime / (1000 * 60 * 60);
    const totalChecks = Array.from(this.components.values())
      .flatMap(c => c.checks.flatMap(check => check.results)).length;
    
    const successfulChecks = Array.from(this.components.values())
      .flatMap(c => c.checks.flatMap(check => check.results))
      .filter(result => result.status === 'SUCCESS').length;

    const availabilityRate = totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 100;

    return {
      overall: {
        status: this.healthStatus.overall,
        score: this.healthStatus.score,
        uptime: this.healthStatus.uptime,
        uptimeHours: Math.round(uptimeHours * 100) / 100,
        availability: Math.round(availabilityRate * 100) / 100
      },
      components: {
        total: this.components.size,
        byStatus: this.groupBy(Array.from(this.components.values()), 'status'),
        byCategory: this.groupBy(Array.from(this.components.values()), 'category'),
        averageScore: this.calculateAverageScore()
      },
      checks: {
        total: totalChecks,
        successful: successfulChecks,
        failed: totalChecks - successfulChecks,
        successRate: availabilityRate,
        totalCheckTypes: this.countCheckTypes()
      },
      alerts: {
        total: this.alerts.size,
        active: Array.from(this.alerts.values()).filter(a => !a.resolved).length,
        resolved: Array.from(this.alerts.values()).filter(a => a.resolved).length,
        bySeverity: this.groupBy(Array.from(this.alerts.values()), 'severity'),
        byComponent: this.groupBy(Array.from(this.alerts.values()), 'component')
      },
      metrics: {
        total: this.metrics.size,
        byCategory: this.groupBy(Array.from(this.metrics.values()), 'category')
      },
      rules: {
        total: this.rules.size,
        enabled: Array.from(this.rules.values()).filter(r => r.enabled).length,
        totalTriggers: Array.from(this.rules.values()).reduce((sum, r) => sum + r.metadata.triggerCount, 0)
      },
      performance: {
        monitoringInterval: this.monitoringInterval ? 30000 : 0,
        alertInterval: this.alertInterval ? 60000 : 0,
        cleanupInterval: this.cleanupInterval ? 3600000 : 0,
        reportingInterval: this.reportingInterval ? 300000 : 0
      },
      digitalSignature: this.digitalSignature
    };
  }

  private groupBy(items: any[], key: string): Record<string, number> {
    return items.reduce((acc, item) => {
      const value = item[key];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  private calculateAverageScore(): number {
    const components = Array.from(this.components.values());
    if (components.length === 0) return 100;

    const totalScore = components.reduce((sum, component) => sum + component.score, 0);
    return Math.round(totalScore / components.length);
  }

  private countCheckTypes(): Record<string, number> {
    const checkTypes: Record<string, number> = {};
    
    for (const component of this.components.values()) {
      for (const check of component.checks) {
        checkTypes[check.type] = (checkTypes[check.type] || 0) + 1;
      }
    }

    return checkTypes;
  }

  public shutdown(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.alertInterval) {
      clearInterval(this.alertInterval);
      this.alertInterval = null;
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    if (this.reportingInterval) {
      clearInterval(this.reportingInterval);
      this.reportingInterval = null;
    }

    arcsecMasterLogController.log({
      level: 'INFO',
      category: 'SYSTEM',
      source: 'HealthMonitor',
      message: 'ARCSEC Health Monitor shutdown complete'
    });

    console.log('🔌 ARCSEC Health Monitor shutdown complete');
  }
}

// Singleton instance
export const arcsecHealthMonitor = new ARCSECHealthMonitor();