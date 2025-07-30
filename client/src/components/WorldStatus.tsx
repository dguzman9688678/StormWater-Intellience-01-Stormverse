import React, { useEffect, useState } from 'react';
import CyberpunkPanel from './ui/cyberpunk-panel';

interface WorldInfo {
  metadata: any;
  world: any;
  agents: number;
  quantum: string;
  security: string;
  status: string;
  created: string;
}

export default function WorldStatus() {
  const [worldInfo, setWorldInfo] = useState<WorldInfo | null>(null);
  const [agentStatus, setAgentStatus] = useState<any[]>([]);
  
  useEffect(() => {
    // Load world information
    fetch('/STORMVERSE_WORLD.json')
      .then(res => res.json())
      .then(data => setWorldInfo(data))
      .catch(err => console.error('Failed to load world info:', err));
      
    // Load agent deployment
    fetch('/agent-deployment.json')
      .then(res => res.json())
      .then(data => setAgentStatus(data.agents || []))
      .catch(err => console.error('Failed to load agent status:', err));
  }, []);
  
  if (!worldInfo) {
    return (
      <CyberpunkPanel title="WORLD STATUS" position="bottom-left" className="w-[400px]">
        <div className="text-center p-4">
          <div className="text-cyan-400 animate-pulse">Loading World Data...</div>
        </div>
      </CyberpunkPanel>
    );
  }
  
  return (
    <CyberpunkPanel title="WORLD STATUS" position="bottom-left" className="w-[400px]">
      <div className="world-status">
        {/* World Identity */}
        <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded">
          <h3 className="text-sm font-bold text-green-400 mb-2">WORLD IDENTITY</h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Creator:</span>
              <span className="text-white">{worldInfo.metadata.creator}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className="text-green-400 font-bold">{worldInfo.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Protocol:</span>
              <span className="text-red-400">{worldInfo.security}</span>
            </div>
          </div>
        </div>
        
        {/* World Dimensions */}
        <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700 rounded">
          <h3 className="text-sm font-bold text-blue-400 mb-2">WORLD DIMENSIONS</h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Name:</span>
              <span className="text-white">{worldInfo.world.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Theme:</span>
              <span className="text-cyan-400">{worldInfo.world.theme.primary}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Globe Radius:</span>
              <span className="text-white">6,371 km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Atmosphere:</span>
              <span className="text-white">100 km</span>
            </div>
          </div>
        </div>
        
        {/* Agent Network */}
        <div className="mb-4 p-3 bg-purple-900/30 border border-purple-700 rounded">
          <h3 className="text-sm font-bold text-purple-400 mb-2">AI AGENT NETWORK</h3>
          <div className="grid grid-cols-2 gap-2">
            {agentStatus.slice(0, 8).map(agent => (
              <div key={agent.id} className="text-xs">
                <span 
                  className="inline-block w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: agent.color }}
                />
                <span className="text-gray-300">{agent.name}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-center text-gray-500">
            {worldInfo.agents} Agents Active
          </div>
        </div>
        
        {/* Quantum Status */}
        <div className="mb-4 p-3 bg-indigo-900/30 border border-indigo-700 rounded">
          <h3 className="text-sm font-bold text-indigo-400 mb-2">QUANTUM ENGINE</h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Dimensions:</span>
              <span className="text-white">{worldInfo.quantum}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Speedup:</span>
              <span className="text-green-400">4x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Preservation:</span>
              <span className="text-yellow-400">74.1%</span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center pt-3 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            World Created: {new Date(worldInfo.created).toLocaleString()}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            © 2025 Daniel Guzman - All Rights Reserved
          </p>
        </div>
      </div>
    </CyberpunkPanel>
  );
}