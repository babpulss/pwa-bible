export type Verse = {
  number: number;
  text: string;
};

export type Chapter = {
  number: number;
  verses: Verse[];
};

export type Book = {
  number: number;
  title: string;
  chapters: Chapter[];
};

export type BibleData = {
  translation: string;
  language: string;
  books: Book[];
};

export type Selection = {
  book: number;
  chapter: number;
};

export type Theme = "light" | "dark" | "highContrast";

export type TranslationId = "kor" | "kjv" | "ja" | "ita";

export type SearchResult = {
  bookNumber: number;
  bookTitle: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
  translationId: TranslationId;
};
