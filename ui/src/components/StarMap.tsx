import { Stage, Container } from '@pixi/react';
import { useCallback, useState, useEffect } from 'react';
import { Planet } from './Planet.tsx';
import { PlanetDialog } from './PlanetDialog.tsx';

interface PlanetData {
  id: number;
  x: number;
  y: number;
  radius: number;
  satellites: {
    size: number;
    orbitRadius: number;
    orbitTilt: number;
    speed: number;
  }[];
}

export const StarMap = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<number | null>(null);
  const [showDebug] = useState(false);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev.slice(-4), `[${new Date().toLocaleTimeString()}] ${message}`]);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const newDimensions = { width: window.innerWidth, height: window.innerHeight };
      setDimensions(newDimensions);
      addLog(`Window resized: ${newDimensions.width}x${newDimensions.height}`);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [addLog]);

  const handlePlanetClick = useCallback((id: number) => {
    setSelectedPlanet(prev => {
      const newValue = prev === id ? null : id;
      addLog(`Planet ${id} ${newValue === null ? 'deselected' : 'selected'}`);
      return newValue;
    });
  }, [addLog]);

  const planets: PlanetData[] = [
    { id: 1, x: 200, y: 200, radius: 30 },
    { id: 2, x: 400, y: 300, radius: 40 },
    { id: 3, x: 600, y: 400, radius: 35 },
    { id: 4, x: 800, y: 300, radius: 45 },
    { id: 5, x: 500, y: 500, radius: 38 },
  ].map(planet => ({
    ...planet,
    satellites: [
      {
        size: planet.radius * 0.2,
        orbitRadius: planet.radius * 2,
        orbitTilt: Math.random() * 60 - 30, // Random tilt between -30 and 30 degrees
        speed: 0.02 + Math.random() * 0.02 // Random speed between 0.02 and 0.04 radians per second
      },
      {
        size: planet.radius * 0.15,
        orbitRadius: planet.radius * 3,
        orbitTilt: Math.random() * 60 - 30,
        speed: 0.01 + Math.random() * 0.02
      }
    ]
  }));

  return (
    <div className="relative w-full h-full">
      <Stage 
        width={dimensions.width} 
        height={dimensions.height-400} 
        options={{ 
          backgroundColor: 0x000000,
          resolution: window.devicePixelRatio || 1,
          antialias: true,
          eventMode: 'dynamic'
        }}
      >
        <Container eventMode="dynamic" interactiveChildren={true}>
          {planets.map((planet) => (
            <Planet
              key={planet.id}
              {...planet}
              onClick={() => handlePlanetClick(planet.id)}
              selected={selectedPlanet === planet.id}
              onHover={(isHovered: boolean) => addLog(`Planet ${planet.id} ${isHovered ? 'hovered' : 'unhovered'}`)}
            />
          ))}
          {selectedPlanet && (
            <PlanetDialog
              planet={selectedPlanet}
              onClose={() => setSelectedPlanet(null)}
              x={(planets.find(p => p.id === selectedPlanet)?.x ?? 0) + 120} 
              y={planets.find(p => p.id === selectedPlanet)?.y ?? 0}
            />
          )}
        </Container>
      </Stage>
      {showDebug && (
        <div className="fixed bottom-4 left-4 bg-gray-800/90 p-4 rounded-lg shadow-lg backdrop-blur-sm border border-gray-700">
          <h3 className="text-white font-semibold mb-2">Debug Logs</h3>
          <div className="space-y-1">
            {logs.map((log, i) => (
              <p key={i} className="text-gray-300 text-sm font-mono">{log}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
