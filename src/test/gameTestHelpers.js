// Helper utilities for test scenarios to reduce duplication.
// finishPlayer: flips all cards of the specified player faceUp and sets flippedCount accordingly.
export function finishPlayer(result, playerIndex) {
  // Uses exposeTestHelpers __setPlayers from useGameState when available.
  const flipAll = ps => ps.map((p,i) => i!==playerIndex ? p : {
    ...p,
    cards: p.cards.map(c => ({ ...c, faceUp: true })),
    flippedCount: p.cards.length,
  })
  result.current.__setPlayers(flipAll)
}
