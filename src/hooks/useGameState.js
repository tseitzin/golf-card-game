import { useState, useEffect, useMemo, useCallback } from 'react'
import { calculateVisibleScore, calculateScore, explainScore } from '../utils/score'

const DECK_COPY_COUNT = 8
const COLUMN_COUNT = 4
// Deck composition reference counts for expectation calculations
const BASE_COUNTS = (() => {
  const m = new Map()
  for (let v = 0; v <= 12; v++) m.set(v, 8)
  m.set(-5, 4)
  return m
})()

function computeExpectedUnknownValue(players, discardPile, drawnCard) {
  const remaining = new Map(BASE_COUNTS)
  const dec = val => {
    if (remaining.has(val)) remaining.set(val, Math.max(0, remaining.get(val) - 1))
  }
  players.forEach(p => p.cards.forEach(c => { if (c.faceUp) dec(c.value) }))
  discardPile.forEach(c => dec(c.value))
  if (drawnCard) dec(drawnCard.value)
  let total = 0, count = 0
  remaining.forEach((cnt, val) => { total += val * cnt; count += cnt })
  return count === 0 ? 0 : total / count
}

function buildDeck() {
  const values = []
  for (let i = 0; i < DECK_COPY_COUNT; i++) {
    for (let v = 0; v <= 12; v++) {
      values.push(v)
    }
  }
  for (let i = 0; i < 4; i++) {
    values.push(-5)
  }
  const shuffled = values.sort(() => Math.random() - 0.5)
  return shuffled.map((value, index) => ({ id: index, value, faceUp: false }))
}

export function useGameState(config = {}) {
  const {
    initialDeck,
    disableDelays = false,
    stepDelay: stepDelayOverride,
    exposeTestHelpers = false,
    enablePersistence = true,
    persistenceKey = 'golfGameState:v1',
    disableComputerAuto = false,
    enableSkipHeuristic = false,
  } = config

  const deck = useMemo(() => {
    if (initialDeck && initialDeck.length) {
      return initialDeck.map((value, index) => ({ id: index, value, faceUp: false }))
    }
    return buildDeck()
  }, [initialDeck])
  const [playerSetup, setPlayerSetup] = useState([
    { name: '', color: '#fbbf24' },
    { name: '', color: '#38bdf8' },
  ])
  const [setupComplete, setSetupComplete] = useState(false)
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [players, setPlayers] = useState(() => [
    { cards: deck.slice(0, 8).map(c => ({ ...c, faceUp: false })), flippedCount: 0 },
    { cards: deck.slice(8, 16).map(c => ({ ...c, faceUp: false })), flippedCount: 0 },
  ])
  const [deckRest, setDeckRest] = useState(deck.slice(16))
  const [drawnCard, setDrawnCard] = useState(null)
  const [discardPile, setDiscardPile] = useState([])
  const [discardTop, setDiscardTop] = useState(null)
  const [initialFlips, setInitialFlips] = useState([false, false])
  const [firstTurnDraw, setFirstTurnDraw] = useState([false, false])
  const [turnComplete, setTurnComplete] = useState([false, false])
  const [mustFlipAfterDiscard, setMustFlipAfterDiscard] = useState([false, false])
  const [roundOver, setRoundOver] = useState(false)
  const [currentHole, setCurrentHole] = useState(1) // 1..9
  const [holeScores, setHoleScores] = useState([]) // array of { hole, scores: [p0, p1] }

  const handleSetupChange = useCallback((idx, field, value) => {
    setPlayerSetup(prev => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)))
  }, [])

  const handleSetupSubmit = useCallback(e => {
    e.preventDefault()
    // Seed discard pile with top card before gameplay starts.
    if (discardTop == null && deckRest.length > 0) {
      const [top, ...rest] = deckRest
      setDeckRest(rest)
      const seed = { ...top, faceUp: true }
      setDiscardTop(seed)
      setDiscardPile([seed])
    }
    // Auto-flip two random cards for computer (player index 1) only; human selects manually.
    setPlayers(prev =>
      prev.map((p, i) => {
        if (i !== 1) return p
        let hiddenIdxs = p.cards.map((c, ci) => ci).filter(ci => !p.cards[ci].faceUp)
        const toFlip = []
        for (let f = 0; f < 2 && hiddenIdxs.length > 0; f++) {
          const pick = hiddenIdxs.splice(Math.floor(Math.random() * hiddenIdxs.length), 1)[0]
          toFlip.push(pick)
        }
        return {
          ...p,
          cards: p.cards.map((c, ci) => (toFlip.includes(ci) ? { ...c, faceUp: true } : c)),
          flippedCount: p.flippedCount + toFlip.length,
        }
      }),
    )
    setInitialFlips([false, true])
    setSetupComplete(true)
  }, [deckRest])

  const drawCard = useCallback(() => {
    // Prevent drawing before setup is complete (initial simultaneous flips & discard seed must occur first)
    if (!setupComplete) return
    // Require player to have completed their two initial flips.
    if (!initialFlips[currentPlayer]) return
    if (drawnCard || deckRest.length === 0) return
    // After setup, players may draw even if it's first flip phase already done; we still enforce one draw per turn.
    if (firstTurnDraw[currentPlayer] || turnComplete[currentPlayer]) return
    const [top, ...rest] = deckRest
    setDrawnCard(top)
    setDeckRest(rest)
    setFirstTurnDraw(prev => prev.map((v, i) => (i === currentPlayer ? true : v)))
  }, [currentPlayer, deckRest, drawnCard, firstTurnDraw, turnComplete, setupComplete, initialFlips])

  const discardDrawnCard = useCallback(() => {
    if (!drawnCard || turnComplete[currentPlayer]) return
    const toDiscard = { ...drawnCard, faceUp: true }
    setDiscardPile(prev => [toDiscard, ...prev])
    setDiscardTop(toDiscard)
    setDrawnCard(null)
    const faceDownCount = players[currentPlayer].cards.filter(c => !c.faceUp).length
    if (faceDownCount === 1) {
      setTurnComplete(prev => prev.map((v, i) => (i === currentPlayer ? true : v)))
      setMustFlipAfterDiscard(prev => prev.map((v, i) => (i === currentPlayer ? false : v)))
      setFirstTurnDraw(prev => prev.map((v, i) => (i === currentPlayer ? false : v)))
    } else {
      setMustFlipAfterDiscard(prev => prev.map((v, i) => (i === currentPlayer ? true : v)))
      setFirstTurnDraw(prev => prev.map((v, i) => (i === currentPlayer ? false : v)))
    }
  }, [currentPlayer, drawnCard, players, turnComplete])

  const pickUpDiscard = useCallback(() => {
    if (drawnCard || discardPile.length === 0 || turnComplete[currentPlayer]) return
    const top = discardPile[0]
    setDrawnCard({ ...top, faceUp: true })
    setDiscardPile(prev => prev.slice(1))
    setDiscardTop(prev => (discardPile.length > 1 ? discardPile[1] : null))
    setMustFlipAfterDiscard(prev => prev.map((v, i) => (i === currentPlayer ? false : v)))
  }, [currentPlayer, discardPile, drawnCard, turnComplete])

  const replaceCard = useCallback(
    idx => {
      if (!drawnCard || turnComplete[currentPlayer]) return
      // Capture current card to be replaced from players state directly
      const currentCard = players[currentPlayer].cards[idx]
      setPlayers(prev =>
        prev.map((p, i) =>
          i === currentPlayer
            ? {
                ...p,
                cards: p.cards.map((c, j) => (j === idx ? { ...drawnCard, faceUp: true } : c)),
              }
            : p,
        ),
      )
      if (currentCard) {
        const discarded = { ...currentCard, faceUp: true }
        setDiscardPile(prev => [discarded, ...prev])
        setDiscardTop(discarded)
      }
      setDrawnCard(null)
      setFirstTurnDraw(prev => prev.map((v, i) => (i === currentPlayer ? false : v)))
      setMustFlipAfterDiscard(prev => prev.map((v, i) => (i === currentPlayer ? false : v)))
      setTurnComplete(prev => prev.map((v, i) => (i === currentPlayer ? true : v)))
    },
    [currentPlayer, drawnCard, turnComplete, players],
  )

  const handleCardClick = useCallback(
    (playerIndex, cardIndex) => {
      if (currentPlayer !== playerIndex) return
      const player = players[playerIndex]
      const card = player.cards[cardIndex]
      if (!card) return

      if (mustFlipAfterDiscard[playerIndex] && !card.faceUp && !turnComplete[playerIndex] && !drawnCard) {
        setPlayers(prev =>
          prev.map((p, i) => {
            if (i !== playerIndex) return p
            return {
              ...p,
              cards: p.cards.map((c, j) => (j === cardIndex ? { ...c, faceUp: true } : c)),
              flippedCount: p.flippedCount + 1,
            }
          }),
        )
        setMustFlipAfterDiscard(prev => prev.map((v, i) => (i === playerIndex ? false : v)))
        setFirstTurnDraw(prev => prev.map((v, i) => (i === playerIndex ? false : v)))
        setTurnComplete(prev => prev.map((v, i) => (i === playerIndex ? true : v)))
        return
      }

      if (!initialFlips[playerIndex] && player.flippedCount < 2 && !drawnCard && !card.faceUp && !turnComplete[playerIndex]) {
        setPlayers(prev =>
          prev.map((p, i) => {
            if (i !== playerIndex) return p
            return {
              ...p,
              cards: p.cards.map((c, j) => (j === cardIndex ? { ...c, faceUp: true } : c)),
              flippedCount: p.flippedCount + 1,
            }
          }),
        )
        if (player.flippedCount + 1 === 2) {
          setInitialFlips(prev => prev.map((v, i) => (i === playerIndex ? true : v)))
        }
        return
      }

      if (drawnCard && initialFlips[playerIndex] && !turnComplete[playerIndex]) {
        replaceCard(cardIndex)
      }
    },
    [currentPlayer, drawnCard, initialFlips, mustFlipAfterDiscard, players, replaceCard, turnComplete],
  )

  const canInteractWithCard = useCallback(
    (playerIndex, cardIndex) => {
      if (currentPlayer !== playerIndex) return false
      const player = players[playerIndex]
      const card = player.cards[cardIndex]
      if (!card || card.faceUp) return false
      if (mustFlipAfterDiscard[playerIndex] && !turnComplete[playerIndex] && !drawnCard) return true
      if (!initialFlips[playerIndex] && player.flippedCount < 2 && !drawnCard && !turnComplete[playerIndex]) return true
      if (drawnCard && initialFlips[playerIndex] && !turnComplete[playerIndex]) return true
      return false
    },
    [currentPlayer, drawnCard, initialFlips, mustFlipAfterDiscard, players, turnComplete],
  )

  useEffect(() => {
    setTurnComplete(tc => tc.map((val, i) => (i === currentPlayer ? false : val)))
    setFirstTurnDraw(arr => arr.map((v, i) => (i === currentPlayer ? false : v)))
    setMustFlipAfterDiscard(arr => arr.map((v, i) => (i === currentPlayer ? false : v)))
  }, [currentPlayer])

  // Ensure initialFlips flags remain consistent if flippedCount reaches 2 after setup change sequencing.
  useEffect(() => {
    setInitialFlips(prev => prev.map((v, i) => (v || players[i].flippedCount >= 2)))
  }, [players])

  const delay = useCallback(
    ms => (disableDelays ? Promise.resolve() : new Promise(resolve => setTimeout(resolve, ms))),
    [disableDelays],
  )
  const stepDelay = stepDelayOverride ?? 1200

  const computerTurn = useCallback(async () => {
    if (!setupComplete || currentPlayer !== 1 || roundOver) return
    const cards = players[1].cards

    // Initial two flips if not done yet
    if (!initialFlips[1] && players[1].flippedCount === 0) {
      let hidden = cards.map((c, i) => (!c.faceUp ? i : -1)).filter(i => i !== -1)
      for (let f = 0; f < 2; f++) {
        if (hidden.length === 0) break
        const idx = hidden[Math.floor(Math.random() * hidden.length)]
        setPlayers(ps => ps.map((p, pi) => (pi === 1 ? { ...p, cards: p.cards.map((c, ci) => (ci === idx ? { ...c, faceUp: true } : c)), flippedCount: p.flippedCount + 1 } : p)))
        hidden = hidden.filter(i => i !== idx)
        await delay(stepDelay)
      }
      setInitialFlips(f => f.map((v, i) => (i === 1 ? true : v)))
    }

    // Evaluate skip heuristic BEFORE considering discard pickup or drawing: if exactly one facedown remains, consider skipping to avoid triggering final round prematurely.
    const faceDownRemaining = cards.filter(c => !c.faceUp).length
    if (enableSkipHeuristic && faceDownRemaining === 1 && !drawnCard && !turnComplete[1]) {
      let exposedSum = 0
      let matchColumns = 0
      for (let col = 0; col < COLUMN_COUNT; col++) {
        const a = cards[col]
        const b = cards[col + COLUMN_COUNT]
        if (a.faceUp && b.faceUp && a.value === b.value) matchColumns++
        if (a.faceUp && !(b.faceUp && a.value === b.value)) exposedSum += a.value
        if (b.faceUp && !(a.faceUp && a.value === b.value)) exposedSum += b.value
      }
      const layoutGood = matchColumns >= 1 && exposedSum <= 18
      if (layoutGood) {
        setTurnComplete(tc => tc.map((v,i) => (i===1 ? true : v)))
        return
      }
    }

    // Helper: evaluate top discard usefulness before drawing
    const evaluateDiscard = topDiscard => {
      if (!topDiscard) return null
      // Priority order: complete pair; improve high card; low placeholder
      for (let col = 0; col < COLUMN_COUNT; col++) {
        const a = col
        const b = col + COLUMN_COUNT
        if (cards[a].faceUp && !cards[b].faceUp && cards[a].value === topDiscard.value) return { idx: b, reason: 'pair' }
        if (cards[b].faceUp && !cards[a].faceUp && cards[b].value === topDiscard.value) return { idx: a, reason: 'pair' }
      }
      // Improve high card (avoid matched pairs)
      let best = null
      for (let i = 0; i < cards.length; i++) {
        const pairIdx = i < COLUMN_COUNT ? i + COLUMN_COUNT : i - COLUMN_COUNT
        const isPair = cards[i].faceUp && cards[pairIdx].faceUp && cards[i].value === cards[pairIdx].value
        if (cards[i].faceUp && !isPair && topDiscard.value < cards[i].value) {
          const gain = cards[i].value - topDiscard.value
          if (!best || gain > best.gain) best = { idx: i, gain, reason: 'improve' }
        }
      }
      if (best) return best
      // Low placeholder if very low value and any hidden remains
      if (topDiscard.value <= 3) {
        const hiddenIdx = cards.findIndex(c => !c.faceUp)
        if (hiddenIdx !== -1) {
          // Avoid consuming the final facedown as a mere placeholder if skip heuristic disabled; prefer drawing for evaluation
          if (faceDownRemaining === 1 && !enableSkipHeuristic) return null
          return { idx: hiddenIdx, reason: 'placeholder' }
        }
      }
      return null
    }

    if (!drawnCard && initialFlips[1] && !turnComplete[1] && discardPile.length > 0) {
      const decision = evaluateDiscard(discardPile[0])
      if (decision) {
        await delay(250)
        pickUpDiscard()
        await delay(250)
        replaceCard(decision.idx)
        return
      }
    }

    // Draw if not yet drawn this turn (after potential skip decision)
    if (!firstTurnDraw[1] && initialFlips[1] && !drawnCard) {
      await delay(stepDelay)
      drawCard()
      return
    }

    // If only one faceDown and we have drawn, decide finalize
    // (faceDownRemaining already computed above)
    if (faceDownRemaining === 1 && drawnCard) {
      const lastIdx = cards.findIndex(c => !c.faceUp)
      const pairIdx = lastIdx < COLUMN_COUNT ? lastIdx + COLUMN_COUNT : lastIdx - COLUMN_COUNT
      if (cards[pairIdx].faceUp && (drawnCard.value === cards[pairIdx].value || drawnCard.value < cards[pairIdx].value)) {
        await delay(300)
        replaceCard(lastIdx)
      } else {
        await delay(300)
        discardDrawnCard()
      }
      return
    }

    // Handle a drawn card strategically with heuristics & EV
    if (drawnCard && !turnComplete[1]) {
      // 1. Complete a vertical pair immediately
      for (let col = 0; col < COLUMN_COUNT; col++) {
        const a = col
        const b = col + COLUMN_COUNT
        if (cards[a].faceUp && cards[a].value === drawnCard.value && !cards[b].faceUp) {
          await delay(250); replaceCard(b); return
        }
        if (cards[b].faceUp && cards[b].value === drawnCard.value && !cards[a].faceUp) {
          await delay(250); replaceCard(a); return
        }
      }
      const expectedUnknown = computeExpectedUnknownValue(players, discardPile, drawnCard)
      // 2. High card discard heuristic
      if (drawnCard.value > 9) {
        await delay(250)
        discardDrawnCard()
        return
      }
      // 3. Improve a high exposed card (avoid matched pairs)
      let targetIdx = -1
      let bestGain = 0
      for (let i = 0; i < cards.length; i++) {
        const pairIdx = i < COLUMN_COUNT ? i + COLUMN_COUNT : i - COLUMN_COUNT
        const isPair = cards[i].faceUp && cards[pairIdx].faceUp && cards[i].value === cards[pairIdx].value
        if (cards[i].faceUp && !isPair && drawnCard.value < cards[i].value) {
          const gain = cards[i].value - drawnCard.value
          if (gain > bestGain) { bestGain = gain; targetIdx = i }
        }
      }
      if (targetIdx !== -1 && drawnCard.value <= 9) {
        await delay(250); replaceCard(targetIdx); return
      }
      // 4. Replace a facedown if drawn is significantly better than expectation
      if (drawnCard.value <= expectedUnknown - 1.5) {
        const hiddenIdx = cards.findIndex(c => !c.faceUp)
        if (hiddenIdx !== -1) { await delay(250); replaceCard(hiddenIdx); return }
      }
      // 5. Reveal info: replace first hidden
      const hiddenIdx = cards.findIndex(c => !c.faceUp)
      if (hiddenIdx !== -1) { await delay(250); replaceCard(hiddenIdx); return }
      // 6. Nothing beneficial -> discard
      await delay(250); discardDrawnCard(); return
    }

    // Must flip after discard (forced reveal)
    if (mustFlipAfterDiscard[1]) {
      let bestIdx = -1
      for (let col = 0; col < COLUMN_COUNT; col++) {
        const a = col
        const b = col + COLUMN_COUNT
        if (!cards[a].faceUp && cards[b].faceUp) {
          bestIdx = a
          break
        }
        if (!cards[b].faceUp && cards[a].faceUp) {
          bestIdx = b
          break
        }
      }
      if (bestIdx === -1) bestIdx = cards.findIndex(c => !c.faceUp)
      if (bestIdx !== -1) {
        await delay(250)
        setPlayers(ps => ps.map((p, pi) => (pi === 1 ? { ...p, cards: p.cards.map((c, j) => (j === bestIdx ? { ...c, faceUp: true } : c)), flippedCount: p.flippedCount + 1 } : p)))
        setMustFlipAfterDiscard(a => a.map((v, i) => (i === 1 ? false : v)))
        setFirstTurnDraw(a => a.map((v, i) => (i === 1 ? false : v)))
        setTurnComplete(tc => tc.map((v, i) => (i === 1 ? true : v)))
      }
      return
    }

    // Fallback: draw if turn still open
    if (!turnComplete[1] && !drawnCard && initialFlips[1]) {
      await delay(stepDelay)
      drawCard()
    }
  }, [
    currentPlayer,
    discardDrawnCard,
    discardPile,
    drawCard,
    drawnCard,
    firstTurnDraw,
    initialFlips,
    mustFlipAfterDiscard,
    pickUpDiscard,
    players,
    replaceCard,
    roundOver,
    setupComplete,
    stepDelay,
    delay,
    turnComplete,
  ])

  useEffect(() => {
    if (disableComputerAuto) return
    if (setupComplete && currentPlayer === 1 && !roundOver) {
      computerTurn()
    }
  }, [computerTurn, currentPlayer, roundOver, setupComplete, disableComputerAuto])

  useEffect(() => {
    if (roundOver) return
    const playerFlippedAll = players.map(p => p.cards.every(c => c.faceUp))
    if (!window._finalTurn && (playerFlippedAll[0] || playerFlippedAll[1])) {
      if (playerFlippedAll[currentPlayer]) {
        const other = currentPlayer === 0 ? 1 : 0
        if (players[other].cards.some(c => !c.faceUp)) {
          window._finalTurn = other
          setCurrentPlayer(other)
          return
        }
        setPlayers(ps =>
          ps.map(p => ({
            ...p,
            cards: p.cards.map(c => (c.faceUp ? c : { ...c, faceUp: true })),
          })),
        )
        setRoundOver(true)
        window._finalTurn = false
        return
      }
    }
    if (typeof window._finalTurn === 'number' && turnComplete[window._finalTurn]) {
      setPlayers(ps =>
        ps.map(p => ({
          ...p,
          cards: p.cards.map(c => (c.faceUp ? c : { ...c, faceUp: true })),
        })),
      )
      setRoundOver(true)
      window._finalTurn = false
    }
  }, [currentPlayer, players, roundOver, turnComplete])

  // Auto-advance turn when a player's turn completes and not in final turn resolution.
  useEffect(() => {
    if (roundOver) return
    // Skip auto-advance if final turn indicator is active
    if (typeof window._finalTurn === 'number') return
    // If current player's turnComplete is true, advance to next.
    if (turnComplete[currentPlayer]) {
      const next = (currentPlayer + 1) % players.length
      setCurrentPlayer(next)
    }
  }, [turnComplete, currentPlayer, players.length, roundOver])

  // When roundOver toggles to true, finalize hole scores.
  useEffect(() => {
    if (!roundOver) return
    // Ensure all cards face up
    const finalBreakdowns = players.map(p => explainScore(p.cards.map(c => ({ ...c, faceUp: true }))))
    const finalScores = finalBreakdowns.map(b => b.final)
    setHoleScores(prev => {
      if (prev.some(h => h.hole === currentHole)) return prev // avoid duplicate
      return [...prev, { hole: currentHole, scores: finalScores, breakdowns: finalBreakdowns }]
    })
  }, [roundOver, players, currentHole])

  const overallTotals = holeScores.reduce(
    (acc, h) => acc.map((v, i) => v + (h.scores[i] ?? 0)),
    players.map(() => 0),
  )

  const startNextHole = useCallback(() => {
    if (currentHole >= 9) return
    // Build new deck and redeal
    const newDeck = buildDeck()
    const newPlayers = [
      { cards: newDeck.slice(0, 8).map(c => ({ ...c, faceUp: false })), flippedCount: 0 },
      { cards: newDeck.slice(8, 16).map(c => ({ ...c, faceUp: false })), flippedCount: 0 },
    ]
    setPlayers(newPlayers)
    setDeckRest(newDeck.slice(16))
    setDrawnCard(null)
    setDiscardPile([])
    setInitialFlips([false, false])
    setFirstTurnDraw([false, false])
    setTurnComplete([false, false])
    setMustFlipAfterDiscard([false, false])
    setRoundOver(false)
    window._finalTurn = false
    setCurrentHole(h => h + 1)
    // Synchronously auto flip two computer cards like initial setup
    setPlayers(prev =>
      prev.map((p, i) => {
        if (i !== 1) return p
        let hiddenIdxs = p.cards.map((c, ci) => ci).filter(ci => !p.cards[ci].faceUp)
        const toFlip = []
        for (let f = 0; f < 2 && hiddenIdxs.length > 0; f++) {
          const pick = hiddenIdxs.splice(Math.floor(Math.random() * hiddenIdxs.length), 1)[0]
          toFlip.push(pick)
        }
        return {
          ...p,
          cards: p.cards.map((c, ci) => (toFlip.includes(ci) ? { ...c, faceUp: true } : c)),
          flippedCount: p.flippedCount + toFlip.length,
        }
      }),
    )
    setInitialFlips([false, true])
  }, [])

  const visibleScores = players.map(p => calculateVisibleScore(p.cards))

  const testHelpers = exposeTestHelpers
    ? {
        __setPlayers: setPlayers,
        __setInitialFlips: setInitialFlips,
        __setTurnComplete: setTurnComplete,
        __setMustFlipAfterDiscard: setMustFlipAfterDiscard,
        __setDiscard: next => {
          setDiscardPile(prev => {
            const updated = typeof next === 'function' ? next(prev) : next
            setDiscardTop(updated[0] || null)
            return updated
          })
        },
        __debug: () => ({
          setupComplete,
          initialFlips: [...initialFlips],
          drawnCard: !!drawnCard,
          deckRestCount: deckRest.length,
          firstTurnDraw: [...firstTurnDraw],
          turnComplete: [...turnComplete],
          currentPlayer,
          disableComputerAuto,
          enableSkipHeuristic,
        }),
      }
    : {}

  // Persistence: load on mount
  useEffect(() => {
    if (!enablePersistence) return
    try {
      const raw = localStorage.getItem(persistenceKey)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed.version !== 1) return
      // Basic shape validation
      if (!Array.isArray(parsed.players) || !Array.isArray(parsed.holeScores)) return
      setPlayerSetup(parsed.playerSetup || playerSetup)
      setSetupComplete(parsed.setupComplete || false)
      setCurrentPlayer(parsed.currentPlayer || 0)
      setPlayers(parsed.players)
      setDeckRest(parsed.deckRest || [])
      setDrawnCard(parsed.drawnCard || null)
      setDiscardPile(parsed.discardPile || [])
      setDiscardTop(parsed.discardTop || (parsed.discardPile && parsed.discardPile[0]) || null)
      setInitialFlips(parsed.initialFlips || [false, false])
      setFirstTurnDraw(parsed.firstTurnDraw || [false, false])
      setTurnComplete(parsed.turnComplete || [false, false])
      setMustFlipAfterDiscard(parsed.mustFlipAfterDiscard || [false, false])
      setRoundOver(parsed.roundOver || false)
      setCurrentHole(parsed.currentHole || 1)
      setHoleScores(parsed.holeScores || [])
      // overallTotals derived; ignore persisted overallTotals if present
    } catch (e) {
      console.warn('Failed to load saved game state', e)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persistence: save snapshot on relevant state changes
  useEffect(() => {
    if (!enablePersistence) return
    try {
      const snapshot = {
        version: 1,
        playerSetup,
        setupComplete,
        currentPlayer,
        players,
        deckRest,
        drawnCard,
        discardPile,
        discardTop,
        initialFlips,
        firstTurnDraw,
        turnComplete,
        mustFlipAfterDiscard,
        roundOver,
        currentHole,
        holeScores,
      }
      localStorage.setItem(persistenceKey, JSON.stringify(snapshot))
    } catch (e) {
      console.warn('Failed to persist game state', e)
    }
  }, [
    enablePersistence,
    persistenceKey,
    playerSetup,
    setupComplete,
    currentPlayer,
    players,
    deckRest,
    drawnCard,
    discardPile,
    initialFlips,
    firstTurnDraw,
    turnComplete,
    mustFlipAfterDiscard,
    roundOver,
    currentHole,
    holeScores,
  ])

  const clearSavedGame = useCallback(() => {
    try {
      localStorage.removeItem(persistenceKey)
    } catch {}
  }, [persistenceKey])

  return {
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
    mustFlipAfterDiscard,
    roundOver,
    setRoundOver,
    currentHole,
    holeScores,
    overallTotals,
    startNextHole,
    drawCard,
    discardDrawnCard,
    pickUpDiscard,
    replaceCard,
    handleCardClick,
    canInteractWithCard,
    visibleScores,
    clearSavedGame,
    ...testHelpers,
  }
}
