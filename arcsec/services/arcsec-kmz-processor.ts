/**
 * KMZ File Processor
 * Handles KMZ/KML file parsing and geospatial data extraction
 */

import { parseString } from 'xml2js';
import { promisify } from 'util';
import * as JSZip from 'jszip';

const parseXML = promisify(parseString);

export interface KMZData {
  name: string;
  description?: string;
  coordinates: Array<{
    latitude: number;
    longitude: number;
    altitude?: number;
  }>;
  properties: Record<string, any>;
  placemarks?: Array<{
    name: string;
    description?: string;
    coordinates: Array<{ latitude: number; longitude: number; altitude?: number }>;
    styleUrl?: string;
  }>;
}

export class KMZProcessor {
  async processKMZ(data: any): Promise<KMZData> {
    try {
      // Enhanced KMZ processing logic
      // Handle both raw data and Buffer input
      if (Buffer.isBuffer(data)) {
        return this.processKMZBuffer(data);
      }
      
      return {
        name: data.name || 'Untitled KMZ',
        description: data.description,
        coordinates: data.coordinates || [],
        properties: data.properties || {},
        placemarks: data.placemarks || []
      };
    } catch (error) {
      console.error('KMZ processing error:', error);
      throw new Error('Failed to process KMZ file');
    }
  }
  
  async processKMZBuffer(kmzBuffer: Buffer): Promise<KMZData> {
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
      return this.parseKMLContent(kmlContent);
      
    } catch (error) {
      console.error('KMZ buffer processing error:', error);
      throw new Error('Failed to process KMZ buffer');
    }
  }
  
  async parseKMLContent(kmlContent: string): Promise<KMZData> {
    try {
      const result = await parseXML(kmlContent);
      const kml = result.kml || result;
      const document = kml.Document?.[0] || kml;
      
      const placemarks = this.extractPlacemarksFromKML(document);
      
      return {
        name: document.name?.[0] || 'Parsed KML',
        description: document.description?.[0],
        coordinates: this.extractCoordinates(placemarks),
        properties: {
          source: 'KML',
          placemarkCount: placemarks.length
        },
        placemarks
      };
      
    } catch (error) {
      console.error('KML parsing error:', error);
      throw new Error('Failed to parse KML content');
    }
  }
  
  extractPlacemarksFromKML(document: any): Array<any> {
    const placemarks = document.Placemark || [];
    return Array.isArray(placemarks) ? placemarks : [placemarks];
  }
  
  extractCoordinates(placemarks: Array<any>): Array<{ latitude: number; longitude: number; altitude?: number }> {
    const coordinates: Array<{ latitude: number; longitude: number; altitude?: number }> = [];
    
    placemarks.forEach(placemark => {
      const geometry = placemark.Point?.[0] || placemark.LineString?.[0] || placemark.Polygon?.[0];
      if (geometry?.coordinates?.[0]) {
        const coordString = geometry.coordinates[0];
        const coords = this.parseCoordinateString(coordString);
        coordinates.push(...coords);
      }
    });
    
    return coordinates;
  }
  
  parseCoordinateString(coordString: string): Array<{ latitude: number; longitude: number; altitude?: number }> {
    const coordinates: Array<{ latitude: number; longitude: number; altitude?: number }> = [];
    
    const coordPairs = coordString.trim().split(/\s+/);
    coordPairs.forEach(pair => {
      const parts = pair.split(',');
      if (parts.length >= 2) {
        const longitude = parseFloat(parts[0]);
        const latitude = parseFloat(parts[1]);
        const altitude = parts[2] ? parseFloat(parts[2]) : undefined;
        
        if (!isNaN(longitude) && !isNaN(latitude)) {
          coordinates.push({ latitude, longitude, altitude });
        }
      }
    });
    
    return coordinates;
  }
  
  async extractPlacemarks(kmlContent: string): Promise<any[]> {
    try {
      const result = await parseXML(kmlContent);
      const kml = result.kml || result;
      const document = kml.Document?.[0] || kml;
      
      return this.extractPlacemarksFromKML(document).map(placemark => ({
        name: placemark.name?.[0] || 'Unnamed Placemark',
        description: placemark.description?.[0],
        coordinates: this.extractCoordinates([placemark]),
        styleUrl: placemark.styleUrl?.[0]
      }));
      
    } catch (error) {
      console.error('KML parsing error:', error);
      throw error;
    }
  }
}