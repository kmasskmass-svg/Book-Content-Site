import { useState, useCallback } from 'react';
import { books } from '../data/books';

const KEY = 'etmam-progress';

interface ProgressData {
  [bookId: string]: Set<string>;
}

export function useProgress() {
  const [visited, setVisited] = useState<Record<string, string[]>>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{}');
    } catch {
      return {};
    }
  });

  const markVisited = useCallback((bookId: string, sectionId: string) => {
    setVisited(prev => {
      const bookSections = prev[bookId] || [];
      if (bookSections.includes(sectionId)) return prev;
      const updated = { ...prev, [bookId]: [...bookSections, sectionId] };
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getBookProgress = useCallback((bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return 0;
    const totalSections = 1 + book.abwab.length + book.abwab.reduce((a, b) => a + b.fusul.length, 0);
    const visitedCount = (visited[bookId] || []).length;
    return totalSections > 0 ? Math.min(100, Math.round((visitedCount / totalSections) * 100)) : 0;
  }, [visited]);

  const getTotalProgress = useCallback(() => {
    const totalBooks = books.filter(b => b.id !== 'muqaddima').length;
    const visitedBooks = Object.keys(visited).filter(id => id !== 'muqaddima' && (visited[id] || []).length > 0).length;
    return totalBooks > 0 ? Math.round((visitedBooks / totalBooks) * 100) : 0;
  }, [visited]);

  return { markVisited, getBookProgress, getTotalProgress, visited };
}
