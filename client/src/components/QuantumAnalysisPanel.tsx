import React, { useState, useEffect } from 'react';
import CyberpunkPanel from './ui/cyberpunk-panel';

interface QuantumState {
  quantum_number: number;
  amplitude: number;
  phase: number;
  energy_level: string;
  coherence: number;
}

interface EntangledPair {
  pair: string[];
  entanglement_strength: number;
  bell_state: string;
  correlation_coefficient: number;
}

export default function QuantumAnalysisPanel() {
  const [activeTab, setActiveTab] = useState<'states' | 'entanglement' | 'metrics'>('states');
  
  // Quantum states data
  const quantumStates: Record<string, QuantumState> = {
    'Document Metadata': { quantum_number: 1, amplitude: 1.000, phase: 0.000, energy_level: '0.1 ℏω', coherence: 1.000 },
    'Core Discovery': { quantum_number: 3, amplitude: 0.946, phase: 0.325, energy_level: '0.3 ℏω', coherence: 0.819 },
    'StormVerse Project': { quantum_number: 4, amplitude: 0.879, phase: 0.476, energy_level: '0.4 ℏω', coherence: 0.741 },
    'Storm JSON Tech': { quantum_number: 5, amplitude: 0.789, phase: 0.614, energy_level: '0.5 ℏω', coherence: 0.670 },
    'NOAA Database': { quantum_number: 8, amplitude: 0.402, phase: 0.916, energy_level: '0.8 ℏω', coherence: 0.497 }
  };
  
  const entangledPairs: EntangledPair[] = [
    { pair: ['StormVerse Project', 'Storm JSON Tech'], entanglement_strength: 0.85, bell_state: '|Φ+⟩', correlation_coefficient: 0.92 },
    { pair: ['NOAA Database', 'Data Compilation'], entanglement_strength: 0.92, bell_state: '|Ψ+⟩', correlation_coefficient: 0.96 },
    { pair: ['Core Discovery', 'Final Principles'], entanglement_strength: 0.78, bell_state: '|Φ-⟩', correlation_coefficient: 0.88 }
  ];
  
  const quantumMetrics = {
    total_qubits: 4.25,
    hilbert_space_dimension: 19,
    superposition_amplitude: 0.229,
    measurement_fidelity: 0.741,
    information_preservation: '74.1%',
    quantum_signature: 'Ψ(info,time) = Σᵢ αᵢ|sectionᵢ⟩ exp(-iEᵢt/ℏ)',
    von_neumann_entropy: 1.87,
    quantum_speedup_factor: 4
  };
  
  return (
    <CyberpunkPanel 
      title="QUANTUM ANALYSIS" 
      position="bottom-right"
      className="quantum-panel w-[440px]"
    >
      <div className="quantum-content">
        {/* Tab Navigation */}
        <div className="tabs flex gap-2 mb-3 border-b border-cyan-800">
          <button
            onClick={() => setActiveTab('states')}
            className={`tab px-3 py-1 text-xs transition-all ${
              activeTab === 'states' 
                ? 'text-cyan-400 border-b-2 border-cyan-400' 
                : 'text-gray-400 hover:text-cyan-300'
            }`}
          >
            Quantum States
          </button>
          <button
            onClick={() => setActiveTab('entanglement')}
            className={`tab px-3 py-1 text-xs transition-all ${
              activeTab === 'entanglement' 
                ? 'text-purple-400 border-b-2 border-purple-400' 
                : 'text-gray-400 hover:text-purple-300'
            }`}
          >
            Entanglement
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`tab px-3 py-1 text-xs transition-all ${
              activeTab === 'metrics' 
                ? 'text-green-400 border-b-2 border-green-400' 
                : 'text-gray-400 hover:text-green-300'
            }`}
          >
            Metrics
          </button>
        </div>
        
        {/* Content based on active tab */}
        <div className="tab-content" style={{ maxHeight: '350px', overflowY: 'auto' }}>
          {activeTab === 'states' && (
            <div className="quantum-states space-y-2">
              {Object.entries(quantumStates).map(([name, state]) => (
                <div key={name} className="state-item p-2 bg-black/50 border border-cyan-800 rounded">
                  <h4 className="text-sm font-bold text-cyan-400 mb-1">{name}</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Amplitude:</span>
                      <span className="text-cyan-300 ml-1">{state.amplitude.toFixed(3)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Phase:</span>
                      <span className="text-purple-300 ml-1">{state.phase.toFixed(3)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Energy:</span>
                      <span className="text-green-300 ml-1">{state.energy_level}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Coherence:</span>
                      <span className="text-yellow-300 ml-1">{(state.coherence * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'entanglement' && (
            <div className="entanglement-pairs space-y-2">
              {entangledPairs.map((pair, index) => (
                <div key={index} className="pair-item p-2 bg-black/50 border border-purple-800 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm">
                      <span className="text-purple-400">{pair.pair[0]}</span>
                      <span className="text-gray-400 mx-2">⟷</span>
                      <span className="text-purple-400">{pair.pair[1]}</span>
                    </div>
                    <span className="text-xs text-cyan-400 font-mono">{pair.bell_state}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Strength:</span>
                      <span className="text-purple-300 ml-1">{(pair.entanglement_strength * 100).toFixed(0)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Correlation:</span>
                      <span className="text-cyan-300 ml-1">{pair.correlation_coefficient.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="summary mt-3 p-2 bg-purple-900/20 border border-purple-700 rounded">
                <div className="text-xs text-purple-300">
                  <div>Total System Entanglement: 4.15</div>
                  <div>Entanglement Entropy: 2.73</div>
                  <div>Quantum Discord: 1.42</div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'metrics' && (
            <div className="quantum-metrics space-y-2">
              <div className="metric-group p-2 bg-black/50 border border-green-800 rounded">
                <h4 className="text-sm font-bold text-green-400 mb-2">System Metrics</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Qubits:</span>
                    <span className="text-green-300">{quantumMetrics.total_qubits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hilbert Space:</span>
                    <span className="text-green-300">{quantumMetrics.hilbert_space_dimension}D</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Superposition:</span>
                    <span className="text-green-300">{quantumMetrics.superposition_amplitude}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fidelity:</span>
                    <span className="text-green-300">{(quantumMetrics.measurement_fidelity * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Info Preservation:</span>
                    <span className="text-green-300">{quantumMetrics.information_preservation}</span>
                  </div>
                </div>
              </div>
              
              <div className="metric-group p-2 bg-black/50 border border-cyan-800 rounded">
                <h4 className="text-sm font-bold text-cyan-400 mb-2">Quantum Signature</h4>
                <div className="text-xs font-mono text-cyan-300 break-all">
                  {quantumMetrics.quantum_signature}
                </div>
              </div>
              
              <div className="metric-group p-2 bg-black/50 border border-purple-800 rounded">
                <h4 className="text-sm font-bold text-purple-400 mb-2">Performance</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Speedup Factor:</span>
                    <span className="text-purple-300">{quantumMetrics.quantum_speedup_factor}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Von Neumann Entropy:</span>
                    <span className="text-purple-300">{quantumMetrics.von_neumann_entropy}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="quantum-footer mt-3 pt-2 border-t border-gray-800 text-xs text-gray-500 text-center">
          Quantum Analysis by Daniel Guzman & Claude Sonnet 4
        </div>
      </div>
    </CyberpunkPanel>
  );
}