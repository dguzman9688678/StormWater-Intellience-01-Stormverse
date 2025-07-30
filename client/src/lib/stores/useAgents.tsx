import { create } from "zustand";

interface Agent {
  id: string;
  name: string;
  type: 'analysis' | 'security' | 'data' | 'visualization' | 'control';
  status: 'active' | 'idle' | 'processing' | 'error';
  activity: string;
  position: {
    longitude: number;
    latitude: number;
    height: number;
  };
  capabilities: string[];
}

interface AgentsState {
  agents: Agent[];
  activeAgents: Agent[];
  
  // Actions
  initializeAgents: () => void;
  updateAgentStatus: (agentId: string, status: Agent['status']) => void;
  setAgentActivity: (agentId: string, activity: string) => void;
  getAgentById: (agentId: string) => Agent | undefined;
}

export const useAgents = create<AgentsState>((set, get) => ({
  agents: [],
  activeAgents: [],
  
  initializeAgents: () => {
    const initialAgents: Agent[] = [
      {
        id: 'storm-citadel',
        name: 'STORM CITADEL',
        type: 'control',
        status: 'active',
        activity: 'AI CONTROL TOWERS OPERATIONAL',
        position: { longitude: -95.0, latitude: 50.0, height: 2000000 },
        capabilities: ['Global Coordination', 'System Control', 'AI Management']
      },
      {
        id: 'codex-temple',
        name: 'CODEX TEMPLE',
        type: 'data',
        status: 'active',
        activity: 'POLICY SIMULATIONS RUNNING',
        position: { longitude: -75.0, latitude: 40.0, height: 1800000 },
        capabilities: ['Data Processing', 'Policy Analysis', 'Simulation']
      },
      {
        id: 'skywall',
        name: 'SKYWALL',
        type: 'security',
        status: 'active',
        activity: 'ATMOSPHERIC MONITORING',
        position: { longitude: -120.0, latitude: 35.0, height: 2200000 },
        capabilities: ['Atmospheric Analysis', 'Weather Prediction', 'Storm Tracking']
      },
      {
        id: 'mirrorfield',
        name: 'MIRRORFIELD',
        type: 'analysis',
        status: 'active',
        activity: 'POLICY SIMULATIONS ACTIVE',
        position: { longitude: -85.0, latitude: 30.0, height: 1900000 },
        capabilities: ['Mirror Analysis', 'Reflection Modeling', 'Data Validation']
      },
      {
        id: 'watershed-realms',
        name: 'WATERSHED REALMS',
        type: 'analysis',
        status: 'active',
        activity: 'HYDROLOGICAL ANALYSIS',
        position: { longitude: -110.0, latitude: 45.0, height: 2100000 },
        capabilities: ['Water Systems', 'Flood Prediction', 'Rainfall Analysis']
      },
      {
        id: 'sanctum-of-self',
        name: 'SANCTUM OF SELF',
        type: 'data',
        status: 'active',
        activity: 'MEMORY CORE PROCESSING',
        position: { longitude: -100.0, latitude: 25.0, height: 1700000 },
        capabilities: ['Memory Management', 'Core Processing', 'Self Analysis']
      },
      {
        id: 'arcsec-citadel',
        name: 'ARCSEC CITADEL',
        type: 'security',
        status: 'active',
        activity: 'SECURITY PROTOCOLS ACTIVE',
        position: { longitude: -90.0, latitude: 55.0, height: 2300000 },
        capabilities: ['Security', 'Authentication', 'Data Integrity']
      },
      {
        id: 'phoenix-core',
        name: 'PHOENIX CORE',
        type: 'visualization',
        status: 'active',
        activity: 'QUANTUM RENDERING',
        position: { longitude: -105.0, latitude: 35.0, height: 2000000 },
        capabilities: ['Visualization', 'Quantum Rendering', 'Probability Display']
      }
    ];
    
    set({ 
      agents: initialAgents,
      activeAgents: initialAgents.filter(agent => agent.status === 'active')
    });
    
    console.log('Agents initialized:', initialAgents.length);
  },
  
  updateAgentStatus: (agentId, status) => {
    set((state) => {
      const updatedAgents = state.agents.map(agent =>
        agent.id === agentId ? { ...agent, status } : agent
      );
      
      return {
        agents: updatedAgents,
        activeAgents: updatedAgents.filter(agent => agent.status === 'active')
      };
    });
  },
  
  setAgentActivity: (agentId, activity) => {
    set((state) => ({
      agents: state.agents.map(agent =>
        agent.id === agentId ? { ...agent, activity } : agent
      ),
      activeAgents: state.activeAgents.map(agent =>
        agent.id === agentId ? { ...agent, activity } : agent
      )
    }));
  },
  
  getAgentById: (agentId) => {
    return get().agents.find(agent => agent.id === agentId);
  }
}));
