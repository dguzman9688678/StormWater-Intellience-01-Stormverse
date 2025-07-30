import fetch from 'node-fetch';

export interface HurricaneData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  windSpeed: number;
  pressure: number;
  category: number;
  lastUpdate: string;
  forecast: TrackPoint[];
}

export interface TrackPoint {
  time: number;
  latitude: number;
  longitude: number;
  windSpeed: number;
  pressure?: number;
}

export interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  area: string;
  effective: string;
  expires: string;
}

export class NOAAService {
  private readonly baseUrl = 'https://api.weather.gov';
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.NOAA_API_KEY || '';
  }

  async getActiveHurricanes(): Promise<HurricaneData[]> {
    try {
      // In production, this would fetch from NOAA's actual hurricane API
      // For now, return realistic mock data
      return this.getMockHurricaneData();
      
    } catch (error) {
      console.error('NOAA hurricane fetch error:', error);
      return this.getMockHurricaneData();
    }
  }

  async getHurricaneTrack(hurricaneId: string): Promise<TrackPoint[]> {
    try {
      // Mock track data for development
      return [
        { time: 0, latitude: 25.0, longitude: -80.0, windSpeed: 100, pressure: 970 },
        { time: 6, latitude: 26.5, longitude: -78.5, windSpeed: 110, pressure: 965 },
        { time: 12, latitude: 28.0, longitude: -77.0, windSpeed: 120, pressure: 960 },
        { time: 18, latitude: 29.5, longitude: -75.5, windSpeed: 115, pressure: 965 },
        { time: 24, latitude: 31.0, longitude: -74.0, windSpeed: 105, pressure: 975 },
        { time: 30, latitude: 32.5, longitude: -72.5, windSpeed: 95, pressure: 980 },
        { time: 36, latitude: 34.0, longitude: -71.0, windSpeed: 85, pressure: 985 }
      ];
      
    } catch (error) {
      console.error('Hurricane track fetch error:', error);
      return [];
    }
  }

  async getWeatherAlerts(): Promise<WeatherAlert[]> {
    try {
      const response = await fetch(`${this.baseUrl}/alerts/active`, {
        headers: {
          'User-Agent': 'StormVerse/1.0 (contact@stormverse.io)'
        }
      });

      if (response.ok) {
        const data = await response.json() as any;
        return this.formatAlerts(data.features || []);
      }

      return this.getMockAlerts();
      
    } catch (error) {
      console.error('Weather alerts fetch error:', error);
      return this.getMockAlerts();
    }
  }

  private getMockHurricaneData(): HurricaneData[] {
    return [
      {
        id: 'AL092024',
        name: 'STORM ALPHA',
        latitude: 26.5,
        longitude: -78.2,
        windSpeed: 120,
        pressure: 965,
        category: 3,
        lastUpdate: new Date().toISOString(),
        forecast: [
          { time: 6, latitude: 27.8, longitude: -76.1, windSpeed: 125 },
          { time: 12, latitude: 29.2, longitude: -74.3, windSpeed: 130 },
          { time: 18, latitude: 30.8, longitude: -72.1, windSpeed: 115 },
          { time: 24, latitude: 32.1, longitude: -70.4, windSpeed: 105 }
        ]
      },
      {
        id: 'AL102024',
        name: 'STORM BETA',
        latitude: 22.1,
        longitude: -85.4,
        windSpeed: 85,
        pressure: 985,
        category: 1,
        lastUpdate: new Date().toISOString(),
        forecast: [
          { time: 6, latitude: 23.2, longitude: -84.1, windSpeed: 90 },
          { time: 12, latitude: 24.5, longitude: -82.8, windSpeed: 95 },
          { time: 18, latitude: 25.8, longitude: -81.2, windSpeed: 100 },
          { time: 24, latitude: 27.1, longitude: -79.9, windSpeed: 85 }
        ]
      }
    ];
  }

  private getMockAlerts(): WeatherAlert[] {
    return [
      {
        id: 'alert-001',
        title: 'Hurricane Warning',
        description: 'Hurricane conditions expected within 36 hours',
        severity: 'extreme',
        area: 'Florida Keys',
        effective: new Date().toISOString(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'alert-002',
        title: 'Storm Surge Watch',
        description: 'Life-threatening storm surge possible',
        severity: 'severe',
        area: 'South Florida Coast',
        effective: new Date().toISOString(),
        expires: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  private formatAlerts(features: any[]): WeatherAlert[] {
    return features.map((feature, index) => ({
      id: feature.properties?.id || `alert-${index}`,
      title: feature.properties?.event || 'Weather Alert',
      description: feature.properties?.description || 'Weather alert issued',
      severity: this.mapSeverity(feature.properties?.severity),
      area: feature.properties?.areaDesc || 'Area not specified',
      effective: feature.properties?.effective || new Date().toISOString(),
      expires: feature.properties?.expires || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }));
  }

  private mapSeverity(noaaSeverity: string): WeatherAlert['severity'] {
    const severity = noaaSeverity?.toLowerCase();
    
    if (severity?.includes('extreme')) return 'extreme';
    if (severity?.includes('severe')) return 'severe';
    if (severity?.includes('moderate')) return 'moderate';
    return 'minor';
  }

  async getPressureSystems(): Promise<any[]> {
    // Mock pressure system data
    return [
      {
        id: 'high-atlantic-001',
        type: 'high',
        latitude: 35.0,
        longitude: -65.0,
        pressure: 1025,
        movement: { direction: 270, speed: 15 }
      },
      {
        id: 'low-gulf-001',
        type: 'low',
        latitude: 25.0,
        longitude: -90.0,
        pressure: 992,
        movement: { direction: 45, speed: 20 }
      }
    ];
  }

  async getSeaSurfaceTemperature(): Promise<any> {
    // Mock SST data for hurricane development potential
    return {
      averageTemp: 28.5, // Celsius
      anomaly: 1.2,
      regions: [
        { lat: 25, lon: -80, temp: 29.1 },
        { lat: 20, lon: -85, temp: 28.8 },
        { lat: 15, lon: -75, temp: 27.9 }
      ]
    };
  }
}
