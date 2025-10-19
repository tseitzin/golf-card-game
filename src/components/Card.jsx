import { useEffect, useRef } from 'react'

/**
 * Card component: purely visual card flip.
 * Props:
 *  - card: { id, value, faceUp }
 *  - onClick: handler
 *  - interactive: boolean (adds pointer cursor)
 *  - width / height (defaults 52x78)
 *  - flipDelay: optional ms to delay initial flip animation (used for staggered computer auto-flips)
 */
export default function Card({ card, onClick, interactive, width = 52, height = 78, flipDelay = 0 }) {
  const faceUp = !!card?.faceUp
  const displayValue = faceUp ? card.value : card?.value
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
          transform: 'rotateY(0deg)',
          transformStyle: 'preserve-3d',
          borderRadius: 8,
          border: '1px solid #0f172a',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f3b27 0%, #14532d 55%, #1d7a43 100%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '-40%',
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(255,214,0,0.12) 0, rgba(255,214,0,0.12) 6px, transparent 6px, transparent 12px)',
            opacity: 0.55,
          }}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            border: '2px solid rgba(255,214,0,0.7)',
            background: 'radial-gradient(circle, rgba(255,214,0,0.25) 0%, rgba(20,83,45,0.9) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 6px rgba(255,214,0,0.25)',
          }}
        >
          <span
            style={{
              color: '#fef08a',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Golf
          </span>
        </div>
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
          fontSize: 20,
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
