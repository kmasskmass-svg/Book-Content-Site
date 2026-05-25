import { useState, useCallback } from 'react';
import type { Bookmark } from '../types';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const stored = localStorage.getItem('etmam-bookmarks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const save = (bms: Bookmark[]) => {
    setBookmarks(bms);
    localStorage.setItem('etmam-bookmarks', JSON.stringify(bms));
  };

  const addBookmark = useCallback((bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
    setBookmarks(prev => {
      const exists = prev.find(b =>
        b.bookId === bookmark.bookId &&
        b.babId === bookmark.babId &&
        b.faslId === bookmark.faslId
      );
      if (exists) return prev;
      const newBm: Bookmark = {
        ...bookmark,
        id: Date.now().toString(),
        createdAt: Date.now(),
      };
      const updated = [newBm, ...prev];
      localStorage.setItem('etmam-bookmarks', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks(prev => {
      const updated = prev.filter(b => b.id !== id);
      localStorage.setItem('etmam-bookmarks', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isBookmarked = useCallback((bookId: string, babId?: string, faslId?: string) => {
    return bookmarks.some(b =>
      b.bookId === bookId &&
      b.babId === babId &&
      b.faslId === faslId
    );
  }, [bookmarks]);

  return { bookmarks, addBookmark, removeBookmark, isBookmarked };
}
