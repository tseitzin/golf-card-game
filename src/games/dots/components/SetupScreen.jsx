import { useState } from 'react';

const PLAYER_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'];

export default function SetupScreen({ onStartGame, darkMode }) {
	const [playerCount, setPlayerCount] = useState(2);
	const [boardSize, setBoardSize] = useState('10');
	const [players, setPlayers] = useState([
		{ name: 'Player 1', isComputer: false, color: PLAYER_COLORS[0] },
		{ name: 'Player 2', isComputer: false, color: PLAYER_COLORS[1] },
	]);
	const [error, setError] = useState('');

	const theme = {
		light: {
			background: '#f8f6f1',
			cardBg: '#ffffff',
			text: '#222',
			secondaryText: '#666',
			border: '#e5e5e5',
			inputBg: '#ffffff',
			inputBorder: '#d1d5db',
		},
		dark: {
			background: '#1a202c',
			cardBg: '#2d3748',
			text: '#e5e5e5',
			secondaryText: '#a3a3a3',
			border: '#4a5568',
			inputBg: '#374151',
			inputBorder: '#4b5563',
		},
	};

	const currentTheme = darkMode ? theme.dark : theme.light;

	const handlePlayerCountChange = (count) => {
		setPlayerCount(count);
		const newPlayers = [];

		for (let i = 0; i < count; i++) {
			if (i < players.length) {
				newPlayers.push(players[i]);
			} else {
				newPlayers.push({
					name: `Player ${i + 1}`,
					isComputer: false,
					color: PLAYER_COLORS[i % PLAYER_COLORS.length],
				});
			}
		}

		setPlayers(newPlayers);
		setError('');
	};

	const handlePlayerChange = (index, field, value) => {
		const newPlayers = [...players];
		newPlayers[index] = { ...newPlayers[index], [field]: value };

		if (field === 'isComputer' && value) {
			newPlayers[index].name = `CPU ${index + 1}`;
		} else if (field === 'isComputer' && !value) {
			newPlayers[index].name = `Player ${index + 1}`;
		}

		setPlayers(newPlayers);
		setError('');
	};

	const handleBoardSizeChange = (value) => {
		setBoardSize(value);
		setError('');
	};

	const handleStartGame = () => {
		const humanPlayers = players.filter(p => !p.isComputer).length;

		if (humanPlayers === 0) {
			setError('At least one human player is required');
			return;
		}

		const emptyNames = players.some(p => !p.name || p.name.trim() === '');
		if (emptyNames) {
			setError('All players must have a name');
			return;
		}

		const size = parseInt(boardSize, 10);
		if (isNaN(size) || size < 3 || size > 30) {
			setError('Grid size must be between 3 and 30');
			return;
		}

		onStartGame({
			players,
			boardSize: size + 1,
		});
	};

	return (
		<div
			style={{
				minHeight: '100vh',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '40px 20px',
			}}
		>
			<h1
				style={{
					fontSize: 48,
					fontWeight: 'bold',
					color: currentTheme.text,
					marginBottom: 12,
					textAlign: 'center',
				}}
			>
				Dots and Boxes
			</h1>

			<p
				style={{
					fontSize: 16,
					color: currentTheme.secondaryText,
					marginBottom: 32,
					textAlign: 'center',
					maxWidth: 500,
				}}
			>
				Complete boxes by drawing lines. Get a point for each box and take another turn!
			</p>

			<div
				style={{
					backgroundColor: currentTheme.cardBg,
					borderRadius: 16,
					padding: 32,
					maxWidth: 500,
					width: '100%',
					border: `2px solid ${currentTheme.border}`,
					boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
				}}
			>
				<div style={{ marginBottom: 24 }}>
					<label
						style={{
							display: 'block',
							fontSize: 14,
							fontWeight: '600',
							color: currentTheme.text,
							marginBottom: 8,
						}}
					>
						Number of Players
					</label>
					<div style={{ display: 'flex', gap: 8 }}>
						{[2, 3, 4].map(count => (
							<button
								key={count}
								onClick={() => handlePlayerCountChange(count)}
								style={{
									flex: 1,
									padding: '10px',
									borderRadius: 8,
									border: `2px solid ${playerCount === count ? '#3B82F6' : currentTheme.border}`,
									backgroundColor: playerCount === count ? '#3B82F6' : currentTheme.inputBg,
									color: playerCount === count ? '#fff' : currentTheme.text,
									fontSize: 16,
									fontWeight: '600',
									cursor: 'pointer',
									transition: 'all 0.2s ease',
								}}
							>
								{count}
							</button>
						))}
					</div>
				</div>

				<div style={{ marginBottom: 24 }}>
					<label
						style={{
							display: 'block',
							fontSize: 14,
							fontWeight: '600',
							color: currentTheme.text,
							marginBottom: 8,
						}}
					>
						Grid Size (number of boxes per side)
					</label>
					<input
						type="number"
						min="3"
						max="30"
						value={boardSize}
						onChange={(e) => handleBoardSizeChange(e.target.value)}
						placeholder="Enter grid size"
						style={{
							width: '100%',
							padding: '12px 16px',
							borderRadius: 8,
							border: `2px solid ${currentTheme.inputBorder}`,
							backgroundColor: currentTheme.inputBg,
							color: currentTheme.text,
							fontSize: 16,
							fontWeight: '600',
							textAlign: 'center',
						}}
					/>
					<p
						style={{
							fontSize: 12,
							color: currentTheme.secondaryText,
							marginTop: 6,
							textAlign: 'center',
						}}
					>
						Enter 20 to create a 20x20 grid of boxes (Recommended: 10-15)
					</p>
				</div>

				<div style={{ marginBottom: 24 }}>
					<h3
						style={{
							fontSize: 16,
							fontWeight: '600',
							color: currentTheme.text,
							marginBottom: 12,
						}}
					>
						Player Configuration
					</h3>

					{players.map((player, index) => (
						<div
							key={index}
							style={{
								marginBottom: 16,
								padding: 16,
								borderRadius: 8,
								backgroundColor: darkMode ? '#374151' : '#f3f4f6',
								border: `2px solid ${player.color}`,
							}}
						>
							<div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
								<div
									style={{
										width: 24,
										height: 24,
										borderRadius: '50%',
										backgroundColor: player.color,
									}}
								/>
								<span
									style={{
										fontSize: 14,
										fontWeight: '600',
										color: currentTheme.text,
									}}
								>
									Player {index + 1}
								</span>
							</div>

							<div style={{ marginBottom: 12 }}>
								<label
									style={{
										display: 'block',
										fontSize: 12,
										fontWeight: '600',
										color: currentTheme.secondaryText,
										marginBottom: 6,
									}}
								>
									Player Type
								</label>
								<div style={{ display: 'flex', gap: 8 }}>
									<button
										onClick={() => handlePlayerChange(index, 'isComputer', false)}
										style={{
											flex: 1,
											padding: '8px',
											borderRadius: 6,
											border: `2px solid ${!player.isComputer ? player.color : currentTheme.border}`,
											backgroundColor: !player.isComputer ? player.color : currentTheme.inputBg,
											color: !player.isComputer ? '#fff' : currentTheme.text,
											fontSize: 13,
											fontWeight: '600',
											cursor: 'pointer',
											transition: 'all 0.2s ease',
										}}
									>
										Human
									</button>
									<button
										onClick={() => handlePlayerChange(index, 'isComputer', true)}
										style={{
											flex: 1,
											padding: '8px',
											borderRadius: 6,
											border: `2px solid ${player.isComputer ? player.color : currentTheme.border}`,
											backgroundColor: player.isComputer ? player.color : currentTheme.inputBg,
											color: player.isComputer ? '#fff' : currentTheme.text,
											fontSize: 13,
											fontWeight: '600',
											cursor: 'pointer',
											transition: 'all 0.2s ease',
										}}
									>
										Computer
									</button>
								</div>
							</div>

							<div>
								<label
									style={{
										display: 'block',
										fontSize: 12,
										fontWeight: '600',
										color: currentTheme.secondaryText,
										marginBottom: 6,
									}}
								>
									Player Name
								</label>
								<input
									type="text"
									value={player.name}
									onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
									style={{
										width: '100%',
										padding: '8px 12px',
										borderRadius: 6,
										border: `2px solid ${currentTheme.inputBorder}`,
										backgroundColor: currentTheme.inputBg,
										color: currentTheme.text,
										fontSize: 14,
										fontWeight: '500',
									}}
								/>
							</div>
						</div>
					))}
				</div>

				{error && (
					<div
						style={{
							padding: '12px',
							borderRadius: 8,
							backgroundColor: '#FEE2E2',
							border: '2px solid #EF4444',
							color: '#991B1B',
							fontSize: 14,
							fontWeight: '600',
							marginBottom: 16,
							textAlign: 'center',
						}}
					>
						{error}
					</div>
				)}

				<button
					onClick={handleStartGame}
					style={{
						width: '100%',
						padding: '14px',
						borderRadius: 8,
						border: 'none',
						backgroundColor: '#3B82F6',
						color: '#fff',
						fontSize: 16,
						fontWeight: '700',
						cursor: 'pointer',
						boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
						transition: 'all 0.2s ease',
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.transform = 'translateY(-2px)';
						e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.transform = 'translateY(0)';
						e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
					}}
				>
					Start Game
				</button>
			</div>
		</div>
	);
}
