export type Verse = {
  number: number
  text: string
}

export type Chapter = {
  number: number
  verses: Verse[]
}

export type Book = {
  number: number
  title: string
  chapters: Chapter[]
}

export type BibleData = {
  translation: string
  language: string
  books: Book[]
}

export type Selection = {
  book: number
  chapter: number
}

export type Theme = 'light' | 'dark'

export type SearchResult = {
  bookNumber: number
  bookTitle: string
  chapter: number
  verse: number
  text: string
}
