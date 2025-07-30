import React, { useState, useEffect } from 'react';
import CyberpunkPanel from './ui/cyberpunk-panel';

interface SystemMetadata {
  metadata: {
    creator: string;
    project: string;
    timestamp: string;
    enforcement: string;
    status: string;
    classification: string;
  };
  system_boot: {
    authentication: {
      user: string;
      identity_verified: boolean;
      imprint_id: string;
      agents_initialized: string[];
    };
  };
  session_summary: {
    agents_success: boolean;
    signature_verified: boolean;
    forecast_logged: boolean;
    kmz_mapped: boolean;
    noaa_tracked: boolean;
    report_generated: boolean;
  };
  arcsec_declaration: {
    imprint_id: string;
    protocol_version: string;
    authorship: string;
    security_status: string;
    linked_identity: string;
  };
}

export default function MetadataPanel() {
  const [metadata, setMetadata] = useState<SystemMetadata | null>(null);
  const [arcsecStatus, setArcsecStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [metaResponse, arcsecResponse] = await Promise.all([
          fetch('/api/metadata/system'),
          fetch('/api/metadata/arcsec')
        ]);
        
        if (metaResponse.ok && arcsecResponse.ok) {
          const metaData = await metaResponse.json();
          const arcsecData = await arcsecResponse.json();
          setMetadata(metaData);
          setArcsecStatus(arcsecData);
        }
      } catch (error) {
        console.error('Metadata fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMetadata();
  }, []);
  
  if (loading) {
    return (
      <CyberpunkPanel title="SYSTEM METADATA" position="top-left" className="metadata-panel">
        <div className="loading-text">Loading metadata...</div>
      </CyberpunkPanel>
    );
  }
  
  return (
    <CyberpunkPanel 
      title="SYSTEM METADATA" 
      position="top-left"
      className="metadata-panel w-[420px]"
    >
      <div className="metadata-content space-y-3">
        {/* Project Information */}
        <div className="section border border-purple-800 rounded p-2 bg-black/50">
          <h3 className="text-xs font-bold text-purple-400 mb-2">PROJECT INFORMATION</h3>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Project:</span>
              <span className="text-cyan-400">{metadata?.metadata.project}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Creator:</span>
              <span className="text-yellow-400">{metadata?.metadata.creator}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Classification:</span>
              <span className="text-green-400 text-right" style={{ maxWidth: '200px' }}>
                {metadata?.metadata.classification}
              </span>
            </div>
          </div>
        </div>
        
        {/* ARCSEC Status */}
        {arcsecStatus && (
          <div className="section border border-red-800 rounded p-2 bg-black/50">
            <h3 className="text-xs font-bold text-red-400 mb-2">ARCSEC SECURITY</h3>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-red-400 font-bold">{arcsecStatus.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Mode:</span>
                <span className="text-orange-400 font-bold animate-pulse">{arcsecStatus.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Protocol:</span>
                <span className="text-cyan-400">{arcsecStatus.protocol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Imprint:</span>
                <span className="text-purple-400">{arcsecStatus.imprint}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Authorship:</span>
                <span className="text-yellow-400">{arcsecStatus.authorship}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Agents Status */}
        {metadata?.system_boot.authentication.agents_initialized && (
          <div className="section border border-green-800 rounded p-2 bg-black/50">
            <h3 className="text-xs font-bold text-green-400 mb-2">AI AGENTS</h3>
            <div className="agent-grid grid grid-cols-4 gap-1">
              {metadata.system_boot.authentication.agents_initialized.map(agent => (
                <div 
                  key={agent}
                  className="agent-status text-xs p-1 bg-green-900/30 border border-green-700 rounded text-center"
                >
                  <span className="text-green-400">{agent}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Session Summary */}
        {metadata?.session_summary && (
          <div className="section border border-blue-800 rounded p-2 bg-black/50">
            <h3 className="text-xs font-bold text-blue-400 mb-2">SESSION STATUS</h3>
            <div className="status-grid grid grid-cols-2 gap-1 text-xs">
              {Object.entries(metadata.session_summary).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1">
                  <span className={`status-indicator ${value ? 'text-green-400' : 'text-red-400'}`}>
                    {value ? '✓' : '✗'}
                  </span>
                  <span className="text-gray-400">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Copyright */}
        <div className="copyright text-center text-xs text-gray-500 pt-2 border-t border-gray-800">
          © 2025 Daniel Guzman - All Rights Reserved
        </div>
      </div>
    </CyberpunkPanel>
  );
}