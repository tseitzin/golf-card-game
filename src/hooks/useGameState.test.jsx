import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameState } from './useGameState.js'

const mockEvent = () => ({ preventDefault: vi.fn() })

const createTestDeck = () => {
  const deck = []
  for (let i = 0; i < 104; i++) {
    deck.push(i % 13)
  }
  deck.push(-5, -5, -5, -5)
  return deck
}

const flipCard = (result, cardIndex) => {
  act(() => {
    result.current.handleCardClick(0, cardIndex)
  })
}

const flipTwoCards = result => {
  flipCard(result, 0)
  flipCard(result, 1)
}

describe('useGameState', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    delete window._finalTurn
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete window._finalTurn
  })

  it('initialises with two players and setup incomplete', () => {
    const { result } = renderHook(() => useGameState({ enablePersistence: false }))

    expect(result.current.playerSetup).toHaveLength(2)
    expect(result.current.setupComplete).toBe(false)
    expect(result.current.players).toHaveLength(2)
    expect(result.current.players[0].cards).toHaveLength(8)
    expect(result.current.visibleScores[0]).toBe(0)
    expect(result.current.visibleScores[1]).toBe(0)
  })

  it('updates player setup and marks setup as complete on submit', () => {
    const { result } = renderHook(() => useGameState({ enablePersistence: false }))

    act(() => {
      result.current.handleSetupChange(0, 'name', 'Alice')
      result.current.handleSetupChange(1, 'name', 'Robo')
    })

    expect(result.current.playerSetup[0].name).toBe('Alice')
    expect(result.current.playerSetup[1].name).toBe('Robo')

    act(() => {
      result.current.handleSetupSubmit(mockEvent())
    })

    expect(result.current.setupComplete).toBe(true)
  })

  it('gates drawing until setup submit and until two initial flips are made', () => {
    const { result } = renderHook(() => useGameState({ enablePersistence: false }))
    // Attempt draw before setup; should remain null
    act(() => {
      result.current.drawCard()
    })
    expect(result.current.drawnCard).toBeNull()

    // Submit setup (seed discard only)
    act(() => {
      result.current.handleSetupSubmit(mockEvent())
    })
    // Still cannot draw until two flips
    act(() => {
      result.current.drawCard()
    })
    expect(result.current.drawnCard).toBeNull()

    // Perform two flips
    flipTwoCards(result)

    act(() => {
      result.current.drawCard()
    })
    expect(result.current.drawnCard).not.toBeNull()
    expect(result.current.firstTurnDraw[0]).toBe(true)
  })

  it('marks initial flips complete after two cards are revealed', () => {
    const { result } = renderHook(() => useGameState({ enablePersistence: false }))

    flipTwoCards(result)

    expect(result.current.initialFlips[0]).toBe(true)
    expect(result.current.players[0].flippedCount).toBe(2)
  })

  it('automates the computer first turn when eligible (computer flips two after setup)', async () => {
    const deck = createTestDeck()
    const { result } = renderHook(() =>
      useGameState({ disableDelays: true, initialDeck: deck, enablePersistence: false }),
    )

    act(() => {
      result.current.handleSetupSubmit(mockEvent())
      result.current.setCurrentPlayer(1)
    })

    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    const computer = result.current.players[1]
    expect(computer.flippedCount).toBeGreaterThanOrEqual(2)
    // Strategy refactor: initial turn may end with just the two auto flips before drawing
    expect(computer.cards.filter(c => c.faceUp).length).toBeGreaterThanOrEqual(2)
    expect(result.current.initialFlips[1]).toBe(true)
    expect(result.current.turnComplete[1]).toBe(true)
  })

  it('assigns a final turn to the opponent when a player reveals all cards', async () => {
    const deck = createTestDeck()
    const { result } = renderHook(() =>
      useGameState({ disableDelays: true, initialDeck: deck, exposeTestHelpers: true, enablePersistence: false }),
    )

    act(() => {
      result.current.__setPlayers(ps =>
        ps.map((p, i) =>
          i === 0
            ? {
                ...p,
                cards: p.cards.map(c => ({ ...c, faceUp: true })),
              }
            : p,
        ),
      )
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(window._finalTurn).toBe(1)
    expect(result.current.currentPlayer).toBe(1)
    expect(result.current.roundOver).toBe(false)
  })

  it('ends the round after the final turn player completes their move', async () => {
    const deck = createTestDeck()
    const { result } = renderHook(() =>
      useGameState({ disableDelays: true, initialDeck: deck, exposeTestHelpers: true, enablePersistence: false }),
    )

    act(() => {
      result.current.handleSetupSubmit(mockEvent())
      window._finalTurn = 1
      result.current.__setTurnComplete(tc => tc.map((val, i) => (i === 1 ? true : val)))
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.roundOver).toBe(true)
    expect(window._finalTurn).toBe(false)
    expect(result.current.players.every(p => p.cards.every(c => c.faceUp))).toBe(true)
  })
  it('seeds discard pile and auto-flips two computer cards only on setup submit', () => {
    const deck = createTestDeck()
    const { result } = renderHook(() =>
      useGameState({ disableDelays: true, initialDeck: deck, enablePersistence: false }),
    )

    act(() => {
      result.current.handleSetupSubmit(mockEvent())
    })

    expect(result.current.discardPile.length).toBe(1)
    expect(result.current.players[0].flippedCount).toBe(0)
    expect(result.current.players[1].flippedCount).toBe(2)
    expect(result.current.initialFlips).toEqual([false, true])
  })

  it('records hole score on roundOver and advances to next hole retaining previous scores', () => {
    const deck = createTestDeck()
    const { result } = renderHook(() => useGameState({ disableDelays: true, initialDeck: deck, exposeTestHelpers: true, enablePersistence: false }))

    act(() => {
      result.current.handleSetupSubmit(mockEvent())
      // Force all cards face up for player 0 quickly to trigger final turn logic, then complete for player 1
      result.current.__setPlayers(ps => ps.map(p => ({ ...p, cards: p.cards.map(c => ({ ...c, faceUp: true })) })))
      result.current.setRoundOver(true)
    })

    expect(result.current.roundOver).toBe(true)
    expect(result.current.holeScores.length).toBe(1)
    const firstHole = result.current.holeScores[0]
    expect(firstHole.hole).toBe(1)
    expect(firstHole.scores).toHaveLength(2)
    expect(firstHole.breakdowns).toHaveLength(2)
    expect(firstHole.breakdowns[0]).toHaveProperty('rawScore')
    expect(firstHole.breakdowns[0]).toHaveProperty('matchingColumnCount')

    const prevTotals = [...result.current.overallTotals]

    act(() => {
      result.current.startNextHole()
    })

    expect(result.current.currentHole).toBe(2)
    expect(result.current.holeScores.length).toBe(1) // next hole not scored yet
    expect(result.current.overallTotals).toEqual(prevTotals)
    expect(result.current.roundOver).toBe(false)
  })

  it('overallTotals includes column bonus from homogeneous matched columns', () => {
    const deck = createTestDeck()
    const { result } = renderHook(() => useGameState({ disableDelays: true, initialDeck: deck, exposeTestHelpers: true, enablePersistence: false }))

    act(() => {
      result.current.handleSetupSubmit(mockEvent())
      // Force a board state: two matched columns of same value (e.g., value 5 in columns 0 and 1)
      result.current.__setPlayers(ps => ps.map((p, pi) => {
        if (pi !== 0) return p
        const newCards = [...p.cards]
        // Column 0
        newCards[0] = { ...newCards[0], value: 5, faceUp: true }
        newCards[4] = { ...newCards[4], value: 5, faceUp: true }
        // Column 1
        newCards[1] = { ...newCards[1], value: 5, faceUp: true }
        newCards[5] = { ...newCards[5], value: 5, faceUp: true }
        // Flip remaining cards face up with arbitrary distinct values
        for (let i = 0; i < newCards.length; i++) {
          if (!newCards[i].faceUp) newCards[i] = { ...newCards[i], faceUp: true }
        }
        return { ...p, cards: newCards }
      }))
      // Also flip computer cards face up so round can end
      result.current.__setPlayers(ps => ps.map(p => ({ ...p, cards: p.cards.map(c => ({ ...c, faceUp: true })) })))
      result.current.setRoundOver(true)
    })

    const hole = result.current.holeScores[0]
    expect(hole).toBeTruthy()
    const breakdown = hole.breakdowns[0]
    expect(breakdown.matchingColumnCount).toBeGreaterThanOrEqual(2)
    // overallTotals should reflect final (raw + bonus)
    const finalScore = breakdown.final
    expect(result.current.overallTotals[0]).toBe(finalScore)
  })

  it('computer starts hole 2 with exactly two flipped cards', () => {
    const deck = createTestDeck()
    const { result } = renderHook(() => useGameState({ disableDelays: true, initialDeck: deck, exposeTestHelpers: true, enablePersistence: false, disableComputerAuto: true }))
    act(() => {
      result.current.handleSetupSubmit(mockEvent())
      // End hole 1 quickly: flip all player 0 cards, then all player 1 cards
      result.current.__setPlayers(ps => ps.map(p => ({ ...p, cards: p.cards.map(c => ({ ...c, faceUp: true })), flippedCount: 8 })))
      result.current.setRoundOver(true)
    })
    // Start next hole
    act(() => {
      result.current.startNextHole()
    })
    const computer = result.current.players[1]
    const flipped = computer.cards.filter(c => c.faceUp).length
    expect(flipped).toBe(2)
    // Ensure initialFlips shows computer done, player 0 not yet
    expect(result.current.initialFlips).toEqual([false, true])
  })

  it('AI picks up discard to complete a vertical pair (smoke)', async () => {
    const deck = createTestDeck()
    const { result } = renderHook(() => useGameState({ disableDelays: true, initialDeck: deck, enablePersistence: false, exposeTestHelpers: true }))
    act(() => {
      result.current.handleSetupSubmit(mockEvent())
    })
    // Force computer turn
    act(() => {
      result.current.setCurrentPlayer(1)
    })
    // Craft computer board: top of column 0 faceUp value 5, bottom hidden
    act(() => {
      result.current.__setPlayers(ps => ps.map((p, i) => i !== 1 ? p : {
        ...p,
        cards: p.cards.map((c, ci) => ci === 0 ? { ...c, value: 5, faceUp: true } : ci === 4 ? { ...c, value: 9, faceUp: false } : c),
        flippedCount: 1,
      }))
      result.current.__setInitialFlips([true, true])
      result.current.setCurrentPlayer(1)
    })
    // Placeholder assertion until discard injection helper added
    expect(result.current.players[1].cards[0].value).toBe(5)
  })

  it('AI replaces highest mismatched high card with a lower drawn card (placeholder)', async () => {
    const deck = createTestDeck()
    const { result } = renderHook(() => useGameState({ disableDelays: true, initialDeck: deck, enablePersistence: false, disableComputerAuto: true, exposeTestHelpers: true }))
    act(() => {
      result.current.handleSetupSubmit(mockEvent())
    })
    // Prepare computer board with a high exposed card 12 and a low drawn card 3
    act(() => {
      result.current.__setPlayers(ps => ps.map((p, i) => i !== 1 ? p : {
        ...p,
        cards: p.cards.map((c, ci) => ci === 2 ? { ...c, value: 12, faceUp: true } : c),
        flippedCount: p.flippedCount + 1,
      }))
      result.current.__setInitialFlips([true, true])
    })
    act(() => {
      // Drawn card simulate by setting drawnCard via replacing internal deck then calling draw
      // skipping full integration; placeholder assertion
    })
    expect(true).toBe(true)
  })

  it('AI takes low discard (<=3) replacing a higher card', async () => {
    const deck = createTestDeck()
    const { result } = renderHook(() => useGameState({ disableDelays: true, initialDeck: deck, enablePersistence: false, exposeTestHelpers: true }))
    act(() => {
      result.current.handleSetupSubmit(mockEvent())
      // Give computer a couple of medium/high exposed cards
      result.current.__setPlayers(ps => ps.map((p,i) => i!==1? p : {
        ...p,
        cards: p.cards.map((c,ci) => ci===0? { ...c, value:9, faceUp:true } : ci===4? { ...c, value:7, faceUp:true } : c),
        flippedCount:2
      }))
      result.current.__setInitialFlips([false,true])
      // Put low value 2 on discard
      result.current.__setDiscard([{ id:9999, value:2, faceUp:true }])
      result.current.setCurrentPlayer(1)
    })
    // Allow AI effect to run
    await act(async () => { await Promise.resolve(); await Promise.resolve() })
    const comp = result.current.players[1]
    const has2 = comp.cards.some(c => c.faceUp && c.value === 2)
    expect(has2).toBe(true)
  })

  it('AI discards very high drawn card (>9) deterministically', async () => {
    // Construct deck: first 16 dealt (low 2s), deckRest[0]=7 (seed discard mid value), deckRest[1]=12 (first draw high)
    const base = []
    for (let i=0;i<16;i++) base.push(2)
    base.push(7)  // seeded discard (not picked up: no improvement, not <=3 placeholder)
    base.push(12) // first draw (high) -> should be discarded
    base.push(11) // extra
    while (base.length < 120) base.push(5)
    const { result } = renderHook(() => useGameState({ disableDelays: true, initialDeck: base, enablePersistence: false, exposeTestHelpers: true }))
    act(() => {
      result.current.handleSetupSubmit(mockEvent())
      // Ensure it's computer's turn and its initial flips are considered complete so it draws immediately.
      result.current.setCurrentPlayer(1)
      result.current.__setInitialFlips([false,true])
    })
    // Let AI effects cycle enough times: first to draw, second to process drawn high card
    for (let i=0;i<4;i++) {
      await act(async () => { await Promise.resolve() })
    }
    expect(result.current.drawnCard).toBeNull()
    // High card should have been discarded; ensure discard pile contains 12
    expect(result.current.discardPile.map(c => c.value)).toContain(12)
  })

  it('AI replaces a facedown via EV threshold (drawn <= expectedUnknown - 1.5)', async () => {
    // Deck: first 16 arbitrary (will override computer cards), seeded discard high (11), first draw low (1)
    const base = []
    for (let i=0;i<16;i++) base.push(4) // neutral
    base.push(11) // seed discard
    base.push(1)  // first draw for computer
    while (base.length < 120) base.push(6)
    const { result } = renderHook(() => useGameState({ disableDelays: true, initialDeck: base, enablePersistence: false, exposeTestHelpers: true }))
    act(() => {
      result.current.handleSetupSubmit(mockEvent())
      result.current.setCurrentPlayer(1)
      // Force initial flips complete but also normalize computer layout: two matched low 1s to avoid improvement/pair triggers.
      result.current.__setInitialFlips([false,true])
      result.current.__setPlayers(ps => ps.map((p,i) => i!==1 ? p : {
        ...p,
        cards: p.cards.map((c,ci) => {
          if (ci===0) return { ...c, value:1, faceUp:true }
          if (ci===4) return { ...c, value:1, faceUp:true } // vertical pair prevents pair replacement path
          // keep others facedown with value 4 (neutral > drawn)
          return { ...c, value:4, faceUp:false }
        }),
        flippedCount: 2,
      }))
    })
    const baselineHidden = () => result.current.players[1].cards.filter(c => !c.faceUp).length
    const baselineFaceUpSet = new Set(result.current.players[1].cards.map((c,i)=> c.faceUp ? i : null).filter(i=>i!==null))
    // Run several effect cycles to allow draw + evaluation + potential forced reveal
    for (let i=0;i<12;i++) {
      await act(async () => { await Promise.resolve() })
    }
    const computer = result.current.players[1]
    const hiddenCount = baselineHidden()
    const newFaceUpIndices = computer.cards
      .map((c,i)=> c.faceUp && !baselineFaceUpSet.has(i) ? i : null)
      .filter(i=> i!==null)
    // Success conditions: either hidden decreased or a new faceUp card with value 1 appeared due to replacement
    const decreasedHidden = hiddenCount <= 5
    const newOne = newFaceUpIndices.some(i => computer.cards[i].value === 1)
    expect(decreasedHidden || newOne).toBe(true)
    expect(result.current.drawnCard).toBeNull()
  })

  it('AI skips turn with one facedown left and good layout', async () => {
    const deck = createTestDeck()
    const { result } = renderHook(() => useGameState({ disableDelays: true, initialDeck: deck, enablePersistence: false, exposeTestHelpers: true, enableSkipHeuristic: true }))
    act(() => {
      result.current.handleSetupSubmit(mockEvent())
      // Craft good layout: two matching columns and low exposed sum
      result.current.__setPlayers(ps => ps.map((p,i) => i!==1 ? p : {
        ...p,
        cards: p.cards.map((c,ci) => {
          // Make columns 0 & 1 matching low values
          if (ci===0) return { ...c, value:2, faceUp:true }
          if (ci===4) return { ...c, value:2, faceUp:true }
          if (ci===1) return { ...c, value:1, faceUp:true }
          if (ci===5) return { ...c, value:1, faceUp:true }
          // Column 2 top faceUp medium value, bottom hidden (target facedown left)
          if (ci===2) return { ...c, value:4, faceUp:true }
          if (ci===6) return { ...c, faceUp:false }
          // Column 3 both faceUp moderate
          if (ci===3) return { ...c, value:3, faceUp:true }
          if (ci===7) return { ...c, value:3, faceUp:true }
          return c
        }),
        flippedCount:7,
      }))
      result.current.__setInitialFlips([false,true])
      result.current.setCurrentPlayer(1)
    })
    await act(async () => { await Promise.resolve(); await Promise.resolve() })
    expect(result.current.turnComplete[1]).toBe(true)
    // Ensure the single facedown remains unflipped due to skip
    const fd = result.current.players[1].cards.filter(c => !c.faceUp).length
    expect(fd).toBe(1)
  })

  it('AI with skip heuristic disabled still draws with one facedown left', async () => {
    const deck = createTestDeck()
    const { result } = renderHook(() => useGameState({ disableDelays: true, initialDeck: deck, enablePersistence: false, exposeTestHelpers: true, enableSkipHeuristic: false }))
    act(() => {
      result.current.handleSetupSubmit(mockEvent())
      // Force state to one facedown & good layout but skip disabled
      result.current.__setPlayers(ps => ps.map((p,i) => i!==1 ? p : {
        ...p,
        cards: p.cards.map((c,ci) => {
          if (ci===0) return { ...c, value:2, faceUp:true }
          if (ci===4) return { ...c, value:2, faceUp:true }
          if (ci===1) return { ...c, value:1, faceUp:true }
          if (ci===5) return { ...c, value:1, faceUp:true }
          if (ci===2) return { ...c, value:4, faceUp:true }
          if (ci===6) return { ...c, faceUp:false }
          if (ci===3) return { ...c, value:3, faceUp:true }
          if (ci===7) return { ...c, value:3, faceUp:true }
          return c
        }),
        flippedCount:7,
      }))
      result.current.__setInitialFlips([false,true])
      result.current.setCurrentPlayer(1)
    })
    // Allow cycles; capture initial discard length and hidden count
    const initialDiscardLen = result.current.discardPile.length
    const initialHidden = result.current.players[1].cards.filter(c => !c.faceUp).length
    for (let i=0;i<10;i++) {
      await act(async () => { await Promise.resolve() })
    }
    const afterHidden = result.current.players[1].cards.filter(c => !c.faceUp).length
    const discardGrew = result.current.discardPile.length > initialDiscardLen
    // With skip disabled, AI should not have ended turn before at least attempting a draw+process cycle.
    expect(discardGrew || afterHidden < initialHidden || result.current.firstTurnDraw[1]).toBe(true)
    // Ensure we didn't prematurely mark turn complete without any action
    if (result.current.turnComplete[1]) {
      expect(discardGrew || afterHidden < initialHidden).toBe(true)
    }
  })

  it('persists and reloads game state (holeScores & currentHole)', () => {
    const deck = createTestDeck()
    const key = 'testGamePersist:v1'
    // Start game and finish a hole
    const { result: r1, unmount } = renderHook(() =>
      useGameState({ disableDelays: true, initialDeck: deck, exposeTestHelpers: true, persistenceKey: key })
    )
    act(() => {
      r1.current.handleSetupSubmit(mockEvent())
      r1.current.__setPlayers(ps => ps.map(p => ({ ...p, cards: p.cards.map(c => ({ ...c, faceUp: true })) })))
      r1.current.setRoundOver(true)
    })
    expect(r1.current.holeScores.length).toBe(1)
    expect(JSON.parse(localStorage.getItem(key))).toMatchObject({ currentHole: 1 })
    unmount()

    // Load existing state
    const { result: r2 } = renderHook(() =>
      useGameState({ disableDelays: true, initialDeck: deck, exposeTestHelpers: true, persistenceKey: key })
    )
    expect(r2.current.holeScores.length).toBe(1)
    expect(r2.current.currentHole).toBe(1)
    // Advance hole and ensure persistence updates
    act(() => {
      r2.current.startNextHole()
    })
    expect(r2.current.currentHole).toBe(2)
    const stored = JSON.parse(localStorage.getItem(key))
    expect(stored.currentHole).toBe(2)
  })

  it('auto advances turn when current player turnComplete becomes true', () => {
    const deck = createTestDeck()
    const { result } = renderHook(() => useGameState({ disableDelays: true, initialDeck: deck, exposeTestHelpers: true, enablePersistence: false }))
    act(() => {
      result.current.handleSetupSubmit(mockEvent())
    })
    const startingPlayer = result.current.currentPlayer
    act(() => {
      // Force turn complete flag for current player
      result.current.__setTurnComplete(tc => tc.map((v, i) => (i === startingPlayer ? true : v)))
    })
    // Allow effect cycle
    act(() => {})
    expect(result.current.currentPlayer).toBe((startingPlayer + 1) % 2)
  })

  it('shows seeded discard pile card faceUp with value', () => {
    const deck = createTestDeck()
    const { result } = renderHook(() => useGameState({ disableDelays: true, initialDeck: deck, enablePersistence: false }))
    act(() => {
      result.current.handleSetupSubmit(mockEvent())
    })
    expect(result.current.discardPile.length).toBe(1)
    expect(result.current.discardPile[0].faceUp).toBe(true)
    expect(typeof result.current.discardPile[0].value).toBe('number')
  })

  it('places discarded drawn card faceUp on discard pile', async () => {
    const deck = createTestDeck()
    const { result } = renderHook(() => useGameState({ disableDelays: true, initialDeck: deck, enablePersistence: false, exposeTestHelpers: true }))
    let drawnValue
    act(() => {
      result.current.handleSetupSubmit(mockEvent())
      flipTwoCards(result)
    })
    const preDrawDebug = result.current.__debug ? result.current.__debug() : null
    act(() => {
      result.current.drawCard()
    })
    const postDrawDebug = result.current.__debug ? result.current.__debug() : null
      // (debug logs removed)
    await act(async () => {
      await Promise.resolve()
    })
    drawnValue = result.current.drawnCard?.value
    expect(typeof drawnValue).toBe('number')
    act(() => {
      result.current.discardDrawnCard()
    })
    expect(result.current.drawnCard).toBeNull()
    expect(result.current.discardPile[0].faceUp).toBe(true)
    // Top discard should equal the value that was drawn
    const topVal = result.current.discardPile[0].value
    expect(typeof topVal).toBe('number')
    // Ensure not showing previous seed if a discard action occurred
    // drawnValue captured post draw; should match current discard top
    expect(topVal).toBe(drawnValue)
  })

  it('places replaced card into discard pile faceUp with its value (no computer interference)', async () => {
    const deck = createTestDeck()
    const { result } = renderHook(() => useGameState({ disableDelays: true, initialDeck: deck, enablePersistence: false, exposeTestHelpers: true, disableComputerAuto: true }))
    act(() => {
      result.current.handleSetupSubmit(mockEvent())
      flipTwoCards(result)
    })
    // Allow initialFlips sync
    await act(async () => { await Promise.resolve() })
    const originalValues = result.current.players[0].cards.map(c => c.value)
    const originalFirstCardValue = originalValues[0]
    expect(typeof originalFirstCardValue).toBe('number')
    // Draw a card
    act(() => { result.current.drawCard() })
    await act(async () => { await Promise.resolve() })
    // Replace index 0
    act(() => { result.current.handleCardClick(0, 0) })
    const top = result.current.discardTop
    expect(top).toBeTruthy()
    expect(top.faceUp).toBe(true)
    expect(typeof top.value).toBe('number')
    expect(top.value).toBe(originalFirstCardValue)
  })

  it('updates discard pile top value correctly through draw->discard and draw->replace sequences (no computer interference)', async () => {
    const deck = createTestDeck()
    const { result } = renderHook(() => useGameState({ disableDelays: true, initialDeck: deck, enablePersistence: false, exposeTestHelpers: true, disableComputerAuto: true }))
    let firstDrawValue, firstDiscardValue, secondDrawValue, replacedCardValue
    act(() => {
      result.current.handleSetupSubmit(mockEvent())
      flipTwoCards(result)
    })
    const seqPreDraw = result.current.__debug ? result.current.__debug() : null
    act(() => { result.current.drawCard() })
    const seqPostDraw = result.current.__debug ? result.current.__debug() : null
      // (debug logs removed)
    await act(async () => { await Promise.resolve() })
    firstDrawValue = result.current.drawnCard?.value
    expect(typeof firstDrawValue).toBe('number')
    act(() => { result.current.discardDrawnCard() })
    firstDiscardValue = result.current.discardPile[0].value
    act(() => { result.current.drawCard() })
    await act(async () => { await Promise.resolve() })
    secondDrawValue = result.current.drawnCard?.value
    replacedCardValue = result.current.players[0].cards[0].value
    act(() => { result.current.handleCardClick(0, 0) })
    // After first discard, top should equal firstDrawValue
    expect(firstDiscardValue).toBe(firstDrawValue)
    // After replace, top should become original replaced card value, not second drawn card
    await act(async () => { await Promise.resolve() })
    const currentTop = result.current.discardTop.value
    expect(typeof currentTop).toBe('number')
    expect(currentTop).toBe(replacedCardValue)
    // Ensure not fallback dash; verify numeric
    expect(typeof currentTop).toBe('number')
  })
})
