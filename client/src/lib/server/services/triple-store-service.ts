export interface SemanticTriple {
  subject: string;
  predicate: string;
  object: string;
  context?: string;
  timestamp: Date;
  source: string;
  verified: boolean;
}

export interface SemanticEntity {
  '@context': any;
  '@type': string;
  '@id': string;
  [key: string]: any;
}

export class TripleStoreService {
  private triples: Map<string, SemanticTriple> = new Map();
  private contexts: Map<string, any> = new Map();

  constructor() {
    this.initializeOntologies();
  }

  private initializeOntologies(): void {
    // Weather and Climate Ontology
    this.contexts.set('weather', {
      '@context': {
        'storm': 'http://stormverse.io/ontology/storm#',
        'geo': 'http://www.w3.org/2003/01/geo/wgs84_pos#',
        'time': 'http://www.w3.org/2006/time#',
        'noaa': 'http://noaa.gov/ontology#',
        'Hurricane': 'storm:Hurricane',
        'TropicalStorm': 'storm:TropicalStorm',
        'PressureSystem': 'storm:PressureSystem',
        'WeatherFront': 'storm:WeatherFront',
        'windSpeed': { '@id': 'storm:windSpeed', '@type': 'xsd:float' },
        'pressure': { '@id': 'storm:pressure', '@type': 'xsd:float' },
        'category': { '@id': 'storm:category', '@type': 'xsd:integer' },
        'latitude': { '@id': 'geo:lat', '@type': 'xsd:decimal' },
        'longitude': { '@id': 'geo:long', '@type': 'xsd:decimal' },
        'timestamp': { '@id': 'time:inXSDDateTime', '@type': 'xsd:dateTime' },
        'forecast': 'storm:forecast',
        'probability': { '@id': 'storm:probability', '@type': 'xsd:float' }
      }
    });

    // AI Agent Ontology
    this.contexts.set('agent', {
      '@context': {
        'agent': 'http://stormverse.io/ontology/agent#',
        'capability': 'http://stormverse.io/ontology/capability#',
        'Agent': 'agent:Agent',
        'AnalysisAgent': 'agent:AnalysisAgent',
        'SecurityAgent': 'agent:SecurityAgent',
        'DataAgent': 'agent:DataAgent',
        'VisualizationAgent': 'agent:VisualizationAgent',
        'ControlAgent': 'agent:ControlAgent',
        'hasCapability': 'agent:hasCapability',
        'hasStatus': 'agent:hasStatus',
        'currentActivity': 'agent:currentActivity',
        'coordinates': 'agent:coordinates',
        'lastUpdate': { '@id': 'agent:lastUpdate', '@type': 'xsd:dateTime' }
      }
    });

    // Security and Provenance Ontology
    this.contexts.set('security', {
      '@context': {
        'sec': 'http://stormverse.io/ontology/security#',
        'prov': 'http://www.w3.org/ns/prov#',
        'DataSource': 'sec:DataSource',
        'VerificationRecord': 'sec:VerificationRecord',
        'AuthorshipRecord': 'sec:AuthorshipRecord',
        'hasAuthor': 'prov:wasAttributedTo',
        'generatedAt': 'prov:generatedAtTime',
        'derivedFrom': 'prov:wasDerivedFrom',
        'verifiedBy': 'sec:verifiedBy',
        'integrityHash': 'sec:integrityHash',
        'confidence': { '@id': 'sec:confidence', '@type': 'xsd:float' }
      }
    });
  }

  async storeSemanticData(entity: SemanticEntity): Promise<{ id: string; triples: number }> {
    const triples = this.entityToTriples(entity);
    let storedCount = 0;

    for (const triple of triples) {
      const id = this.generateTripleId(triple);
      
      const semanticTriple: SemanticTriple = {
        ...triple,
        timestamp: new Date(),
        source: entity['@id'] || 'unknown',
        verified: false
      };

      this.triples.set(id, semanticTriple);
      storedCount++;
    }

    console.log(`Stored ${storedCount} triples for entity: ${entity['@id']}`);
    
    return {
      id: entity['@id'],
      triples: storedCount
    };
  }

  private entityToTriples(entity: SemanticEntity): Omit<SemanticTriple, 'timestamp' | 'source' | 'verified'>[] {
    const triples: Omit<SemanticTriple, 'timestamp' | 'source' | 'verified'>[] = [];
    const subject = entity['@id'];

    // Add type triple
    if (entity['@type']) {
      triples.push({
        subject,
        predicate: 'rdf:type',
        object: entity['@type'],
        context: entity['@context']
      });
    }

    // Process all properties
    Object.entries(entity).forEach(([key, value]) => {
      if (key.startsWith('@')) return; // Skip JSON-LD keywords

      if (Array.isArray(value)) {
        value.forEach(item => {
          triples.push({
            subject,
            predicate: key,
            object: this.serializeValue(item),
            context: entity['@context']
          });
        });
      } else {
        triples.push({
          subject,
          predicate: key,
          object: this.serializeValue(value),
          context: entity['@context']
        });
      }
    });

    return triples;
  }

  private serializeValue(value: any): string {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return String(value);
  }

  private generateTripleId(triple: Omit<SemanticTriple, 'timestamp' | 'source' | 'verified'>): string {
    const content = `${triple.subject}::${triple.predicate}::${triple.object}`;
    return Buffer.from(content).toString('base64');
  }

  async queryByType(type: string): Promise<SemanticEntity[]> {
    const typeTriples = Array.from(this.triples.values()).filter(
      triple => triple.predicate === 'rdf:type' && triple.object === type
    );

    const entities: SemanticEntity[] = [];

    for (const typeTriple of typeTriples) {
      const entityTriples = Array.from(this.triples.values()).filter(
        triple => triple.subject === typeTriple.subject
      );

      const entity = this.triplesToEntity(entityTriples);
      if (entity) {
        entities.push(entity);
      }
    }

    return entities;
  }

  async queryTriples(
    subject?: string,
    predicate?: string,
    object?: string
  ): Promise<SemanticTriple[]> {
    return Array.from(this.triples.values()).filter(triple => {
      return (!subject || triple.subject === subject) &&
             (!predicate || triple.predicate === predicate) &&
             (!object || triple.object === object);
    });
  }

  private triplesToEntity(triples: SemanticTriple[]): SemanticEntity | null {
    if (triples.length === 0) return null;

    const subject = triples[0].subject;
    const typeTriple = triples.find(t => t.predicate === 'rdf:type');
    
    const entity: SemanticEntity = {
      '@context': this.inferContext(triples),
      '@type': typeTriple?.object || 'Unknown',
      '@id': subject
    };

    triples.forEach(triple => {
      if (triple.predicate === 'rdf:type') return;

      try {
        const value = JSON.parse(triple.object);
        entity[triple.predicate] = value;
      } catch {
        entity[triple.predicate] = triple.object;
      }
    });

    return entity;
  }

  private inferContext(triples: SemanticTriple[]): any {
    // Try to determine the most appropriate context
    const contexts = triples
      .map(t => t.context)
      .filter(c => c)
      .reduce((acc, context) => {
        acc[context as string] = (acc[context as string] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const mostCommonContext = Object.keys(contexts).reduce((a, b) => 
      contexts[a] > contexts[b] ? a : b, 'weather'
    );

    return this.contexts.get(mostCommonContext) || this.contexts.get('weather');
  }

  async getHurricaneData(): Promise<SemanticEntity[]> {
    return this.queryByType('storm:Hurricane');
  }

  async getAgentData(): Promise<SemanticEntity[]> {
    return this.queryByType('agent:Agent');
  }

  async getPressureSystemData(): Promise<SemanticEntity[]> {
    return this.queryByType('storm:PressureSystem');
  }

  exportRDF(): string {
    let rdf = this.generatePrefixes();
    
    for (const triple of this.triples.values()) {
      const subject = this.formatRDFResource(triple.subject);
      const predicate = this.formatRDFResource(triple.predicate);
      const object = this.formatRDFValue(triple.object);
      
      rdf += `${subject} ${predicate} ${object} .\n`;
    }

    return rdf;
  }

  private generatePrefixes(): string {
    return `@prefix storm: <http://stormverse.io/ontology/storm#> .
@prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> .
@prefix time: <http://www.w3.org/2006/time#> .
@prefix agent: <http://stormverse.io/ontology/agent#> .
@prefix sec: <http://stormverse.io/ontology/security#> .
@prefix prov: <http://www.w3.org/ns/prov#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

`;
  }

  private formatRDFResource(resource: string): string {
    if (resource.startsWith('http://') || resource.startsWith('https://')) {
      return `<${resource}>`;
    }
    
    // Handle prefixed names
    if (resource.includes(':')) {
      return resource;
    }
    
    return `<${resource}>`;
  }

  private formatRDFValue(value: string): string {
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'number') {
        return `"${value}"^^xsd:decimal`;
      }
      if (typeof parsed === 'boolean') {
        return `"${value}"^^xsd:boolean`;
      }
    } catch {
      // Not JSON, treat as string
    }

    // Check if it's a date
    if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      return `"${value}"^^xsd:dateTime`;
    }

    // Default to string literal
    return `"${value.replace(/"/g, '\\"')}"`;
  }

  async clearStore(): Promise<void> {
    this.triples.clear();
    console.log('Triple store cleared');
  }

  getStatistics(): { totalTriples: number; entities: number; contexts: number } {
    const entities = new Set(Array.from(this.triples.values()).map(t => t.subject));
    
    return {
      totalTriples: this.triples.size,
      entities: entities.size,
      contexts: this.contexts.size
    };
  }
}
