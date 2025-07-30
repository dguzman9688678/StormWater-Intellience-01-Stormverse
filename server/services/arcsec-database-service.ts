/**
 * Database Status Service
 * Provides database schema and connection status information
 * Copyright (c) 2025 Daniel Guzman - All Rights Reserved
 */

export interface TableStatus {
  name: string;
  recordCount: number;
  lastActivity: string;
  status: 'active' | 'idle' | 'error';
}

export interface DatabaseStatus {
  connected: boolean;
  type: 'postgresql' | 'in-memory';
  tables: TableStatus[];
  metrics: {
    totalRecords: number;
    activeConnections: number;
    queryPerformance: number;
  };
}

export class DatabaseService {
  private tableDefinitions = [
    'users',
    'geo_files',
    'noaa_data',
    'compliance_zones',
    'arcsec_assets',
    'agent_activity',
    'system_metadata'
  ];
  
  async getDatabaseStatus(): Promise<DatabaseStatus> {
    // Simulate database status
    const isConnected = process.env.DATABASE_URL ? true : false;
    
    const tables: TableStatus[] = this.tableDefinitions.map(tableName => ({
      name: tableName,
      recordCount: Math.floor(Math.random() * 1000),
      lastActivity: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      status: 'active' as const
    }));
    
    const totalRecords = tables.reduce((sum, table) => sum + table.recordCount, 0);
    
    return {
      connected: isConnected,
      type: isConnected ? 'postgresql' : 'in-memory',
      tables,
      metrics: {
        totalRecords,
        activeConnections: isConnected ? Math.floor(Math.random() * 10) + 1 : 0,
        queryPerformance: Math.random() * 50 + 10
      }
    };
  }
  
  async getTableSchema(tableName: string): Promise<any> {
    const schemas: Record<string, any> = {
      users: {
        columns: [
          { name: 'id', type: 'UUID', primaryKey: true },
          { name: 'name', type: 'TEXT', nullable: false },
          { name: 'email', type: 'TEXT', unique: true },
          { name: 'role', type: 'ENUM', values: ['admin', 'operator', 'viewer', 'analyst'] },
          { name: 'created_at', type: 'TIMESTAMP', default: 'NOW()' }
        ]
      },
      geo_files: {
        columns: [
          { name: 'id', type: 'UUID', primaryKey: true },
          { name: 'user_id', type: 'UUID', foreignKey: 'users.id' },
          { name: 'filename', type: 'TEXT', nullable: false },
          { name: 'filepath', type: 'TEXT', nullable: false },
          { name: 'arcsec_signature', type: 'TEXT', nullable: false },
          { name: 'status', type: 'ENUM', values: ['unverified', 'verified', 'invalid'] }
        ]
      },
      noaa_data: {
        columns: [
          { name: 'id', type: 'UUID', primaryKey: true },
          { name: 'data_type', type: 'ENUM', values: ['radar', 'satellite', 'hurricane'] },
          { name: 'timestamp', type: 'TIMESTAMP', nullable: false },
          { name: 'data', type: 'JSONB', nullable: false },
          { name: 'agent_triggered_by', type: 'TEXT' }
        ]
      }
    };
    
    return schemas[tableName] || null;
  }
}

export const databaseService = new DatabaseService();