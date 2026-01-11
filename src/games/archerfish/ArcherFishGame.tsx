import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { GameConfig, Fish } from './types';
import GameSetup from './components/GameSetup';
import GameScreen from './components/GameScreen';
import GameResults from './components/GameResults';

type GamePhase = 'setup' | 'playing' | 'results';

export default function ArcherFishGame() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [finalResults, setFinalResults] = useState<Fish[]>([]);

  const handleStartGame = (config: GameConfig) => {
    setGameConfig(config);
    setGamePhase('playing');
  };

  const handleGameEnd = (fish: Fish[]) => {
    setFinalResults(fish);
    setGamePhase('results');
  };

  const handlePlayAgain = () => {
    setGamePhase('setup');
    setGameConfig(null);
    setFinalResults([]);
  };

  return (
    <>
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

      {gamePhase === 'setup' && <GameSetup onStartGame={handleStartGame} />}
      {gamePhase === 'playing' && gameConfig && (
        <GameScreen config={gameConfig} onGameEnd={handleGameEnd} />
      )}
      {gamePhase === 'results' && gameConfig && (
        <GameResults
          fish={finalResults}
          config={gameConfig}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </>
  );
}
