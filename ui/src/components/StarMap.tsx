import { Stage, Container, Text, Graphics } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { useCallback, useState, useEffect } from 'react';
import { Planet } from './Planet.tsx';

interface PlanetData {
  id: number;
  x: number;
  y: number;
  radius: number;
}

const PlanetDialog = ({ planet, onClose, x, y }: { planet: number, onClose: () => void, x: number, y: number }) => {
  return (
    <Container position={[x, y]}>
      <Graphics
        draw={g => {
          g.clear();
          g.beginFill(0x000000, 0.8);
          g.lineStyle(2, 0x4a5568);
          g.drawRoundedRect(-100, -80, 200, 160, 10);
          g.endFill();
        }}
      />
      <Text
        text={`Planet ${planet}`}
        anchor={0.5}
        position={[0, -50]}
        style={
          new TextStyle({
            fill: 0xffffff,
            fontSize: 18,
            fontWeight: 'bold'
          })
        }
      />
      <Text
        text="Resources: 1000"
        anchor={0.5}
        position={[0, -20]}
        style={
          new TextStyle({
            fill: 0xcccccc,
            fontSize: 14
          })
        }
      />
      <Text
        text="Population: 500"
        anchor={0.5}
        position={[0, 0]}
        style={
          new TextStyle({
            fill: 0xcccccc,
            fontSize: 14
          })
        }
      />
      <Text
        text="Defense: 75%"
        anchor={0.5}
        position={[0, 20]}
        style={
          new TextStyle({
            fill: 0xcccccc,
            fontSize: 14
          })
        }
      />
      <Graphics
        draw={g => {
          g.clear();
          g.beginFill(0x3b82f6);
          g.drawRoundedRect(-40, 40, 80, 30, 5);
          g.endFill();
        }}
        eventMode="dynamic"
        onclick={onClose}
        cursor="pointer"
      />
      <Text
        text="Close"
        anchor={0.5}
        position={[0, 55]}
        style={
          new TextStyle({
            fill: 0xffffff,
            fontSize: 14
          })
        }
      />
    </Container>
  );
};

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
  ];

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
              x={dimensions.width / 2}
              y={dimensions.height / 2}
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
