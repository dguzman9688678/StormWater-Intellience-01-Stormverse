import crypto from 'crypto';

export interface DataIntegrityRecord {
  id: string;
  dataId: string;
  hash: string;
  timestamp: Date;
  author: string;
  source: string;
  verified: boolean;
  verificationMethod: string;
  confidence: number;
}

export interface AuthorshipRecord {
  dataId: string;
  author: string;
  organization: string;
  role: string;
  timestamp: Date;
  digitalSignature?: string;
  publicKey?: string;
}

export interface AuditTrailEntry {
  id: string;
  dataId: string;
  action: 'created' | 'modified' | 'accessed' | 'verified' | 'deleted';
  actor: string;
  timestamp: Date;
  details: Record<string, any>;
  sourceIP?: string;
  sessionId?: string;
}

export interface VerificationResult {
  verified: boolean;
  confidence: number;
  method: string;
  timestamp: Date;
  issues: string[];
  metadata: Record<string, any>;
}

export class ARCSECService {
  private integrityRecords: Map<string, DataIntegrityRecord> = new Map();
  private authorshipRecords: Map<string, AuthorshipRecord[]> = new Map();
  private auditTrail: Map<string, AuditTrailEntry[]> = new Map();
  private trustedSources: Set<string> = new Set();

  constructor() {
    this.initializeTrustedSources();
  }

  private initializeTrustedSources(): void {
    // Initialize trusted data sources
    this.trustedSources.add('noaa.gov');
    this.trustedSources.add('weather.gov');
    this.trustedSources.add('nhc.noaa.gov');
    this.trustedSources.add('stormverse.internal');
    this.trustedSources.add('hurricane.database');
  }

  async verifyDataIntegrity(data: any): Promise<VerificationResult> {
    const startTime = Date.now();
    const issues: string[] = [];
    let confidence = 1.0;
    let verified = true;

    try {
      // Generate data hash
      const dataHash = this.generateDataHash(data);
      const dataId = data.id || data['@id'] || `data_${Date.now()}`;

      // Check if we have an existing integrity record
      const existingRecord = this.integrityRecords.get(dataId);
      
      if (existingRecord) {
        // Verify against existing hash
        if (existingRecord.hash !== dataHash) {
          issues.push('Data hash mismatch - data may have been tampered with');
          confidence -= 0.5;
          verified = false;
        }
      } else {
        // Create new integrity record
        const integrityRecord: DataIntegrityRecord = {
          id: `integrity_${Date.now()}`,
          dataId,
          hash: dataHash,
          timestamp: new Date(),
          author: data.author || 'system',
          source: data.source || 'unknown',
          verified: true,
          verificationMethod: 'SHA-256',
          confidence: 1.0
        };

        this.integrityRecords.set(dataId, integrityRecord);
      }

      // Verify data source
      const sourceVerification = this.verifyDataSource(data);
      if (!sourceVerification.trusted) {
        issues.push(`Untrusted data source: ${sourceVerification.source}`);
        confidence -= 0.3;
      }

      // Verify data structure and completeness
      const structureVerification = this.verifyDataStructure(data);
      if (!structureVerification.valid) {
        issues.push('Invalid data structure');
        confidence -= 0.2;
        structureVerification.issues.forEach(issue => issues.push(issue));
      }

      // Verify temporal consistency
      const temporalVerification = this.verifyTemporalConsistency(data);
      if (!temporalVerification.valid) {
        issues.push('Temporal inconsistency detected');
        confidence -= 0.1;
      }

      // Record audit trail
      await this.addAuditTrailEntry(dataId, 'verified', 'arcsec-system', {
        verificationResult: verified,
        confidence,
        issuesCount: issues.length,
        processingTime: Date.now() - startTime
      });

      const result: VerificationResult = {
        verified: verified && confidence > 0.5,
        confidence: Math.max(0, confidence),
        method: 'ARCSEC-Multi-Factor',
        timestamp: new Date(),
        issues,
        metadata: {
          processingTime: Date.now() - startTime,
          hashAlgorithm: 'SHA-256',
          sourceVerified: sourceVerification.trusted,
          structureValid: structureVerification.valid,
          temporalValid: temporalVerification.valid
        }
      };

      console.log(`Data verification completed for ${dataId}: ${verified ? 'VERIFIED' : 'FAILED'} (confidence: ${confidence.toFixed(2)})`);
      
      return result;

    } catch (error) {
      console.error('Data verification error:', error);
      
      return {
        verified: false,
        confidence: 0,
        method: 'ARCSEC-Multi-Factor',
        timestamp: new Date(),
        issues: [`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        metadata: {
          error: true,
          processingTime: Date.now() - startTime
        }
      };
    }
  }

  private generateDataHash(data: any): string {
    // Create normalized JSON string for hashing
    const normalizedData = this.normalizeDataForHashing(data);
    return crypto.createHash('sha256').update(normalizedData).digest('hex');
  }

  private normalizeDataForHashing(data: any): string {
    // Remove volatile fields that shouldn't affect hash
    const cleanData = { ...data };
    delete cleanData.timestamp;
    delete cleanData.lastModified;
    delete cleanData.accessCount;
    delete cleanData.sessionId;
    
    // Sort object keys for consistent hashing
    return JSON.stringify(cleanData, Object.keys(cleanData).sort());
  }

  private verifyDataSource(data: any): { trusted: boolean; source: string; reason?: string } {
    const source = data.source || data.provider || 'unknown';
    
    // Extract domain from URL if source is a URL
    let domain = source;
    try {
      if (source.startsWith('http')) {
        domain = new URL(source).hostname;
      }
    } catch {
      // Not a URL, use as-is
    }

    const trusted = this.trustedSources.has(domain) || this.trustedSources.has(source);
    
    return {
      trusted,
      source: domain,
      reason: trusted ? undefined : 'Source not in trusted list'
    };
  }

  private verifyDataStructure(data: any): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check for required fields based on data type
    if (data['@type'] === 'storm:Hurricane' || data.type === 'hurricane') {
      if (!data.latitude || typeof data.latitude !== 'number') {
        issues.push('Missing or invalid latitude');
      }
      if (!data.longitude || typeof data.longitude !== 'number') {
        issues.push('Missing or invalid longitude');
      }
      if (!data.windSpeed || typeof data.windSpeed !== 'number') {
        issues.push('Missing or invalid wind speed');
      }
      if (!data.pressure || typeof data.pressure !== 'number') {
        issues.push('Missing or invalid pressure');
      }
    }

    // Check for agent data structure
    if (data['@type'] === 'agent:Agent' || data.type === 'agent') {
      if (!data.id || typeof data.id !== 'string') {
        issues.push('Missing or invalid agent ID');
      }
      if (!data.status || !['active', 'idle', 'processing', 'error'].includes(data.status)) {
        issues.push('Missing or invalid agent status');
      }
    }

    // Check for semantic data requirements
    if (data['@context'] && !data['@type']) {
      issues.push('JSON-LD context without type specification');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  private verifyTemporalConsistency(data: any): { valid: boolean; reason?: string } {
    // Check if timestamps are reasonable
    if (data.timestamp) {
      const timestamp = new Date(data.timestamp);
      const now = new Date();
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      if (timestamp < oneYearAgo) {
        return { valid: false, reason: 'Timestamp too old' };
      }
      
      if (timestamp > oneHourFromNow) {
        return { valid: false, reason: 'Timestamp in future' };
      }
    }

    // Check forecast data temporal consistency
    if (data.forecast && Array.isArray(data.forecast)) {
      for (let i = 1; i < data.forecast.length; i++) {
        if (data.forecast[i].time <= data.forecast[i-1].time) {
          return { valid: false, reason: 'Forecast times not sequential' };
        }
      }
    }

    return { valid: true };
  }

  async recordAuthorship(dataId: string, author: string, organization: string, role: string): Promise<void> {
    const authorshipRecord: AuthorshipRecord = {
      dataId,
      author,
      organization,
      role,
      timestamp: new Date()
    };

    // Generate digital signature if we have keypair
    const signature = this.generateDigitalSignature(authorshipRecord);
    if (signature) {
      authorshipRecord.digitalSignature = signature.signature;
      authorshipRecord.publicKey = signature.publicKey;
    }

    if (!this.authorshipRecords.has(dataId)) {
      this.authorshipRecords.set(dataId, []);
    }
    
    this.authorshipRecords.get(dataId)!.push(authorshipRecord);

    await this.addAuditTrailEntry(dataId, 'created', author, {
      organization,
      role,
      authorship: 'recorded'
    });

    console.log(`Authorship recorded for ${dataId} by ${author} (${organization})`);
  }

  private generateDigitalSignature(data: AuthorshipRecord): { signature: string; publicKey: string } | null {
    try {
      // Generate a keypair for demonstration
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      });

      // Create signature
      const dataToSign = JSON.stringify({
        dataId: data.dataId,
        author: data.author,
        organization: data.organization,
        timestamp: data.timestamp.toISOString()
      });

      const signature = crypto.sign('sha256', Buffer.from(dataToSign), privateKey);

      return {
        signature: signature.toString('base64'),
        publicKey: publicKey.replace(/\n/g, '\\n')
      };

    } catch (error) {
      console.error('Digital signature generation failed:', error);
      return null;
    }
  }

  async getAuditTrail(dataId: string): Promise<AuditTrailEntry[]> {
    return this.auditTrail.get(dataId) || [];
  }

  private async addAuditTrailEntry(
    dataId: string, 
    action: AuditTrailEntry['action'], 
    actor: string, 
    details: Record<string, any>
  ): Promise<void> {
    const entry: AuditTrailEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dataId,
      action,
      actor,
      timestamp: new Date(),
      details,
      sourceIP: '127.0.0.1', // In production, extract from request
      sessionId: `session_${Date.now()}`
    };

    if (!this.auditTrail.has(dataId)) {
      this.auditTrail.set(dataId, []);
    }

    this.auditTrail.get(dataId)!.push(entry);

    // Keep only last 1000 entries per data item
    const entries = this.auditTrail.get(dataId)!;
    if (entries.length > 1000) {
      entries.splice(0, entries.length - 1000);
    }
  }

  async getDataIntegrityStatus(dataId: string): Promise<DataIntegrityRecord | null> {
    return this.integrityRecords.get(dataId) || null;
  }

  async getAuthorshipRecords(dataId: string): Promise<AuthorshipRecord[]> {
    return this.authorshipRecords.get(dataId) || [];
  }

  addTrustedSource(source: string): void {
    this.trustedSources.add(source);
    console.log(`Added trusted source: ${source}`);
  }

  removeTrustedSource(source: string): void {
    this.trustedSources.delete(source);
    console.log(`Removed trusted source: ${source}`);
  }

  getTrustedSources(): string[] {
    return Array.from(this.trustedSources);
  }

  getSecurityStatistics(): {
    totalIntegrityRecords: number;
    totalAuthorshipRecords: number;
    totalAuditEntries: number;
    trustedSources: number;
    verificationSuccess: number;
  } {
    let totalAuthorshipRecords = 0;
    let totalAuditEntries = 0;

    for (const records of this.authorshipRecords.values()) {
      totalAuthorshipRecords += records.length;
    }

    for (const entries of this.auditTrail.values()) {
      totalAuditEntries += entries.length;
    }

    const verifiedRecords = Array.from(this.integrityRecords.values())
      .filter(record => record.verified).length;

    return {
      totalIntegrityRecords: this.integrityRecords.size,
      totalAuthorshipRecords,
      totalAuditEntries,
      trustedSources: this.trustedSources.size,
      verificationSuccess: this.integrityRecords.size > 0 ? 
        (verifiedRecords / this.integrityRecords.size) * 100 : 0
    };
  }

  async clearSecurityData(): Promise<void> {
    this.integrityRecords.clear();
    this.authorshipRecords.clear();
    this.auditTrail.clear();
    console.log('ARCSEC security data cleared');
  }

  async exportSecurityReport(): Promise<string> {
    const stats = this.getSecurityStatistics();
    const timestamp = new Date().toISOString();

    let report = `# ARCSEC Security Report\n`;
    report += `Generated: ${timestamp}\n\n`;
    report += `## Statistics\n`;
    report += `- Total Integrity Records: ${stats.totalIntegrityRecords}\n`;
    report += `- Total Authorship Records: ${stats.totalAuthorshipRecords}\n`;
    report += `- Total Audit Entries: ${stats.totalAuditEntries}\n`;
    report += `- Trusted Sources: ${stats.trustedSources}\n`;
    report += `- Verification Success Rate: ${stats.verificationSuccess.toFixed(2)}%\n\n`;

    report += `## Trusted Sources\n`;
    for (const source of this.trustedSources) {
      report += `- ${source}\n`;
    }

    report += `\n## Recent Integrity Records\n`;
    for (const [dataId, record] of this.integrityRecords) {
      report += `- ${dataId}: ${record.verified ? 'VERIFIED' : 'FAILED'} (${record.confidence.toFixed(2)})\n`;
    }

    return report;
  }
}
