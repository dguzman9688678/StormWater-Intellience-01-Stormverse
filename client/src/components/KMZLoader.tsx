import { useCallback, useRef } from "react";
import { useStormVerse } from "../lib/stores/useStormVerse";

export default function KMZLoader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { viewer, addKMZLayer } = useStormVerse();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !viewer) return;

    try {
      // Load KMZ file using Cesium's KML data source
      const kmzDataSource = await window.Cesium.KmlDataSource.load(file, {
        camera: viewer.scene.camera,
        canvas: viewer.scene.canvas,
        clampToGround: true
      });

      viewer.dataSources.add(kmzDataSource);
      
      // Style the loaded entities for cyberpunk theme
      const entities = kmzDataSource.entities.values;
      entities.forEach((entity: any) => {
        if (entity.polyline) {
          entity.polyline.material = new window.Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.2,
            color: window.Cesium.Color.CYAN
          });
          entity.polyline.width = 3;
        }
        
        if (entity.polygon) {
          entity.polygon.material = window.Cesium.Color.CYAN.withAlpha(0.3);
          entity.polygon.outline = true;
          entity.polygon.outlineColor = window.Cesium.Color.CYAN;
        }
        
        if (entity.point) {
          entity.point.color = window.Cesium.Color.CYAN;
          entity.point.outlineColor = window.Cesium.Color.WHITE;
          entity.point.outlineWidth = 2;
          entity.point.pixelSize = 8;
        }
      });

      // Zoom to the loaded data
      viewer.flyTo(kmzDataSource);
      
      console.log(`Loaded KMZ file: ${file.name}`);
      
    } catch (error) {
      console.error('Error loading KMZ file:', error);
    }
  }, [viewer, addKMZLayer]);

  const triggerFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="kmz-loader">
      <input
        ref={fileInputRef}
        type="file"
        accept=".kmz,.kml"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      
      <button 
        className="cyber-button kmz-upload-btn"
        onClick={triggerFileUpload}
        title="Load KMZ/KML Hurricane Data"
      >
        <span className="button-text">LOAD KMZ</span>
        <span className="button-glow"></span>
      </button>
    </div>
  );
}
