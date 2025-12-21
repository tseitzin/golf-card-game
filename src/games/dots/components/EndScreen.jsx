export default function EndScreen({ players, winner, onPlayAgain, onNewGame, darkMode }) {
	const theme = {
		light: {
			overlay: 'rgba(0, 0, 0, 0.7)',
			cardBg: '#ffffff',
			text: '#222',
			secondaryText: '#666',
		},
		dark: {
			overlay: 'rgba(0, 0, 0, 0.85)',
			cardBg: '#2d3748',
			text: '#e5e5e5',
			secondaryText: '#a3a3a3',
		},
	};

	const currentTheme = darkMode ? theme.dark : theme.light;

	const scores = players.map((player) => player);
	scores.sort((a, b) => {
		const getScore = (p) => {
			const idx = players.indexOf(p);
			return players[idx].score || 0;
		};
		return getScore(b) - getScore(a);
	});

	const maxScore = Math.max(...players.map((_, idx) => players[idx].score || 0));
	const winners = players.filter((_, idx) => (players[idx].score || 0) === maxScore);
	const isTie = winners.length > 1;

	return (
		<div
			style={{
				position: 'fixed',
				inset: 0,
				backgroundColor: currentTheme.overlay,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				zIndex: 1000,
				padding: '20px',
			}}
		>
			<div
				style={{
					backgroundColor: currentTheme.cardBg,
					borderRadius: 24,
					padding: '40px',
					maxWidth: 500,
					width: '100%',
					boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
					textAlign: 'center',
				}}
			>
				<h2
					style={{
						fontSize: 48,
						fontWeight: 'bold',
						color: currentTheme.text,
						marginBottom: 16,
					}}
				>
					Game Over!
				</h2>

				{isTie ? (
					<div
						style={{
							fontSize: 24,
							fontWeight: 'bold',
							color: '#F59E0B',
							marginBottom: 32,
						}}
					>
						It's a Tie!
					</div>
				) : winner ? (
					<div
						style={{
							fontSize: 24,
							fontWeight: 'bold',
							color: winner.color,
							marginBottom: 32,
						}}
					>
						{winner.name} Wins!
					</div>
				) : null}

				<div style={{ marginBottom: 32 }}>
					<h3
						style={{
							fontSize: 18,
							fontWeight: '600',
							color: currentTheme.text,
							marginBottom: 16,
						}}
					>
						Final Scores
					</h3>

					<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
						{players.map((player, idx) => (
							<div
								key={idx}
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									padding: '12px 20px',
									borderRadius: 12,
									backgroundColor: darkMode ? '#374151' : '#f3f4f6',
									border: `3px solid ${player.color}`,
								}}
							>
								<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
											fontSize: 16,
											fontWeight: '600',
											color: currentTheme.text,
										}}
									>
										{player.name}
									</span>
								</div>
								<span
									style={{
										fontSize: 24,
										fontWeight: 'bold',
										color: player.color,
									}}
								>
									{player.score || 0}
								</span>
							</div>
						))}
					</div>
				</div>

				<div style={{ display: 'flex', gap: 12 }}>
					<button
						onClick={onPlayAgain}
						style={{
							flex: 1,
							padding: '14px',
							borderRadius: 12,
							border: 'none',
							backgroundColor: '#10B981',
							color: '#fff',
							fontSize: 16,
							fontWeight: '700',
							cursor: 'pointer',
							boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
							transition: 'all 0.2s ease',
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.transform = 'translateY(-2px)';
							e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.transform = 'translateY(0)';
							e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
						}}
					>
						Play Again
					</button>

					<button
						onClick={onNewGame}
						style={{
							flex: 1,
							padding: '14px',
							borderRadius: 12,
							border: `2px solid ${currentTheme.text}`,
							backgroundColor: 'transparent',
							color: currentTheme.text,
							fontSize: 16,
							fontWeight: '700',
							cursor: 'pointer',
							transition: 'all 0.2s ease',
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor = darkMode ? '#374151' : '#f3f4f6';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = 'transparent';
						}}
					>
						New Game
					</button>
				</div>
			</div>
		</div>
	);
}
