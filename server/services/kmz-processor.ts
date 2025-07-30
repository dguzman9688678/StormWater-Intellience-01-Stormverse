import JSZip from 'jszip';
import xml2js from 'xml2js';

export interface KMZData {
  id: string;
  name: string;
  type: 'hurricane_track' | 'pressure_zone' | 'weather_front' | 'observation';
  geometries: KMZGeometry[];
  metadata: KMZMetadata;
  processed: Date;
}

export interface KMZGeometry {
  type: 'Point' | 'LineString' | 'Polygon';
  coordinates: number[][];
  properties: Record<string, any>;
}

export interface KMZMetadata {
  source: string;
  created: string;
  description?: string;
  author?: string;
  version?: string;
}

export class KMZProcessor {
  private parser = new xml2js.Parser();

  async processKMZ(kmzBuffer: Buffer): Promise<KMZData> {
    try {
      const zip = await JSZip.loadAsync(kmzBuffer);
      
      // Find KML file(s) in the archive
      const kmlFiles = Object.keys(zip.files).filter(name => 
        name.endsWith('.kml') && !zip.files[name].dir
      );

      if (kmlFiles.length === 0) {
        throw new Error('No KML files found in KMZ archive');
      }

      const kmlContent = await zip.files[kmlFiles[0]].async('text');
      const kmlData = await this.parseKML(kmlContent);
      
      return {
        id: `kmz_${Date.now()}`,
        name: kmlData.name || 'Untitled KMZ',
        type: this.detectDataType(kmlData),
        geometries: this.extractGeometries(kmlData),
        metadata: this.extractMetadata(kmlData),
        processed: new Date()
      };
      
    } catch (error) {
      console.error('KMZ processing error:', error);
      throw new Error('Failed to process KMZ file');
    }
  }

  private async parseKML(kmlContent: string): Promise<any> {
    try {
      const result = await this.parser.parseStringPromise(kmlContent);
      return result.kml || result;
    } catch (error) {
      console.error('KML parsing error:', error);
      throw new Error('Failed to parse KML content');
    }
  }

  private detectDataType(kmlData: any): KMZData['type'] {
    const content = JSON.stringify(kmlData).toLowerCase();
    
    if (content.includes('hurricane') || content.includes('storm') || content.includes('tropical')) {
      return 'hurricane_track';
    }
    
    if (content.includes('pressure') || content.includes('isobar')) {
      return 'pressure_zone';
    }
    
    if (content.includes('front') || content.includes('weather')) {
      return 'weather_front';
    }
    
    return 'observation';
  }

  private extractGeometries(kmlData: any): KMZGeometry[] {
    const geometries: KMZGeometry[] = [];
    
    // Recursively extract placemarks
    this.extractPlacemarks(kmlData, geometries);
    
    return geometries;
  }

  private extractPlacemarks(node: any, geometries: KMZGeometry[]): void {
    if (!node || typeof node !== 'object') return;

    // Handle arrays
    if (Array.isArray(node)) {
      node.forEach(item => this.extractPlacemarks(item, geometries));
      return;
    }

    // Check if this is a Placemark
    if (node.Placemark) {
      const placemarks = Array.isArray(node.Placemark) ? node.Placemark : [node.Placemark];
      
      placemarks.forEach((placemark: any) => {
        const geometry = this.extractGeometryFromPlacemark(placemark);
        if (geometry) {
          geometries.push(geometry);
        }
      });
    }

    // Recursively check other properties
    Object.values(node).forEach(value => {
      if (typeof value === 'object') {
        this.extractPlacemarks(value, geometries);
      }
    });
  }

  private extractGeometryFromPlacemark(placemark: any): KMZGeometry | null {
    try {
      let coordinates: number[][] = [];
      let type: KMZGeometry['type'] = 'Point';
      
      // Extract properties
      const properties: Record<string, any> = {
        name: placemark.name?.[0] || 'Unnamed',
        description: placemark.description?.[0] || ''
      };

      // Handle extended data
      if (placemark.ExtendedData) {
        this.extractExtendedData(placemark.ExtendedData[0], properties);
      }

      // Extract geometry
      if (placemark.Point) {
        type = 'Point';
        const coords = this.parseCoordinates(placemark.Point[0].coordinates[0]);
        coordinates = coords.length > 0 ? [coords[0]] : [];
      } else if (placemark.LineString) {
        type = 'LineString';
        coordinates = this.parseCoordinates(placemark.LineString[0].coordinates[0]);
      } else if (placemark.Polygon) {
        type = 'Polygon';
        const outerBoundary = placemark.Polygon[0].outerBoundaryIs?.[0]?.LinearRing?.[0]?.coordinates?.[0];
        if (outerBoundary) {
          coordinates = [this.parseCoordinates(outerBoundary)];
        }
      }

      if (coordinates.length === 0) {
        return null;
      }

      return {
        type,
        coordinates,
        properties
      };
      
    } catch (error) {
      console.error('Geometry extraction error:', error);
      return null;
    }
  }

  private parseCoordinates(coordString: string): number[][] {
    if (!coordString || typeof coordString !== 'string') {
      return [];
    }

    try {
      return coordString
        .trim()
        .split(/\s+/)
        .map(coord => {
          const parts = coord.split(',').map(Number);
          return parts.length >= 2 ? [parts[0], parts[1], parts[2] || 0] : [];
        })
        .filter(coord => coord.length >= 2);
    } catch (error) {
      console.error('Coordinate parsing error:', error);
      return [];
    }
  }

  private extractExtendedData(extendedData: any, properties: Record<string, any>): void {
    if (extendedData.Data) {
      const dataElements = Array.isArray(extendedData.Data) ? extendedData.Data : [extendedData.Data];
      
      dataElements.forEach((data: any) => {
        const name = data.$.name;
        const value = data.value?.[0];
        if (name && value !== undefined) {
          properties[name] = value;
        }
      });
    }
  }

  private extractMetadata(kmlData: any): KMZMetadata {
    const metadata: KMZMetadata = {
      source: 'KMZ Upload',
      created: new Date().toISOString()
    };

    // Try to extract document metadata
    if (kmlData.Document?.[0]) {
      const doc = kmlData.Document[0];
      metadata.description = doc.description?.[0];
      metadata.author = doc.author?.[0];
      metadata.version = doc.version?.[0];
    }

    return metadata;
  }

  async validateKMZ(kmzBuffer: Buffer): Promise<boolean> {
    try {
      const zip = await JSZip.loadAsync(kmzBuffer);
      const kmlFiles = Object.keys(zip.files).filter(name => name.endsWith('.kml'));
      return kmlFiles.length > 0;
    } catch {
      return false;
    }
  }

  convertToGeoJSON(kmzData: KMZData): any {
    return {
      type: 'FeatureCollection',
      features: kmzData.geometries.map(geom => ({
        type: 'Feature',
        geometry: {
          type: geom.type,
          coordinates: geom.type === 'Point' ? geom.coordinates[0] : geom.coordinates
        },
        properties: geom.properties
      })),
      metadata: kmzData.metadata
    };
  }
}
