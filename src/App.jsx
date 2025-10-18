import { useState, useEffect, useMemo } from 'react'

// Calculate the score for only face-up cards
function calculateVisibleScore(cards) {
  let score = 0;
  for (let col = 0; col < 4; col++) {
    const idx1 = col;
    const idx2 = col + 4;
    const v1 = cards[idx1];
    const v2 = cards[idx2];
    if (v1.faceUp && v2.faceUp && v1.value === v2.value && v1.value !== -5) {
      // Vertical match, both face up, not -5: zero for this column
      continue;
    }
    if (v1.faceUp) score += v1.value;
    if (v2.faceUp) score += v2.value;
  }
  return score;
}
// Calculate the score for a player's cards
function calculateScore(cards) {
  // Count vertical matches by value (excluding -5 for set bonuses)
  let score = 0;
  let verticalMinusFiveCount = 0;
  let verticalMatchSets = 0;
  for (let col = 0; col < 4; col++) {
    const idx1 = col;
    const idx2 = col + 4;
    const v1 = cards[idx1].value;
    const v2 = cards[idx2].value;
    if (v1 === v2) {
      if (v1 === -5) {
        verticalMinusFiveCount++;
        score += -5;
      } else {
        verticalMatchSets++;
        // No score for this column
      }
    } else {
      score += v1 + v2;
    }
  }
  // Set bonus for vertical matches (not -5)
  let bonus = 0;
  if (verticalMatchSets === 2) bonus -= 10;
  if (verticalMatchSets === 3) bonus -= 15;
  if (verticalMatchSets === 4) bonus -= 20;
  // Special case: two vertical -5s
  if (verticalMinusFiveCount === 2) {
    bonus -= 30;
  }
  return score + bonus;
}

export default function App() {
  // Computer turn phase state
  const [computerPhase, setComputerPhase] = useState('idle');
  // --- All state and hooks at the top ---
  const [playerSetup, setPlayerSetup] = useState([
    { name: '', color: '#fbbf24' },
    { name: '', color: '#38bdf8' },
  ]);
  const [setupComplete, setSetupComplete] = useState(false);
  const [hasTakenCard, setHasTakenCard] = useState(false);
  const [roundOver, setRoundOver] = useState(false);
  const [mustFlipAfterDiscard, setMustFlipAfterDiscard] = useState([false, false]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const deck = useMemo(() => {
    const values = [];
    for (let i = 0; i < 8; i++) {
      for (let v = 0; v <= 12; v++) {
        values.push(v);
      }
    }
    for (let i = 0; i < 4; i++) {
      values.push(-5);
    }
    const shuffled = values.sort(() => Math.random() - 0.5);
    return shuffled.map((value, index) => ({ id: index, value, faceUp: false }));
  }, []);
  const [players, setPlayers] = useState(() => [
    { cards: deck.slice(0, 8).map(c => ({ ...c, faceUp: false })), flippedCount: 0 },
    { cards: deck.slice(8, 16).map(c => ({ ...c, faceUp: false })), flippedCount: 0 },
  ]);
  const [deckRest, setDeck] = useState(deck.slice(16));
  const [drawnCard, setDrawnCard] = useState(null);
  const [discardPile, setDiscardPile] = useState([]);
  const [initialFlips, setInitialFlips] = useState([false, false]);
  const [firstTurnDraw, setFirstTurnDraw] = useState([false, false]);
  const [turnComplete, setTurnComplete] = useState([false, false]);

  // --- Helper functions ---
  function findWorstCardIdx(cards) {
    let maxVal = -Infinity;
    let idx = -1;
    for (let i = 0; i < cards.length; i++) {
      if (!cards[i].faceUp) {
        return i;
      }
      if (cards[i].value > maxVal) {
        maxVal = cards[i].value;
        idx = i;
      }
    }
    return idx;
  }

// (Removed duplicate nested component declaration)

  // Reset turnComplete for currentPlayer at the start of each turn
  useEffect(() => {
    setTurnComplete(tc => tc.map((val, i) => i === currentPlayer ? false : val));
  }, [currentPlayer]);
    const delay = ms => new Promise(res => setTimeout(res, ms));
    const stepDelay = 1200; // 1.2 seconds for better visibility
    async function computerTurn() {
      // Only run initial flip logic if not already done and no cards have been flipped yet
      if (!initialFlips[1] && players[1].flippedCount === 0) {
        let hidden = players[1].cards.map((c, i) => !c.faceUp ? i : -1).filter(i => i !== -1);
        for (let f = 0; f < 2; f++) {
          if (hidden.length === 0) break;
          const idx = hidden[Math.floor(Math.random() * hidden.length)];
          setPlayers(ps => ps.map((p, pi) => pi === 1 ? {
            ...p,
            cards: p.cards.map((c, ci) => ci === idx ? { ...c, faceUp: true } : c),
            flippedCount: p.flippedCount + 1
          } : p));
          hidden = hidden.filter(i => i !== idx);
          await delay(stepDelay);
        }
        // Set initialFlips[1] to true immediately after flipping two cards
        setInitialFlips(flips => flips.map((f, i) => i === 1 ? true : f));
        // No need to await after this, prevents re-entry
      }
      if (firstTurnDraw[1] === false && initialFlips[1]) {
        await delay(stepDelay);
        drawCard();
        setComputerPhase('decide');
        return;
      }
      // After drawing, immediately decide what to do next
      await delay(400);
      // If only one card left face down, handle that case
      const faceDownCount1 = players[1].cards.filter(c => !c.faceUp).length;
      if (faceDownCount1 === 1 && drawnCard) {
        const cards = players[1].cards;
        const lastIdx = cards.findIndex(c => !c.faceUp);
        const col = lastIdx < 4 ? lastIdx : lastIdx - 4;
        const pairIdx = lastIdx < 4 ? lastIdx + 4 : lastIdx - 4;
        if (cards[pairIdx].faceUp && (drawnCard.value === cards[pairIdx].value || drawnCard.value < cards[pairIdx].value)) {
          replaceCard(lastIdx);
        } else {
          discardDrawnCard();
        }
        return;
      }
      // Otherwise, try to make a zero or swap for a better card
      if (drawnCard) {
        const cards = players[1].cards;
        let matchIdx = -1;
        // Try to make a zero (vertical match)
        for (let col = 0; col < 4; col++) {
          const idx1 = col;
          const idx2 = col + 4;
          if (cards[idx1].faceUp && cards[idx1].value === drawnCard.value && !cards[idx2].faceUp) {
            matchIdx = idx2;
            break;
          }
          if (cards[idx2].faceUp && cards[idx2].value === drawnCard.value && !cards[idx1].faceUp) {
            matchIdx = idx1;
            break;
          }
        }
        if (matchIdx !== -1) {
          await delay(400);
          replaceCard(matchIdx);
          setTurnComplete(tc => tc.map((val, i) => i === 1 ? true : val));
          return;
        }
        // Otherwise, replace highest value face-down card if possible
        let faceDownIdx = cards.findIndex(c => !c.faceUp);
        if (faceDownIdx !== -1) {
          await delay(400);
          replaceCard(faceDownIdx);
          setTurnComplete(tc => tc.map((val, i) => i === 1 ? true : val));
          return;
        }
        // Otherwise, replace highest value face-up card if drawnCard is better and doesn't break a match
        let maxVal = -Infinity;
        let maxIdx = -1;
        for (let i = 0; i < 8; i++) {
          let col = i < 4 ? i : i - 4;
          let pairIdx = i < 4 ? i + 4 : i - 4;
          if (cards[i].faceUp && !(cards[i].value === cards[pairIdx].value) && cards[i].value > maxVal && drawnCard.value < cards[i].value) {
            maxVal = cards[i].value;
            maxIdx = i;
          }
        }
        if (maxIdx !== -1) {
          await delay(400);
          replaceCard(maxIdx);
          setTurnComplete(tc => tc.map((val, i) => i === 1 ? true : val));
          return;
        }
        // Otherwise, discard and flip a face-down card
        await delay(400);
        discardDrawnCard();
        setTurnComplete(tc => tc.map((val, i) => i === 1 ? true : val));
        return;
      }
      // 1. If discard pile is not empty and can make a zero or is better than a face-up card, pick up discard
      if (!drawnCard && discardPile.length > 0 && initialFlips[1] && !turnComplete[1]) {
        const topDiscard = discardPile[0];
        const cards = players[1].cards;
        let bestIdx = -1;
        // Always take -5 if possible
        if (topDiscard.value === -5) {
          // Replace highest value face-up card, or any face-down card if all are negative
          let maxVal = -Infinity;
          for (let i = 0; i < 8; i++) {
            if (cards[i].faceUp && cards[i].value > maxVal) {
              maxVal = cards[i].value;
              bestIdx = i;
            }
          }
          // If all cards are face down, just pick the first
          if (bestIdx === -1) {
            bestIdx = cards.findIndex(c => !c.faceUp);
          }
        } else {
          // Try to complete a zero (vertical match) in either direction
          for (let col = 0; col < 4; col++) {
            const idx1 = col;
            const idx2 = col + 4;
            if (cards[idx1].faceUp && cards[idx1].value === topDiscard.value && !cards[idx2].faceUp) {
              bestIdx = idx2;
              break;
            }
            if (cards[idx2].faceUp && cards[idx2].value === topDiscard.value && !cards[idx1].faceUp) {
              bestIdx = idx1;
              break;
            }
            if (!cards[idx1].faceUp && cards[idx2].faceUp && cards[idx2].value === topDiscard.value) {
              bestIdx = idx1;
              break;
            }
            if (!cards[idx2].faceUp && cards[idx1].faceUp && cards[idx1].value === topDiscard.value) {
              bestIdx = idx2;
              break;
            }
          }
          // If can't complete a zero, see if it's better than a face-up card
          if (bestIdx === -1) {
            let maxVal = -Infinity;
            for (let i = 0; i < 8; i++) {
              if (cards[i].faceUp && topDiscard.value < cards[i].value) {
                if (cards[i].value > maxVal) {
                  maxVal = cards[i].value;
                  bestIdx = i;
                }
              }
            }
          }
        }
        if (bestIdx !== -1) {
          await delay(400);
          pickUpDiscard();
          await delay(400);
          replaceCard(bestIdx);
          return;
        }
      }
      // 2. If only one card left face down, draw and decide to swap or discard
      const faceDownCount2 = players[1].cards.filter(c => !c.faceUp).length;
      if (faceDownCount2 === 1 && !drawnCard && initialFlips[1] && !turnComplete[1]) {
        await delay(400);
        drawCard();
        return;
      }
      // If only one card left face down and drawnCard exists
      if (faceDownCount2 === 1 && drawnCard && !turnComplete[1]) {
        const cards = players[1].cards;
        const lastIdx = cards.findIndex(c => !c.faceUp);
        // Find the other card in the same column
        const col = lastIdx < 4 ? lastIdx : lastIdx - 4;
        const pairIdx = lastIdx < 4 ? lastIdx + 4 : lastIdx - 4;
        // If drawnCard matches the other card, or is better, swap
        if (cards[pairIdx].faceUp && (drawnCard.value === cards[pairIdx].value || drawnCard.value < cards[pairIdx].value)) {
          await delay(400);
          replaceCard(lastIdx);
        } else {
          await delay(400);
          discardDrawnCard();
        }
        return;
      }
      if (drawnCard && !turnComplete[1]) {
        const cards = players[1].cards;
        // Try to make a zero
        let matchIdx = -1;
        for (let col = 0; col < 4; col++) {
          const idx1 = col;
          const idx2 = col + 4;
          if (cards[idx1].faceUp && cards[idx1].value === drawnCard.value && !cards[idx2].faceUp) {
            matchIdx = idx2;
            break;
          }
          if (cards[idx2].faceUp && cards[idx2].value === drawnCard.value && !cards[idx1].faceUp) {
            matchIdx = idx1;
            break;
          }
        }
        if (matchIdx !== -1) {
          await delay(400);
          replaceCard(matchIdx);
          setTurnComplete(tc => tc.map((val, i) => i === 1 ? true : val));
          return;
        }
        // Otherwise, replace highest value face-up card if drawnCard is better and doesn't break a match
        let maxVal = -Infinity;
        let maxIdx = -1;
        for (let i = 0; i < 8; i++) {
          // Don't break up a vertical match
          let col = i < 4 ? i : i - 4;
          let pairIdx = i < 4 ? i + 4 : i - 4;
          if (cards[i].faceUp && !(cards[i].value === cards[pairIdx].value) && cards[i].value > maxVal && drawnCard.value < cards[i].value) {
            maxVal = cards[i].value;
            maxIdx = i;
          }
        }
        if (maxIdx !== -1) {
          await delay(400);
          replaceCard(maxIdx);
          setTurnComplete(tc => tc.map((val, i) => i === 1 ? true : val));
          return;
        }
        // Otherwise, discard and flip a face-down card (prefer column with known value)
        await delay(400);
        discardDrawnCard();
        setTurnComplete(tc => tc.map((val, i) => i === 1 ? true : val));
        return;
      }
      // 4. If must flip after discarding, flip a card in a column where the other card is face up
      if (mustFlipAfterDiscard[1]) {
        const cards = players[1].cards;
        let bestIdx = -1;
        for (let col = 0; col < 4; col++) {
          const idx1 = col;
          const idx2 = col + 4;
          if (!cards[idx1].faceUp && cards[idx2].faceUp) {
            bestIdx = idx1;
            break;
          }
          if (!cards[idx2].faceUp && cards[idx1].faceUp) {
            bestIdx = idx2;
            break;
          }
        }
        if (bestIdx === -1) {
          bestIdx = players[1].cards.findIndex(c => !c.faceUp);
        }
        if (bestIdx !== -1) {
          await delay(400);
          // Simulate clicking to flip
          setPlayers(ps => ps.map((p, pi) => pi === 1 ? {
            ...p,
            cards: p.cards.map((c, j) => j === bestIdx ? { ...c, faceUp: true } : c),
            flippedCount: p.flippedCount + 1
          } : p));
          setMustFlipAfterDiscard(arr => arr.map((v, i) => i === 1 ? false : v));
          setFirstTurnDraw(arr => arr.map((v, i) => i === 1 ? false : v));
          setTurnComplete(tc => tc.map((val, i) => i === 1 ? true : val));
        }
        return;
      }
      // 5. If nothing else, draw from the deck
      if (!turnComplete[1] && !drawnCard && initialFlips[1]) {
        await delay(stepDelay);
        drawCard();
        return;
      }
    }
    // Computer turn is now triggered by useEffect below

    // Only run computerTurn when it's the computer's turn and setup is complete
    useEffect(() => {
      if (setupComplete && currentPlayer === 1 && !roundOver) {
        computerTurn();
      }
    }, [setupComplete, currentPlayer, players, drawnCard, discardPile, initialFlips, firstTurnDraw, turnComplete, mustFlipAfterDiscard, roundOver]);


  // Update player name or color in setup
  function handleSetupChange(idx, field, value) {
    setPlayerSetup(prev => prev.map((p, i) =>
      i === idx ? { ...p, [field]: value } : p
    ));
  }
  // Handle player setup form submission
  function handleSetupSubmit(e) {
    e.preventDefault();
    setSetupComplete(true);
  }
// ...existing code...

  // Draw a card from the deck
  function drawCard() {
    if (drawnCard || deckRest.length === 0) return;
    // Only allow draw if initial flips are done and no card has been drawn this turn
    if (initialFlips[currentPlayer] && !firstTurnDraw[currentPlayer] && !turnComplete[currentPlayer]) {
      setFirstTurnDraw(arr => arr.map((v, i) => i === currentPlayer ? true : v));
      setDrawnCard(deckRest[0]);
      setDeck(deckRest.slice(1));
    }
  }

  // Discard the drawn card (from draw pile)
  function discardDrawnCard() {
    if (!drawnCard || turnComplete[currentPlayer]) return;
    setDiscardPile([drawnCard, ...discardPile]);
    setDrawnCard(null);
    // After discarding, must flip a face-down card (unless only one left, then end turn)
    const faceDownCount = players[currentPlayer].cards.filter(c => !c.faceUp).length;
    if (faceDownCount === 1) {
      // If only one left, this is a skip (putting), do not flip
      setTurnComplete(tc => tc.map((val, i) => i === currentPlayer ? true : val));
      setMustFlipAfterDiscard(flipArr => flipArr.map((f, i) => i === currentPlayer ? false : f));
      setFirstTurnDraw(arr => arr.map((v, i) => i === currentPlayer ? false : v));
    } else {
      setMustFlipAfterDiscard(flipArr => flipArr.map((f, i) => i === currentPlayer ? true : f));
      setFirstTurnDraw(arr => arr.map((v, i) => i === currentPlayer ? false : v));
    }
  }

  // Pick up the top card from the discard pile
  function pickUpDiscard() {
    if (drawnCard || discardPile.length === 0 || turnComplete[currentPlayer]) return;
    // When picking up discard, you must swap it for one of your cards immediately
    setDrawnCard(discardPile[0]);
    setDiscardPile(discardPile.slice(1));
    setMustFlipAfterDiscard(arr => arr.map((v, i) => i === currentPlayer ? false : v));
  }

  // Replace a card in the player's grid with the drawn card
  function replaceCard(idx) {
    if (!drawnCard || turnComplete[currentPlayer]) return;
    setPlayers(players => players.map((p, i) =>
      i === currentPlayer
        ? {
            ...p,
            cards: p.cards.map((c, j) => j === idx ? { ...drawnCard, faceUp: true } : c)
          }
        : p
    ));
    setDiscardPile([players[currentPlayer].cards[idx], ...discardPile]);
    setDrawnCard(null);
    // After swapping, your turn ends immediately
    setFirstTurnDraw(arr => arr.map((v, i) => i === currentPlayer ? false : v));
    setMustFlipAfterDiscard(arr => arr.map((v, i) => i === currentPlayer ? false : v));
    setTurnComplete(tc => tc.map((val, i) => i === currentPlayer ? true : val));
  }

  // At the start of each turn, set turnComplete[currentPlayer] = false
  useEffect(() => {
    setTurnComplete(tc => tc.map((val, i) => i === currentPlayer ? false : val));
    setFirstTurnDraw(arr => arr.map((v, i) => i === currentPlayer ? false : v));
    setMustFlipAfterDiscard(arr => arr.map((v, i) => i === currentPlayer ? false : v));
  }, [currentPlayer]);

  // Detect when a player flips their last card, and handle round ending logic
  useEffect(() => {
    // If round is already over, do nothing
    if (roundOver) return;
    // Check if any player has all cards face up
    const playerFlippedAll = players.map(p => p.cards.every(c => c.faceUp));
    // Only trigger final turn if a player just flipped their last card and the other player still has face-down cards
    if (!window._finalTurn && (playerFlippedAll[0] || playerFlippedAll[1])) {
      if (playerFlippedAll[currentPlayer]) {
        // Only give a final turn if the other player has face-down cards
        const other = currentPlayer === 0 ? 1 : 0;
        if (players[other].cards.some(c => !c.faceUp)) {
          window._finalTurn = other;
          setCurrentPlayer(other);
          return;
        } else {
          // If the other player is already fully revealed, just end the round
          setPlayers(ps => ps.map(p => ({
            ...p,
            cards: p.cards.map(c => c.faceUp ? c : { ...c, faceUp: true })
          })));
          setRoundOver(true);
          window._finalTurn = false;
          return;
        }
      }
    }
    // If the final turn player just completed their turn, flip all remaining cards and end round
    if (typeof window._finalTurn === 'number' && turnComplete[window._finalTurn]) {
      setPlayers(ps => ps.map(p => ({
        ...p,
        cards: p.cards.map(c => c.faceUp ? c : { ...c, faceUp: true })
      })));
      setRoundOver(true);
      window._finalTurn = false;
    }
  }, [players, turnComplete, currentPlayer, roundOver]);

  // Place the return statement at the end of the component, not inside useState
  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-700 to-green-900 p-4">
        {!setupComplete ? (
          <form onSubmit={handleSetupSubmit} style={{ background: '#fff', borderRadius: 16, padding: 32, marginBottom: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontWeight: 'bold', fontSize: 24, marginBottom: 16 }}>Player Setup</h2>
            {[0, 1].map(idx => (
              <div key={idx} style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Player {idx + 1} Name:</label>
                <input
                  type="text"
                  value={playerSetup[idx].name}
                  onChange={e => handleSetupChange(idx, 'name', e.target.value)}
                  required
                  style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', marginBottom: 8, width: 180 }}
                />
                <div style={{ marginTop: 6 }}>
                  <label style={{ fontWeight: 'bold', marginRight: 8 }}>Color:</label>
                  <input
                    type="color"
                    value={playerSetup[idx].color}
                    onChange={e => handleSetupChange(idx, 'color', e.target.value)}
                    style={{ width: 36, height: 36, border: 'none', background: 'none', verticalAlign: 'middle' }}
                  />
                </div>
              </div>
            ))}
            <button type="submit" style={{ background: '#22c55e', color: '#fff', fontWeight: 'bold', padding: '10px 32px', borderRadius: 8, border: 'none', fontSize: 18, marginTop: 12, cursor: 'pointer' }}>Start Game</button>
          </form>
        ) : (
          <>
            <h1 className="text-white text-3xl font-bold mb-6 text-center">Golf</h1>
            <div style={{ color: playerSetup[currentPlayer].color, fontWeight: 'bold', marginBottom: 8, fontSize: 22 }}>
              {playerSetup[currentPlayer].name || `Player ${currentPlayer + 1}`}'s Turn
            </div>
            {/* Player boards side by side */}
            <div style={{ display: 'flex', gap: '48px', marginBottom: '32px', justifyContent: 'center' }}>
              {/* Human player board */}
              <div>
                <div style={{ color: playerSetup[0].color, fontWeight: 'bold', marginBottom: 4, fontSize: 18, textAlign: 'center' }}>{playerSetup[0].name || 'You'}</div>
                <div style={{ marginBottom: 6, fontWeight: 'bold', color: '#222', textAlign: 'center' }}>
                  Running Total: {calculateVisibleScore(players[0].cards)}
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 60px)',
                  gridTemplateRows: 'repeat(2, 90px)',
                  gap: '10px',
                  background: playerSetup[0].color,
                  borderRadius: 12,
                  padding: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  {(players[0]?.cards || Array(8).fill(null)).map((card, idx) => (
                    <div
                      key={card ? card.id : idx}
                      style={{ width: '60px', height: '90px', background: card?.faceUp ? '#eee' : '#333', color: card?.faceUp ? '#222' : '#eee', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', cursor: card?.faceUp ? 'default' : (!drawnCard && mustFlipAfterDiscard[0] && !card.faceUp && !turnComplete[0]) ? 'pointer' : (drawnCard && initialFlips[0] && !turnComplete[0] && discardPile.length > 0 && drawnCard === discardPile[0]) ? 'pointer' : (drawnCard && initialFlips[0] && !turnComplete[0] && drawnCard !== discardPile[0]) ? 'pointer' : (!initialFlips[0] && players[0].flippedCount < 2 && !drawnCard && !card.faceUp && !turnComplete[0]) ? 'pointer' : 'default' }}
                      onClick={() => {
                        if (currentPlayer !== 0) return;
                        // Allow flipping if mustFlipAfterDiscard is true, card is face down, and turn not complete
                        if (mustFlipAfterDiscard[0] && card && !card.faceUp && !turnComplete[0] && !drawnCard) {
                          setPlayers(players => players.map((p, i) =>
                            i === 0
                              ? {
                                  ...p,
                                  cards: p.cards.map((c, j) => j === idx ? { ...c, faceUp: true } : c),
                                  flippedCount: p.flippedCount + 1
                                }
                              : p
                          ));
                          setMustFlipAfterDiscard(flipArr => flipArr.map((f, i) => i === 0 ? false : f));
                          setFirstTurnDraw(arr => arr.map((v, i) => i === 0 ? false : v));
                          setTurnComplete(tc => tc.map((val, i) => i === 0 ? true : val));
                          return;
                        }
                        // Allow initial flips (first two cards) for current player only
                        if (!initialFlips[0] && players[0].flippedCount < 2 && !drawnCard && card && !card.faceUp && !turnComplete[0]) {
                          setPlayers(players => players.map((p, i) =>
                            i === 0
                              ? {
                                  ...p,
                                  cards: p.cards.map((c, j) => j === idx ? { ...c, faceUp: true } : c),
                                  flippedCount: p.flippedCount + 1
                                }
                              : p
                          ));
                          // After second flip, set initialFlips[0] to true
                          if (players[0].flippedCount + 1 === 2) {
                            setInitialFlips(flips => flips.map((f, i) => i === 0 ? true : f));
                          }
                          return;
                        }
                        // If drawnCard is from discard pile, must swap it for a card
                        if (drawnCard && initialFlips[0] && !turnComplete[0] && discardPile.length > 0 && drawnCard === discardPile[0]) {
                          replaceCard(idx);
                          return;
                        }
                        // If drawnCard is from draw pile, can swap or discard (with flip)
                        if (drawnCard && initialFlips[0] && !turnComplete[0] && drawnCard !== discardPile[0]) {
                          replaceCard(idx);
                          return;
                        }
                      }}
                    >
                      {card?.faceUp ? card.value : '?'}
                    </div>
                  ))}
                </div>
              </div>
              {/* Computer player board */}
              <div>
                <div style={{ color: playerSetup[1].color, fontWeight: 'bold', marginBottom: 4, fontSize: 18, textAlign: 'center' }}>{playerSetup[1].name || 'Computer'}</div>
                <div style={{ marginBottom: 6, fontWeight: 'bold', color: '#222', textAlign: 'center' }}>
                  Running Total: {calculateVisibleScore(players[1].cards)}
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 60px)',
                  gridTemplateRows: 'repeat(2, 90px)',
                  gap: '10px',
                  background: playerSetup[1].color,
                  borderRadius: 12,
                  padding: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  {(players[1]?.cards || Array(8).fill(null)).map((card, idx) => (
                    <div
                      key={card ? card.id : idx}
                      style={{ width: '60px', height: '90px', background: card?.faceUp ? '#eee' : '#333', color: card?.faceUp ? '#222' : '#eee', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', cursor: card?.faceUp ? 'default' : (!drawnCard && mustFlipAfterDiscard[1] && !card.faceUp && !turnComplete[1]) ? 'pointer' : (drawnCard && initialFlips[1] && !turnComplete[1]) ? 'pointer' : (!initialFlips[1] && players[1].flippedCount < 2 && !drawnCard && !card.faceUp && !turnComplete[1]) ? 'pointer' : 'default' }}
                      onClick={() => {
                        if (currentPlayer !== 1) return;
                        // Computer logic: flip if mustFlipAfterDiscard is true, card is face down, and turn not complete
                        if (mustFlipAfterDiscard[1] && card && !card.faceUp && !turnComplete[1] && !drawnCard) {
                          setPlayers(players => players.map((p, i) =>
                            i === 1
                              ? {
                                  ...p,
                                  cards: p.cards.map((c, j) => j === idx ? { ...c, faceUp: true } : c),
                                  flippedCount: p.flippedCount + 1
                                }
                              : p
                          ));
                          setMustFlipAfterDiscard(flipArr => flipArr.map((f, i) => i === 1 ? false : f));
                          setFirstTurnDraw(arr => arr.map((v, i) => i === 1 ? false : v));
                          setTurnComplete(tc => tc.map((val, i) => i === 1 ? true : val));
                          return;
                        }
                        // Computer allows initial flips (first two cards) automatically
                        if (!initialFlips[1] && players[1].flippedCount < 2 && !drawnCard && card && !card.faceUp && !turnComplete[1]) {
                          setPlayers(players => players.map((p, i) =>
                            i === 1
                              ? {
                                  ...p,
                                  cards: p.cards.map((c, j) => j === idx ? { ...c, faceUp: true } : c),
                                  flippedCount: p.flippedCount + 1
                                }
                              : p
                          ));
                          if (!initialFlips[0] && players[0].flippedCount === 0) {
                            setInitialFlips(flips => flips.map((f, i) => i === 1 ? true : f));
                          }
                          return;
                        }
                        // Computer does not swap with drawn card; only replaces cards or discards
                        if (drawnCard && initialFlips[1] && !turnComplete[1]) {
                          replaceCard(idx);
                          return;
                        }
                      }}
                    >
                      {card?.faceUp ? card.value : '?'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Draw and Discard Area below both boards */}
            <div style={{ display: 'flex', gap: '24px', marginBottom: '40px', justifyContent: 'center' }}>
              {/* Draw pile */}
              <div
                onClick={initialFlips[currentPlayer] && !turnComplete[currentPlayer] && (!firstTurnDraw[currentPlayer] || (firstTurnDraw[currentPlayer] && !drawnCard)) ? drawCard : undefined}
                style={{ width: '60px', height: '90px', background: drawnCard ? '#FFD600' : '#333', color: drawnCard ? '#14532D' : '#eee', border: '2px solid #333', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px', cursor: drawnCard || turnComplete[currentPlayer] || (firstTurnDraw[currentPlayer] && drawnCard) ? 'not-allowed' : 'pointer' }}
              >
                {drawnCard ? drawnCard.value : '?'}
              </div>
              {/* Discard pile */}
              <div
                onClick={initialFlips[currentPlayer] && !turnComplete[currentPlayer] ? pickUpDiscard : undefined}
                style={{
                  width: '60px',
                  height: '90px',
                  background: '#fff',
                  color: '#14532D',
                  border: '2px solid #14532D',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  cursor: drawnCard || turnComplete[currentPlayer] ? 'not-allowed' : (discardPile.length > 0 ? 'pointer' : 'default'),
                }}
              >
                {discardPile.length > 0 ? discardPile[0].value : '-'}
              </div>
              {/* Discard drawn card button */}
              {drawnCard && (
                <button
                  onClick={discardDrawnCard}
                  style={{ marginLeft: 16, background: '#ef4444', color: '#fff', fontWeight: 'bold', padding: '10px 18px', borderRadius: 8, border: 'none', fontSize: 16, cursor: 'pointer' }}
                >
                  Discard Drawn
                </button>
              )}
            </div>
            {/* Action buttons below draw/discard area */}
            <div style={{ marginTop: '24px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                style={{ background: '#FFD600', color: '#14532D', fontWeight: 'bold', padding: '12px 32px', borderRadius: '999px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: 'none', cursor: 'pointer' }}
                onClick={() => window.location.reload()}
              >
                Reset
              </button>
              <button
                style={{ background: '#14532D', color: '#FFD600', fontWeight: 'bold', padding: '12px 32px', borderRadius: '999px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: 'none', cursor: 'pointer' }}
                onClick={() => setRoundOver(true)}
              >
                End Round
              </button>
              <button
                style={{ background: turnComplete[currentPlayer] ? '#0ea5e9' : '#aaa', color: '#fff', fontWeight: 'bold', padding: '12px 32px', borderRadius: '999px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: 'none', cursor: turnComplete[currentPlayer] ? 'pointer' : 'not-allowed' }}
                onClick={turnComplete[currentPlayer] ? () => setCurrentPlayer((currentPlayer + 1) % 2) : undefined}
                disabled={!turnComplete[currentPlayer]}
              >
                End Turn
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
