export function findBestMove(boardSize, lines, boxes, lineKey, checkBoxCompletion) {
	const availableMoves = [];

	for (let row = 0; row < boardSize; row++) {
		for (let col = 0; col < boardSize - 1; col++) {
			const hKey = lineKey(row, col, true);
			if (lines[hKey] === undefined) {
				availableMoves.push({ row, col, isHorizontal: true });
			}
		}
	}

	for (let row = 0; row < boardSize - 1; row++) {
		for (let col = 0; col < boardSize; col++) {
			const vKey = lineKey(row, col, false);
			if (lines[vKey] === undefined) {
				availableMoves.push({ row, col, isHorizontal: false });
			}
		}
	}

	if (availableMoves.length === 0) return null;

	const completingMoves = [];
	const safeMoves = [];
	const riskyMoves = [];

	for (const move of availableMoves) {
		const testLines = { ...lines };
		const key = lineKey(move.row, move.col, move.isHorizontal);
		testLines[key] = 0;

		let completesBox = false;
		for (let r = 0; r < boardSize - 1; r++) {
			for (let c = 0; c < boardSize - 1; c++) {
				const boxKey = `${r},${c}`;
				if (!boxes[boxKey] && checkBoxCompletion(testLines, r, c)) {
					completesBox = true;
					break;
				}
			}
			if (completesBox) break;
		}

		if (completesBox) {
			completingMoves.push(move);
		} else {
			const createsThreeSidedBox = wouldCreateThreeSidedBox(
				move,
				testLines,
				boardSize,
				lineKey,
				boxes
			);

			if (createsThreeSidedBox) {
				riskyMoves.push(move);
			} else {
				safeMoves.push(move);
			}
		}
	}

	if (completingMoves.length > 0) {
		return completingMoves[Math.floor(Math.random() * completingMoves.length)];
	}

	if (safeMoves.length > 0) {
		return safeMoves[Math.floor(Math.random() * safeMoves.length)];
	}

	return riskyMoves[Math.floor(Math.random() * riskyMoves.length)];
}

function wouldCreateThreeSidedBox(move, testLines, boardSize, lineKey, boxes) {
	const affectedBoxes = [];

	if (move.isHorizontal) {
		if (move.row > 0) {
			affectedBoxes.push({ row: move.row - 1, col: move.col });
		}
		if (move.row < boardSize - 1) {
			affectedBoxes.push({ row: move.row, col: move.col });
		}
	} else {
		if (move.col > 0) {
			affectedBoxes.push({ row: move.row, col: move.col - 1 });
		}
		if (move.col < boardSize - 1) {
			affectedBoxes.push({ row: move.row, col: move.col });
		}
	}

	for (const box of affectedBoxes) {
		const boxKey = `${box.row},${box.col}`;
		if (boxes[boxKey]) continue;

		const topLine = lineKey(box.row, box.col, true);
		const bottomLine = lineKey(box.row + 1, box.col, true);
		const leftLine = lineKey(box.row, box.col, false);
		const rightLine = lineKey(box.row, box.col + 1, false);

		const sidesComplete = [topLine, bottomLine, leftLine, rightLine].filter(
			line => testLines[line] !== undefined
		).length;

		if (sidesComplete === 3) {
			return true;
		}
	}

	return false;
}
