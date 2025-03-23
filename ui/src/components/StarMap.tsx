import { Stage, Container, Graphics } from "@pixi/react";
import React, { useCallback, useState, useEffect, useRef } from "react";
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
import { useWallet } from "../hooks/useWallet.ts";
import { GameAbi__factory } from "../contracts/index.ts";
import { getRevealProof, MAP_WIDTH } from "../services/gameProof.ts";
import { getCommitment } from "../services/positionCommitment.ts";
import { StatusOverlay } from "./StatusOverlay";

const SALT = 1n;

export const StarMap = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<number | null>(null);
  const [selectedArmy, setSelectedArmy] = useState<number | null>(null);
  const [selectedSearchId, setSelectedSearchId] = useState<number | null>(null);
  const [selectingDestination, setSelectingDestination] = useState(false);
  const [pathPoints, setPathPoints] = useState<PathPoint[]>([]);
  const [hoverPosition, setHoverPosition] = useState<PathPoint | null>(null);
  const [searchItems, setSearchItems] = useState<SearchItem[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<number>(1);
  const [logs, setLogs] = useState<string[]>([]);
  const [showDebug] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const { signer, address, isConnecting } = useWallet();
  const contract = "0x4F6087C73f8dC8D1F7fbca7e5C7fBE8953A6589E";
  const game = GameAbi__factory.connect(contract, signer!);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lastRetrieveInfoFromContract, setLastRetrieveInfoFromContract] = useState<number>(0);
  const tryFetchingId = useRef(0);

  const [planets, setPlanets] = useState<PlanetData[]>([
    { id: 1, x: 200, y: 200, radius: 30, playerId: 0, energy: 400 },
    { id: 2, x: 400, y: 300, radius: 40, playerId: 0, energy: 400 },
    { id: 3, x: 600, y: 200, radius: 35, playerId: 0, energy: 400 },
    { id: 4, x: 800, y: 400, radius: 45, playerId: 0, energy: 400 },
    { id: 5, x: 300, y: 500, radius: 25, playerId: 0, energy: 400 },
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
    // { id: 1, x: 300, y: 300, energy: 100, playerId: 1 },
    // { id: 2, x: 500, y: 400, energy: 80, playerId: 2 },
    // { id: 3, x: 700, y: 300, energy: 120, playerId: 0 },
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

  const getPlayerId = (address: string | null) => {
    if (address == "0xDfbEE02da49CB97E75A8AaD35620FE602F38fb19")
      return 1;
    else if (address == "0x9CdD77E2D4C455b6a25dF1C91E0c1647B4D719f3")
      return 2;
    else return 0;
  };

  useEffect(() => {
    setCurrentPlayerId(getPlayerId(address));
  }, [address]);

  // useEffect(() => {
  //   // Show first notification after 3 seconds
  //   const firstTimer = setTimeout(() => {
  //     const item = searchService.createSearchItem("A new army movement started");
  //     setSearchItems((prev) => [...prev, item]);
  //   }, 3000);

  //   return () => {
  //     clearTimeout(firstTimer);
  //   };
  // }, []);

  useEffect(() => {
    searchService.setOnItemsChange(setSearchItems);
    // searchService.startTimer(planets);
    return () => searchService.stopTimer();
  }, [planets]);

  useEffect(() => {
    if (!address || !game || !currentPlayerId || isConnecting) return;
    if (tryFetchingId.current > 0) return;
    const threadId = Math.floor(Math.random() * 100000);
    if (Date.now() - lastRetrieveInfoFromContract < 60000) return;

    if (tryFetchingId.current === 0) tryFetchingId.current = threadId;
    if (tryFetchingId.current !== threadId) return;
    
    const fetchStatus = async () => {
      setStatusMessage("Reading status from contract...");
      try {
        // update planets
        const maxPlanetId = await game.maxPlanetId();
        const updatedPlanets = [...planets];
        let hasChanges = false;
        
        for (let i = 1; i <= maxPlanetId && i < updatedPlanets.length; i++) {
          const planetOwner = await game.planetOwner(i);
          if (planetOwner === address) {
            if (updatedPlanets[i-1].playerId !== currentPlayerId) {
              updatedPlanets[i-1] = {
                ...updatedPlanets[i-1],
                playerId: currentPlayerId
              };
              hasChanges = true;
            }
          } else {
            const playerId = getPlayerId(planetOwner);
            if (updatedPlanets[i-1].playerId !== playerId) {
              updatedPlanets[i-1] = {
                ...updatedPlanets[i-1],
                playerId
              };
              hasChanges = true;
            }
          }
        }
        
        if (hasChanges) {
          setPlanets(updatedPlanets);
        }

        // update army
        const maxArmyId = await game.maxArmyId();
        const storedArmies = JSON.parse(localStorage.getItem("armies") || "[]") as ArmyData[];
        const updatedArmies: ArmyData[] = []; // from empty
        
        for (let i = 1; i <= maxArmyId; i++) {
          const armyOwner = await game.armyOwner(i);
          const armyEnergy = await game.armyEnergy(i);
          const armyStartBlockNumber = await game.armyStartBlockNumber(i);
          const armyCommitment = await game.armyCommitment(i);
          const storedArmy = storedArmies.find((a) => a.id === i);

          if (armyOwner === address) {
            if (!storedArmy) {
              console.warn("unknown my own army", i);
            } else if (BigInt(storedArmy.commitment ?? 0) !== armyCommitment) {
              console.warn(
                "my own army commitment changed",
                storedArmy.commitment,
                "!==",
                armyCommitment
              );
            } else {
              updatedArmies.push({
                id: i,
                energy: Number(armyEnergy),
                startBlockNumber: Number(armyStartBlockNumber),
                commitment: armyCommitment,
                x: storedArmy.x,
                y: storedArmy.y,
                movingTo: storedArmy.movingTo,
                playerId: currentPlayerId,
              });
            }
          } else {
            const existingItem = searchItems.find((x) => x.armyId === i);
            if (!existingItem) {
              const item = searchService.createSearchItem(
                "A new army movement started",
                i
              );
              setSearchItems((prev) => [...prev, item]);
            }
          }
        }
        
        if (updatedArmies.length > 0) {
          setArmies(updatedArmies);
        }

        setLastRetrieveInfoFromContract(Date.now());
      } catch (error) {
        console.warn("Error reading status from contract:", error);
        setLastRetrieveInfoFromContract(0);
      }

      setStatusMessage(null);
      tryFetchingId.current = 0;
    };
    fetchStatus();
  }, [game, address, currentPlayerId, planets, armies, lastRetrieveInfoFromContract, isConnecting, searchItems]);

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

  const handleReveal = useCallback(
    async (id: number) => {
      const army = armies.find((a) => a.id === id);
      if (!army) return;
      const points = [{x:army.x, y:army.y}, ...(army.movingTo??[])]
        .map(p => ({ x: p.x/100, y: p.y/100 }))
        .map((a) => BigInt(a.x + a.y * MAP_WIDTH));
      setStatusMessage("Generating proof...");

      try {
        const proof = await getRevealProof(
          points,
          army.commitment!,
          100n,
          BigInt(address!),
          SALT,
          1n,
        );
        console.log(proof);
        addLog(`Generated proof for army ${id}`);
      } catch (error) {
        console.error("Error generating proof:", error);
        addLog(`Failed to generate proof for army ${id}`);
      }
      setStatusMessage(null);
    },
    [address, armies, addLog]
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

  const handleSetTarget = useCallback(async () => {
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
        const points = [{x:planet.x, y:planet.y}, ...pathPoints].map(p => ({ x: p.x/100, y: p.y/100 }));
        const commitment = getCommitment(
          points,
          SALT,
          BigInt(address!)
        );
        console.log("Commitment", commitment);
        
        setStatusMessage("Submitting commitment to blockchain...");
        try {
          const maxArmyId = await game.maxArmyId();
          await game.commit(planet.id, commitment, 100);
          const newArmy : ArmyData = {
            id: Number(maxArmyId + 1n),
            x: planet.x,
            y: planet.y,
            energy: 100,
            commitment,
            movingTo: pathPoints,
            playerId: currentPlayerId,
          };

          // Update local storage, newest army first
          const storedArmies = JSON.parse(localStorage.getItem("armies") || "[]") as ArmyData[];
          const uniqueArmies = Array
            .from(new Set([...storedArmies, newArmy].map(a => a.id)))
            .map(id => newArmy.id === id ? newArmy : storedArmies.find(a => a.id === id));
          console.log("uniqueArmies", uniqueArmies);
          localStorage.setItem("armies", JSON.stringify(uniqueArmies));

          planet.energy -= newArmy.energy;

          setArmies((prev) => [...prev, newArmy]);
          addLog(`Created new army ${newArmy.id} from planet ${selectedPlanet}`);
        } catch (error) {
          console.error("Error committing:", error);
          addLog(`Failed to create army: ${error}`);
        } finally {
          setStatusMessage(null);
        }
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
    game,
    address,
  ]);

  const handleUndo = useCallback(() => {
    setPathPoints((prev) => {
      if (prev.length === 0) return prev;
      return prev.slice(0, -1);
    });
    addLog("Undid last path point");
  }, [addLog]);

  const handleOccupy = useCallback(async (planetId: number) => {
    const planet = planets.find((p) => p.id === planetId);
    if (!planet) return;

    console.log("Occupying planet", planetId)
    setStatusMessage("Initializing player...");
    try {
      await game.initPlayer();
      planet.energy = 400;
      planet.playerId = currentPlayerId;
      addLog(`Occupied planet ${planetId}`);
    } catch (error) {
      console.error("Error occupying planet:", error);
      addLog(`Failed to occupy planet: ${error}`);
    } finally {
      setStatusMessage(null);
    }
  }, [game, planets, currentPlayerId, addLog]);

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
                  onReveal={() => handleReveal(army.id)}
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
              onOccupy={() => handleOccupy(selectedPlanet!)}
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
      {statusMessage && <StatusOverlay message={statusMessage} />}
    </div>
  );
};
