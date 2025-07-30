import React, { useState } from 'react';
import CyberpunkPanel from './ui/cyberpunk-panel';
import { STORMVERSE_CONFIG } from '../lib/stormverse-config';

interface AnalysisDocument {
  id: string;
  title: string;
  category: string;
  purpose: string;
  includes: string[];
  status: 'complete' | 'in-progress' | 'planned';
}

const analysisDocuments: AnalysisDocument[] = [
  {
    id: 'readme',
    title: 'README.md',
    category: 'CORE TECHNICAL DOCUMENTATION',
    purpose: 'Entry-point explainer',
    includes: [
      'Project overview (StormVerse description)',
      'Tech stack (CesiumJS, AI agents, ARCSEC)',
      'Setup instructions',
      'Folder structure',
      'Run/deploy commands'
    ],
    status: 'complete'
  },
  {
    id: 'system-arch',
    title: 'SYSTEM_ARCHITECTURE.md',
    category: 'CORE TECHNICAL DOCUMENTATION',
    purpose: '3D + AI + data system breakdown',
    includes: [
      'Cesium globe structure',
      'Agent orbital layout',
      'KMZ/GeoJSON data ingestion',
      'ARCSEC hook-in layers',
      'Triple store or AI logic flow diagrams'
    ],
    status: 'complete'
  },
  {
    id: 'agent-spec',
    title: 'AGENT_DESIGN_SPEC.md',
    category: 'CORE TECHNICAL DOCUMENTATION',
    purpose: 'Define all 8 agents',
    includes: [
      'MITO: Dev automation',
      'ULTRON: Metadata validation',
      'JARVIS: Command routing',
      'PHOENIX: Memory & resurrection',
      'ODIN: Security protocols',
      'ECHO: Audio/voice interface',
      'STORM: Forecast logic',
      'VADER: Surveillance & resilience'
    ],
    status: 'complete'
  },
  {
    id: 'globe-guide',
    title: 'GLOBE_INTERFACE_GUIDE.md',
    category: 'CORE TECHNICAL DOCUMENTATION',
    purpose: 'Explain 3D controls',
    includes: [
      'Navigation (rotate, zoom, click regions)',
      'Live weather overlays',
      'Quantum arc renderer',
      'Time slider',
      'Agent orbit behavior'
    ],
    status: 'in-progress'
  },
  {
    id: 'data-sources',
    title: 'DATA_SOURCES.md',
    category: 'DATA & AI DOCUMENTS',
    purpose: 'Show where all live data comes from',
    includes: [
      'NOAA feeds',
      'KMZ file links',
      'GeoJSON formats',
      'OpenAI integration for insights',
      'ARCSEC-authenticated sources'
    ],
    status: 'complete'
  },
  {
    id: 'ai-logic',
    title: 'AI_LOGIC_FLOW.json',
    category: 'DATA & AI DOCUMENTS',
    purpose: 'How forecasts and analytics are calculated',
    includes: [
      'What each agent uses to analyze',
      'Probability cone rendering logic',
      'Quantum math models used (summarized)',
      'AI to output relationship'
    ],
    status: 'in-progress'
  },
  {
    id: 'viewer-config',
    title: 'viewer_config.json',
    category: 'DATA & AI DOCUMENTS',
    purpose: 'Central config for CesiumJS viewer',
    includes: [
      'Which KMZs to load',
      'Enabled overlays',
      'Token and source metadata',
      'Agent definitions and links to functions'
    ],
    status: 'complete'
  },
  {
    id: 'arcsec-protocol',
    title: 'ARCSEC_PROTOCOL.md',
    category: 'ARCSEC / LEGAL / SECURITY',
    purpose: 'Declare authorship, protection, origin',
    includes: [
      'Digital identity seal',
      'Authorship tracking',
      'Timestamp enforcement',
      'Data lineage and traceability',
      'Platform sovereignty'
    ],
    status: 'complete'
  },
  {
    id: 'license',
    title: 'LICENSE.md',
    category: 'ARCSEC / LEGAL / SECURITY',
    purpose: 'IP and usage license',
    includes: [
      'GPL-3.0 (open but protected)',
      'Custom ARCSEC License',
      'Authorship rights enforcement'
    ],
    status: 'complete'
  }
];

export default function AnalysisPanel() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDoc, setSelectedDoc] = useState<AnalysisDocument | null>(null);
  
  const categories = ['ALL', 'CORE TECHNICAL DOCUMENTATION', 'DATA & AI DOCUMENTS', 'ARCSEC / LEGAL / SECURITY'];
  
  const filteredDocs = selectedCategory === 'ALL' 
    ? analysisDocuments 
    : analysisDocuments.filter(doc => doc.category === selectedCategory);
  
  const getStatusColor = (status: AnalysisDocument['status']) => {
    switch (status) {
      case 'complete': return 'text-green-400';
      case 'in-progress': return 'text-yellow-400';
      case 'planned': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };
  
  return (
    <CyberpunkPanel 
      title="ANALYSIS DOCUMENTS" 
      position="bottom-left"
      className="analysis-panel w-[400px] max-h-[60vh]"
    >
      <div className="analysis-content">
        {/* Category Filter */}
        <div className="category-filter mb-3">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-black/50 border border-cyan-700 text-cyan-400 px-2 py-1 rounded text-xs"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        {/* Document List */}
        <div className="document-list overflow-y-auto" style={{ maxHeight: '300px' }}>
          {filteredDocs.map(doc => (
            <div 
              key={doc.id}
              className={`document-item border border-cyan-800/30 rounded p-2 mb-2 cursor-pointer transition-all hover:border-cyan-400 ${
                selectedDoc?.id === doc.id ? 'bg-cyan-900/20 border-cyan-400' : ''
              }`}
              onClick={() => setSelectedDoc(doc)}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-cyan-400 font-bold text-sm">{doc.title}</h4>
                <span className={`text-xs ${getStatusColor(doc.status)}`}>
                  {doc.status.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-400 text-xs">{doc.purpose}</p>
            </div>
          ))}
        </div>
        
        {/* Selected Document Details */}
        {selectedDoc && (
          <div className="document-details mt-3 pt-3 border-t border-cyan-800">
            <h3 className="text-cyan-400 font-bold mb-2">{selectedDoc.title}</h3>
            <p className="text-gray-300 text-xs mb-2">{selectedDoc.purpose}</p>
            <div className="includes-list">
              <h4 className="text-purple-400 text-xs font-bold mb-1">Includes:</h4>
              <ul className="list-disc list-inside">
                {selectedDoc.includes.map((item, idx) => (
                  <li key={idx} className="text-gray-400 text-xs">• {item}</li>
                ))}
              </ul>
            </div>
            <div className="mt-2 pt-2 border-t border-cyan-800/50">
              <p className="text-xs text-gray-500">
                © 2025 Daniel Guzman - All Rights Reserved
              </p>
            </div>
          </div>
        )}
      </div>
    </CyberpunkPanel>
  );
}