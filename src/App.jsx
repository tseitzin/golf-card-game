import './App.css'
import PlayerSetup from './components/PlayerSetup.jsx'
import PlayerBoard from './components/PlayerBoard.jsx'
import DrawDiscardArea from './components/DrawDiscardArea.jsx'
import ActionBar from './components/ActionBar.jsx'
import Scorecard from './components/Scorecard.jsx'
import { useGameState } from './hooks/useGameState.js'
import { useState, useEffect } from 'react'

export default function App() {
  const [aiSpeed, setAiSpeed] = useState(() => {
    try {
      return localStorage.getItem('golf:aiSpeed') || 'slow'
    } catch { return 'slow' }
  })
  useEffect(() => {
    try { localStorage.setItem('golf:aiSpeed', aiSpeed) } catch {}
  }, [aiSpeed])
  const {
    playerSetup,
    setupComplete,
    handleSetupChange,
    handleSetupSubmit,
    players,
    currentPlayer,
    setCurrentPlayer,
    drawnCard,
    discardPile,
    discardTop,
    initialFlips,
    firstTurnDraw,
    turnComplete,
    setRoundOver,
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
    clearSavedGame,
  } = useGameState({ aiSpeed })

  // Turn advancement now automatic; no manual End Turn handler.

  const canDraw =
    !roundOver &&
    initialFlips[currentPlayer] &&
    !turnComplete[currentPlayer] &&
    (!firstTurnDraw[currentPlayer] || (firstTurnDraw[currentPlayer] && !drawnCard))

  const canPickUp =
    !roundOver &&
    initialFlips[currentPlayer] &&
    !turnComplete[currentPlayer] &&
    discardPile.length > 0 &&
    !drawnCard

  const canDiscard = !roundOver && !turnComplete[currentPlayer]

  const playerNames = [
    playerSetup[0].name || 'You',
    playerSetup[1].name || 'Computer',
  ]

  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-700 to-green-900 p-4">
        {!setupComplete ? (
          <PlayerSetup
            playerSetup={playerSetup}
            onChange={handleSetupChange}
            onSubmit={handleSetupSubmit}
          />
        ) : (
          <>
            <h1 className="text-white text-3xl font-bold mb-6 text-center">Golf</h1>
            <div style={{ display: 'flex', gap: 16, marginBottom: 12, alignItems: 'center' }}>
              <label style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
                AI Speed:
                <select
                  value={aiSpeed}
                  onChange={e => setAiSpeed(e.target.value)}
                  style={{
                    marginLeft: 8,
                    background: '#14532D',
                    color: '#FFD600',
                    border: '1px solid #FFD600',
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
              <span style={{ color: '#ddd', fontSize: 12, fontStyle: 'italic' }}>
                (affects computer pacing only)
              </span>
            </div>
            <div
              style={{
                color: playerSetup[currentPlayer].color,
                fontWeight: 'bold',
                marginBottom: 8,
                fontSize: 22,
              }}
            >
              {playerSetup[currentPlayer].name || `Player ${currentPlayer + 1}`}&#39;s Turn
            </div>
            {typeof window._finalTurn === 'number' && !roundOver && (
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
                {window._finalTurnPending && (
                  <span style={{ fontSize: 11, fontStyle: 'italic', opacity: 0.85 }}>
                    awaiting action
                  </span>
                )}
              </div>
            )}
            <div
              style={{
                display: 'flex',
                gap: '48px',
                marginBottom: '32px',
                justifyContent: 'center',
              }}
            >
              {[0, 1].map(idx => (
                <PlayerBoard
                  key={idx}
                  index={idx}
                  player={players[idx]}
                  name={playerNames[idx]}
                  color={playerSetup[idx].color}
                  runningTotal={runningTotalsWithBonus ? runningTotalsWithBonus[idx] : visibleScores[idx]}
                  canInteractWithCard={canInteractWithCard}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>
            <DrawDiscardArea
              drawnCard={drawnCard}
              discardTop={discardTop}
              canDraw={canDraw}
              canPickUp={canPickUp}
              canDiscard={canDiscard}
              onDraw={drawCard}
              onPickUp={pickUpDiscard}
              onDiscard={discardDrawnCard}
            />
            <ActionBar
              onEndRound={() => setRoundOver(true)}
              onReset={() => window.location.reload()}
              onNextHole={startNextHole}
              roundOver={roundOver}
              currentHole={currentHole}
              onClearSave={clearSavedGame}
            />
            <Scorecard
              holeScores={holeScores}
              overallTotals={overallTotals}
              currentHole={currentHole}
              playerNames={playerNames}
            />
          </>
        )}
      </div>
    </div>
  )
}
