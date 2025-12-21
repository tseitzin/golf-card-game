import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, RaceConfig, Car, PlayerInputs, CarConfig } from '../types/race';
import { CAR_COLORS, KEYBOARD_CONTROLS } from '../constants/race';
import { createCar } from '../game/race/GameEngine';
import { SetupScreen } from '../components/race/SetupScreen';
import { generateAICars } from '../utils/race/aiCars';
import { RaceCanvas } from '../components/race/RaceCanvas';
import { RaceHUD } from '../components/race/RaceHUD';
import { TouchControls } from '../components/race/TouchControls';
import { Countdown } from '../components/race/Countdown';
import { EndScreen } from '../components/race/EndScreen';

const getInitialConfig = (): RaceConfig => ({
  humanPlayers: 1,
  aiRacers: 3,
  laps: 3,
  playerConfigs: [
    { color: CAR_COLORS[0].value, number: 1, style: 0 },
  ],
});

export default function RaceGame() {
  const [gameState, setGameState] = useState<GameState>('setup');
  const [raceConfig, setRaceConfig] = useState<RaceConfig>(getInitialConfig);
  const [cars, setCars] = useState<Car[]>([]);
  const [touchInputs, setTouchInputs] = useState<PlayerInputs>({});
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const keyboardInputsRef = useRef<PlayerInputs>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      pressedKeysRef.current.add(e.code);
      updateKeyboardInputs();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeysRef.current.delete(e.code);
      updateKeyboardInputs();
    };

    const updateKeyboardInputs = () => {
      const inputs: PlayerInputs = {};
      for (let i = 0; i < raceConfig.humanPlayers; i++) {
        const controls = KEYBOARD_CONTROLS[i];
        if (controls) {
          inputs[i] = {
            accelerate: pressedKeysRef.current.has(controls.accelerate),
            brake: pressedKeysRef.current.has(controls.brake),
          };
        }
      }
      keyboardInputsRef.current = inputs;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [raceConfig.humanPlayers]);

  const getCombinedInputs = useCallback((): PlayerInputs => {
    const combined: PlayerInputs = {};
    for (let i = 0; i < raceConfig.humanPlayers; i++) {
      const keyboard = keyboardInputsRef.current[i] || { accelerate: false, brake: false };
      const touch = touchInputs[i] || { accelerate: false, brake: false };
      combined[i] = {
        accelerate: keyboard.accelerate || touch.accelerate,
        brake: keyboard.brake || touch.brake,
      };
    }
    return combined;
  }, [raceConfig.humanPlayers, touchInputs]);

  const initializeRace = useCallback(() => {
    const usedColors = raceConfig.playerConfigs.map(p => p.color);
    const usedNumbers = raceConfig.playerConfigs.map(p => p.number);
    const aiCarsConfig = generateAICars(raceConfig.aiRacers, usedColors, usedNumbers);

    const allCars: Car[] = [];
    let lane = 0;

    raceConfig.playerConfigs.forEach((config, index) => {
      const carConfig: CarConfig = {
        id: `player-${index}`,
        color: config.color,
        number: config.number,
        isAI: false,
        playerIndex: index,
      };
      allCars.push(createCar(carConfig, lane++, false));
    });

    aiCarsConfig.forEach((config, index) => {
      const carConfig: CarConfig = {
        id: `ai-${index}`,
        color: config.color,
        number: config.number,
        isAI: true,
      };
      allCars.push(createCar(carConfig, lane++, true));
    });

    setCars(allCars);
  }, [raceConfig]);

  const handleStartRace = useCallback(() => {
    initializeRace();
    setGameState('countdown');
  }, [initializeRace]);

  const handleCountdownComplete = useCallback(() => {
    setGameState('racing');
  }, []);

  const handleRaceFinished = useCallback(() => {
    setGameState('finished');
  }, []);

  const handleRaceAgain = useCallback(() => {
    setCars([]);
    setTouchInputs({});
    setGameState('setup');
  }, []);

  const handleCarsUpdate = useCallback((updatedCars: Car[]) => {
    setCars(updatedCars);
  }, []);

  const playerColors = raceConfig.playerConfigs.map(p => p.color);

  if (gameState === 'setup') {
    return (
      <div>
        {/* Home button */}
        <Link
          to="/"
          style={{
            position: 'fixed',
            top: 16,
            left: 16,
            background: '#fff',
            color: '#1a202c',
            border: '2px solid #1a202c',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 14,
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            zIndex: 1000,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.3s ease',
          }}
        >
          ← Home
        </Link>
        <SetupScreen
          config={raceConfig}
          onConfigChange={setRaceConfig}
          onStartRace={handleStartRace}
        />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-gray-900 overflow-hidden relative">
      {/* Home button */}
      <Link
        to="/"
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          background: '#fff',
          color: '#1a202c',
          border: '2px solid #1a202c',
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: 14,
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 1000,
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          transition: 'all 0.3s ease',
        }}
      >
        ← Home
      </Link>

      <RaceCanvas
        cars={cars}
        isRacing={gameState === 'racing'}
        targetLaps={raceConfig.laps}
        playerInputs={getCombinedInputs()}
        onCarsUpdate={handleCarsUpdate}
        onRaceFinished={handleRaceFinished}
      />

      <RaceHUD cars={cars} targetLaps={raceConfig.laps} />

      {gameState !== 'finished' && (
        <TouchControls
          playerCount={raceConfig.humanPlayers}
          playerColors={playerColors}
          currentInputs={touchInputs}
          onInputChange={setTouchInputs}
        />
      )}

      {gameState === 'countdown' && (
        <Countdown onComplete={handleCountdownComplete} />
      )}

      {gameState === 'finished' && (
        <EndScreen cars={cars} onRaceAgain={handleRaceAgain} />
      )}
    </div>
  );
}
