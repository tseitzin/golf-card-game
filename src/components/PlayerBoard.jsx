import Card from './Card.jsx'
import { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'

// Helper function to get a contrasting highlight color
const getContrastingHighlight = (bgColor) => {
  // Parse hex color to RGB
  const hex = bgColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Calculate perceived brightness (0-255)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  
  // For light backgrounds, use dark highlight; for dark backgrounds, use light highlight
  if (brightness > 128) {
    // Light background - use dark red/crimson
    return {
      color: '#DC2626',
      shadow: 'rgba(220, 38, 38, 0.6)'
    }
  } else {
    // Dark background - use bright white/cyan
    return {
      color: '#FFFFFF',
      shadow: 'rgba(255, 255, 255, 0.7)'
    }
  }
}

export default function PlayerBoard({
  index,
  player,
  name,
  color,
  isComputer,
  isCurrentPlayer,
  darkMode,
  runningTotal,
  canInteractWithCard,
  onCardClick,
}) {
  // Track previous faceUp states to apply small stagger only to the two most recently flipped cards at start.
  const prevFaceUpRef = useRef([])
  useEffect(() => {
    prevFaceUpRef.current = player?.cards?.map(c => c.faceUp) || []
  }, [player])

  const cards = player?.cards || Array(8).fill(null)
  
  // Get contrasting highlight color based on player background
  const highlight = isCurrentPlayer ? getContrastingHighlight(color) : null

  const highlightIndices = (() => {
    const byValue = {}
    for (let col = 0; col < 4; col++) {
      const top = cards[col]
      const bottom = cards[col + 4]
      if (
        top &&
        bottom &&
        top.faceUp &&
        bottom.faceUp &&
        top.value === bottom.value &&
        top.value !== -5
      ) {
        const value = top.value
        if (!byValue[value]) byValue[value] = []
        byValue[value].push(col)
      }
    }
    const indices = new Set()
    Object.values(byValue).forEach(columnIndices => {
      if (columnIndices.length >= 2) {
        columnIndices.forEach(colIdx => {
          indices.add(colIdx)
          indices.add(colIdx + 4)
        })
      }
    })
    return indices
  })()

  return (
    <div
      style={{
        flex: '0 1 220px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        position: 'relative',
      }}
    >
      <div
        style={{
          color,
          fontWeight: 'bold',
          fontSize: 16,
          textAlign: 'center',
        }}
      >
        {name}
        {isCurrentPlayer && (
          <span style={{ marginLeft: 8, fontSize: 18 }}>👈</span>
        )}
      </div>
      <div
        style={{
          fontWeight: '600',
          color: darkMode ? '#e5e5e5' : '#222',
          textAlign: 'center',
          fontSize: 13,
        }}
      >
        Running Total: {runningTotal}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 52px)',
          gridTemplateRows: 'repeat(2, 78px)',
          gap: '8px',
          background: color,
          borderRadius: 10,
          padding: 10,
          boxShadow: isCurrentPlayer 
            ? `0 0 0 4px ${highlight.color}, 0 0 20px ${highlight.shadow}, 0 4px 12px rgba(0,0,0,0.3)` 
            : '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'box-shadow 0.3s ease',
          position: 'relative',
        }}
      >
        {cards.map((card, idxCard) => {
          const isInteractive = card ? canInteractWithCard(index, idxCard) : false

          // Stagger flips slightly for computer-controlled seats when cards auto-reveal.
          let flipDelay = 0
          const prev = prevFaceUpRef.current[idxCard]
          if (isComputer && card?.faceUp && prev === false) {
            flipDelay = (idxCard % 4) * 40
          }

          const partnerIndex = idxCard < 4 ? idxCard + 4 : idxCard - 4
          const partnerCard = cards[partnerIndex]
          const isMatchPair =
            !!card &&
            !!partnerCard &&
            card.faceUp &&
            partnerCard.faceUp &&
            card.value === partnerCard.value
          const isBottomCard = idxCard >= 4
          const shouldSlide = isBottomCard && isMatchPair
          const highlightCard = highlightIndices.has(idxCard)

          const wrapperStyle = {
            transition: 'transform 0.3s ease',
            transform: shouldSlide ? 'translateY(-40px)' : 'translateY(0)',
            zIndex: shouldSlide ? 3 : 1,
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }

          return (
            <div key={card ? card.id : idxCard} style={wrapperStyle}>
              <Card
                card={card}
                interactive={isInteractive}
                onClick={() => onCardClick?.(index, idxCard)}
                flipDelay={flipDelay}
                highlighted={highlightCard}
                darkMode={darkMode}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

PlayerBoard.propTypes = {
  index: PropTypes.number.isRequired,
  player: PropTypes.shape({
    cards: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        value: PropTypes.number.isRequired,
        faceUp: PropTypes.bool.isRequired,
      })
    ).isRequired,
    flippedCount: PropTypes.number,
  }),
  name: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  isComputer: PropTypes.bool,
  isCurrentPlayer: PropTypes.bool,
  darkMode: PropTypes.bool,
  runningTotal: PropTypes.number,
  canInteractWithCard: PropTypes.func.isRequired,
  onCardClick: PropTypes.func,
}

