export interface Fasl {
  id: string;
  title: string;
  content: string[];
}

export interface Bab {
  id: string;
  title: string;
  content: string[];
  fusul: Fasl[];
}

export interface Book {
  id: string;
  title: string;
  abwab: Bab[];
  introContent: string[];
}

export interface Bookmark {
  id: string;
  bookId: string;
  babId?: string;
  faslId?: string;
  title: string;
  bookTitle: string;
  createdAt: number;
}

export interface Settings {
  fontSize: number;
  theme: 'light' | 'dark' | 'sepia';
  fontFamily: 'amiri' | 'noto' | 'scheherazade';
  lineHeight: number;
}

export interface SearchResult {
  bookId: string;
  bookTitle: string;
  babId?: string;
  babTitle?: string;
  faslId?: string;
  faslTitle?: string;
  text: string;
  matchIndex: number;
}
