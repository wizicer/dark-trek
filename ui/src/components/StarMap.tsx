import { Stage, Container, Graphics } from "@pixi/react";
import React, { useCallback, useState, useEffect } from "react";
import { Planet } from "./Planet.tsx";
import { PlanetDialog } from "./PlanetDialog.tsx";
import { Army } from "./Army.tsx";
import { ArmyDialog } from "./ArmyDialog.tsx";
import { PathEditor } from "./PathEditor.tsx";
import { MovingArmy } from "./MovingArmy.tsx";
import { Grid } from "./Grid.tsx";
import { SearchList } from "./SearchList.tsx";
import { SearchItem } from "../types/search";
import { searchService } from "../services/searchService";
import { PlanetData, PathPoint, ArmyData } from "../types/game";
import { ConnectButton } from "./ConnectButton";

export const StarMap = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<number | null>(null);
  const [selectedArmy, setSelectedArmy] = useState<number | null>(null);
  const [selectedSearchId, setSelectedSearchId] = useState<number | null>(null);
  const [selectingDestination, setSelectingDestination] = useState(false);
  const [pathPoints, setPathPoints] = useState<PathPoint[]>([]);
  const [hoverPosition, setHoverPosition] = useState<PathPoint | null>(null);
  const [searchItems, setSearchItems] = useState<SearchItem[]>([]);
  const [currentPlayerId] = useState<number>(1);
  const [logs, setLogs] = useState<string[]>([]);
  const [showDebug] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [planets] = useState<PlanetData[]>([
    { id: 1, x: 200, y: 200, radius: 30, playerId: 1 },
    { id: 2, x: 400, y: 300, radius: 40, playerId: 2 },
    { id: 3, x: 600, y: 200, radius: 35, playerId: 0 },
    { id: 4, x: 800, y: 400, radius: 45, playerId: 0 },
    { id: 5, x: 300, y: 500, radius: 25, playerId: 0 },
  ].map((planet) => ({
    ...planet,
    satellites: [
      {
        size: planet.radius * 0.2,
        orbitRadius: planet.radius * 2,
        orbitTilt: Math.random() * 60 - 30,
        speed: 0.02 + Math.random() * 0.02,
      },
      {
        size: planet.radius * 0.15,
        orbitRadius: planet.radius * 3,
        orbitTilt: Math.random() * 60 - 30,
        speed: 0.01 + Math.random() * 0.02,
      },
    ],
  })));

  const [armies, setArmies] = useState<ArmyData[]>([
    { id: 1, x: 300, y: 300, energy: 100, playerId: 1 },
    { id: 2, x: 500, y: 400, energy: 80, playerId: 2 },
    { id: 3, x: 700, y: 300, energy: 120, playerId: 0 },
  ]);

  const addLog = useCallback((message: string) => {
    setLogs((prev) => [
      ...prev.slice(-4),
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);
    console.log(message);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const newDimensions = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      setDimensions(newDimensions);
      addLog(`Window resized: ${newDimensions.width}x${newDimensions.height}`);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [addLog]);

  useEffect(() => {
    // Show first notification after 3 seconds
    const firstTimer = setTimeout(() => {
      const item = searchService.createSearchItem("A new army movement started");
      setSearchItems((prev) => [...prev, item]);
    }, 3000);

    return () => {
      clearTimeout(firstTimer);
    };
  }, []);

  useEffect(() => {
    searchService.setOnItemsChange(setSearchItems);
    searchService.startTimer(planets);
    return () => searchService.stopTimer();
  }, [planets]);

  const handleSearchItemUpdate = useCallback((item: SearchItem) => {
    searchService.updateSearchItem(item);
  }, []);

  const handleSearchItemDismiss = useCallback((id: number) => {
    searchService.dismissSearchItem(id);
  }, []);

  const handlePlanetClick = useCallback(
    (id: number) => {
      if (selectingDestination) return;
      setSelectedPlanet((prev) => {
        const newValue = prev === id ? null : id;
        if (newValue !== null) {
          setSelectedArmy(null);
        }
        return newValue;
      });
    },
    [selectingDestination]
  );

  const handleArmyClick = useCallback(
    (id: number) => {
      if (selectingDestination) return;
      setSelectedArmy((prev) => {
        const newValue = prev === id ? null : id;
        if (newValue !== null) {
          setSelectedPlanet(null);
        }
        return newValue;
      });
    },
    [selectingDestination]
  );

  const handleStagePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!selectingDestination) return;
      const cellSize = 100;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.round((e.clientX - rect.left) / cellSize) * cellSize;
      const y = Math.round((e.clientY - rect.top) / cellSize) * cellSize;
      setHoverPosition({ x, y });
    },
    [selectingDestination]
  );

  const handleStageClick = useCallback(() => {
    if (!selectingDestination || !hoverPosition) return;

    const sourcePlanet = planets.find((p) => p.id === selectedPlanet);
    const sourceArmy = armies.find((a) => a.id === selectedArmy);
    if (!sourcePlanet && !sourceArmy && pathPoints.length === 0) return;

    const startPoint =
      pathPoints.length === 0
        ? sourcePlanet
          ? { x: sourcePlanet.x, y: sourcePlanet.y }
          : { x: sourceArmy!.x, y: sourceArmy!.y }
        : pathPoints[pathPoints.length - 1];

    // Check if the new point creates a valid 8-directional path
    const dx = Math.abs(hoverPosition.x - startPoint.x);
    const dy = Math.abs(hoverPosition.y - startPoint.y);
    const isDiagonal = dx === dy;
    const isOrthogonal = dx === 0 || dy === 0;

    if (isDiagonal || isOrthogonal) {
      setPathPoints((prev) => [...prev, { ...hoverPosition }]);
      addLog(`Added path point at (${hoverPosition.x}, ${hoverPosition.y})`);
    }
  }, [
    selectingDestination,
    hoverPosition,
    selectedPlanet,
    selectedArmy,
    planets,
    armies,
    pathPoints,
    addLog,
  ]);

  const handleSetTarget = useCallback(() => {
    if (pathPoints.length === 0) return;

    addLog("Target set with " + pathPoints.length + " points");

    if (selectedArmy) {
      const army = armies.find((a) => a.id === selectedArmy);
      if (army && army.playerId === currentPlayerId) {
        setArmies((prev) =>
          prev.map((a) =>
            a.id === selectedArmy
              ? {
                  ...a,
                  movingTo: [...(pathPoints.length > 0 ? pathPoints : [])],
                }
              : a
          )
        );
        addLog(`Army ${selectedArmy} is moving to ${pathPoints[0].x},${pathPoints[0].y}`);
      } else {
        addLog(`Cannot move army that doesn't belong to you`);
      }
    } else if (selectedPlanet) {
      // Create a new army from the planet
      const planet = planets.find((p) => p.id === selectedPlanet);
      if (planet) {
        const newArmy : ArmyData = {
          id: armies.length + 1,
          x: planet.x,
          y: planet.y,
          energy: 100,
          movingTo: pathPoints,
          playerId: currentPlayerId,
        };
        setArmies((prev) => [...prev, newArmy]);
        addLog(`Created new army ${newArmy.id} from planet ${selectedPlanet}`);
      }
    }

    setSelectingDestination(false);
    setSelectedPlanet(null);
    setSelectedArmy(null);
    setPathPoints([]);
    setHoverPosition(null);
  }, [
    pathPoints,
    addLog,
    selectedArmy,
    armies,
    selectedPlanet,
    planets,
    setArmies,
    currentPlayerId,
  ]);

  const handleUndo = useCallback(() => {
    setPathPoints((prev) => {
      if (prev.length === 0) return prev;
      return prev.slice(0, -1);
    });
    addLog("Undid last path point");
  }, [addLog]);

  const handleSearchItemSelect = useCallback((id: number) => {
    setSelectedSearchId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div className="relative w-full h-full">
      <ConnectButton />
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        options={{
          backgroundColor: 0x000000,
          resolution: window.devicePixelRatio || 1,
          antialias: true,
          eventMode: "dynamic",
        }}
        onPointerMove={handleStagePointerMove}
        onClick={handleStageClick}
      >
        <Container eventMode="dynamic" interactiveChildren={true}>
          {/* Show search points for selected search item */}
          {selectedSearchId && (
            <Graphics
              draw={(g) => {
                g.clear();
                const item = searchItems.find((i) => i.id === selectedSearchId);
                if (!item) return;

                item.searchPoints.forEach((point) => {
                  g.beginFill(0x22c55e, 0.3);
                  g.drawCircle(point.x, point.y, 5);
                  g.endFill();
                });
              }}
            />
          )}

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
              sourcePlanet={planets.find((p) => p.id === selectedPlanet)!}
              pathPoints={pathPoints}
              hoverPosition={hoverPosition}
              onSetTarget={handleSetTarget}
              onUndo={handleUndo}
            />
          )}
          {selectingDestination && selectedArmy && (
            <PathEditor
              sourcePlanet={armies.find((a) => a.id === selectedArmy)!}
              pathPoints={pathPoints}
              hoverPosition={hoverPosition}
              onSetTarget={handleSetTarget}
              onUndo={handleUndo}
            />
          )}
          {armies.map((army) => (
            <React.Fragment key={army.id}>
              {army.movingTo ? (
                <MovingArmy
                  key={army.id}
                  id={army.id}
                  startX={army.x}
                  startY={army.y}
                  pathPoints={army.movingTo!}
                  speed={50}
                  energy={army.energy}
                  selected={selectedArmy === army.id}
                  onSelect={() => handleArmyClick(army.id)}
                  playerId={army.playerId}
                  currentPlayerId={currentPlayerId}
                  onReveal={() => addLog(`Reveal army ${army.id}`)}
                />
              ) : (
                <Army
                  key={army.id}
                  id={army.id}
                  x={army.x}
                  y={army.y}
                  energy={army.energy}
                  selected={selectedArmy === army.id}
                  onClick={() => handleArmyClick(army.id)}
                  onHover={() => {}}
                  playerId={army.playerId}
                  currentPlayerId={currentPlayerId}
                />
              )}
            </React.Fragment>
          ))}
          {planets.map((planet) => (
            <Planet
              key={planet.id}
              id={planet.id}
              x={planet.x}
              y={planet.y}
              radius={planet.radius}
              satellites={planet.satellites}
              selected={selectedPlanet === planet.id}
              onClick={handlePlanetClick}
              onHover={() => {}}
              playerId={planet.playerId}
              currentPlayerId={currentPlayerId}
            />
          ))}
          {selectedPlanet && !selectingDestination && (
            <PlanetDialog
              planet={planets.find((p) => p.id === selectedPlanet)!}
              onClose={() => setSelectedPlanet(null)}
              onSendArmy={() => setSelectingDestination(true)}
              currentPlayerId={currentPlayerId}
            />
          )}
          {selectedArmy &&
            !selectingDestination &&
            !armies.find((a) => a.id === selectedArmy)?.movingTo && (
              <ArmyDialog
                x={(armies.find((a) => a.id === selectedArmy)?.x ?? 0) + 120}
                y={armies.find((a) => a.id === selectedArmy)?.y ?? 0}
                energy={armies.find((a) => a.id === selectedArmy)?.energy ?? 0}
                onClose={() => setSelectedArmy(null)}
                onSend={() => setSelectingDestination(true)}
                playerId={armies.find((a) => a.id === selectedArmy)?.playerId ?? 0}
                currentPlayerId={currentPlayerId}
              />
            )}
          <SearchList
            items={searchItems}
            onItemUpdate={handleSearchItemUpdate}
            onItemDismiss={handleSearchItemDismiss}
            onItemSelect={handleSearchItemSelect}
            selectedSearchId={selectedSearchId || -1}
          />
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
