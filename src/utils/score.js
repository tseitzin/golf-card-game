// Visible score: sum of face-up values applying cancellation for fully visible matched non -5 vertical pairs.
// Bonuses are NOT applied here; only cancellations.
export function calculateVisibleScore(cards) {
  let score = 0
  for (let col = 0; col < 4; col++) {
    const top = cards[col]
    const bottom = cards[col + 4]
    if (top.faceUp && bottom.faceUp && top.value === bottom.value && top.value !== -5) {
      // Cancel both; contribute 0
      continue
    }
    if (top.faceUp) score += top.value
    if (bottom.faceUp) score += bottom.value
  }
  return score
}

// Final score once all cards are face up.
// Rules implemented:
// 1. Matching vertical pair (same column, same value, not -5) => both contribute 0.
// 2. Matching columns counts toward bonuses:
//    - 2 matching columns => extra -10
//    - 3 matching columns => extra -15
//    - 4 matching columns => extra -20
// 3. All 8 cards identical (which implies 4 matching columns) => already covered by 4 columns bonus (-20) AND all are canceled.
// 4. Hole-In-One (-5) cards: individual columns with two -5s each contribute -10 (two cards worth -5 each). They do NOT cancel.
//    Collecting all four -5 cards (i.e., four separate -5 cards somewhere) gives an additional -10 bonus (total -30 for the four).
//    In our 8-card layout, this means exactly four cards with value -5 present.
export function calculateScore(cards) {
  // Assume all cards faceUp when computing final score; caller should enforce.
  let rawScore = 0
  let minusFiveCount = 0
  const matchedColumnsByValue = {}

  for (let i = 0; i < cards.length; i++) {
    if (cards[i].value === -5) minusFiveCount++
  }

  for (let col = 0; col < 4; col++) {
    const top = cards[col]
    const bottom = cards[col + 4]
    if (top.value === bottom.value && top.value !== -5) {
      // Canceled column; track by value for grouping toward bonuses
      matchedColumnsByValue[top.value] = (matchedColumnsByValue[top.value] || 0) + 1
      continue
    }
    if (top.value === bottom.value && top.value === -5) {
      // Two -5s: they still count; add both values (-10)
      rawScore += -10
      continue
    }
    rawScore += top.value + bottom.value
  }

  // Determine the largest group of matched columns with identical values
  const groupSizes = Object.values(matchedColumnsByValue)
  const largestGroup = groupSizes.length ? Math.max(...groupSizes) : 0
  let bonus = 0
  if (largestGroup === 2) bonus -= 10
  else if (largestGroup === 3) bonus -= 15
  else if (largestGroup === 4) bonus -= 20

  // Special Hole-In-One complete set bonus
  if (minusFiveCount === 4) {
    bonus -= 10 // Additional beyond their individual -5 values
  }

  return rawScore + bonus
}

// Detailed breakdown for debugging / UI explanations.
// Returns an object: { rawScore, matchingColumnCount, minusFiveCount, bonus, final, columns: [ {top: value, bottom: value, canceled: bool, isMinusFivePair: bool } ] }
export function explainScore(cards) {
  let rawScore = 0
  let minusFiveCount = cards.reduce((acc, c) => acc + (c.value === -5 ? 1 : 0), 0)
  const columns = []
  const matchedColumnsByValue = {}

  for (let col = 0; col < 4; col++) {
    const top = cards[col]
    const bottom = cards[col + 4]
    if (top.value === bottom.value && top.value !== -5) {
      matchedColumnsByValue[top.value] = (matchedColumnsByValue[top.value] || 0) + 1
      columns.push({ top: top.value, bottom: bottom.value, canceled: true, isMinusFivePair: false, value: top.value })
      continue
    }
    if (top.value === bottom.value && top.value === -5) {
      rawScore += -10
      columns.push({ top: top.value, bottom: bottom.value, canceled: false, isMinusFivePair: true, value: top.value })
      continue
    }
    rawScore += top.value + bottom.value
    columns.push({ top: top.value, bottom: bottom.value, canceled: false, isMinusFivePair: false, value: null })
  }

  const groupSizes = Object.values(matchedColumnsByValue)
  const largestGroup = groupSizes.length ? Math.max(...groupSizes) : 0
  let bonus = 0
  if (largestGroup === 2) bonus -= 10
  else if (largestGroup === 3) bonus -= 15
  else if (largestGroup === 4) bonus -= 20
  if (minusFiveCount === 4) bonus -= 10

  return {
    rawScore,
    matchingColumnCount: largestGroup, // rename meaning: largest homogeneous matched group size
    minusFiveCount,
    bonus,
    final: rawScore + bonus,
    columns: columns.map(c => ({
      ...c,
      countsTowardBonus: c.canceled && matchedColumnsByValue[c.value] === largestGroup && largestGroup > 1,
    })),
  }
}
