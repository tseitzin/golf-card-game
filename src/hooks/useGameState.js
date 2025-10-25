import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
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

const DEFAULT_COLORS = ['#fbbf24', '#38bdf8', '#f472b6', '#34d399', '#c084fc', '#f97316']

const createSetupEntry = index => ({
  name: '',
  color: DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  isComputer: index === 1,
})

const ensureAtLeastOneHuman = setup => {
  if (setup.some(p => !p.isComputer)) return setup
  if (setup.length === 0) return setup
  const next = [...setup]
  next[0] = { ...next[0], isComputer: false }
  return next
}

const resizeSetup = (setup, count) => {
  let next = setup.slice(0, count)
  if (next.length < count) {
    const additions = Array.from({ length: count - next.length }, (_, offset) => createSetupEntry(next.length + offset))
    next = next.concat(additions)
  }
  return ensureAtLeastOneHuman(next)
}

const dealPlayersFromDeck = (deckSource, count) => {
  const players = []
  for (let i = 0; i < count; i++) {
    const start = i * 8
    const slice = deckSource.slice(start, start + 8)
    players.push({ cards: slice.map(card => ({ ...card, faceUp: false })), flippedCount: 0 })
  }
  const rest = deckSource.slice(count * 8)
  return { players, rest }
}

const autoFlipComputerCards = (player, flips = 2) => {
  const hiddenIdxs = player.cards.map((c, idx) => (!c.faceUp ? idx : -1)).filter(idx => idx !== -1)
  if (hiddenIdxs.length === 0) return player
  const toFlip = []
  const available = [...hiddenIdxs]
  for (let i = 0; i < flips && available.length > 0; i++) {
    const pickIndex = Math.floor(Math.random() * available.length)
    const [choice] = available.splice(pickIndex, 1)
    toFlip.push(choice)
  }
  return {
    ...player,
    cards: player.cards.map((c, idx) => (toFlip.includes(idx) ? { ...c, faceUp: true } : c)),
    flippedCount: player.flippedCount + toFlip.length,
  }
}

const revealAllCardsForPlayer = player => {
  const revealedCards = player.cards.map(c => (c.faceUp ? c : { ...c, faceUp: true }))
  const flippedCount = revealedCards.filter(c => c.faceUp).length
  return { ...player, cards: revealedCards, flippedCount }
}

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
    aiSpeed = 'normal', // 'slow' | 'normal' | 'fast'
  } = config

  const deck = useMemo(() => {
    if (initialDeck && initialDeck.length) {
      return initialDeck.map((value, index) => ({ id: index, value, faceUp: false }))
    }
    return buildDeck()
  }, [initialDeck])
  const INITIAL_PLAYER_COUNT = 2
  const [playerCount, setPlayerCount] = useState(INITIAL_PLAYER_COUNT)
  const [playerSetup, setPlayerSetup] = useState(() => resizeSetup([], INITIAL_PLAYER_COUNT))
  const initialDeal = useMemo(() => dealPlayersFromDeck(deck, INITIAL_PLAYER_COUNT), [deck])
  const [players, setPlayers] = useState(initialDeal.players)
  const [deckRest, setDeckRest] = useState(initialDeal.rest)
  const [setupComplete, setSetupComplete] = useState(false)
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [holeStartingPlayer, setHoleStartingPlayer] = useState(0)
  const [drawnCard, setDrawnCard] = useState(null)
  const [discardPile, setDiscardPile] = useState([])
  const [discardTop, setDiscardTop] = useState(null)
  const [initialFlips, setInitialFlips] = useState(() => Array(INITIAL_PLAYER_COUNT).fill(false))
  const [firstTurnDraw, setFirstTurnDraw] = useState(() => Array(INITIAL_PLAYER_COUNT).fill(false))
  const [turnComplete, setTurnComplete] = useState(() => Array(INITIAL_PLAYER_COUNT).fill(false))
  const [mustFlipAfterDiscard, setMustFlipAfterDiscard] = useState(() => Array(INITIAL_PLAYER_COUNT).fill(false))
  const [roundOver, setRoundOver] = useState(false)
  const [currentHole, setCurrentHole] = useState(1) // 1..9
  const [holeScores, setHoleScores] = useState([]) // array of { hole, scores: [...] }
  // Track previous all-face-up state to detect the exact moment a player finishes.
  const prevAllFaceUpRef = useRef(Array(INITIAL_PLAYER_COUNT).fill(false))
  const [finalTurnPlayer, setFinalTurnPlayer] = useState(null)
  const [finalTurnPending, setFinalTurnPending] = useState(false)
  const [finalTurnQueue, setFinalTurnQueue] = useState([])
  const [setupError, setSetupError] = useState(null)

  const resetTurnState = useCallback(count => {
    setInitialFlips(Array(count).fill(false))
    setFirstTurnDraw(Array(count).fill(false))
    setTurnComplete(Array(count).fill(false))
    setMustFlipAfterDiscard(Array(count).fill(false))
    prevAllFaceUpRef.current = Array(count).fill(false)
  }, [])

  const handlePlayerCountChange = useCallback(
    nextCount => {
      if (setupComplete) return
      const clamped = Math.min(6, Math.max(2, nextCount))
      if (clamped === playerCount) return
      setPlayerCount(clamped)
      setPlayerSetup(prev => resizeSetup(prev, clamped))
      const { players: freshPlayers, rest } = dealPlayersFromDeck(deck, clamped)
      setPlayers(freshPlayers)
      setDeckRest(rest)
      setDrawnCard(null)
      setDiscardPile([])
      setDiscardTop(null)
      resetTurnState(clamped)
      setCurrentPlayer(0)
      setHoleStartingPlayer(0)
      setFinalTurnPlayer(null)
      setFinalTurnPending(false)
      setFinalTurnQueue([])
      setRoundOver(false)
      setSetupError(null)
    },
    [deck, playerCount, resetTurnState, setupComplete],
  )

  const handleSetupChange = useCallback((idx, field, value) => {
    setPlayerSetup(prev => {
      const next = prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
      if (field === 'isComputer' && value) {
        if (!next.some(p => !p.isComputer)) {
          return prev
        }
      }
      return ensureAtLeastOneHuman(next)
    })
    setSetupError(null)
  }, [])

  const handleSetupSubmit = useCallback(
    e => {
      e.preventDefault()
      if (!playerSetup.some(p => !p.isComputer)) {
        setSetupError('At least one human player is required.')
        return
      }
      setSetupError(null)
      // Seed discard pile with top card before gameplay starts.
      if (discardTop == null && deckRest.length > 0) {
        const [top, ...rest] = deckRest
        setDeckRest(rest)
        const seed = { ...top, faceUp: true }
        setDiscardTop(seed)
        setDiscardPile([seed])
      }
      setPlayers(prev =>
        prev.map((p, i) => (playerSetup[i]?.isComputer ? autoFlipComputerCards(p) : p)),
      )
      setPlayerCount(playerSetup.length)
      const baselineFalse = Array(playerSetup.length).fill(false)
      setFirstTurnDraw(baselineFalse)
      setTurnComplete(baselineFalse)
      setMustFlipAfterDiscard(baselineFalse)
      setInitialFlips(playerSetup.map(cfg => !!cfg.isComputer))
      setSetupComplete(true)
      setFinalTurnQueue([])
      setFinalTurnPlayer(null)
      setFinalTurnPending(false)
      prevAllFaceUpRef.current = Array(playerSetup.length).fill(false)
      const startingHuman = playerSetup.findIndex(p => !p.isComputer)
      const initialStarter = startingHuman === -1 ? 0 : startingHuman
      setHoleStartingPlayer(initialStarter)
      setCurrentPlayer(initialStarter)
    },
    [deckRest, discardTop, playerSetup],
  )

  const drawCard = useCallback(() => {
    // Prevent drawing before setup is complete (initial simultaneous flips & discard seed must occur first)
    if (!setupComplete) return
    if (roundOver) return
    // Require player to have completed their two initial flips.
    if (!initialFlips[currentPlayer]) return
    if (drawnCard || deckRest.length === 0) return
    // After setup, players may draw even if it's first flip phase already done; we still enforce one draw per turn.
    if (firstTurnDraw[currentPlayer] || turnComplete[currentPlayer]) return
    const [top, ...rest] = deckRest
    setDrawnCard(top)
    setDeckRest(rest)
    setFirstTurnDraw(prev => prev.map((v, i) => (i === currentPlayer ? true : v)))
  }, [currentPlayer, deckRest, drawnCard, firstTurnDraw, turnComplete, setupComplete, initialFlips, roundOver])

  const discardDrawnCard = useCallback(() => {
    if (roundOver) return
    if (!drawnCard || turnComplete[currentPlayer]) return
    const toDiscard = { ...drawnCard, faceUp: true }
    setDiscardPile(prev => [toDiscard, ...prev])
    setDiscardTop(toDiscard)
    setDrawnCard(null)
    const faceDownCount = players[currentPlayer].cards.filter(c => !c.faceUp).length
    if (faceDownCount === 1) {
      setTurnComplete(prev => prev.map((v, i) => (i === currentPlayer ? true : v)))
      setMustFlipAfterDiscard(prev => prev.map((v, i) => (i === currentPlayer ? false : v)))
      setFirstTurnDraw(prev => prev.map((v, i) => (i === currentPlayer ? (playerSetup[i]?.isComputer ? true : false) : v)))
    } else {
      setMustFlipAfterDiscard(prev => prev.map((v, i) => (i === currentPlayer ? true : v)))
      setFirstTurnDraw(prev => prev.map((v, i) => (i === currentPlayer ? (playerSetup[i]?.isComputer ? true : false) : v)))
    }
  }, [currentPlayer, drawnCard, players, turnComplete, roundOver, playerSetup])

  const pickUpDiscard = useCallback(() => {
    if (roundOver) return
    if (drawnCard || discardPile.length === 0 || turnComplete[currentPlayer]) return
    const top = discardPile[0]
    setDrawnCard({ ...top, faceUp: true })
    setDiscardPile(prev => prev.slice(1))
    setDiscardTop(prev => (discardPile.length > 1 ? discardPile[1] : null))
    setMustFlipAfterDiscard(prev => prev.map((v, i) => (i === currentPlayer ? false : v)))
  }, [currentPlayer, discardPile, drawnCard, turnComplete, roundOver])

  const replaceCard = useCallback(
    idx => {
      if (roundOver) return
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
      // Preserve firstTurnDraw for computer to block extra draw attempt
      setFirstTurnDraw(prev => prev.map((v, i) => (i === currentPlayer ? (playerSetup[i]?.isComputer ? true : false) : v)))
      setMustFlipAfterDiscard(prev => prev.map((v, i) => (i === currentPlayer ? false : v)))
      setTurnComplete(prev => prev.map((v, i) => (i === currentPlayer ? true : v)))
    },
    [currentPlayer, drawnCard, turnComplete, players, roundOver, playerSetup],
  )

  const handleCardClick = useCallback(
    (playerIndex, cardIndex) => {
      if (roundOver) return
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
    [currentPlayer, drawnCard, initialFlips, mustFlipAfterDiscard, players, replaceCard, turnComplete, roundOver],
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
    // If we just switched into the final turn player's turn, clear pending so round can conclude after they act.
    if (finalTurnPlayer !== null && currentPlayer === finalTurnPlayer) {
      setFinalTurnPending(false)
    }
  }, [currentPlayer, finalTurnPlayer])

  // Ensure initialFlips flags remain consistent if flippedCount reaches 2 after setup change sequencing.
  useEffect(() => {
    setInitialFlips(prev => players.map((player, idx) => (prev[idx] || player.flippedCount >= 2)))
    if (prevAllFaceUpRef.current.length !== players.length) {
      prevAllFaceUpRef.current = Array(players.length).fill(false)
    }
  }, [players])

  const delay = useCallback(
    ms => (disableDelays ? Promise.resolve() : new Promise(resolve => setTimeout(resolve, ms))),
    [disableDelays],
  )
  // Derive a base step delay. Existing default was 1200ms; we slow further for 'slow' mode.
  const derivedBase = (() => {
    if (typeof stepDelayOverride === 'number') return stepDelayOverride
    switch (aiSpeed) {
      case 'slow': return 2500 // make slow meaningfully slower
      case 'fast': return 650
      case 'normal':
      default: return 1200
    }
  })()
  const stepDelay = derivedBase
  // Quick micro-delay for short actions (replace/discard/pickup); scale with speed.
  const quickDelay = (() => {
    if (typeof stepDelayOverride === 'number') return Math.min(400, Math.max(120, stepDelayOverride / 3))
    switch (aiSpeed) {
      case 'slow': return 600
      case 'fast': return 180
      case 'normal':
      default: return 300
    }
  })()

  const computerTurn = useCallback(async () => {
    if (!setupComplete || roundOver) return
    const playerIndex = currentPlayer
    if (!playerSetup[playerIndex]?.isComputer) return
    const currentState = players[playerIndex]
    if (!currentState) return
    if (turnComplete[playerIndex]) return
    const cards = currentState.cards

    // Initial two flips if not done yet
    if (!initialFlips[playerIndex] && currentState.flippedCount === 0) {
      let hidden = cards.map((c, i) => (!c.faceUp ? i : -1)).filter(i => i !== -1)
      for (let f = 0; f < 2; f++) {
        if (hidden.length === 0) break
        const idx = hidden[Math.floor(Math.random() * hidden.length)]
        setPlayers(ps =>
          ps.map((p, pi) =>
            pi === playerIndex
              ? {
                  ...p,
                  cards: p.cards.map((c, ci) => (ci === idx ? { ...c, faceUp: true } : c)),
                  flippedCount: p.flippedCount + 1,
                }
              : p,
          ),
        )
        hidden = hidden.filter(i => i !== idx)
        await delay(stepDelay)
      }
      setInitialFlips(f => f.map((v, i) => (i === playerIndex ? true : v)))
      return
    }

    // Evaluate skip heuristic BEFORE considering discard pickup or drawing
    const faceDownRemaining = cards.filter(c => !c.faceUp).length
    if (enableSkipHeuristic && faceDownRemaining === 1 && !drawnCard && !turnComplete[playerIndex]) {
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
        setTurnComplete(tc => tc.map((v, i) => (i === playerIndex ? true : v)))
        return
      }
    }

    const evaluateDiscard = topDiscard => {
      if (!topDiscard) return null
      for (let col = 0; col < COLUMN_COUNT; col++) {
        const a = col
        const b = col + COLUMN_COUNT
        if (cards[a].faceUp && !cards[b].faceUp && cards[a].value === topDiscard.value) return { idx: b, reason: 'pair' }
        if (cards[b].faceUp && !cards[a].faceUp && cards[b].value === topDiscard.value) return { idx: a, reason: 'pair' }
      }
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
      if (topDiscard.value <= 3) {
        const hiddenIdx = cards.findIndex(c => !c.faceUp)
        if (hiddenIdx !== -1) {
          if (faceDownRemaining === 1 && !enableSkipHeuristic) return null
          return { idx: hiddenIdx, reason: 'placeholder' }
        }
      }
      return null
    }

    if (!drawnCard && initialFlips[playerIndex] && !turnComplete[playerIndex] && discardPile.length > 0) {
      const decision = evaluateDiscard(discardPile[0])
      if (decision) {
        await delay(quickDelay)
        pickUpDiscard()
        await delay(quickDelay)
        replaceCard(decision.idx)
        return
      }
    }

    if (!firstTurnDraw[playerIndex] && initialFlips[playerIndex] && !drawnCard && !turnComplete[playerIndex]) {
      await delay(stepDelay)
      drawCard()
      return
    }

    if (faceDownRemaining === 1 && drawnCard) {
      const lastIdx = cards.findIndex(c => !c.faceUp)
      const pairIdx = lastIdx < COLUMN_COUNT ? lastIdx + COLUMN_COUNT : lastIdx - COLUMN_COUNT
      if (cards[pairIdx].faceUp && (drawnCard.value === cards[pairIdx].value || drawnCard.value < cards[pairIdx].value)) {
        await delay(quickDelay)
        replaceCard(lastIdx)
      } else {
        await delay(quickDelay)
        discardDrawnCard()
      }
      return
    }

    if (drawnCard && !turnComplete[playerIndex]) {
      for (let col = 0; col < COLUMN_COUNT; col++) {
        const a = col
        const b = col + COLUMN_COUNT
        if (cards[a].faceUp && cards[a].value === drawnCard.value && !cards[b].faceUp) {
          await delay(quickDelay)
          replaceCard(b)
          return
        }
        if (cards[b].faceUp && cards[b].value === drawnCard.value && !cards[a].faceUp) {
          await delay(quickDelay)
          replaceCard(a)
          return
        }
      }
      const expectedUnknown = computeExpectedUnknownValue(players, discardPile, drawnCard)
      if (drawnCard.value > 9) {
        await delay(quickDelay)
        discardDrawnCard()
        return
      }
      let targetIdx = -1
      let bestGain = 0
      for (let i = 0; i < cards.length; i++) {
        const pairIdx = i < COLUMN_COUNT ? i + COLUMN_COUNT : i - COLUMN_COUNT
        const isPair = cards[i].faceUp && cards[pairIdx].faceUp && cards[i].value === cards[pairIdx].value
        if (cards[i].faceUp && !isPair && drawnCard.value < cards[i].value) {
          const gain = cards[i].value - drawnCard.value
          if (gain > bestGain) {
            bestGain = gain
            targetIdx = i
          }
        }
      }
      if (targetIdx !== -1 && drawnCard.value <= 9) {
        await delay(quickDelay)
        replaceCard(targetIdx)
        return
      }
      if (drawnCard.value <= expectedUnknown - 1.5) {
        const hiddenIdx = cards.findIndex(c => !c.faceUp)
        if (hiddenIdx !== -1) {
          await delay(quickDelay)
          replaceCard(hiddenIdx)
          return
        }
      }
      const hiddenIdx = cards.findIndex(c => !c.faceUp)
      if (hiddenIdx !== -1) {
        await delay(quickDelay)
        replaceCard(hiddenIdx)
        return
      }
      await delay(quickDelay)
      discardDrawnCard()
      return
    }

    if (mustFlipAfterDiscard[playerIndex]) {
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
        await delay(quickDelay)
        setPlayers(ps =>
          ps.map((p, pi) =>
            pi === playerIndex
              ? {
                  ...p,
                  cards: p.cards.map((c, j) => (j === bestIdx ? { ...c, faceUp: true } : c)),
                  flippedCount: p.flippedCount + 1,
                }
              : p,
          ),
        )
        setMustFlipAfterDiscard(a => a.map((v, i) => (i === playerIndex ? false : v)))
        setFirstTurnDraw(a => a.map((v, i) => (i === playerIndex ? false : v)))
        setTurnComplete(tc => tc.map((v, i) => (i === playerIndex ? true : v)))
      }
      return
    }

    if (!turnComplete[playerIndex] && !drawnCard && initialFlips[playerIndex]) {
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
    playerSetup,
    replaceCard,
    roundOver,
    setupComplete,
    stepDelay,
    delay,
    turnComplete,
    enableSkipHeuristic,
  ])

  const finalizeRound = useCallback(() => {
    setPlayers(ps =>
      ps.map(p => revealAllCardsForPlayer(p)),
    )
    setRoundOver(true)
    setFinalTurnPlayer(null)
    setFinalTurnPending(false)
    setFinalTurnQueue([])
  }, [])

  const revealRemainingCards = useCallback(index => {
    setPlayers(prev => prev.map((player, i) => (i === index ? revealAllCardsForPlayer(player) : player)))
    setMustFlipAfterDiscard(prev => prev.map((v, i) => (i === index ? false : v)))
    setInitialFlips(prev => prev.map((v, i) => (i === index ? true : v)))
  }, [])

  useEffect(() => {
    if (disableComputerAuto) return
    if (!setupComplete || roundOver) return
    if (!playerSetup[currentPlayer]?.isComputer) return
    computerTurn()
  }, [computerTurn, currentPlayer, roundOver, setupComplete, disableComputerAuto, playerSetup])

  useEffect(() => {
    if (roundOver) return
    const playerFlippedAll = players.map(p => p.cards.every(c => c.faceUp))
    const prev = prevAllFaceUpRef.current
    const hasHidden = index => players[index]?.cards?.some(c => !c.faceUp)

    for (let i = 0; i < playerFlippedAll.length; i++) {
      if (!prev[i] && playerFlippedAll[i]) {
        const pending = []
        for (let offset = 1; offset < players.length; offset++) {
          const idx = (i + offset) % players.length
          if (hasHidden(idx)) pending.push(idx)
        }
        if (pending.length === 0) {
          finalizeRound()
        } else if (finalTurnPlayer === null) {
          const [first, ...rest] = pending
          setFinalTurnPlayer(first)
          setFinalTurnPending(true)
          setFinalTurnQueue(rest)
          if (currentPlayer !== first) setCurrentPlayer(first)
        } else {
          setFinalTurnQueue(queue => {
            const queueSet = new Set(queue.filter(idx => hasHidden(idx)))
            pending.forEach(idx => {
              if (idx !== finalTurnPlayer && hasHidden(idx)) {
                queueSet.add(idx)
              }
            })
            return Array.from(queueSet)
          })
        }
      }
    }

    prevAllFaceUpRef.current = playerFlippedAll

    if (finalTurnPlayer !== null && turnComplete[finalTurnPlayer] && !finalTurnPending) {
      if (hasHidden(finalTurnPlayer)) {
        revealRemainingCards(finalTurnPlayer)
        return
      }
      if (finalTurnQueue.length > 0) {
        let next = null
        let remaining = [...finalTurnQueue]
        while (remaining.length > 0 && next === null) {
          const candidate = remaining.shift()
          if (hasHidden(candidate)) next = candidate
        }
        setFinalTurnQueue(remaining.filter(idx => idx !== next))
        if (next !== null) {
          setFinalTurnPlayer(next)
          setFinalTurnPending(true)
          if (currentPlayer !== next) setCurrentPlayer(next)
        } else {
          finalizeRound()
        }
      } else {
        finalizeRound()
      }
    }
  }, [
    players,
    roundOver,
    turnComplete,
    currentPlayer,
    finalTurnPlayer,
    finalTurnPending,
    finalTurnQueue,
    finalizeRound,
    revealRemainingCards,
  ])

  // Auto-advance turn when a player's turn completes and not in final turn resolution.
  useEffect(() => {
    if (roundOver) return
    // Skip auto-advance if final turn indicator is active
    if (finalTurnPlayer !== null) return
    // If current player's turnComplete is true, advance to next.
    if (turnComplete[currentPlayer]) {
      const next = (currentPlayer + 1) % players.length
      setCurrentPlayer(next)
    }
  }, [turnComplete, currentPlayer, players.length, roundOver, finalTurnPlayer])

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
    const totalPlayers = playerSetup.length
    if (totalPlayers === 0) return
    const nextStarter = totalPlayers === 0 ? 0 : ((holeStartingPlayer + 1) % totalPlayers)
    const newDeck = buildDeck()
    const { players: freshPlayers, rest } = dealPlayersFromDeck(newDeck, totalPlayers)
    const seededPlayers = freshPlayers.map((player, idx) =>
      playerSetup[idx]?.isComputer ? autoFlipComputerCards(player) : player,
    )

    let remainingDeck = rest
    let nextDiscardTop = null
    let nextDiscardPile = []
    if (remainingDeck.length > 0) {
      const [top, ...restDeck] = remainingDeck
      const seed = { ...top, faceUp: true }
      nextDiscardTop = seed
      nextDiscardPile = [seed]
      remainingDeck = restDeck
    }

    setPlayers(seededPlayers)
    setDeckRest(remainingDeck)
    setDiscardTop(nextDiscardTop)
    setDiscardPile(nextDiscardPile)
    setDrawnCard(null)
    resetTurnState(totalPlayers)
    setInitialFlips(playerSetup.map(cfg => !!cfg.isComputer))
    setRoundOver(false)
    setFinalTurnPlayer(null)
    setFinalTurnPending(false)
    setFinalTurnQueue([])
    setCurrentHole(h => h + 1)
    setHoleStartingPlayer(nextStarter)
    setCurrentPlayer(nextStarter)
    setTimeout(() => {
      if (!disableComputerAuto && playerSetup[nextStarter]?.isComputer) {
        computerTurn()
      }
    }, 0)
  }, [
    currentHole,
    computerTurn,
    disableComputerAuto,
    playerSetup,
    resetTurnState,
    holeStartingPlayer,
  ])

  // Running totals including any bonuses that are already guaranteed (i.e., fully revealed matched columns groups).
  const visibleScores = players.map(p => calculateVisibleScore(p.cards))
  const runningTotalsWithBonus = players.map(p => {
    // Build a face-up-only view; treat hidden cards as unknown (exclude them from raw sum except for potential canceled pairs that are both face up)
    const cards = p.cards
    let raw = 0
    const matchedColumnsByValue = {}
    let minusFiveCount = 0
    for (const c of cards) if (c.faceUp && c.value === -5) minusFiveCount++
    for (let col = 0; col < COLUMN_COUNT; col++) {
      const top = cards[col]
      const bottom = cards[col + COLUMN_COUNT]
      const bothUp = top.faceUp && bottom.faceUp
      if (bothUp && top.value === bottom.value && top.value !== -5) {
        matchedColumnsByValue[top.value] = (matchedColumnsByValue[top.value] || 0) + 1
        continue
      }
      if (bothUp && top.value === bottom.value && top.value === -5) {
        raw += -10
        continue
      }
      if (top.faceUp) raw += top.value
      if (bottom.faceUp) raw += bottom.value
    }
    const groupSizes = Object.values(matchedColumnsByValue)
    const largestGroup = groupSizes.length ? Math.max(...groupSizes) : 0
    let bonus = 0
    if (largestGroup === 2) bonus -= 10
    else if (largestGroup === 3) bonus -= 15
    else if (largestGroup === 4) bonus -= 20
    // Hole-in-one full set bonus only applies if all four -5 are faceUp already
    if (minusFiveCount === 4) bonus -= 10
    return raw + bonus
  })

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

      const alignArray = (input, length, fillValue = false) => {
        if (!Array.isArray(input)) return Array(length).fill(fillValue)
        if (input.length === length) return input
        const next = Array(length).fill(fillValue)
        for (let i = 0; i < length; i++) {
          next[i] = i < input.length && typeof input[i] !== 'undefined' ? input[i] : fillValue
        }
        return next
      }

      const savedPlayers = Array.isArray(parsed.players) && parsed.players.length ? parsed.players : null
      const inferredCountRaw = savedPlayers
        ? savedPlayers.length
        : parsed.playerCount || (Array.isArray(parsed.playerSetup) ? parsed.playerSetup.length : INITIAL_PLAYER_COUNT)
      const inferredCount = Math.min(6, Math.max(2, inferredCountRaw || INITIAL_PLAYER_COUNT))
      const { players: fallbackPlayers, rest: fallbackRest } = dealPlayersFromDeck(deck, inferredCount)
      const nextPlayers = savedPlayers && savedPlayers.length === inferredCount ? savedPlayers : fallbackPlayers
      const nextSetup = ensureAtLeastOneHuman(resizeSetup(parsed.playerSetup || [], inferredCount))
      const nextDeckRest = Array.isArray(parsed.deckRest) ? parsed.deckRest : fallbackRest
      const nextDiscardPile = Array.isArray(parsed.discardPile) ? parsed.discardPile : []
      const nextDiscardTop = parsed.discardTop || nextDiscardPile[0] || null
      const nextDrawnCard = parsed.drawnCard || null
      const requestedCurrent = typeof parsed.currentPlayer === 'number' ? parsed.currentPlayer : 0
      const clampedCurrent = Math.min(Math.max(requestedCurrent, 0), inferredCount - 1)

      setPlayerCount(inferredCount)
      setPlayerSetup(nextSetup)
      setSetupComplete(!!parsed.setupComplete)
      setCurrentPlayer(clampedCurrent)
      const savedHoleStarter = typeof parsed.holeStartingPlayer === 'number'
        ? Math.min(Math.max(parsed.holeStartingPlayer, 0), inferredCount - 1)
        : clampedCurrent
      setHoleStartingPlayer(savedHoleStarter)
      setPlayers(nextPlayers)
      setDeckRest(nextDeckRest)
      setDrawnCard(nextDrawnCard)
      setDiscardPile(nextDiscardPile)
      setDiscardTop(nextDiscardTop)
      setInitialFlips(alignArray(parsed.initialFlips, inferredCount, false))
      setFirstTurnDraw(alignArray(parsed.firstTurnDraw, inferredCount, false))
      setTurnComplete(alignArray(parsed.turnComplete, inferredCount, false))
      setMustFlipAfterDiscard(alignArray(parsed.mustFlipAfterDiscard, inferredCount, false))
      setRoundOver(!!parsed.roundOver)
      setCurrentHole(parsed.currentHole || 1)
      setHoleScores(Array.isArray(parsed.holeScores) ? parsed.holeScores : [])
      setSetupError(null)
      setFinalTurnPlayer(null)
      setFinalTurnPending(false)
      setFinalTurnQueue([])
      prevAllFaceUpRef.current = Array(inferredCount).fill(false)
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
        playerCount,
        holeStartingPlayer,
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
    playerCount,
  ])

  const clearSavedGame = useCallback(() => {
    try {
      localStorage.removeItem(persistenceKey)
    } catch {}
  }, [persistenceKey])

  return {
    playerSetup,
    playerCount,
    setupComplete,
    setupError,
    handleSetupChange,
    handleSetupSubmit,
    handlePlayerCountChange,
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
    runningTotalsWithBonus,
    clearSavedGame,
    finalTurnPlayer,
    finalTurnPending,
    deckCount: deckRest.length,
    ...testHelpers,
  }
}
