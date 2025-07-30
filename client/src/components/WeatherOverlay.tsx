import { useEffect, useCallback } from "react";
import { useWeatherData } from "../lib/stores/useWeatherData";
import { useStormVerse } from "../lib/stores/useStormVerse";

export default function WeatherOverlay() {
  const { weatherData, isLoading } = useWeatherData();
  const { viewer } = useStormVerse();

  const renderWeatherData = useCallback(() => {
    if (!viewer || !weatherData || !window.Cesium) return;

    // Clear existing weather entities
    const existingEntities = viewer.entities.values.filter((entity: any) => 
      entity.id && entity.id.startsWith('weather-')
    );
    existingEntities.forEach((entity: any) => viewer.entities.remove(entity));

    // Render hurricane data
    if (weatherData.hurricanes) {
      weatherData.hurricanes.forEach((hurricane: any, index: number) => {
        const position = window.Cesium.Cartesian3.fromDegrees(
          hurricane.longitude, 
          hurricane.latitude, 
          10000
        );

        // Hurricane icon
        viewer.entities.add({
          id: `weather-hurricane-${index}`,
          position: position,
          point: {
            pixelSize: 25,
            color: window.Cesium.Color.RED,
            outlineColor: window.Cesium.Color.WHITE,
            outlineWidth: 3,
            heightReference: window.Cesium.HeightReference.NONE
          },
          label: {
            text: `${hurricane.name}\n${hurricane.windSpeed} mph`,
            font: '12pt Inter',
            fillColor: window.Cesium.Color.WHITE,
            outlineColor: window.Cesium.Color.RED,
            outlineWidth: 2,
            style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new window.Cesium.Cartesian2(0, -50)
          }
        });

        // Wind field visualization
        const windRadius = hurricane.windSpeed * 1000; // Scale wind speed to radius
        viewer.entities.add({
          id: `weather-windfield-${index}`,
          position: position,
          ellipse: {
            semiMajorAxis: windRadius,
            semiMinorAxis: windRadius,
            material: window.Cesium.Color.RED.withAlpha(0.2),
            outline: true,
            outlineColor: window.Cesium.Color.RED,
            height: 5000
          }
        });
      });
    }

    // Render pressure systems
    if (weatherData.pressureSystems) {
      weatherData.pressureSystems.forEach((system: any, index: number) => {
        const position = window.Cesium.Cartesian3.fromDegrees(
          system.longitude,
          system.latitude,
          5000
        );

        const color = system.type === 'high' ? window.Cesium.Color.BLUE : window.Cesium.Color.ORANGE;
        const symbol = system.type === 'high' ? 'H' : 'L';

        viewer.entities.add({
          id: `weather-pressure-${index}`,
          position: position,
          label: {
            text: symbol,
            font: '24pt Inter',
            fillColor: color,
            outlineColor: window.Cesium.Color.WHITE,
            outlineWidth: 2,
            style: window.Cesium.LabelStyle.FILL_AND_OUTLINE
          }
        });
      });
    }

  }, [viewer, weatherData]);

  useEffect(() => {
    if (viewer && weatherData) {
      renderWeatherData();
    }
  }, [viewer, weatherData, renderWeatherData]);

  if (isLoading) {
    return (
      <div className="weather-loading">
        <div className="cyber-spinner"></div>
        <div>LOADING NOAA DATA...</div>
      </div>
    );
  }

  return null;
}
