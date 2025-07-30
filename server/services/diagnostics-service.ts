/**
 * System Diagnostics Service
 * Provides real-time loop detection and anomaly monitoring
 * Copyright (c) 2025 Daniel Guzman - All Rights Reserved
 */

export interface DiagnosticSignal {
  name: string;
  status: 'normal' | 'warning' | 'critical';
  value: number;
  threshold: number;
  description: string;
  childExplanation: string;
}

export interface LoopFlag {
  name: string;
  active: boolean;
  severity: 'low' | 'medium' | 'high';
  description: string;
  childExplanation: string;
}

export interface SystemDiagnostics {
  signals: DiagnosticSignal[];
  flags: LoopFlag[];
  eventEvaluation: string;
  systemLoad: number;
  timestamp: string;
}

export class DiagnosticsService {
  private diagnosticData: SystemDiagnostics;
  
  constructor() {
    this.diagnosticData = this.initializeDiagnostics();
  }
  
  private initializeDiagnostics(): SystemDiagnostics {
    return {
      signals: [
        {
          name: 'signal_repetition',
          status: 'normal',
          value: 0.12,
          threshold: 0.7,
          description: 'Token repetition detection',
          childExplanation: 'This is being said over and over again.'
        },
        {
          name: 'signal_alignment',
          status: 'normal',
          value: 0.89,
          threshold: 0.5,
          description: 'Task alignment verification',
          childExplanation: "That doesn't match what we're supposed to be doing."
        },
        {
          name: 'signal_amplification',
          status: 'normal',
          value: 0.23,
          threshold: 0.6,
          description: 'Feedback loop detection',
          childExplanation: 'My way of talking might be making this go on longer.'
        }
      ],
      flags: [
        {
          name: 'flag_loop_1',
          active: false,
          severity: 'low',
          description: 'Pattern repetition without progress',
          childExplanation: 'Something is happening again and again.'
        },
        {
          name: 'flag_loop_2',
          active: false,
          severity: 'medium',
          description: 'Logic path deviation',
          childExplanation: 'The normal path changed.'
        },
        {
          name: 'flag_loop_3',
          active: false,
          severity: 'high',
          description: 'Recursive state lock',
          childExplanation: "It's stuck doing the same thing forever."
        }
      ],
      eventEvaluation: 'System Normal',
      systemLoad: 42,
      timestamp: new Date().toISOString()
    };
  }
  
  async getDiagnostics(): Promise<SystemDiagnostics> {
    // Simulate real-time diagnostic updates
    this.updateDiagnostics();
    return this.diagnosticData;
  }
  
  private updateDiagnostics(): void {
    // Update signal values with slight variations
    this.diagnosticData.signals = this.diagnosticData.signals.map(signal => {
      const variation = (Math.random() - 0.5) * 0.05;
      const newValue = Math.max(0, Math.min(1, signal.value + variation));
      const status = newValue > signal.threshold ? 
        (newValue > signal.threshold * 1.5 ? 'critical' : 'warning') : 'normal';
      
      return { ...signal, value: newValue, status };
    });
    
    // Randomly activate flags with low probability
    this.diagnosticData.flags = this.diagnosticData.flags.map(flag => ({
      ...flag,
      active: Math.random() < 0.02
    }));
    
    // Update system load
    this.diagnosticData.systemLoad = 42 + Math.floor(Math.random() * 20);
    
    // Update event evaluation
    const hasAnomaly = this.diagnosticData.signals.some(s => s.status !== 'normal') || 
                      this.diagnosticData.flags.some(f => f.active);
    this.diagnosticData.eventEvaluation = hasAnomaly ? "Yep — something's wrong." : 'System Normal';
    
    // Update timestamp
    this.diagnosticData.timestamp = new Date().toISOString();
  }
  
  async getSystemHealth(): Promise<any> {
    const diagnostics = await this.getDiagnostics();
    const overallHealth = diagnostics.eventEvaluation === 'System Normal' ? 'healthy' : 'degraded';
    
    return {
      status: overallHealth,
      load: diagnostics.systemLoad,
      anomalies: diagnostics.flags.filter(f => f.active).length,
      warnings: diagnostics.signals.filter(s => s.status === 'warning').length,
      critical: diagnostics.signals.filter(s => s.status === 'critical').length,
      timestamp: diagnostics.timestamp
    };
  }
}

export const diagnosticsService = new DiagnosticsService();