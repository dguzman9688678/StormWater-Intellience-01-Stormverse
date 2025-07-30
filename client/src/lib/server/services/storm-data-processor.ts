/**
 * StormWater Intelligence Data Processor
 * Processes and integrates data from the StormWater Intelligence Platform
 * Copyright (c) 2025 Daniel Guzman - All Rights Reserved
 */

import fs from 'fs/promises';
import path from 'path';

export interface StormDataMetadata {
  projectName: string;
  version: string;
  copyright: string;
  generatedAt: string;
  totalFiles: number;
  scanPath: string;
  generatedBy: string;
}

export interface ProcessedStormData {
  metadata: StormDataMetadata;
  summary: {
    totalCategories: number;
    filesByType: Record<string, number>;
    securityAudits: number;
    lastProcessed: string;
  };
}

export class StormDataProcessor {
  private dataPath: string;
  
  constructor() {
    this.dataPath = path.join(process.cwd(), 'attached_assets', 'storm_1753881712940.json');
  }
  
  async processStormData(): Promise<ProcessedStormData | null> {
    try {
      const fileContent = await fs.readFile(this.dataPath, 'utf-8');
      const stormData = JSON.parse(fileContent);
      
      // Extract metadata
      const metadata: StormDataMetadata = stormData.metadata || {
        projectName: "StormWater Intelligence Platform",
        version: "3.4",
        copyright: "Copyright (c) 2025 Daniel Guzman - All Rights Reserved",
        generatedAt: new Date().toISOString(),
        totalFiles: 443,
        scanPath: "/home/runner/workspace",
        generatedBy: "Document Consolidation Script v1.0"
      };
      
      // Process categories and calculate summary
      const categories = stormData.categories || {};
      const filesByType: Record<string, number> = {};
      let totalSecurityAudits = 0;
      
      for (const [category, files] of Object.entries(categories)) {
        if (Array.isArray(files)) {
          filesByType[category] = files.length;
          
          // Count security audits
          files.forEach((file: any) => {
            if (file.type === 'security_audit' || file.category === 'security') {
              totalSecurityAudits++;
            }
          });
        }
      }
      
      return {
        metadata,
        summary: {
          totalCategories: Object.keys(categories).length,
          filesByType,
          securityAudits: totalSecurityAudits,
          lastProcessed: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('Error processing storm data:', error);
      return null;
    }
  }
  
  async getStormMetrics(): Promise<any> {
    const processedData = await this.processStormData();
    
    if (!processedData) {
      return {
        status: 'unavailable',
        message: 'Storm data processing failed'
      };
    }
    
    return {
      status: 'active',
      platform: processedData.metadata.projectName,
      version: processedData.metadata.version,
      metrics: {
        totalFiles: processedData.metadata.totalFiles,
        categories: processedData.summary.totalCategories,
        securityAudits: processedData.summary.securityAudits,
        lastUpdated: processedData.metadata.generatedAt
      },
      attribution: processedData.metadata.copyright
    };
  }
}

export const stormDataProcessor = new StormDataProcessor();