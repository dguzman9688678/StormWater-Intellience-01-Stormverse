import { create } from "zustand";
import { fetchNOAAData } from "../noaa-api";

interface Hurricane {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  windSpeed: number;
  pressure: number;
  category: number;
  forecast: any[];
}

interface PressureSystem {
  id: string;
  type: 'high' | 'low';
  latitude: number;
  longitude: number;
  pressure: number;
}

interface WeatherData {
  hurricanes: Hurricane[];
  pressureSystems: PressureSystem[];
  lastUpdated: Date;
  source?: string;
  status?: string;
  timestamp?: string;
}

interface WeatherDataState {
  weatherData: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Actions
  fetchWeatherData: () => Promise<void>;
  clearError: () => void;
}

export const useWeatherData = create<WeatherDataState>((set, get) => ({
  weatherData: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
  
  fetchWeatherData: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/weather/alerts');
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid weather data format received');
      }
      
      const updatedData = {
        hurricanes: data.hurricanes || [],
        pressureSystems: data.pressureSystems || [],
        lastUpdated: new Date(),
        source: data.source || 'Unknown',
        status: data.status || 'Active',
        timestamp: data.timestamp || new Date().toISOString()
      };
      
      set({
        weatherData: updatedData,
        isLoading: false,
        error: null,
        lastUpdated: updatedData.lastUpdated
      });
      
      console.log('Weather data updated successfully:', data.source || 'unknown');
      
    } catch (error) {
      console.error('Weather data fetch error:', error);
      
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch weather data',
        isLoading: false,
        weatherData: null
      });
    }
  },
  
  clearError: () => {
    set({ error: null });
  }
}));
