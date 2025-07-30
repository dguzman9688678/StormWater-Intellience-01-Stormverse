// NOAA API integration for real-time weather data

const NOAA_API_BASE = 'https://api.weather.gov';

export interface NOAAWeatherData {
  hurricanes: any[];
  pressureSystems: any[];
  alerts: any[];
  forecast: any[];
}

export async function fetchNOAAData(): Promise<NOAAWeatherData> {
  try {
    // Fetch active hurricane data
    const hurricanes = await fetchActiveHurricanes();
    
    // Fetch pressure systems (simplified)
    const pressureSystems = await fetchPressureSystems();
    
    // Fetch weather alerts
    const alerts = await fetchWeatherAlerts();
    
    // Return combined data
    return {
      hurricanes,
      pressureSystems,
      alerts,
      forecast: []
    };
    
  } catch (error) {
    console.error('Error fetching NOAA data:', error);
    
    // Return mock data for development/demo purposes
    return getMockWeatherData();
  }
}

async function fetchActiveHurricanes(): Promise<any[]> {
  try {
    // In a real implementation, this would fetch from NOAA's hurricane API
    // For now, return mock data that represents active hurricanes
    
    const response = await fetch('/api/weather/hurricanes');
    if (response.ok) {
      return await response.json();
    }
    
    // Fallback to mock data
    return getMockHurricanes();
    
  } catch (error) {
    console.error('Hurricane data fetch failed:', error);
    return getMockHurricanes();
  }
}

async function fetchPressureSystems(): Promise<any[]> {
  // Mock pressure system data
  return [
    {
      id: 'high-1',
      type: 'high',
      latitude: 35.0,
      longitude: -80.0,
      pressure: 1025
    },
    {
      id: 'low-1',
      type: 'low',
      latitude: 30.0,
      longitude: -90.0,
      pressure: 995
    }
  ];
}

async function fetchWeatherAlerts(): Promise<any[]> {
  try {
    const response = await fetch(`${NOAA_API_BASE}/alerts/active`);
    if (response.ok) {
      const data = await response.json();
      return data.features || [];
    }
    return [];
  } catch (error) {
    console.error('Weather alerts fetch failed:', error);
    return [];
  }
}

function getMockWeatherData(): NOAAWeatherData {
  return {
    hurricanes: getMockHurricanes(),
    pressureSystems: [
      {
        id: 'high-atlantic',
        type: 'high',
        latitude: 35.0,
        longitude: -65.0,
        pressure: 1025
      },
      {
        id: 'low-gulf',
        type: 'low',
        latitude: 25.0,
        longitude: -90.0,
        pressure: 992
      }
    ],
    alerts: [],
    forecast: []
  };
}

function getMockHurricanes(): any[] {
  return [
    {
      id: 'hurr-001',
      name: 'STORM ALPHA',
      latitude: 26.5,
      longitude: -78.2,
      windSpeed: 120,
      pressure: 965,
      category: 3,
      forecast: [
        { time: 6, lat: 27.8, lon: -76.1, windSpeed: 125 },
        { time: 12, lat: 29.2, lon: -74.3, windSpeed: 130 },
        { time: 18, lat: 30.8, lon: -72.1, windSpeed: 115 },
        { time: 24, lat: 32.1, lon: -70.4, windSpeed: 105 }
      ]
    },
    {
      id: 'hurr-002',
      name: 'STORM BETA',
      latitude: 22.1,
      longitude: -85.4,
      windSpeed: 85,
      pressure: 985,
      category: 1,
      forecast: [
        { time: 6, lat: 23.2, lon: -84.1, windSpeed: 90 },
        { time: 12, lat: 24.5, lon: -82.8, windSpeed: 95 },
        { time: 18, lat: 25.8, lon: -81.2, windSpeed: 100 },
        { time: 24, lat: 27.1, lon: -79.9, windSpeed: 85 }
      ]
    }
  ];
}

export async function fetchHurricaneTrack(hurricaneId: string): Promise<any> {
  try {
    const response = await fetch(`/api/weather/hurricanes/${hurricaneId}/track`);
    if (response.ok) {
      return await response.json();
    }
    
    // Return mock track data
    return {
      id: hurricaneId,
      track: [
        { time: 0, lat: 25.0, lon: -80.0, windSpeed: 100 },
        { time: 6, lat: 26.5, lon: -78.5, windSpeed: 110 },
        { time: 12, lat: 28.0, lon: -77.0, windSpeed: 120 },
        { time: 18, lat: 29.5, lon: -75.5, windSpeed: 115 },
        { time: 24, lat: 31.0, lon: -74.0, windSpeed: 105 }
      ]
    };
    
  } catch (error) {
    console.error('Hurricane track fetch failed:', error);
    return null;
  }
}
