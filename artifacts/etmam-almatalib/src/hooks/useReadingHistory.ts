import { useState, useCallback } from 'react';

export interface HistoryEntry {
  bookId: string;
  bookTitle: string;
  babId?: string;
  babTitle?: string;
  faslId?: string;
  faslTitle?: string;
  visitedAt: number;
}

const KEY = 'etmam-history';
const MAX = 20;

export function useReadingHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
      return [];
    }
  });

  const addEntry = useCallback((entry: Omit<HistoryEntry, 'visitedAt'>) => {
    setHistory(prev => {
      const filtered = prev.filter(h =>
        !(h.bookId === entry.bookId && h.babId === entry.babId && h.faslId === entry.faslId)
      );
      const updated = [{ ...entry, visitedAt: Date.now() }, ...filtered].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(KEY);
  }, []);

  return { history, addEntry, clearHistory };
}
