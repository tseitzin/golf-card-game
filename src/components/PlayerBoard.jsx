import Card from './Card.jsx'
import { useRef, useEffect } from 'react'

export default function PlayerBoard({
  index,
  player,
  name,
  color,
  isComputer,
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
        gap: 6,
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
      </div>
      <div
        style={{
          fontWeight: '600',
          color: '#222',
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
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
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
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

