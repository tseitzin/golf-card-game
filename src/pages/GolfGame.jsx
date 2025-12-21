import { Link } from 'react-router-dom'
import '../App.css'
import PlayerSetup from '../components/PlayerSetup.jsx'
import PlayerBoard from '../components/PlayerBoard.jsx'
import DrawDiscardArea from '../components/DrawDiscardArea.jsx'
import ActionBar from '../components/ActionBar.jsx'
import Scorecard from '../components/Scorecard.jsx'
import { useGameState } from '../hooks/useGameState.js'
import { useState, useEffect } from 'react'

export default function GolfGame() {
  const [aiSpeed, setAiSpeed] = useState(() => {
    try {
      return localStorage.getItem('golf:aiSpeed') || 'slow'
    } catch (error) {
      console.warn('Failed to load AI speed from localStorage:', error)
      return 'slow'
    }
  })
  useEffect(() => {
    try { 
      localStorage.setItem('golf:aiSpeed', aiSpeed)
    } catch (error) {
      console.warn('Failed to save AI speed to localStorage:', error)
    }
  }, [aiSpeed])

  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('golf:darkMode')
      return saved ? JSON.parse(saved) : false
    } catch (error) {
      console.warn('Failed to load dark mode from localStorage:', error)
      return false
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem('golf:darkMode', JSON.stringify(darkMode))
    } catch (error) {
      console.warn('Failed to save dark mode to localStorage:', error)
    }
  }, [darkMode])
  const {
    playerSetup,
    playerCount,
    setupComplete,
    setupError,
    handleSetupChange,
    handleSetupSubmit,
    handlePlayerCountChange,
    players,
    currentPlayer,
    drawnCard,
    discardPile,
    discardTop,
    initialFlips,
    firstTurnDraw,
    turnComplete,
    roundOver,
    currentHole,
    holeScores,
    overallTotals,
    startNextHole,
    drawCard,
    discardDrawnCard,
    pickUpDiscard,
    handleCardClick,
    canInteractWithCard,
    visibleScores,
    runningTotalsWithBonus,
    endRoundImmediately,
    resetGame,
    finalTurnPlayer,
    finalTurnPending,
    deckCount,
  } = useGameState({ aiSpeed })

  const currentInitialFlips = initialFlips[currentPlayer] ?? false
  const currentTurnComplete = turnComplete[currentPlayer] ?? false
  const currentFirstTurnDraw = firstTurnDraw[currentPlayer] ?? false
  const currentPlayerConfig = playerSetup[currentPlayer] || {}

  const canDraw =
    !roundOver &&
    currentInitialFlips &&
    !currentTurnComplete &&
    !currentFirstTurnDraw &&
    !drawnCard

  const canPickUp =
    !roundOver &&
    currentInitialFlips &&
    !currentTurnComplete &&
    discardPile.length > 0 &&
    !drawnCard

  const canDiscard = !roundOver && !currentTurnComplete

  const playerNames = playerSetup.map((config, idx) => {
    if (config?.name) return config.name
    return config?.isComputer ? `Computer ${idx + 1}` : `Player ${idx + 1}`
  })

  const renderPlayerArea = () => {
    if (!players.length) return null

    const topCount = players.length > 3 ? Math.ceil(players.length / 2) : players.length
    const topPlayers = players.slice(0, topCount)
    const bottomPlayers = players.slice(topCount)

    const renderRow = (rowPlayers, rowOffset, position) => {
      if (!rowPlayers.length) return null
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            flexWrap: 'wrap',
            width: '100%',
            maxWidth: 960,
            marginBottom: shouldSplit && position === 'top' ? 12 : 0,
            marginTop: shouldSplit && position === 'bottom' ? 12 : 0,
          }}
        >
          {rowPlayers.map((player, idx) => {
            const playerIndex = idx + rowOffset
            return (
              <PlayerBoard
                key={playerIndex}
                index={playerIndex}
                player={player}
                name={playerNames[playerIndex]}
                color={playerSetup[playerIndex]?.color || '#fff'}
                isComputer={!!playerSetup[playerIndex]?.isComputer}
                isCurrentPlayer={playerIndex === currentPlayer && !roundOver}
                darkMode={darkMode}
                runningTotal={
                  runningTotalsWithBonus?.[playerIndex] ??
                  (visibleScores ? visibleScores[playerIndex] : undefined) ??
                  0
                }
                canInteractWithCard={canInteractWithCard}
                onCardClick={handleCardClick}
              />
            )
          })}
        </div>
      )
    }

    const shouldSplit = bottomPlayers.length > 0

    return (
      <div
        style={{
          width: '100%',
          maxWidth: 1080,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: shouldSplit ? '60vh' : 'auto',
          padding: '12px 0 40px',
        }}
      >
        {renderRow(topPlayers, 0, 'top')}
        <div
          style={{
            flexGrow: shouldSplit ? 1 : 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            padding: shouldSplit ? '0 0 12px' : '12px 0 20px',
          }}
        >
          <DrawDiscardArea
            drawnCard={drawnCard}
            discardTop={discardTop}
            canDraw={canDraw}
            canPickUp={canPickUp}
            canDiscard={canDiscard}
            onDraw={drawCard}
            onPickUp={pickUpDiscard}
            onDiscard={discardDrawnCard}
            deckCount={deckCount}
            darkMode={darkMode}
          />
        </div>
        {renderRow(bottomPlayers, topCount, 'bottom')}
      </div>
    )
  }

  const containerClass = [
    'flex flex-col items-center w-full',
    setupComplete ? 'justify-start pt-12 md:pt-16' : 'justify-start pt-12',
    'min-h-screen p-4',
  ].join(' ')

  const theme = {
    light: {
      background: '#f8f6f1',
      text: '#222',
      secondaryText: '#666',
      heading: '#fff',
      cardText: '#000',
    },
    dark: {
      background: '#2d3748',
      text: '#e5e5e5',
      secondaryText: '#a3a3a3',
      heading: '#fff',
      cardText: '#fff',
    },
  }

  const currentTheme = darkMode ? theme.dark : theme.light

  // Apply theme to entire page
  useEffect(() => {
    document.body.style.backgroundColor = currentTheme.background
    document.documentElement.style.backgroundColor = currentTheme.background
  }, [currentTheme.background])

  const containerStyle = {
    backgroundColor: currentTheme.background,
  }

  return (
    <div>
      {/* Home button */}
      <Link
        to="/"
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          background: darkMode ? '#374151' : '#fff',
          color: darkMode ? '#e5e5e5' : '#14532D',
          border: darkMode ? '2px solid #4b5563' : '2px solid #14532D',
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: 14,
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 1000,
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          transition: 'all 0.3s ease',
        }}
      >
        ← Home
      </Link>

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
      <div className={containerClass} style={containerStyle}>
        {!setupComplete ? (
          <>
            <h1 style={{ color: currentTheme.heading }} className="text-4xl font-bold mb-4 text-center tracking-wide">Golf</h1>
            <PlayerSetup
              playerSetup={playerSetup}
              playerCount={playerCount}
              onPlayerCountChange={handlePlayerCountChange}
              onChange={handleSetupChange}
              onSubmit={handleSetupSubmit}
              setupError={setupError}
            />
          </>
        ) : (
          <>
            <div
              style={{
                color: currentPlayerConfig.color || '#fff',
                fontWeight: 'bold',
                marginBottom: 6,
                marginTop: 0,
                fontSize: 22,
                textShadow: '0 1px 1px rgba(0,0,0,0.45), 0 -1px 1px rgba(0,0,0,0.35), 1px 0 1px rgba(0,0,0,0.35), -1px 0 1px rgba(0,0,0,0.35)',
              }}
            >
              {(currentPlayerConfig.name ||
                (currentPlayerConfig.isComputer ? `Computer ${currentPlayer + 1}` : `Player ${currentPlayer + 1}`))}
              &#39;s Turn
            </div>
            {finalTurnPlayer !== null && !roundOver && (
              <div
                style={{
                  background: '#DC2626',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: 8,
                  fontWeight: '700',
                  marginBottom: 12,
                  boxShadow: '0 0 0 2px #991B1B, 0 4px 10px rgba(0,0,0,0.35)',
                  letterSpacing: '0.5px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  animation: 'pulseFinalTurn 1.2s ease-in-out infinite',
                }}
              >
                <span style={{ fontSize: 14 }}>Final Turn</span>
                {finalTurnPending && (
                  <span style={{ fontSize: 11, fontStyle: 'italic', opacity: 0.85 }}>
                    awaiting action
                  </span>
                )}
              </div>
            )}
            {renderPlayerArea()}
            <ActionBar
              onEndRound={() => {
                if (window.confirm('Are you sure you want to end this round? All cards will be revealed and scored.')) {
                  endRoundImmediately()
                }
              }}
              onReset={() => {
                if (window.confirm('Are you sure you want to reset the entire game? All progress will be lost.')) {
                  resetGame()
                }
              }}
              onNextHole={startNextHole}
              roundOver={roundOver}
              currentHole={currentHole}
            />
            <Scorecard
              holeScores={holeScores}
              overallTotals={overallTotals}
              currentHole={currentHole}
              playerNames={playerNames}
              darkMode={darkMode}
            />
            <div
              style={{
                display: 'flex',
                gap: 16,
                marginTop: 18,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <label style={{ color: currentTheme.text, fontSize: 14, fontWeight: '600' }}>
                AI Speed:
                <select
                  value={aiSpeed}
                  onChange={e => setAiSpeed(e.target.value)}
                  style={{
                    marginLeft: 8,
                    background: darkMode ? '#374151' : '#14532D',
                    color: darkMode ? '#fbbf24' : '#FFD600',
                    border: darkMode ? '1px solid #4b5563' : '1px solid #FFD600',
                    borderRadius: 6,
                    padding: '4px 8px',
                    fontWeight: '600',
                  }}
                >
                  <option value="slow">Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                </select>
              </label>
              <span style={{ color: currentTheme.secondaryText, fontSize: 12, fontStyle: 'italic' }}>
                (affects computer player only)
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
