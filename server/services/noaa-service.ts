/**
 * NOAA Weather Service Integration
 * Provides real-time weather data from National Weather Service API
 */

export class NOAAService {
  private apiBase = 'https://api.weather.gov';
  
  async getHurricaneData() {
    try {
      // In production, this would make actual API calls to NOAA
      // For now, returning demo data
      throw new Error('NOAA API credentials not configured');
    } catch (error) {
      throw error;
    }
  }
  
  async getWeatherAlerts(state: string) {
    try {
      const response = await fetch(`${this.apiBase}/alerts/active?area=${state}`);
      if (!response.ok) throw new Error('Failed to fetch alerts');
      return await response.json();
    } catch (error) {
      console.error('NOAA alerts error:', error);
      throw error;
    }
  }
  
  async getCurrentConditions(lat: number, lon: number) {
    try {
      const pointResponse = await fetch(`${this.apiBase}/points/${lat},${lon}`);
      if (!pointResponse.ok) throw new Error('Failed to fetch point data');
      const pointData = await pointResponse.json();
      
      const forecastResponse = await fetch(pointData.properties.forecast);
      if (!forecastResponse.ok) throw new Error('Failed to fetch forecast');
      
      return await forecastResponse.json();
    } catch (error) {
      console.error('NOAA conditions error:', error);
      throw error;
    }
  }
}