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
}

interface WeatherDataState {
  weatherData: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchWeatherData: () => Promise<void>;
  clearError: () => void;
}

export const useWeatherData = create<WeatherDataState>((set, get) => ({
  weatherData: null,
  isLoading: false,
  error: null,
  
  fetchWeatherData: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const data = await fetchNOAAData();
      
      set({
        weatherData: {
          ...data,
          lastUpdated: new Date()
        },
        isLoading: false
      });
      
      console.log('Weather data updated:', data);
      
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch weather data',
        isLoading: false
      });
      
      console.error('Weather data fetch error:', error);
    }
  },
  
  clearError: () => {
    set({ error: null });
  }
}));
