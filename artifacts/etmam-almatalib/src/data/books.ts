import rawData from "../bookData.json";
import type { Book } from "../types";

export const books: Book[] = rawData as Book[];

export function getBook(id: string): Book | undefined {
  return books.find(b => b.id === id);
}

export function searchBooks(query: string, maxResults = 50) {
  if (!query.trim() || query.length < 2) return [];
  const q = query.trim().toLowerCase();
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

    // Search intro content
    for (const line of (book.introContent || [])) {
      if (line.toLowerCase().includes(q)) {
        results.push({
          bookId: book.id,
          bookTitle: book.title,
          text: line,
        });
        if (results.length >= maxResults) break;
      }
    }

    for (const bab of book.abwab) {
      if (results.length >= maxResults) break;

      for (const line of bab.content) {
        if (line.toLowerCase().includes(q)) {
          results.push({
            bookId: book.id,
            bookTitle: book.title,
            babId: bab.id,
            babTitle: bab.title,
            text: line,
          });
          if (results.length >= maxResults) break;
        }
      }

      for (const fasl of bab.fusul) {
        if (results.length >= maxResults) break;
        for (const line of fasl.content) {
          if (line.toLowerCase().includes(q)) {
            results.push({
              bookId: book.id,
              bookTitle: book.title,
              babId: bab.id,
              babTitle: bab.title,
              faslId: fasl.id,
              faslTitle: fasl.title,
              text: line,
            });
            if (results.length >= maxResults) break;
          }
        }
      }
    }
  }

  return results;
}
