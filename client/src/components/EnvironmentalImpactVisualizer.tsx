import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Environment, Stars, Sphere } from '@react-three/drei';

interface EnvironmentalData {
  airQuality: {
    aqi: number;
    pm25: number;
    pm10: number;
    ozone: number;
    carbonMonoxide: number;
  };
  waterQuality: {
    ph: number;
    turbidity: number;
    dissolvedOxygen: number;
    temperature: number;
  };
  climate: {
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    uvIndex: number;
  };
  biodiversity: {
    species_count: number;
    habitat_health: number;
    deforestation_rate: number;
  };
  pollution: {
    noise_level: number;
    light_pollution: number;
    chemical_contamination: number;
  };
}

interface AmbientLightingProps {
  environmentalData: EnvironmentalData | null;
  impactLevel: 'low' | 'moderate' | 'high' | 'critical';
}

const AmbientLighting: React.FC<AmbientLightingProps> = ({ environmentalData, impactLevel }) => {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const { scene } = useThree();

  useFrame((state) => {
    if (!lightRef.current || !environmentalData) return;

    const time = state.clock.getElapsedTime();
    
    // Calculate color based on environmental impact
    let color = new THREE.Color();
    let intensity = 0.5;

    switch (impactLevel) {
      case 'low':
        color.setHex(0x00ff88);
        intensity = 0.6 + Math.sin(time * 0.5) * 0.1;
        break;
      case 'moderate':
        color.setHex(0xffff00);
        intensity = 0.8 + Math.sin(time * 1.0) * 0.2;
        break;
      case 'high':
        color.setHex(0xff8800);
        intensity = 1.0 + Math.sin(time * 1.5) * 0.3;
        break;
      case 'critical':
        color.setHex(0xff0000);
        intensity = 1.2 + Math.sin(time * 2.0) * 0.4;
        break;
    }

    lightRef.current.color = color;
    lightRef.current.intensity = intensity;

    // Update scene fog based on air quality
    if (environmentalData.airQuality.aqi > 150) {
      scene.fog = new THREE.Fog(0x888888, 10, 50);
    } else if (environmentalData.airQuality.aqi > 100) {
      scene.fog = new THREE.Fog(0xcccccc, 20, 80);
    } else {
      scene.fog = null;
    }
  });

  return (
    <>
      <directionalLight
        ref={lightRef}
        position={[10, 10, 5]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <ambientLight intensity={0.3} />
    </>
  );
};

interface EnvironmentalSphereProps {
  data: EnvironmentalData;
  type: 'air' | 'water' | 'climate';
  position: [number, number, number];
}

const EnvironmentalSphere: React.FC<EnvironmentalSphereProps> = ({ data, type, position }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    
    // Animate based on environmental data
    let scale = 1;
    let color = new THREE.Color();

    switch (type) {
      case 'air':
        scale = 1 + (data.airQuality.aqi / 500) * 0.5;
        const aqiLevel = data.airQuality.aqi;
        if (aqiLevel > 200) color.setHex(0xff0000);
        else if (aqiLevel > 150) color.setHex(0xff8800);
        else if (aqiLevel > 100) color.setHex(0xffff00);
        else color.setHex(0x00ff88);
        break;
      
      case 'water':
        scale = 1 + Math.abs(7 - data.waterQuality.ph) * 0.1;
        if (data.waterQuality.ph < 6.5 || data.waterQuality.ph > 8.5) {
          color.setHex(0xff4444);
        } else {
          color.setHex(0x0088ff);
        }
        break;
      
      case 'climate':
        scale = 1 + (data.climate.temperature / 50) * 0.3;
        if (data.climate.temperature > 35) color.setHex(0xff4422);
        else if (data.climate.temperature > 30) color.setHex(0xff8844);
        else if (data.climate.temperature > 25) color.setHex(0xffcc88);
        else color.setHex(0x88ccff);
        break;
    }

    meshRef.current.scale.setScalar(scale + Math.sin(time * 2) * 0.1);
    (meshRef.current.material as THREE.MeshStandardMaterial).color = color;
    (meshRef.current.material as THREE.MeshStandardMaterial).emissive = color.clone().multiplyScalar(0.2);
  });

  return (
    <Sphere ref={meshRef} args={[0.5, 32, 32]} position={position}>
      <meshStandardMaterial transparent opacity={0.8} />
    </Sphere>
  );
};

const DataDisplay: React.FC<{ data: EnvironmentalData; impactLevel: string }> = ({ data, impactLevel }) => {
  return (
    <div className="absolute top-4 left-4 bg-black/80 text-white p-4 rounded-lg border border-cyan-500 min-w-80">
      <h3 className="text-xl font-bold text-cyan-400 mb-3">Environmental Impact Monitor</h3>
      
      <div className="space-y-3">
        <div className="bg-gray-800 p-3 rounded">
          <h4 className="text-cyan-300 font-semibold mb-2">Air Quality</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>AQI: <span className={`font-bold ${data.airQuality.aqi > 150 ? 'text-red-400' : 'text-green-400'}`}>
              {data.airQuality.aqi}
            </span></div>
            <div>PM2.5: {data.airQuality.pm25.toFixed(1)} µg/m³</div>
            <div>PM10: {data.airQuality.pm10.toFixed(1)} µg/m³</div>
            <div>Ozone: {data.airQuality.ozone.toFixed(3)} ppm</div>
          </div>
        </div>

        <div className="bg-gray-800 p-3 rounded">
          <h4 className="text-blue-300 font-semibold mb-2">Water Quality</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>pH: <span className={`font-bold ${data.waterQuality.ph < 6.5 || data.waterQuality.ph > 8.5 ? 'text-red-400' : 'text-green-400'}`}>
              {data.waterQuality.ph.toFixed(1)}
            </span></div>
            <div>Turbidity: {data.waterQuality.turbidity.toFixed(1)} NTU</div>
            <div>DO: {data.waterQuality.dissolvedOxygen.toFixed(1)} mg/L</div>
            <div>Temp: {data.waterQuality.temperature.toFixed(1)}°C</div>
          </div>
        </div>

        <div className="bg-gray-800 p-3 rounded">
          <h4 className="text-orange-300 font-semibold mb-2">Climate</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Temp: <span className={`font-bold ${data.climate.temperature > 35 ? 'text-red-400' : 'text-green-400'}`}>
              {data.climate.temperature.toFixed(1)}°C
            </span></div>
            <div>Humidity: {data.climate.humidity.toFixed(1)}%</div>
            <div>Pressure: {data.climate.pressure.toFixed(0)} hPa</div>
            <div>UV Index: {data.climate.uvIndex.toFixed(1)}</div>
          </div>
        </div>

        <div className="bg-gray-900 p-3 rounded border border-cyan-400">
          <h4 className="text-cyan-400 font-bold mb-1">Overall Impact Level</h4>
          <div className={`text-lg font-bold ${
            impactLevel === 'critical' ? 'text-red-400' :
            impactLevel === 'high' ? 'text-orange-400' :
            impactLevel === 'moderate' ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {impactLevel.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};

const EnvironmentalImpactVisualizer: React.FC = () => {
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData | null>(null);
  const [impactLevel, setImpactLevel] = useState<'low' | 'moderate' | 'high' | 'critical'>('low');
  const [isActive, setIsActive] = useState(false);

  const calculateImpactLevel = (data: EnvironmentalData): 'low' | 'moderate' | 'high' | 'critical' => {
    const impacts: number[] = [];

    // Air Quality Impact
    if (data.airQuality.aqi > 200) impacts.push(0.8);
    else if (data.airQuality.aqi > 150) impacts.push(0.6);
    else if (data.airQuality.aqi > 100) impacts.push(0.4);
    else impacts.push(0.1);

    // Water Quality Impact
    if (data.waterQuality.ph < 6.5 || data.waterQuality.ph > 8.5) {
      impacts.push(0.7);
    } else {
      impacts.push(0.2);
    }

    // Climate Impact
    if (data.climate.temperature > 35) impacts.push(0.9);
    else if (data.climate.temperature > 30) impacts.push(0.6);
    else impacts.push(0.3);

    const avgImpact = impacts.reduce((sum, impact) => sum + impact, 0) / impacts.length;
    
    if (avgImpact > 0.75) return 'critical';
    if (avgImpact > 0.5) return 'high';
    if (avgImpact > 0.25) return 'moderate';
    return 'low';
  };

  const fetchEnvironmentalData = async () => {
    try {
      // Simulate environmental data fetch
      const mockData: EnvironmentalData = {
        airQuality: {
          aqi: Math.floor(Math.random() * 300) + 50,
          pm25: Math.random() * 50 + 10,
          pm10: Math.random() * 100 + 20,
          ozone: Math.random() * 0.2 + 0.05,
          carbonMonoxide: Math.random() * 10 + 2
        },
        waterQuality: {
          ph: Math.random() * 4 + 6,
          turbidity: Math.random() * 20 + 1,
          dissolvedOxygen: Math.random() * 10 + 5,
          temperature: Math.random() * 20 + 10
        },
        climate: {
          temperature: Math.random() * 40 + 10,
          humidity: Math.random() * 80 + 20,
          pressure: Math.random() * 50 + 1000,
          windSpeed: Math.random() * 30 + 5,
          uvIndex: Math.random() * 10 + 1
        },
        biodiversity: {
          species_count: Math.floor(Math.random() * 1000) + 100,
          habitat_health: Math.random() * 100,
          deforestation_rate: Math.random() * 5
        },
        pollution: {
          noise_level: Math.random() * 100 + 30,
          light_pollution: Math.random() * 100,
          chemical_contamination: Math.random() * 50
        }
      };

      setEnvironmentalData(mockData);
      setImpactLevel(calculateImpactLevel(mockData));
    } catch (error) {
      console.error('Failed to fetch environmental data:', error);
    }
  };

  useEffect(() => {
    if (isActive) {
      fetchEnvironmentalData();
      const interval = setInterval(fetchEnvironmentalData, 5000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  return (
    <div className="relative w-full h-screen bg-black">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`px-4 py-2 rounded-lg font-bold transition-colors ${
            isActive 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isActive ? 'Stop Monitoring' : 'Start Monitoring'}
        </button>
      </div>

      {environmentalData && (
        <DataDisplay data={environmentalData} impactLevel={impactLevel} />
      )}

      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <AmbientLighting environmentalData={environmentalData} impactLevel={impactLevel} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
        
        {environmentalData && (
          <>
            <EnvironmentalSphere data={environmentalData} type="air" position={[-3, 0, 0]} />
            <EnvironmentalSphere data={environmentalData} type="water" position={[0, 0, 0]} />
            <EnvironmentalSphere data={environmentalData} type="climate" position={[3, 0, 0]} />
          </>
        )}

        {!isActive && (
          <Html center>
            <div className="text-white text-center p-6 bg-black/80 rounded-lg border border-cyan-500">
              <h2 className="text-2xl font-bold text-cyan-400 mb-3">
                Environmental Impact Visualizer
              </h2>
              <p className="text-gray-300 mb-4">
                Real-time environmental data visualization with ambient lighting
              </p>
              <p className="text-sm text-gray-400">
                Click "Start Monitoring" to begin real-time visualization
              </p>
            </div>
          </Html>
        )}
      </Canvas>
    </div>
  );
};

export default EnvironmentalImpactVisualizer;