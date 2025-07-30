import React, { useState, useEffect } from 'react';
import CyberpunkPanel from './ui/cyberpunk-panel';

interface DiagnosticSignal {
  name: string;
  status: 'normal' | 'warning' | 'critical';
  value: number;
  threshold: number;
  description: string;
  childExplanation: string;
}

interface LoopFlag {
  name: string;
  active: boolean;
  severity: 'low' | 'medium' | 'high';
  description: string;
  childExplanation: string;
}

export default function DiagnosticsPanel() {
  const [diagnostics, setDiagnostics] = useState<{
    signals: DiagnosticSignal[];
    flags: LoopFlag[];
    eventEvaluation: string;
    systemLoad: number;
  }>({
    signals: [],
    flags: [],
    eventEvaluation: 'System Normal',
    systemLoad: 0
  });
  
  useEffect(() => {
    // Initialize diagnostic signals
    const signals: DiagnosticSignal[] = [
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
    ];
    
    const flags: LoopFlag[] = [
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
    ];
    
    setDiagnostics({
      signals,
      flags,
      eventEvaluation: 'System Normal',
      systemLoad: 42
    });
    
    // Simulate diagnostic updates
    const interval = setInterval(() => {
      setDiagnostics(prev => {
        const newSignals = prev.signals.map(signal => {
          // Simulate value changes
          const variation = (Math.random() - 0.5) * 0.1;
          const newValue = Math.max(0, Math.min(1, signal.value + variation));
          const status = newValue > signal.threshold ? 
            (newValue > signal.threshold * 1.5 ? 'critical' : 'warning') : 'normal';
          
          return { ...signal, value: newValue, status };
        });
        
        const newFlags = prev.flags.map(flag => {
          // Random flag activation (low probability)
          const shouldActivate = Math.random() < 0.02;
          return { ...flag, active: shouldActivate };
        });
        
        const hasAnomaly = newSignals.some(s => s.status !== 'normal') || 
                          newFlags.some(f => f.active);
        
        const systemLoad = 42 + Math.floor(Math.random() * 20);
        
        return {
          signals: newSignals,
          flags: newFlags,
          eventEvaluation: hasAnomaly ? "Yep — something's wrong." : 'System Normal',
          systemLoad
        };
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'normal': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-900/50 border-red-600';
      case 'medium': return 'bg-yellow-900/50 border-yellow-600';
      case 'low': return 'bg-blue-900/50 border-blue-600';
      default: return 'bg-gray-900/50 border-gray-600';
    }
  };
  
  return (
    <CyberpunkPanel 
      title="SYSTEM DIAGNOSTICS" 
      position="top-right"
      className="diagnostics-panel w-[400px]"
    >
      <div className="diagnostics-content">
        {/* Event Evaluation Status */}
        <div className={`event-status mb-3 p-2 rounded border ${
          diagnostics.eventEvaluation === 'System Normal' 
            ? 'bg-green-900/30 border-green-700' 
            : 'bg-red-900/30 border-red-700 animate-pulse'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300">EVENT EVALUATION:</span>
            <span className={`text-sm font-mono ${
              diagnostics.eventEvaluation === 'System Normal' ? 'text-green-400' : 'text-red-400'
            }`}>
              {diagnostics.eventEvaluation}
            </span>
          </div>
        </div>
        
        {/* Diagnostic Signals */}
        <div className="signals-section mb-3">
          <h3 className="text-xs font-bold text-cyan-400 mb-2">DIAGNOSTIC SIGNALS</h3>
          <div className="space-y-2">
            {diagnostics.signals.map(signal => (
              <div key={signal.name} className="signal-item p-2 bg-black/50 border border-cyan-800 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-cyan-300">{signal.name}</span>
                  <span className={`text-xs font-bold ${getStatusColor(signal.status)}`}>
                    {signal.status.toUpperCase()}
                  </span>
                </div>
                <div className="signal-bar mb-1">
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        signal.status === 'critical' ? 'bg-red-500' :
                        signal.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${signal.value * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{(signal.value * 100).toFixed(1)}%</span>
                    <span>Threshold: {(signal.threshold * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 italic">{signal.childExplanation}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Loop Flags */}
        <div className="flags-section mb-3">
          <h3 className="text-xs font-bold text-purple-400 mb-2">LOOP FLAGS</h3>
          <div className="space-y-2">
            {diagnostics.flags.map(flag => (
              <div 
                key={flag.name} 
                className={`flag-item p-2 rounded border transition-all ${
                  flag.active 
                    ? getSeverityColor(flag.severity) + ' animate-pulse'
                    : 'bg-black/50 border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-purple-300">{flag.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${flag.active ? 'text-red-400' : 'text-green-400'}`}>
                      {flag.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      flag.active ? 'bg-red-400 animate-pulse' : 'bg-gray-600'
                    }`} />
                  </div>
                </div>
                <p className="text-xs text-gray-400 italic">{flag.childExplanation}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* System Load */}
        <div className="load-section">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-yellow-400">SYSTEM LOAD</span>
            <span className="text-xs text-yellow-300">{diagnostics.systemLoad}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                diagnostics.systemLoad > 80 ? 'bg-red-500' :
                diagnostics.systemLoad > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${diagnostics.systemLoad}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 italic mt-1">
            {diagnostics.systemLoad > 80 
              ? "This is getting too heavy for me to handle right now."
              : "System load within normal parameters."}
          </p>
        </div>
        
        {/* Footer */}
        <div className="diagnostics-footer mt-3 pt-2 border-t border-gray-800 text-xs text-gray-500 text-center">
          Loop Detection & Anomaly System v2.1
        </div>
      </div>
    </CyberpunkPanel>
  );
}