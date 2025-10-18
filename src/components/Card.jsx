import { useEffect, useRef } from 'react'

/**
 * Card component: purely visual card flip.
 * Props:
 *  - card: { id, value, faceUp }
 *  - onClick: handler
 *  - interactive: boolean (adds pointer cursor)
 *  - width / height (defaults 60x90)
 *  - flipDelay: optional ms to delay initial flip animation (used for staggered computer auto-flips)
 */
export default function Card({ card, onClick, interactive, width = 60, height = 90, flipDelay = 0 }) {
  const faceUp = !!card?.faceUp
  const displayValue = faceUp ? card.value : '?'
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Toggle class to trigger CSS transition when face state changes
    if (faceUp) {
      requestAnimationFrame(() => {
        el.classList.add('card-flipped')
      })
    } else {
      el.classList.remove('card-flipped')
    }
  }, [faceUp])

  return (
    <div
      ref={ref}
      onClick={onClick}
      className="flip-card"
      style={{
        width,
        height,
        position: 'relative',
        cursor: interactive ? 'pointer' : 'default',
        perspective: 800,
        transition: 'transform 0.42s cubic-bezier(0.22,0.61,0.36,1)',
        transformStyle: 'preserve-3d',
        // Delay only when turning faceUp (stagger). Use inline animation delay via style.
        transitionDelay: faceUp ? `${flipDelay}ms` : '0ms',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          background: '#333',
          color: '#eee',
          border: '1px solid #333',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          fontWeight: '600',
          transform: 'rotateY(0deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        ?
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: '#eee',
          color: '#222',
          border: '1px solid #333',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          fontWeight: '600',
          transformStyle: 'preserve-3d',
        }}
      >
        {displayValue}
      </div>
      <style>{`
        .flip-card { transform: rotateY(${faceUp ? 180 : 0}deg); }
        .flip-card.card-flipped { transform: rotateY(180deg); }
      `}</style>
    </div>
  )
}
