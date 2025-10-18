import './App.css'
import PlayerSetup from './components/PlayerSetup.jsx'
import PlayerBoard from './components/PlayerBoard.jsx'
import DrawDiscardArea from './components/DrawDiscardArea.jsx'
import ActionBar from './components/ActionBar.jsx'
import Scorecard from './components/Scorecard.jsx'
import { useGameState } from './hooks/useGameState.js'

export default function App() {
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
    clearSavedGame,
  } = useGameState()

  // Turn advancement now automatic; no manual End Turn handler.

  const canDraw =
    initialFlips[currentPlayer] &&
    !turnComplete[currentPlayer] &&
    (!firstTurnDraw[currentPlayer] || (firstTurnDraw[currentPlayer] && !drawnCard))

  const canPickUp =
    initialFlips[currentPlayer] &&
    !turnComplete[currentPlayer] &&
    discardPile.length > 0 &&
    !drawnCard

  const canDiscard = !turnComplete[currentPlayer]

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
                  runningTotal={visibleScores[idx]}
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
