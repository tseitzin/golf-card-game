import { useState } from 'react';
import CheckerPiece from './CheckerPiece';
import { BOARD_SIZE, SQUARE_COLORS } from '../constants';

const GameBoard = ({
  board,
  selectedPiece,
  validMoves,
  onSquareClick,
  lastMove,
  currentHint
}) => {
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [dragOverSquare, setDragOverSquare] = useState(null);

  const isDarkSquare = (row, col) => (row + col) % 2 === 1;

  const isValidMoveSquare = (row, col) => {
    return validMoves.some(move => move.row === row && move.col === col);
  };

  const isMandatoryCapture = (row, col) => {
    return validMoves.some(move => move.row === row && move.col === col && move.isCapture);
  };

  const isLastMoveSquare = (row, col) => {
    if (!lastMove) return false;
    return (
      (lastMove.from.row === row && lastMove.from.col === col) ||
      (lastMove.to.row === row && lastMove.to.col === col)
    );
  };

  const isHintSquare = (row, col) => {
    if (!currentHint) return false;
    return (
      (currentHint.from.row === row && currentHint.from.col === col) ||
      (currentHint.to.row === row && currentHint.to.col === col)
    );
  };

  const handleDragStart = (e, row, col) => {
    const piece = board[row][col];
    if (!piece) return;

    setDraggedPiece({ row, col });
    onSquareClick(row, col);

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ row, col }));
  };

  const handleDragEnd = () => {
    setDraggedPiece(null);
    setDragOverSquare(null);
  };

  const handleDragOver = (e, row, col) => {
    e.preventDefault();

    if (isValidMoveSquare(row, col)) {
      e.dataTransfer.dropEffect = 'move';
      setDragOverSquare({ row, col });
    } else {
      e.dataTransfer.dropEffect = 'none';
      setDragOverSquare(null);
    }
  };

  const handleDragLeave = () => {
    setDragOverSquare(null);
  };

  const handleDrop = (e, row, col) => {
    e.preventDefault();
    setDragOverSquare(null);

    if (isValidMoveSquare(row, col)) {
      onSquareClick(row, col);
    }

    setDraggedPiece(null);
  };

  const handleClick = (row, col) => {
    onSquareClick(row, col);
  };

  return (
    <div className="flex items-center justify-center w-full p-4">
      <div
        className="grid gap-0 shadow-2xl rounded-lg overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
          width: 'min(90vw, 90vh, 600px)',
          height: 'min(90vw, 90vh, 600px)',
          aspectRatio: '1/1'
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const isSelected = selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex;
            const isValidMove = isValidMoveSquare(rowIndex, colIndex);
            const isMandatory = isMandatoryCapture(rowIndex, colIndex);
            const isLastMove = isLastMoveSquare(rowIndex, colIndex);
            const isDragging = draggedPiece?.row === rowIndex && draggedPiece?.col === colIndex;
            const isDragOver = dragOverSquare?.row === rowIndex && dragOverSquare?.col === colIndex;
            const isHint = isHintSquare(rowIndex, colIndex);
            const isDark = isDarkSquare(rowIndex, colIndex);

            const bgColor = isLastMove
              ? '#fbbf24'
              : isHint
              ? '#a78bfa'
              : isDark
              ? SQUARE_COLORS.DARK
              : SQUARE_COLORS.LIGHT;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="relative flex items-center justify-center cursor-pointer"
                style={{
                  backgroundColor: bgColor,
                  transition: 'background-color 0.3s ease'
                }}
                onClick={() => handleClick(rowIndex, colIndex)}
                onDragOver={(e) => handleDragOver(e, rowIndex, colIndex)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
              >
                {isSelected && (
                  <div
                    className="absolute inset-0 bg-yellow-400"
                    style={{ opacity: 0.4 }}
                  />
                )}

                {isValidMove && (
                  <div
                    className={`absolute rounded-full ${
                      isMandatory ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{
                      width: '40%',
                      height: '40%',
                      opacity: 0.6
                    }}
                  />
                )}

                {isDragOver && (
                  <div
                    className="absolute inset-0 bg-blue-400"
                    style={{ opacity: 0.3 }}
                  />
                )}

                {piece && (
                  <div
                    draggable={isDark}
                    onDragStart={(e) => handleDragStart(e, rowIndex, colIndex)}
                    onDragEnd={handleDragEnd}
                    className="w-full h-full"
                    style={{ cursor: isDark ? 'grab' : 'default' }}
                  >
                    <CheckerPiece
                      piece={piece}
                      isSelected={isSelected}
                      isDragging={isDragging}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GameBoard;
