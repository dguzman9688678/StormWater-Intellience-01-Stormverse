import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface Layer {
  id: string;
  type: 'imagery' | 'terrain' | 'kmz' | 'weather';
  url?: string;
  data?: any;
  alpha?: number;
  visible?: boolean;
}

interface StormVerseState {
  isInitialized: boolean;
  viewer: any | null;
  layers: Layer[];
  
  // Actions
  initializeSystem: () => void;
  setViewer: (viewer: any) => void;
  addLayer: (layer: Layer) => void;
  removeLayer: (layerId: string) => void;
  toggleLayer: (layerId: string) => void;
  addKMZLayer: (data: any) => void;
}

export const useStormVerse = create<StormVerseState>()(
  subscribeWithSelector((set, get) => ({
    isInitialized: false,
    viewer: null,
    layers: [],
    
    initializeSystem: () => {
      console.log('Initializing StormVerse system...');
      
      // Simulate system initialization
      setTimeout(() => {
        set({ isInitialized: true });
        console.log('StormVerse system initialized');
      }, 2000);
    },
    
    setViewer: (viewer) => {
      set({ viewer });
      console.log('Cesium viewer set');
    },
    
    addLayer: (layer) => {
      set((state) => ({
        layers: [...state.layers, { ...layer, visible: true }]
      }));
      console.log(`Layer added: ${layer.id}`);
    },
    
    removeLayer: (layerId) => {
      set((state) => ({
        layers: state.layers.filter(layer => layer.id !== layerId)
      }));
      
      // Remove from viewer if exists
      const { viewer } = get();
      if (viewer) {
        const dataSource = viewer.dataSources.getByName(layerId);
        if (dataSource.length > 0) {
          viewer.dataSources.remove(dataSource[0]);
        }
      }
      
      console.log(`Layer removed: ${layerId}`);
    },
    
    toggleLayer: (layerId) => {
      set((state) => ({
        layers: state.layers.map(layer =>
          layer.id === layerId 
            ? { ...layer, visible: !layer.visible }
            : layer
        )
      }));
    },
    
    addKMZLayer: (data) => {
      const kmzLayer: Layer = {
        id: `kmz-${Date.now()}`,
        type: 'kmz',
        data,
        visible: true
      };
      
      get().addLayer(kmzLayer);
    }
  }))
);
