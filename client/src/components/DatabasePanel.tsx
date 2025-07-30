import React, { useState } from 'react';
import CyberpunkPanel from './ui/cyberpunk-panel';

interface TableInfo {
  name: string;
  description: string;
  recordCount?: number;
  lastActivity?: string;
  icon: string;
}

const databaseTables: TableInfo[] = [
  {
    name: 'users',
    description: 'User accounts with role-based permissions',
    icon: '👤',
    recordCount: 0
  },
  {
    name: 'geo_files',
    description: 'KMZ/KML files with ARCSEC signatures',
    icon: '🗺️',
    recordCount: 0
  },
  {
    name: 'noaa_data',
    description: 'Live weather data from NOAA feeds',
    icon: '🌪️',
    recordCount: 0
  },
  {
    name: 'compliance_zones',
    description: 'EPA/FEMA regulatory compliance areas',
    icon: '⚖️',
    recordCount: 0
  },
  {
    name: 'arcsec_assets',
    description: 'Protected assets with SHA-256 verification',
    icon: '🔐',
    recordCount: 0
  },
  {
    name: 'agent_activity',
    description: 'AI agent operations and audit logs',
    icon: '🤖',
    recordCount: 0
  },
  {
    name: 'system_metadata',
    description: 'Global system configuration',
    icon: '⚙️',
    recordCount: 0
  }
];

export default function DatabasePanel() {
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);
  const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected' | 'in-memory'>('in-memory');
  
  return (
    <CyberpunkPanel 
      title="DATABASE SCHEMA" 
      position="left"
      className="database-panel w-[380px] max-h-[70vh]"
    >
      <div className="database-content">
        {/* Connection Status */}
        <div className="db-status mb-3 p-2 rounded bg-black/50 border border-cyan-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-cyan-400">Status:</span>
            <span className={`text-xs font-bold ${
              dbStatus === 'connected' ? 'text-green-400' : 
              dbStatus === 'in-memory' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {dbStatus === 'connected' ? 'PostgreSQL Connected' :
               dbStatus === 'in-memory' ? 'In-Memory Storage' : 'Disconnected'}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            © 2025 Daniel Guzman - ARCSEC Protected
          </div>
        </div>
        
        {/* Table List */}
        <div className="table-list space-y-2 overflow-y-auto" style={{ maxHeight: '400px' }}>
          {databaseTables.map(table => (
            <div 
              key={table.name}
              className={`table-item p-2 rounded border cursor-pointer transition-all ${
                selectedTable?.name === table.name 
                  ? 'bg-cyan-900/30 border-cyan-400' 
                  : 'bg-black/30 border-cyan-800/50 hover:border-cyan-600'
              }`}
              onClick={() => setSelectedTable(table)}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{table.icon}</span>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-cyan-400">
                    {table.name}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {table.description}
                  </p>
                  {table.recordCount !== undefined && (
                    <div className="text-xs text-green-400 mt-1">
                      Records: {table.recordCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Selected Table Details */}
        {selectedTable && (
          <div className="table-details mt-3 pt-3 border-t border-cyan-800">
            <h3 className="text-sm font-bold text-purple-400 mb-2">
              Table: {selectedTable.name}
            </h3>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-cyan-400">PostgreSQL Table</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Protection:</span>
                <span className="text-yellow-400">ARCSEC v3.0X</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400">Active</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Database Actions */}
        <div className="db-actions mt-3 pt-3 border-t border-cyan-800">
          <button className="w-full py-1 px-2 bg-cyan-900/50 border border-cyan-600 rounded text-xs text-cyan-400 hover:bg-cyan-800/50 transition-colors">
            Initialize Database
          </button>
        </div>
      </div>
    </CyberpunkPanel>
  );
}