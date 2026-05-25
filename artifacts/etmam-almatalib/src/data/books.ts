import rawData from "../bookData.json";
import type { Book } from "../types";
import { normalizeArabic } from "../utils/arabic";

export const books: Book[] = rawData as Book[];

export function getBook(id: string): Book | undefined {
  return books.find(b => b.id === id);
}

export function searchBooks(query: string, maxResults = 60) {
  if (!query.trim() || query.length < 2) return [];
  const q = normalizeArabic(query.trim());
  const results: Array<{
    bookId: string;
    bookTitle: string;
    babId?: string;
    babTitle?: string;
    faslId?: string;
    faslTitle?: string;
    text: string;
  }> = [];

  for (const book of books) {
    if (results.length >= maxResults) break;

    for (const line of book.introContent || []) {
      if (normalizeArabic(line).includes(q)) {
        results.push({ bookId: book.id, bookTitle: book.title, text: line });
        if (results.length >= maxResults) break;
      }
    }

    for (const bab of book.abwab) {
      if (results.length >= maxResults) break;

      for (const line of bab.content) {
        if (normalizeArabic(line).includes(q)) {
          results.push({ bookId: book.id, bookTitle: book.title, babId: bab.id, babTitle: bab.title, text: line });
          if (results.length >= maxResults) break;
        }
      }

      for (const fasl of bab.fusul) {
        if (results.length >= maxResults) break;
        for (const line of fasl.content) {
          if (normalizeArabic(line).includes(q)) {
            results.push({ bookId: book.id, bookTitle: book.title, babId: bab.id, babTitle: bab.title, faslId: fasl.id, faslTitle: fasl.title, text: line });
            if (results.length >= maxResults) break;
          }
        }
      }
    }
  }

  return results;
}

export function getAdjacentBook(id: string, dir: 'prev' | 'next'): Book | undefined {
  const idx = books.findIndex(b => b.id === id);
  if (idx < 0) return undefined;
  return dir === 'prev' ? books[idx - 1] : books[idx + 1];
}

export function getAllSections(bookId: string) {
  const book = getBook(bookId);
  if (!book) return [];
  const sections: Array<{ bookId: string; babId?: string; faslId?: string; title: string }> = [
    { bookId, title: book.title },
  ];
  for (const bab of book.abwab) {
    sections.push({ bookId, babId: bab.id, title: bab.title });
    for (const fasl of bab.fusul) {
      sections.push({ bookId, babId: bab.id, faslId: fasl.id, title: fasl.title });
    }
  }
  return sections;
}
