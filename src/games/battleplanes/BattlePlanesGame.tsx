import { useState } from 'react';
import { Link } from 'react-router-dom';
import GameSetup from './components/GameSetup';
import GameScreen from './components/GameScreen';
import type { GameConfig } from './types';

export default function BattlePlanesGame() {
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);

  const handleStartGame = (config: GameConfig) => {
    setGameConfig(config);
  };

  const handleExitGame = () => {
    setGameConfig(null);
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

      {gameConfig ? (
        <GameScreen config={gameConfig} onExit={handleExitGame} />
      ) : (
        <GameSetup onStartGame={handleStartGame} />
      )}
    </>
  );
}
