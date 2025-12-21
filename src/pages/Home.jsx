import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const games = [
  {
    id: 'golf',
    name: 'Golf',
    description: 'A classic 6-card golf game. Flip cards, swap strategically, and aim for the lowest score!',
    path: '/golf',
    emoji: '⛳',
    color: '#14532D',
  },
  {
    id: 'race-game',
    name: 'Race Game',
    description: 'Fast-paced oval track racing with AI opponents. Control your car and race to victory!',
    path: '/race',
    emoji: '🏎️',
    color: '#DC2626',
  },
]

export default function Home() {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('golf:darkMode')
      return saved ? JSON.parse(saved) : false
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('golf:darkMode', JSON.stringify(darkMode))
    } catch {
      // Ignore localStorage errors
    }
  }, [darkMode])

  const theme = {
    light: {
      background: '#f8f6f1',
      cardBg: '#ffffff',
      text: '#222',
      secondaryText: '#666',
      border: '#e5e5e5',
    },
    dark: {
      background: '#1a202c',
      cardBg: '#2d3748',
      text: '#e5e5e5',
      secondaryText: '#a3a3a3',
      border: '#4a5568',
    },
  }

  const currentTheme = darkMode ? theme.dark : theme.light

  useEffect(() => {
    document.body.style.backgroundColor = currentTheme.background
    document.documentElement.style.backgroundColor = currentTheme.background
  }, [currentTheme.background])

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: currentTheme.background,
        padding: '40px 20px',
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* Dark mode toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          background: darkMode ? '#374151' : '#fff',
          color: darkMode ? '#fbbf24' : '#14532D',
          border: darkMode ? '2px solid #4b5563' : '2px solid #14532D',
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: 14,
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 1000,
          transition: 'all 0.3s ease',
        }}
      >
        {darkMode ? '☀️ Light' : '🌙 Dark'}
      </button>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1
          style={{
            fontSize: 48,
            fontWeight: 'bold',
            color: currentTheme.text,
            marginBottom: 12,
          }}
        >
          🎴 Card Games
        </h1>
        <p
          style={{
            fontSize: 18,
            color: currentTheme.secondaryText,
            maxWidth: 500,
            margin: '0 auto',
          }}
        >
          Choose a game to play
        </p>
      </div>

      {/* Games Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 24,
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        {games.map((game) => (
          <Link
            key={game.id}
            to={game.path}
            style={{
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
              <div
                style={{
                  backgroundColor: currentTheme.cardBg,
                  borderRadius: 16,
                  padding: 24,
                  border: `2px solid ${currentTheme.border}`,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  height: '100%',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'
                  e.currentTarget.style.borderColor = game.color
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                  e.currentTarget.style.borderColor = currentTheme.border
                }}
              >
                <div
                  style={{
                    fontSize: 48,
                    marginBottom: 16,
                    textAlign: 'center',
                  }}
                >
                  {game.emoji}
                </div>
                <h2
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: currentTheme.text,
                    marginBottom: 8,
                    textAlign: 'center',
                  }}
                >
                  {game.name}
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    color: currentTheme.secondaryText,
                    textAlign: 'center',
                    lineHeight: 1.5,
                  }}
                >
                  {game.description}
                </p>
                <div
                  style={{
                    marginTop: 16,
                    textAlign: 'center',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      backgroundColor: game.color,
                      color: '#fff',
                      padding: '8px 20px',
                      borderRadius: 8,
                      fontWeight: '600',
                      fontSize: 14,
                    }}
                  >
                    Play Now
                  </span>
                </div>
              </div>
          </Link>
        ))}
      </div>

      {/* Coming Soon Placeholder */}
      <div
        style={{
          textAlign: 'center',
          marginTop: 48,
          padding: 24,
          color: currentTheme.secondaryText,
          fontSize: 14,
        }}
      >
        <p>More games coming soon! 🎲</p>
      </div>
    </div>
  )
}
