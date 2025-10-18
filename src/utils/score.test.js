import { describe, expect, it } from 'vitest'
import { calculateVisibleScore, calculateScore } from './score'

const faceUpCard = value => ({ value, faceUp: true })
const faceDownCard = value => ({ value, faceUp: false })

const buildGrid = rows => rows.flat()

describe('calculateVisibleScore', () => {
  it('returns 0 when all cards are face down', () => {
    const cards = Array(8).fill(faceDownCard(5))
    expect(calculateVisibleScore(cards)).toBe(0)
  })

  it('sums only visible cards', () => {
    const cards = buildGrid([
      [faceUpCard(5), faceDownCard(7), faceDownCard(2), faceDownCard(9)],
      [faceDownCard(6), faceUpCard(3), faceDownCard(4), faceDownCard(1)],
    ])
    expect(calculateVisibleScore(cards)).toBe(8)
  })

  it('ignores vertically matched visible pairs that are not -5', () => {
    const cards = buildGrid([
      [faceUpCard(4), faceUpCard(8), faceUpCard(2), faceDownCard(9)],
      [faceUpCard(4), faceDownCard(3), faceUpCard(2), faceUpCard(7)],
    ])
    expect(calculateVisibleScore(cards)).toBe(15)
  })
})

describe('calculateScore', () => {
  it('sums values when no matches or -5 pair present', () => {
    const cards = buildGrid([
      [faceUpCard(3), faceUpCard(7), faceUpCard(5), faceUpCard(1)],
      [faceUpCard(4), faceUpCard(2), faceUpCard(8), faceUpCard(0)],
    ])
    // 3+4 + 7+2 + 5+8 + 1+0 = 30
    expect(calculateScore(cards)).toBe(30)
  })

  it('cancels a single matching column (no bonus yet)', () => {
    const cards = buildGrid([
      [faceUpCard(4), faceUpCard(7), faceUpCard(5), faceUpCard(1)],
      [faceUpCard(4), faceUpCard(2), faceUpCard(8), faceUpCard(0)],
    ])
    // Column 1 cancels; others sum: (7+2) + (5+8) + (1+0) = 23
    expect(calculateScore(cards)).toBe(23)
  })

  it('applies -10 bonus for two matching columns', () => {
    const cards = buildGrid([
      [faceUpCard(4), faceUpCard(7), faceUpCard(5), faceUpCard(1)],
      [faceUpCard(4), faceUpCard(7), faceUpCard(8), faceUpCard(0)],
    ])
    // Matches cols 1 (4/4) and 2 (7/7): same value pairs but different values from each other.
    // New rule: Bonus only if matched columns share the SAME value; here we have one 4-pair and one 7-pair -> no bonus.
    // Remaining cols: (5+8) + (1+0) = 14
    expect(calculateScore(cards)).toBe(14)
  })

  it('applies -15 bonus for three matching columns', () => {
    const cards = buildGrid([
      [faceUpCard(4), faceUpCard(7), faceUpCard(5), faceUpCard(1)],
      [faceUpCard(4), faceUpCard(7), faceUpCard(5), faceUpCard(9)],
    ])
    // Three matched columns but of different values (4,7,5). Largest homogeneous group size is 1 -> no bonus.
    // Remaining col: 1+9=10
    expect(calculateScore(cards)).toBe(10)
  })

  it('applies -20 bonus for four matching columns (all eight same numbers or four pairs)', () => {
    const cards = buildGrid([
      [faceUpCard(4), faceUpCard(4), faceUpCard(4), faceUpCard(4)],
      [faceUpCard(4), faceUpCard(4), faceUpCard(4), faceUpCard(4)],
    ])
    // All columns cancel => 0 then bonus -20
    expect(calculateScore(cards)).toBe(-20)
  })

    it('does not apply bonus for only one matching column', () => {
      // Build hand: column 0 matching (both 7), others mismatched distinct values
      const cards = [
        { value: 7, faceUp: true },
        { value: 1, faceUp: true },
        { value: 2, faceUp: true },
        { value: 3, faceUp: true },
        { value: 7, faceUp: true },
        { value: 4, faceUp: true },
        { value: 5, faceUp: true },
        { value: 6, faceUp: true },
      ]
      // Matching column cancels (0), others sum: (1+4)+(2+5)+(3+6)= (5)+(7)+(9)=21
      // No bonus should apply
      expect(calculateScore(cards)).toBe(21)
    })

  it('scores two -5 columns and no hole-in-one bonus (only 4 -5 cards total triggers bonus)', () => {
    const cards = buildGrid([
      [faceUpCard(-5), faceUpCard(3), faceUpCard(-5), faceUpCard(7)],
      [faceUpCard(-5), faceUpCard(6), faceUpCard(-5), faceUpCard(4)],
    ])
    // Two -5 columns: each contributes -10; other columns: (3+6)=9, (7+4)=11 => raw: -10 -10 + 9 + 11 = 0
    // minusFiveCount = 4 => hole-in-one bonus -10 => final -10
    expect(calculateScore(cards)).toBe(-10)
  })

  it('example walkthrough results in -1', () => {
    const cards = buildGrid([
      [faceUpCard(4), faceUpCard(8), faceUpCard(8), faceUpCard(3)],
      [faceUpCard(4), faceUpCard(8), faceUpCard(8), faceUpCard(11)],
    ])
    // Columns 1-3 cancel; they include two 8 columns and one 4 column.
    // Largest homogeneous matched group is the 8s with size 2 -> bonus -10.
    // Remaining col: 3+11 = 14; final 14 - 10 = 4
    expect(calculateScore(cards)).toBe(4)
  })

  it('does not give bonus for two different matched columns (0/0 and 6/6)', () => {
    const cards = buildGrid([
      [faceUpCard(0), faceUpCard(1), faceUpCard(6), faceUpCard(6)],
      [faceUpCard(0), faceUpCard(0), faceUpCard(12), faceUpCard(6)],
    ])
    // Matched columns: (0,0) and (6,6) but values differ; no homogeneous group >=2 except each individually size 1.
    // Raw: canceled cols 1 & 4 => 0. Remaining cols: col2 1+0=1, col3 6+12=18 => 19
    expect(calculateScore(cards)).toBe(19)
  })
})
