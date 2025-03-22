import { Stage, Container } from '@pixi/react';
import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { Planet } from './Planet.tsx';
import { PlanetDialog } from './PlanetDialog.tsx';
import { Army } from './Army.tsx';
import { ArmyDialog } from './ArmyDialog.tsx';
import { PathEditor } from './PathEditor.tsx';
import { MovingArmy } from './MovingArmy.tsx';
import { Grid } from './Grid.tsx';

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

interface PathPoint {
  x: number;
  y: number;
}

interface ArmyData {
  id: number;
  x: number;
  y: number;
  energy: number;
  movingTo?: { x: number; y: number }[];
}

export const StarMap = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<number | null>(null);
  const [selectedArmy, setSelectedArmy] = useState<number | null>(null);
  const [selectingDestination, setSelectingDestination] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<PathPoint | null>(null);
  const [pathPoints, setPathPoints] = useState<PathPoint[]>([]);
  const [showDebug] = useState(false);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [logs, setLogs] = useState<string[]>([]);
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
        orbitTilt: Math.random() * 60 - 30,
        speed: 0.02 + Math.random() * 0.02
      },
      {
        size: planet.radius * 0.15,
        orbitRadius: planet.radius * 3,
        orbitTilt: Math.random() * 60 - 30,
        speed: 0.01 + Math.random() * 0.02
      }
    ]
  }));

  const armies = useMemo<ArmyData[]>(() => [
    { id: 1, x: 300, y: 300, energy: 100 },
    { id: 2, x: 700, y: 200, energy: 150 },
    { id: 3, x: 500, y: 600, energy: 80 },
  ], []);

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev.slice(-4), `[${new Date().toLocaleTimeString()}] ${message}`]);
    console.log(message);
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
    if (selectingDestination) return;
    setSelectedPlanet(prev => {
      const newValue = prev === id ? null : id;
      if (newValue !== null) {
        setSelectedArmy(null);
      }
      addLog(`Planet ${id} ${newValue === null ? 'deselected' : 'selected'}`);
      return newValue;
    });
  }, [addLog, selectingDestination]);

  const handleArmyClick = useCallback((id: number) => {
    if (selectingDestination) return;
    setSelectedArmy(prev => {
      const newValue = prev === id ? null : id;
      if (newValue !== null) {
        setSelectedPlanet(null);
      }
      addLog(`Army ${id} ${newValue === null ? 'deselected' : 'selected'}`);
      return newValue;
    });
  }, [addLog, selectingDestination]);

  const handleStagePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!selectingDestination) return;
    const cellSize = 100;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / cellSize) * cellSize;
    const y = Math.round((e.clientY - rect.top) / cellSize) * cellSize;
    setHoverPosition({ x, y });
  }, [selectingDestination]);

  const handleStageClick = useCallback(() => {
    if (!selectingDestination || !hoverPosition) return;

    const sourcePlanet = planets.find(p => p.id === selectedPlanet);
    const sourceArmy = armies.find(a => a.id === selectedArmy);
    if (!sourcePlanet && !sourceArmy && pathPoints.length === 0) return;

    const startPoint = pathPoints.length === 0 
      ? (sourcePlanet ? { x: sourcePlanet.x, y: sourcePlanet.y } : { x: sourceArmy!.x, y: sourceArmy!.y })
      : pathPoints[pathPoints.length - 1];

    // Check if the new point creates a valid 8-directional path
    const dx = Math.abs(hoverPosition.x - startPoint.x);
    const dy = Math.abs(hoverPosition.y - startPoint.y);
    const isDiagonal = dx === dy;
    const isOrthogonal = dx === 0 || dy === 0;

    if (isDiagonal || isOrthogonal) {
      setPathPoints(prev => [...prev, { ...hoverPosition }]);
      addLog(`Added path point at (${hoverPosition.x}, ${hoverPosition.y})`);
    }
  }, [selectingDestination, hoverPosition, selectedPlanet, selectedArmy, planets, armies, pathPoints, addLog]);

  const handleSetTarget = useCallback(() => {
    if (pathPoints.length === 0) return;
    
    addLog('Target set with ' + pathPoints.length + ' points');
    
    if (selectedArmy) {
      const army = armies.find(a => a.id === selectedArmy);
      if (army) {
        army.movingTo = pathPoints;
      }
    }
    
    setSelectingDestination(false);
    setSelectedPlanet(null);
    setSelectedArmy(null);
    setPathPoints([]);
    setHoverPosition(null);
  }, [pathPoints, addLog, selectedArmy, armies]);

  const handleUndo = useCallback(() => {
    setPathPoints(prev => {
      if (prev.length === 0) return prev;
      return prev.slice(0, -1);
    });
    addLog('Undid last path point');
  }, [addLog]);

  return (
    <div className="relative w-full h-full">
      <Stage 
        width={dimensions.width} 
        height={dimensions.height} 
        options={{ 
          backgroundColor: 0x000000,
          resolution: window.devicePixelRatio || 1,
          antialias: true,
          eventMode: 'dynamic'
        }}
        onPointerMove={handleStagePointerMove}
        onClick={handleStageClick}
      >
        <Container eventMode="dynamic" interactiveChildren={true}>
          {(selectedPlanet || selectedArmy || selectingDestination) && (
            <Grid
              width={dimensions.width}
              height={dimensions.height}
              cellSize={100}
              color={0x444444}
              alpha={0.8}
            />
          )}
          {selectingDestination && selectedPlanet && (
            <PathEditor
              sourcePlanet={planets.find(p => p.id === selectedPlanet)!}
              pathPoints={pathPoints}
              hoverPosition={hoverPosition}
              onSetTarget={handleSetTarget}
              onUndo={handleUndo}
            />
          )}
          {selectingDestination && selectedArmy && (
            <PathEditor
              sourcePlanet={armies.find(a => a.id === selectedArmy)!}
              pathPoints={pathPoints}
              hoverPosition={hoverPosition}
              onSetTarget={handleSetTarget}
              onUndo={handleUndo}
            />
          )}
          {armies.map(army => (
            <React.Fragment key={army.id}>
              {army.movingTo ? (
                <MovingArmy
                  id={army.id}
                  startX={army.x}
                  startY={army.y}
                  pathPoints={army.movingTo}
                  speed={50}
                  energy={army.energy}
                  selected={selectedArmy === army.id}
                  onSelect={handleArmyClick}
                  onReveal={() => addLog(`Reveal army ${army.id}`)}
                />
              ) : (
                <Army
                  x={army.x}
                  y={army.y}
                  onClick={() => handleArmyClick(army.id)}
                  selected={selectedArmy === army.id}
                  onHover={(isHovered: boolean) => addLog(`Army ${army.id} ${isHovered ? 'hovered' : 'unhovered'}`)}
                />
              )}
            </React.Fragment>
          ))}
          {planets.map(planet => (
            <Planet
              key={planet.id}
              {...planet}
              onClick={() => handlePlanetClick(planet.id)}
              selected={selectedPlanet === planet.id}
              onHover={(isHovered: boolean) => addLog(`Planet ${planet.id} ${isHovered ? 'hovered' : 'unhovered'}`)}
            />
          ))}
          {selectedPlanet && !selectingDestination && (
            <PlanetDialog
              {...planets.find(p => p.id === selectedPlanet)!}
              planet={selectedPlanet}
              onClose={() => {
                setSelectedPlanet(null);
                addLog(`Planet ${selectedPlanet} dialog closed`);
              }}
              onSend={() => {
                setSelectingDestination(true);
                addLog(`Setting destination from planet ${selectedPlanet}`);
              }}
            />
          )}
          {selectedArmy && !selectingDestination && !armies.find(a => a.id === selectedArmy)?.movingTo && (
            <ArmyDialog
              {...armies.find(a => a.id === selectedArmy)!}
              onClose={() => {
                setSelectedArmy(null);
                addLog(`Army ${selectedArmy} dialog closed`);
              }}
              onSend={() => {
                setSelectingDestination(true);
                addLog(`Setting destination for army ${selectedArmy}`);
              }}
            />
          )}
        </Container>
      </Stage>
      {showDebug && (
        <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white p-2">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      )}
    </div>
  );
};
