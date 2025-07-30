// Triple Store implementation for semantic environmental data

export interface Triple {
  subject: string;
  predicate: string;
  object: string;
  context?: string;
  timestamp?: Date;
  source?: string;
}

export interface SemanticData {
  '@context': any;
  '@type': string;
  '@id': string;
  [key: string]: any;
}

export class TripleStore {
  private triples: Triple[] = [];
  private contexts: Map<string, any> = new Map();

  constructor() {
    this.initializeContexts();
  }

  private initializeContexts(): void {
    // Weather ontology context
    this.contexts.set('weather', {
      '@context': {
        'storm': 'http://stormverse.io/ontology/storm#',
        'geo': 'http://www.w3.org/2003/01/geo/wgs84_pos#',
        'time': 'http://www.w3.org/2006/time#',
        'Hurricane': 'storm:Hurricane',
        'windSpeed': 'storm:windSpeed',
        'pressure': 'storm:pressure',
        'category': 'storm:category',
        'latitude': 'geo:lat',
        'longitude': 'geo:long',
        'timestamp': 'time:inXSDDateTime'
      }
    });

    // Agent ontology context
    this.contexts.set('agent', {
      '@context': {
        'agent': 'http://stormverse.io/ontology/agent#',
        'capability': 'agent:capability',
        'status': 'agent:status',
        'activity': 'agent:activity',
        'coordinates': 'agent:coordinates'
      }
    });
  }

  addTriple(triple: Triple): void {
    const enrichedTriple = {
      ...triple,
      timestamp: triple.timestamp || new Date(),
      source: triple.source || 'stormverse-system'
    };
    
    this.triples.push(enrichedTriple);
    console.log('Triple added:', enrichedTriple);
  }

  addSemanticData(data: SemanticData): void {
    // Convert JSON-LD to triples
    const triples = this.jsonLdToTriples(data);
    triples.forEach(triple => this.addTriple(triple));
  }

  private jsonLdToTriples(data: SemanticData): Triple[] {
    const triples: Triple[] = [];
    const subject = data['@id'];
    
    Object.keys(data).forEach(key => {
      if (key.startsWith('@')) return; // Skip JSON-LD keywords
      
      const value = data[key];
      if (typeof value === 'object' && value !== null) {
        // Handle nested objects
        if (Array.isArray(value)) {
          value.forEach(item => {
            triples.push({
              subject,
              predicate: key,
              object: typeof item === 'object' ? JSON.stringify(item) : String(item)
            });
          });
        } else {
          triples.push({
            subject,
            predicate: key,
            object: JSON.stringify(value)
          });
        }
      } else {
        triples.push({
          subject,
          predicate: key,
          object: String(value)
        });
      }
    });
    
    return triples;
  }

  query(subject?: string, predicate?: string, object?: string): Triple[] {
    return this.triples.filter(triple => {
      return (!subject || triple.subject === subject) &&
             (!predicate || triple.predicate === predicate) &&
             (!object || triple.object === object);
    });
  }

  getHurricaneData(hurricaneId?: string): SemanticData[] {
    const hurricaneTriples = hurricaneId 
      ? this.query(hurricaneId)
      : this.query(undefined, 'rdf:type', 'storm:Hurricane');
    
    return this.triplesToJsonLd(hurricaneTriples);
  }

  getAgentData(agentId?: string): SemanticData[] {
    const agentTriples = agentId
      ? this.query(agentId)
      : this.query(undefined, 'rdf:type', 'agent:Agent');
    
    return this.triplesToJsonLd(agentTriples);
  }

  private triplesToJsonLd(triples: Triple[]): SemanticData[] {
    const grouped = new Map<string, Triple[]>();
    
    // Group triples by subject
    triples.forEach(triple => {
      if (!grouped.has(triple.subject)) {
        grouped.set(triple.subject, []);
      }
      grouped.get(triple.subject)!.push(triple);
    });
    
    // Convert each group to JSON-LD
    return Array.from(grouped.entries()).map(([subject, subjectTriples]) => {
      const jsonLd: SemanticData = {
        '@context': this.contexts.get('weather') || {},
        '@id': subject,
        '@type': 'Unknown'
      };
      
      subjectTriples.forEach(triple => {
        try {
          const value = JSON.parse(triple.object);
          jsonLd[triple.predicate] = value;
        } catch {
          jsonLd[triple.predicate] = triple.object;
        }
      });
      
      return jsonLd;
    });
  }

  exportRDF(): string {
    let rdf = `@prefix storm: <http://stormverse.io/ontology/storm#> .
@prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> .
@prefix time: <http://www.w3.org/2006/time#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

`;
    
    this.triples.forEach(triple => {
      rdf += `<${triple.subject}> <${triple.predicate}> "${triple.object}" .\n`;
    });
    
    return rdf;
  }

  importRDF(rdfData: string): void {
    // Basic RDF parsing (simplified)
    const lines = rdfData.split('\n');
    lines.forEach(line => {
      const match = line.match(/<([^>]+)>\s+<([^>]+)>\s+"([^"]+)"/);
      if (match) {
        this.addTriple({
          subject: match[1],
          predicate: match[2],
          object: match[3]
        });
      }
    });
  }
}

export const globalTripleStore = new TripleStore();
