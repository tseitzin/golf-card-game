import { useState, useCallback, useEffect, useRef } from 'react';
import { findBestMove } from '../utils/aiLogic';

export function useGameState() {
	const [players, setPlayers] = useState([]);
	const [boardSize, setBoardSize] = useState(4);
	const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
	const [lines, setLines] = useState(new Set());
	const [boxes, setBoxes] = useState({});
	const [gameOver, setGameOver] = useState(false);
	const [winner, setWinner] = useState(null);
	const aiTimeoutRef = useRef(null);

	const initializeGame = useCallback((config) => {
		setPlayers(config.players);
		setBoardSize(config.boardSize);
		setCurrentPlayerIndex(0);
		setLines(new Set());
		setBoxes({});
		setGameOver(false);
		setWinner(null);
	}, []);

	const resetGame = useCallback(() => {
		setCurrentPlayerIndex(0);
		setLines(new Set());
		setBoxes({});
		setGameOver(false);
		setWinner(null);
	}, []);

	const lineKey = useCallback((row, col, isHorizontal) => {
		return `${row},${col},${isHorizontal ? 'h' : 'v'}`;
	}, []);

	const checkBoxCompletion = useCallback((newLines, row, col) => {
		const topLine = lineKey(row, col, true);
		const bottomLine = lineKey(row + 1, col, true);
		const leftLine = lineKey(row, col, false);
		const rightLine = lineKey(row, col + 1, false);

		return (
			newLines.has(topLine) &&
			newLines.has(bottomLine) &&
			newLines.has(leftLine) &&
			newLines.has(rightLine)
		);
	}, [lineKey]);

	const makeMove = useCallback((row, col, isHorizontal) => {
		if (gameOver) return false;

		const key = lineKey(row, col, isHorizontal);

		if (lines.has(key)) {
			return false;
		}

		const newLines = new Set(lines);
		newLines.add(key);
		setLines(newLines);

		let completedBoxes = 0;
		const newBoxes = { ...boxes };

		for (let r = 0; r < boardSize - 1; r++) {
			for (let c = 0; c < boardSize - 1; c++) {
				const boxKey = `${r},${c}`;
				if (!newBoxes[boxKey] && checkBoxCompletion(newLines, r, c)) {
					newBoxes[boxKey] = currentPlayerIndex;
					completedBoxes++;
				}
			}
		}

		setBoxes(newBoxes);

		const totalBoxes = (boardSize - 1) * (boardSize - 1);
		const boxesCompleted = Object.keys(newBoxes).length;

		if (boxesCompleted === totalBoxes) {
			const scores = players.map((_, idx) =>
				Object.values(newBoxes).filter(owner => owner === idx).length
			);
			const updatedPlayers = players.map((player, idx) => ({
				...player,
				score: scores[idx],
			}));
			setPlayers(updatedPlayers);

			const maxScore = Math.max(...scores);
			const winners = updatedPlayers.filter((player) => player.score === maxScore);

			setGameOver(true);
			setWinner(winners.length === 1 ? winners[0] : null);
			return true;
		}

		if (completedBoxes === 0) {
			setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
		}

		return true;
	}, [gameOver, lines, boxes, currentPlayerIndex, players, boardSize, lineKey, checkBoxCompletion]);

	useEffect(() => {
		if (gameOver || players.length === 0) return;

		const currentPlayer = players[currentPlayerIndex];
		if (!currentPlayer?.isComputer) return;

		if (aiTimeoutRef.current) {
			clearTimeout(aiTimeoutRef.current);
		}

		aiTimeoutRef.current = setTimeout(() => {
			const move = findBestMove(boardSize, lines, boxes, lineKey, checkBoxCompletion);
			if (move) {
				makeMove(move.row, move.col, move.isHorizontal);
			}
		}, 500);

		return () => {
			if (aiTimeoutRef.current) {
				clearTimeout(aiTimeoutRef.current);
			}
		};
	}, [currentPlayerIndex, players, gameOver, boardSize, lines, boxes, makeMove, lineKey, checkBoxCompletion]);

	return {
		players,
		boardSize,
		currentPlayerIndex,
		lines,
		boxes,
		gameOver,
		winner,
		initializeGame,
		makeMove,
		resetGame,
	};
}
