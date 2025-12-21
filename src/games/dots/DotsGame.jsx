import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SetupScreen from './components/SetupScreen';
import GameBoard from './components/GameBoard';
import EndScreen from './components/EndScreen';
import { useGameState } from './hooks/useGameState';

export default function DotsGame() {
	const [gameState, setGameState] = useState('setup');
	const [darkMode, setDarkMode] = useState(() => {
		try {
			const saved = localStorage.getItem('dots:darkMode');
			return saved ? JSON.parse(saved) : false;
		} catch {
			return false;
		}
	});

	useEffect(() => {
		try {
			localStorage.setItem('dots:darkMode', JSON.stringify(darkMode));
		} catch {
			// Ignore
		}
	}, [darkMode]);

	const {
		players,
		boardSize,
		currentPlayerIndex,
		lines,
		boxes,
		gameOver,
		winner,
		lastMove,
		initializeGame,
		makeMove,
		resetGame,
		undoLastMove,
	} = useGameState();

	const theme = {
		light: {
			background: '#f8f6f1',
			text: '#222',
			secondaryText: '#666',
		},
		dark: {
			background: '#1a202c',
			text: '#e5e5e5',
			secondaryText: '#a3a3a3',
		},
	};

	const currentTheme = darkMode ? theme.dark : theme.light;

	useEffect(() => {
		document.body.style.backgroundColor = currentTheme.background;
		document.documentElement.style.backgroundColor = currentTheme.background;
	}, [currentTheme.background]);

	const handleStartGame = (config) => {
		initializeGame(config);
		setGameState('playing');
	};

	const handlePlayAgain = () => {
		setGameState('playing');
		resetGame();
	};

	const handleNewGame = () => {
		setGameState('setup');
		resetGame();
	};

	if (gameState === 'setup') {
		return (
			<div style={{ backgroundColor: currentTheme.background, minHeight: '100vh' }}>
				<Link
					to="/"
					style={{
						position: 'fixed',
						top: 16,
						left: 16,
						background: darkMode ? '#374151' : '#fff',
						color: darkMode ? '#e5e5e5' : '#1a202c',
						border: darkMode ? '2px solid #4b5563' : '2px solid #1a202c',
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
					 Home
				</Link>

				<button
					onClick={() => setDarkMode(!darkMode)}
					style={{
						position: 'fixed',
						top: 16,
						right: 16,
						background: darkMode ? '#374151' : '#fff',
						color: darkMode ? '#fbbf24' : '#1a202c',
						border: darkMode ? '2px solid #4b5563' : '2px solid #1a202c',
						borderRadius: 8,
						padding: '8px 16px',
						fontSize: 14,
						fontWeight: '600',
						cursor: 'pointer',
						boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
						zIndex: 1000,
						transition: 'all 0.3s ease',
					}}
				>
					{darkMode ? ' Light' : ' Dark'}
				</button>

				<SetupScreen onStartGame={handleStartGame} darkMode={darkMode} />
			</div>
		);
	}

	return (
		<div style={{ backgroundColor: currentTheme.background, minHeight: '100vh' }}>
			<Link
				to="/"
				style={{
					position: 'fixed',
					top: 16,
					left: 16,
					background: darkMode ? '#374151' : '#fff',
					color: darkMode ? '#e5e5e5' : '#1a202c',
					border: darkMode ? '2px solid #4b5563' : '2px solid #1a202c',
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
				 Home
			</Link>

			<button
				onClick={() => setDarkMode(!darkMode)}
				style={{
					position: 'fixed',
					top: 16,
					right: 16,
					background: darkMode ? '#374151' : '#fff',
					color: darkMode ? '#fbbf24' : '#1a202c',
					border: darkMode ? '2px solid #4b5563' : '2px solid #1a202c',
					borderRadius: 8,
					padding: '8px 16px',
					fontSize: 14,
					fontWeight: '600',
					cursor: 'pointer',
					boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
					zIndex: 1000,
					transition: 'all 0.3s ease',
				}}
			>
				{darkMode ? ' Light' : ' Dark'}
			</button>

			<GameBoard
				players={players}
				boardSize={boardSize}
				currentPlayerIndex={currentPlayerIndex}
				lines={lines}
				boxes={boxes}
				onLineClick={makeMove}
				onUndo={undoLastMove}
				lastMove={lastMove}
				darkMode={darkMode}
			/>

			{gameOver && (
				<EndScreen
					players={players}
					winner={winner}
					onPlayAgain={handlePlayAgain}
					onNewGame={handleNewGame}
					darkMode={darkMode}
				/>
			)}
		</div>
	);
}
