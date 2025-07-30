import React, { useState, useEffect, useRef } from 'react';
import { useAgents } from '../lib/stores/useAgents';

interface AgentCommand {
  id: string;
  command: string;
  timestamp: Date;
  agent: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  output?: string;
}

interface AgentMetrics {
  cpu: number;
  memory: number;
  network: number;
  tasks: number;
  uptime: string;
}

export function AgentDeploymentShell() {
  const { agents, updateAgentStatus } = useAgents();
  const [isOpen, setIsOpen] = useState(false);
  const [currentAgent, setCurrentAgent] = useState('JARVIS');
  const [commandHistory, setCommandHistory] = useState<AgentCommand[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [metrics, setMetrics] = useState<Record<string, AgentMetrics>>({});
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Agent command definitions
  const agentCommands = {
    JARVIS: [
      'system status',
      'agent network',
      'task distribution',
      'performance monitor',
      'emergency protocols',
      'communication test',
      'resource allocation'
    ],
    STORM_CITADEL: [
      'weather analysis',
      'hurricane tracking',
      'forecast generation',
      'probability calculation',
      'model ensemble',
      'risk assessment'
    ],
    ULTRON: [
      'data validation',
      'quality check',
      'integrity scan',
      'metadata verify',
      'schema validate',
      'source authenticate'
    ],
    ODIN: [
      'security scan',
      'threat assessment',
      'arcsec verify',
      'encryption status',
      'audit log',
      'access control'
    ],
    PHOENIX: [
      'data recovery',
      'archive search',
      'pattern analysis',
      'historical query',
      'trend analysis',
      'backup status'
    ],
    ECHO: [
      'voice synthesis',
      'language process',
      'alert broadcast',
      'communication test',
      'translation service',
      'accessibility check'
    ],
    MITO: [
      'system update',
      'performance optimize',
      'bug scan',
      'deployment status',
      'code analysis',
      'auto repair'
    ],
    VADER: [
      'surveillance mode',
      'anomaly detect',
      'network monitor',
      'threat scan',
      'resilience test',
      'recovery status'
    ]
  };

  // Initialize metrics for all agents
  useEffect(() => {
    const initialMetrics: Record<string, AgentMetrics> = {};
    Object.keys(agentCommands).forEach(agent => {
      initialMetrics[agent] = {
        cpu: Math.round(Math.random() * 40 + 20), // 20-60%
        memory: Math.round(Math.random() * 30 + 30), // 30-60%
        network: Math.round(Math.random() * 100), // 0-100 Mbps
        tasks: Math.round(Math.random() * 10 + 1), // 1-11 tasks
        uptime: `${Math.round(Math.random() * 72 + 24)}h ${Math.round(Math.random() * 60)}m`
      };
    });
    setMetrics(initialMetrics);

    // Update metrics periodically
    const interval = setInterval(() => {
      setMetrics(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(agent => {
          updated[agent] = {
            ...updated[agent],
            cpu: Math.max(0, Math.min(100, updated[agent].cpu + (Math.random() - 0.5) * 10)),
            memory: Math.max(0, Math.min(100, updated[agent].memory + (Math.random() - 0.5) * 5)),
            network: Math.max(0, Math.min(1000, updated[agent].network + (Math.random() - 0.5) * 20))
          };
        });
        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Handle command execution
  const executeCommand = async (command: string, agent: string) => {
    const commandId = Date.now().toString();
    const newCommand: AgentCommand = {
      id: commandId,
      command: command,
      timestamp: new Date(),
      agent: agent,
      status: 'pending'
    };

    setCommandHistory(prev => [...prev, newCommand]);

    // Simulate command execution
    setTimeout(() => {
      setCommandHistory(prev => 
        prev.map(cmd => 
          cmd.id === commandId 
            ? { ...cmd, status: 'executing' }
            : cmd
        )
      );
    }, 500);

    setTimeout(() => {
      const output = generateCommandOutput(command, agent);
      setCommandHistory(prev => 
        prev.map(cmd => 
          cmd.id === commandId 
            ? { ...cmd, status: 'completed', output }
            : cmd
        )
      );
    }, 2000);
  };

  // Generate realistic command output
  const generateCommandOutput = (command: string, agent: string): string => {
    const timestamp = new Date().toISOString();
    
    switch (command) {
      case 'system status':
        return `[${timestamp}] JARVIS SYSTEM STATUS
==========================================
Network Health: 98.7%
Active Agents: 8/8
Data Processing: 1.2TB/hour
Response Time: 0.23s avg
Security Level: ARCSEC VERIFIED
Emergency Protocols: STANDBY
==========================================`;

      case 'weather analysis':
        return `[${timestamp}] STORM CITADEL WEATHER ANALYSIS
==============================================
Current Analysis: Hurricane Delta Track Prediction
Confidence Level: 94.2%
Model Consensus: GFS/ECMWF/NAM Agreement
Wind Speed: 115 kts (Cat 3)
Probability Cone: Updated 18:30 UTC
Next Update: 00:00 UTC +6h
==============================================`;

      case 'data validation':
        return `[${timestamp}] ULTRON DATA VALIDATION REPORT
============================================
Sources Validated: 47
Quality Score: 96.8% avg
Failed Validations: 2 (quarantined)
ARCSEC Verifications: 45/47 passed
Schema Compliance: 100%
Integrity Checks: PASSED
============================================`;

      case 'security scan':
        return `[${timestamp}] ODIN SECURITY SCAN COMPLETE
========================================
Threat Level: LOW
Active Monitors: 127
Encryption Status: AES-256 ACTIVE
Access Violations: 0
ARCSEC Protocol: ENFORCED
Key Rotation: ON SCHEDULE
========================================`;

      case 'performance optimize':
        return `[${timestamp}] MITO PERFORMANCE OPTIMIZATION
===========================================
Memory Usage: Optimized (-12.3%)
CPU Load: Balanced across cores
Database Queries: Indexed +34% speed
Cache Hit Rate: 94.7%
Bundle Size: Reduced 8.9%
Deploy Status: READY
===========================================`;

      default:
        return `[${timestamp}] ${agent} executing: ${command}
Command completed successfully.
Status: OK
Response Time: ${Math.round(Math.random() * 1000 + 200)}ms`;
    }
  };

  // Handle terminal input
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCommand.trim()) return;

    executeCommand(currentCommand.trim(), currentAgent);
    setCurrentCommand('');
  };

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);

  // Focus input when terminal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="deployment-shell-toggle"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(0, 255, 255, 0.1)',
          border: '2px solid #00ffff',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          color: '#00ffff',
          fontSize: '24px',
          cursor: 'pointer',
          zIndex: 1000,
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        ⚡
      </button>
    );
  }

  return (
    <div
      className="agent-deployment-shell"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '700px',
        height: '500px',
        background: 'rgba(5, 5, 8, 0.98)',
        border: '2px solid #00ffff',
        borderRadius: '12px',
        fontFamily: 'Courier New, monospace',
        color: '#00ffff',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 0 30px rgba(0, 255, 255, 0.3)'
      }}
    >
      {/* Terminal Header */}
      <div
        style={{
          background: 'rgba(0, 255, 255, 0.1)',
          padding: '10px 15px',
          borderBottom: '1px solid #00ffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontWeight: 'bold' }}>STORMVERSE AGENT SHELL</span>
          <select
            value={currentAgent}
            onChange={(e) => setCurrentAgent(e.target.value)}
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid #00ffff',
              color: '#00ffff',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            {Object.keys(agentCommands).map(agent => (
              <option key={agent} value={agent}>{agent}</option>
            ))}
          </select>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {metrics[currentAgent] && (
            <div style={{ fontSize: '10px', display: 'flex', gap: '10px' }}>
              <span>CPU: {metrics[currentAgent].cpu}%</span>
              <span>MEM: {metrics[currentAgent].memory}%</span>
              <span>NET: {metrics[currentAgent].network}Mbps</span>
            </div>
          )}
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ff6b6b',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        style={{
          flex: 1,
          padding: '15px',
          overflow: 'auto',
          fontSize: '12px',
          lineHeight: '1.4'
        }}
      >
        <div style={{ marginBottom: '10px', color: '#888' }}>
          Welcome to StormVerse Agent Deployment Shell v1.0
          <br />
          Connected to: {currentAgent} | ARCSEC Protocol: ACTIVE
          <br />
          Type 'help' for available commands or use autocomplete suggestions.
          <br />
          ========================================================
        </div>

        {commandHistory.map((cmd) => (
          <div key={cmd.id} style={{ marginBottom: '10px' }}>
            <div style={{ color: '#00ff88' }}>
              [{cmd.timestamp.toLocaleTimeString()}] {cmd.agent}@stormverse:~$ {cmd.command}
            </div>
            {cmd.status === 'executing' && (
              <div style={{ color: '#ffaa00', fontStyle: 'italic' }}>
                Executing... Please wait.
              </div>
            )}
            {cmd.output && (
              <div style={{ color: '#e0e0e0', marginLeft: '20px', whiteSpace: 'pre-line' }}>
                {cmd.output}
              </div>
            )}
            {cmd.status === 'failed' && (
              <div style={{ color: '#ff6b6b' }}>
                Command failed: {cmd.command}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Command Input */}
      <div
        style={{
          borderTop: '1px solid #00ffff',
          padding: '10px 15px',
          background: 'rgba(0, 0, 0, 0.3)'
        }}
      >
        <form onSubmit={handleCommandSubmit} style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '10px', color: '#00ff88' }}>
            {currentAgent}@stormverse:~$
          </span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            placeholder="Enter command..."
            list={`commands-${currentAgent}`}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#00ffff',
              fontSize: '12px',
              fontFamily: 'inherit',
              outline: 'none'
            }}
          />
          <datalist id={`commands-${currentAgent}`}>
            {agentCommands[currentAgent as keyof typeof agentCommands]?.map((cmd) => (
              <option key={cmd} value={cmd} />
            ))}
          </datalist>
        </form>
      </div>

      {/* Quick Commands */}
      <div
        style={{
          borderTop: '1px solid #444',
          padding: '8px 15px',
          background: 'rgba(0, 0, 0, 0.5)',
          fontSize: '10px'
        }}
      >
        <div style={{ marginBottom: '5px', color: '#888' }}>Quick Commands:</div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {agentCommands[currentAgent as keyof typeof agentCommands]?.slice(0, 4).map((cmd) => (
            <button
              key={cmd}
              onClick={() => executeCommand(cmd, currentAgent)}
              style={{
                background: 'rgba(0, 255, 255, 0.1)',
                border: '1px solid #00ffff',
                color: '#00ffff',
                padding: '2px 6px',
                fontSize: '9px',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AgentDeploymentShell;