import { Stage, Container } from '@pixi/react';
import { useCallback, useState, useEffect } from 'react';
import { Planet } from './Planet';

export const StarMap = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePlanetClick = useCallback((id: number) => {
    setSelectedPlanet(id);
  }, []);

  const planets = [
    { id: 1, x: 100, y: 100, radius: 20 },
    { id: 2, x: 300, y: 200, radius: 30 },
    { id: 3, x: 500, y: 400, radius: 25 },
  ];

  return (
    <>
      <Stage 
        width={dimensions.width} 
        height={dimensions.height} 
        options={{ 
          backgroundColor: 0x000000,
          resolution: window.devicePixelRatio || 1,
          antialias: true 
        }}
      >
        <Container>
          {planets.map((planet) => (
            <Planet
              key={planet.id}
              {...planet}
              onClick={() => handlePlanetClick(planet.id)}
              selected={selectedPlanet === planet.id}
            />
          ))}
        </Container>
      </Stage>
      {selectedPlanet && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl text-white mb-2">Planet {selectedPlanet}</h2>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => setSelectedPlanet(null)}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
};
