import { useState, useCallback, useEffect, useRef } from 'react';
import { findBestMove } from '../utils/aiLogic';

export function useGameState() {
	const [players, setPlayers] = useState([]);
	const [boardSize, setBoardSize] = useState(4);
	const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
	const [lines, setLines] = useState({});
	const [boxes, setBoxes] = useState({});
	const [gameOver, setGameOver] = useState(false);
	const [winner, setWinner] = useState(null);
	const [lastMove, setLastMove] = useState(null);
	const aiTimeoutRef = useRef(null);
	
	// Use refs to track current state to avoid stale closures
	const linesRef = useRef(lines);
	const boxesRef = useRef(boxes);
	const currentPlayerIndexRef = useRef(currentPlayerIndex);
	
	useEffect(() => {
		linesRef.current = lines;
	}, [lines]);
	
	useEffect(() => {
		boxesRef.current = boxes;
	}, [boxes]);
	
	useEffect(() => {
		currentPlayerIndexRef.current = currentPlayerIndex;
	}, [currentPlayerIndex]);

	const initializeGame = useCallback((config) => {
		setPlayers(config.players);
		setBoardSize(config.boardSize);
		setCurrentPlayerIndex(0);
		setLines({});
		setBoxes({});
		setGameOver(false);
		setWinner(null);
		setLastMove(null);
	}, []);

	const resetGame = useCallback(() => {
		setCurrentPlayerIndex(0);
		setLines({});
		setBoxes({});
		setGameOver(false);
		setWinner(null);
		setLastMove(null);
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
			newLines[topLine] !== undefined &&
			newLines[bottomLine] !== undefined &&
			newLines[leftLine] !== undefined &&
			newLines[rightLine] !== undefined
		);
	}, [lineKey]);

	const makeMove = useCallback((row, col, isHorizontal) => {
		if (gameOver) return false;

		const key = lineKey(row, col, isHorizontal);

		// Use refs to get the most current state
		const currentLines = linesRef.current;
		const currentBoxes = boxesRef.current;
		const currentPlayer = currentPlayerIndexRef.current;

		if (currentLines[key] !== undefined) {
			return false;
		}

		const newLines = { ...currentLines, [key]: currentPlayer };

		let completedBoxes = 0;
		const newBoxes = { ...currentBoxes };
		const boxesAdded = [];

		for (let r = 0; r < boardSize - 1; r++) {
			for (let c = 0; c < boardSize - 1; c++) {
				const boxKey = `${r},${c}`;
				if (newBoxes[boxKey] === undefined && checkBoxCompletion(newLines, r, c)) {
					newBoxes[boxKey] = currentPlayer;
					boxesAdded.push(boxKey);
					completedBoxes++;
				}
			}
		}

		const totalBoxes = (boardSize - 1) * (boardSize - 1);
		const boxesCompleted = Object.keys(newBoxes).length;

		const previousPlayerIndex = currentPlayer;
		const turnChanged = completedBoxes === 0;

		// Determine next player
		const nextPlayerIndex = completedBoxes === 0 
			? (currentPlayer + 1) % players.length 
			: currentPlayer;

		// Update refs immediately before state updates
		linesRef.current = newLines;
		boxesRef.current = newBoxes;
		if (completedBoxes === 0) {
			currentPlayerIndexRef.current = nextPlayerIndex;
		}

		// Update all state together
		setLines(newLines);
		setBoxes(newBoxes);
		if (completedBoxes === 0) {
			setCurrentPlayerIndex(nextPlayerIndex);
		}

		setLastMove({
			line: key,
			boxesAdded,
			previousPlayerIndex,
			turnChanged,
		});

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

	return true;
	}, [gameOver, players, boardSize, lineKey, checkBoxCompletion]);

	const undoLastMove = useCallback(() => {
		if (!lastMove || gameOver) return false;

		const currentPlayer = players[currentPlayerIndex];
		if (currentPlayer?.isComputer) return false;

		const previousPlayer = players[lastMove.previousPlayerIndex];
		if (previousPlayer?.isComputer) return false;

		const newLines = { ...lines };
		delete newLines[lastMove.line];
		setLines(newLines);

		const newBoxes = { ...boxes };
		lastMove.boxesAdded.forEach(boxKey => {
			delete newBoxes[boxKey];
		});
		setBoxes(newBoxes);

		if (lastMove.turnChanged) {
			setCurrentPlayerIndex(lastMove.previousPlayerIndex);
		}

		setLastMove(null);
		return true;
	}, [lastMove, lines, boxes, currentPlayerIndex, players, gameOver]);

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
		lastMove,
		initializeGame,
		makeMove,
		resetGame,
		undoLastMove,
	};
}
