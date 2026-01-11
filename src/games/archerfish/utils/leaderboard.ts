import type { Difficulty } from '../types';

export interface LeaderboardEntry {
  id: string;
  player_name: string;
  survival_time: number;
  difficulty: Difficulty;
  is_human: boolean;
  timestamp: string;
}

const STORAGE_KEY = 'archerfish:leaderboard';

export function getLeaderboard(difficulty?: Difficulty, limit: number = 10): LeaderboardEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    let entries: LeaderboardEntry[] = JSON.parse(data);
    
    // Filter by difficulty if specified
    if (difficulty) {
      entries = entries.filter(entry => entry.difficulty === difficulty);
    }
    
    // Sort by survival time (descending) and limit results
    return entries
      .sort((a, b) => b.survival_time - a.survival_time)
      .slice(0, limit);
  } catch (error) {
    console.error('Error reading leaderboard:', error);
    return [];
  }
}

export function saveLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'timestamp'>): boolean {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const entries: LeaderboardEntry[] = data ? JSON.parse(data) : [];
    
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    
    entries.push(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch (error) {
    console.error('Error saving leaderboard entry:', error);
    return false;
  }
}

export function clearLeaderboard(difficulty?: Difficulty): boolean {
  try {
    if (!difficulty) {
      // Clear all entries
      localStorage.removeItem(STORAGE_KEY);
      return true;
    }
    
    // Clear only entries for specific difficulty
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return true;
    
    const entries: LeaderboardEntry[] = JSON.parse(data);
    const filtered = entries.filter(entry => entry.difficulty !== difficulty);
    
    if (filtered.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing leaderboard:', error);
    return false;
  }
}
