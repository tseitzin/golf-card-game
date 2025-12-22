import { useState, useEffect } from 'react';

export default function GameBoard({
	players,
	boardSize,
	currentPlayerIndex,
	lines,
	boxes,
	onLineClick,
	onUndo,
	lastMove,
	darkMode,
}) {
	const [hoveredLine, setHoveredLine] = useState(null);
	const [windowSize, setWindowSize] = useState({
		width: typeof window !== 'undefined' ? window.innerWidth : 1200,
		height: typeof window !== 'undefined' ? window.innerHeight : 800,
	});

	useEffect(() => {
		const handleResize = () => {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const theme = {
		light: {
			background: '#f8f6f1',
			cardBg: '#ffffff',
			text: '#222',
			secondaryText: '#666',
			dotColor: '#374151',
			lineColor: '#9ca3af',
			hoverColor: '#3B82F6',
		},
		dark: {
			background: '#1a202c',
			cardBg: '#2d3748',
			text: '#e5e5e5',
			secondaryText: '#a3a3a3',
			dotColor: '#e5e5e5',
			lineColor: '#6b7280',
			hoverColor: '#60A5FA',
		},
	};

	const currentTheme = darkMode ? theme.dark : theme.light;
	const currentPlayer = players[currentPlayerIndex];

	const availableWidth = windowSize.width * 0.9;
	const availableHeight = windowSize.height * 0.75;
	const padding = 40;
	const maxCellSize = Math.min(
		(availableWidth - padding * 2) / boardSize,
		(availableHeight - padding * 2) / boardSize
	);
	const cellSize = Math.max(12, Math.min(120, maxCellSize));
	const dotRadius = Math.max(2, Math.min(6, cellSize * 0.15));
	const lineWidth = Math.max(1.5, Math.min(4, cellSize * 0.1));

	const lineKey = (row, col, isHorizontal) => {
		return `${row},${col},${isHorizontal ? 'h' : 'v'}`;
	};

	const getLineOwner = (row, col, isHorizontal) => {
		return lines[lineKey(row, col, isHorizontal)];
	};

	const handleLineClick = (row, col, isHorizontal) => {
		if (getLineOwner(row, col, isHorizontal) === undefined && !currentPlayer.isComputer) {
			onLineClick(row, col, isHorizontal);
		}
	};

	const renderDot = (row, col) => {
		return (
			<circle
				key={`dot-${row}-${col}`}
				cx={col * cellSize}
				cy={row * cellSize}
				r={dotRadius}
				fill={currentTheme.dotColor}
			/>
		);
	};

	const renderLine = (row, col, isHorizontal) => {
		const key = lineKey(row, col, isHorizontal);
		const ownerIndex = getLineOwner(row, col, isHorizontal);
		const drawn = ownerIndex !== undefined;
		const isHovered = hoveredLine === key;

		const x1 = col * cellSize;
		const y1 = row * cellSize;
		const x2 = isHorizontal ? (col + 1) * cellSize : col * cellSize;
		const y2 = isHorizontal ? row * cellSize : (row + 1) * cellSize;

		const midX = (x1 + x2) / 2;
		const midY = (y1 + y2) / 2;
		const hitboxPadding = 12;

	const lineColor = drawn ? players[ownerIndex].color : (isHovered ? currentPlayer.color : 'transparent');

		return (
			<g key={key}>
				<line
					x1={x1}
					y1={y1}
					x2={x2}
					y2={y2}
					stroke={lineColor}
					strokeWidth={lineWidth}
					strokeLinecap="round"
				/>

				{!drawn && (
					<>
						<line
							x1={x1}
							y1={y1}
							x2={x2}
							y2={y2}
							stroke={currentTheme.lineColor}
							strokeWidth={1}
							strokeDasharray="4,4"
							opacity={0.3}
							pointerEvents="none"
						/>

						<rect
							x={midX - (isHorizontal ? cellSize / 2 : hitboxPadding / 2)}
							y={midY - (isHorizontal ? hitboxPadding / 2 : cellSize / 2)}
							width={isHorizontal ? cellSize : hitboxPadding}
							height={isHorizontal ? hitboxPadding : cellSize}
							fill="transparent"
							cursor={currentPlayer.isComputer ? 'default' : 'pointer'}
							onMouseEnter={() => !currentPlayer.isComputer && setHoveredLine(key)}
							onMouseLeave={() => setHoveredLine(null)}
							onClick={() => handleLineClick(row, col, isHorizontal)}
						/>
					</>
				)}
			</g>
		);
	};

	const renderBox = (row, col) => {
		const boxKey = `${row},${col}`;
		const owner = boxes[boxKey];

		if (owner === undefined) return null;

		const player = players[owner];
		const x = col * cellSize;
		const y = row * cellSize;

		return (
			<g key={boxKey}>
				<rect
					x={x + lineWidth}
					y={y + lineWidth}
					width={cellSize - lineWidth * 2}
					height={cellSize - lineWidth * 2}
					fill={player.color}
					opacity={0.3}
				/>
				<text
					x={x + cellSize / 2}
					y={y + cellSize / 2}
					textAnchor="middle"
					dominantBaseline="central"
					fill={player.color}
					fontSize={Math.max(10, cellSize * 0.5)}
					fontWeight="bold"
				>
					{player.name.charAt(0).toUpperCase()}
				</text>
			</g>
		);
	};

	const boardWidth = (boardSize - 1) * cellSize;
	const boardHeight = (boardSize - 1) * cellSize;

	const scores = players.map((player, idx) => ({
		...player,
		score: Object.values(boxes).filter(owner => owner === idx).length,
	}));

	const canUndo = lastMove && !currentPlayer.isComputer &&
		!players[lastMove.previousPlayerIndex]?.isComputer;

	return (
		<div
			style={{
				minHeight: '100vh',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '80px 20px 40px',
			}}
		>
			<div
				style={{
					marginBottom: 24,
					padding: '12px 24px',
					borderRadius: 12,
					backgroundColor: currentPlayer.color,
					color: '#fff',
					fontSize: 18,
					fontWeight: 'bold',
					boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
				}}
			>
				{currentPlayer.name}'s Turn {currentPlayer.isComputer && '(Computer)'}
			</div>

			<div
				style={{
					display: 'flex',
					gap: 16,
					marginBottom: 16,
					flexWrap: 'wrap',
					justifyContent: 'center',
				}}
			>
				{scores.map((player, idx) => (
					<div
						key={idx}
						style={{
							padding: '10px 20px',
							borderRadius: 8,
							backgroundColor: currentTheme.cardBg,
							border: `3px solid ${player.color}`,
							boxShadow: idx === currentPlayerIndex ? '0 0 0 2px rgba(0,0,0,0.1)' : 'none',
						}}
					>
						<div
							style={{
								fontSize: 14,
								fontWeight: '600',
								color: currentTheme.text,
								marginBottom: 4,
							}}
						>
							{player.name}
						</div>
						<div
							style={{
								fontSize: 24,
								fontWeight: 'bold',
								color: player.color,
								textAlign: 'center',
							}}
						>
							{player.score}
						</div>
					</div>
				))}
			</div>

			<button
				onClick={onUndo}
				disabled={!canUndo}
				style={{
					marginBottom: 24,
					padding: '10px 20px',
					borderRadius: 8,
					backgroundColor: canUndo ? (darkMode ? '#4b5563' : '#374151') : (darkMode ? '#2d3748' : '#e5e7eb'),
					color: canUndo ? '#fff' : (darkMode ? '#6b7280' : '#9ca3af'),
					border: 'none',
					fontSize: 14,
					fontWeight: '600',
					cursor: canUndo ? 'pointer' : 'not-allowed',
					boxShadow: canUndo ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
					transition: 'all 0.2s ease',
					opacity: canUndo ? 1 : 0.5,
				}}
			>
				↶ Undo Last Move
			</button>

			<div
				style={{
					backgroundColor: currentTheme.cardBg,
					borderRadius: 16,
					padding: padding,
					boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
				}}
			>
				<svg
					width={boardWidth + padding * 2}
					height={boardHeight + padding * 2}
					style={{
						display: 'block',
					}}
				>
					<g transform={`translate(${padding}, ${padding})`}>
						{Array.from({ length: boardSize - 1 }, (_, row) =>
							Array.from({ length: boardSize - 1 }, (_, col) => renderBox(row, col))
						)}

						{Array.from({ length: boardSize }, (_, row) =>
							Array.from({ length: boardSize - 1 }, (_, col) =>
								renderLine(row, col, true)
							)
						)}

						{Array.from({ length: boardSize - 1 }, (_, row) =>
							Array.from({ length: boardSize }, (_, col) =>
								renderLine(row, col, false)
							)
						)}

						{Array.from({ length: boardSize }, (_, row) =>
							Array.from({ length: boardSize }, (_, col) => renderDot(row, col))
						)}
					</g>
				</svg>
			</div>

			<div
				style={{
					marginTop: 24,
					fontSize: 14,
					color: currentTheme.secondaryText,
					textAlign: 'center',
					maxWidth: 400,
				}}
			>
				Click on the dashed lines to draw. Complete a box to score a point and take another turn!
			</div>
		</div>
	);
}
