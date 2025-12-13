import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import App from './App.jsx'

vi.mock('./hooks/useGameState.js', () => ({
  useGameState: vi.fn(),
}))

import { useGameState } from './hooks/useGameState.js'

const buildGameState = overrides => ({
  playerSetup: [{ name: '', color: '#fbbf24', isComputer: false }],
  playerCount: 1,
  setupComplete: false,
  setupError: null,
  handleSetupChange: vi.fn(),
  handleSetupSubmit: vi.fn(),
  handlePlayerCountChange: vi.fn(),
  players: [],
  currentPlayer: 0,
  setCurrentPlayer: vi.fn(),
  drawnCard: null,
  discardPile: [],
  discardTop: null,
  initialFlips: [false],
  firstTurnDraw: [false],
  turnComplete: [false],
  setRoundOver: vi.fn(),
  roundOver: false,
  currentHole: 1,
  holeScores: [],
  overallTotals: [0],
  startNextHole: vi.fn(),
  drawCard: vi.fn(),
  discardDrawnCard: vi.fn(),
  pickUpDiscard: vi.fn(),
  handleCardClick: vi.fn(),
  canInteractWithCard: () => false,
  visibleScores: [0],
  runningTotalsWithBonus: [0],
  clearSavedGame: vi.fn(),
  finalTurnPlayer: null,
  finalTurnPending: false,
  deckCount: 52,
  ...overrides,
})

const makeCards = prefix =>
  Array.from({ length: 8 }, (_, idx) => ({ id: `${prefix}-${idx}`, value: idx, faceUp: true }))

beforeEach(() => {
  useGameState.mockReset()
  localStorage.clear()
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('App integration surface', () => {
  it('shows the setup form before the game begins', () => {
    useGameState.mockReturnValue(buildGameState({}))

    render(<App />)

    expect(screen.getByText('Golf')).toBeInTheDocument()
    expect(screen.getByText('Start Game')).toBeInTheDocument()
    expect(screen.queryByText(/Turn/)).not.toBeInTheDocument()
  })

  it('renders player boards and scoreboard after setup, and end round triggers state update', () => {
    const setRoundOver = vi.fn()
    const startNextHole = vi.fn()
    const cardsP1 = makeCards('p1')
    const cardsP2 = makeCards('p2')

    useGameState.mockReturnValue(buildGameState({
      playerSetup: [
        { name: 'Alice', color: '#fbbf24', isComputer: false },
        { name: '', color: '#38bdf8', isComputer: true },
      ],
      playerCount: 2,
      setupComplete: true,
      players: [
        { cards: cardsP1, flippedCount: 8 },
        { cards: cardsP2, flippedCount: 8 },
      ],
      initialFlips: [true, true],
      firstTurnDraw: [false, false],
      turnComplete: [false, false],
      visibleScores: [5, 7],
      runningTotalsWithBonus: [5, 7],
      overallTotals: [5, 7],
      holeScores: [
        {
          hole: 1,
          scores: [5, 7],
          breakdowns: [
            { rawScore: 5, matchingColumnCount: 0, minusFiveCount: 0, bonus: 0, final: 5, columns: [] },
            { rawScore: 7, matchingColumnCount: 0, minusFiveCount: 0, bonus: 0, final: 7, columns: [] },
          ],
        },
      ],
      discardPile: [{ id: 'd1', value: 4, faceUp: true }],
      discardTop: { id: 'd1', value: 4, faceUp: true },
      setRoundOver,
      currentHole: 2,
      startNextHole,
      deckCount: 42,
    }))

    render(<App />)

    expect(screen.getByText("Alice's Turn")).toBeInTheDocument()
    expect(screen.getByText('Play Nine: The Card Game of Golf')).toBeInTheDocument()
    expect(screen.getByText('42 cards left')).toBeInTheDocument()
    fireEvent.click(screen.getByText('End Round'))
    expect(setRoundOver).toHaveBeenCalledWith(true)
    const aiSelect = screen.getByLabelText(/AI Speed/i)
    expect(aiSelect).toHaveValue('slow')
    expect(screen.queryByText('Next Hole')).not.toBeInTheDocument()
  })

  it('exposes the next hole action when the round is over', () => {
    const startNextHole = vi.fn()
    const cards = makeCards('p')

    useGameState.mockReturnValue(buildGameState({
      playerSetup: [
        { name: 'Alice', color: '#fbbf24', isComputer: false },
        { name: 'Bob', color: '#38bdf8', isComputer: false },
      ],
      playerCount: 2,
      setupComplete: true,
      players: [
        { cards, flippedCount: 8 },
        { cards, flippedCount: 8 },
      ],
      initialFlips: [true, true],
      firstTurnDraw: [false, false],
      turnComplete: [true, true],
      visibleScores: [10, 12],
      runningTotalsWithBonus: [10, 12],
      overallTotals: [10, 12],
      holeScores: [
        {
          hole: 1,
          scores: [10, 12],
          breakdowns: [
            { rawScore: 10, matchingColumnCount: 0, minusFiveCount: 0, bonus: 0, final: 10, columns: [] },
            { rawScore: 12, matchingColumnCount: 0, minusFiveCount: 0, bonus: 0, final: 12, columns: [] },
          ],
        },
      ],
      roundOver: true,
      currentHole: 3,
      startNextHole,
    }))

    render(<App />)

    const nextHoleButton = screen.getByText('Next Hole')
    fireEvent.click(nextHoleButton)
    expect(startNextHole).toHaveBeenCalled()
  })
})
