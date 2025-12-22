import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { PLAYER_COLORS, PIECE_TYPES, PIECE_COLORS } from '../constants';

const CheckerPiece = ({ piece, isSelected, isDragging }) => {
  if (!piece) return null;

  const isRed = piece.color === PLAYER_COLORS.RED;
  const isKing = piece.type === PIECE_TYPES.KING;

  const pieceColor = isRed ? PIECE_COLORS.RED : PIECE_COLORS.BLACK;
  const pieceLightColor = isRed ? PIECE_COLORS.RED_LIGHT : PIECE_COLORS.BLACK_LIGHT;

  return (
    <motion.div
      animate={{
        y: isDragging ? -10 : 0
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20
      }}
      className="relative w-full h-full flex items-center justify-center pointer-events-none"
    >
      <div
        className="relative rounded-full shadow-lg flex items-center justify-center cursor-pointer"
        style={{
          width: '80%',
          height: '80%',
          background: `radial-gradient(circle at 30% 30%, ${pieceLightColor}, ${pieceColor})`,
          border: isSelected ? '3px solid #fbbf24' : '2px solid rgba(0,0,0,0.2)',
          boxShadow: isSelected
            ? '0 8px 16px rgba(0,0,0,0.3), 0 0 20px rgba(251, 191, 36, 0.5)'
            : '0 4px 8px rgba(0,0,0,0.2)'
        }}
      >
        {isKing && (
          <Crown
            className="text-yellow-300"
            size={24}
            strokeWidth={2.5}
            fill="#fde047"
          />
        )}
      </div>
    </motion.div>
  );
};

export default CheckerPiece;
