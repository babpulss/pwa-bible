import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Selection, Theme, SearchResult } from './types/bible'
import { useBibleTranslation } from './hooks/useBibleTranslation'
import './App.css'

const STORAGE_KEY = 'simple-bible:last-selection'
const THEME_KEY = 'simple-bible:theme'
const FONT_SCALE_KEY = 'simple-bible:font-scale'
const SHOW_ENGLISH_KEY = 'simple-bible:show-english'
const SEARCH_LIMIT = 120
const MIN_FONT_SCALE = 0.85
const MAX_FONT_SCALE = 1.4
const FONT_STEP = 0.1

const loadSelection = (): Selection | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as Selection
    if (typeof parsed.book === 'number' && typeof parsed.chapter === 'number') {
      return parsed
    }
  } catch (error) {
    console.error('Failed to read saved selection', error)
  }
  return null
}

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'light'
  }
  const stored = window.localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const getInitialFontScale = (): number => {
  if (typeof window === 'undefined') {
    return 1
  }
  const stored = window.localStorage.getItem(FONT_SCALE_KEY)
  if (!stored) {
    return 1
  }
  const parsed = Number.parseFloat(stored)
  if (Number.isFinite(parsed)) {
    return Math.min(MAX_FONT_SCALE, Math.max(MIN_FONT_SCALE, parsed))
  }
  return 1
}

function App() {
  const [bookIndex, setBookIndex] = useState(0)
  const [chapterIndex, setChapterIndex] = useState(0)
  const [savedSelection] = useState<Selection | null>(() =>
    typeof window !== 'undefined' ? loadSelection() : null
  )
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [focusTarget, setFocusTarget] = useState<Selection & { verse: number } | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [manualTheme, setManualTheme] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false
    }
    const stored = window.localStorage.getItem(THEME_KEY)
    return stored === 'light' || stored === 'dark'
  })
  const [theme, setTheme] = useState<Theme>(() => {
    const initial = getInitialTheme()
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement
      root.dataset.theme = initial
      root.style.colorScheme = initial
    }
    return initial
  })
  const [fontScale, setFontScale] = useState<number>(() => getInitialFontScale())
  const [showEnglish, setShowEnglish] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }
    const stored = window.localStorage.getItem(SHOW_ENGLISH_KEY)
    return stored !== 'false'
  })
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const searchTimeoutRef = useRef<number | null>(null)

  const {
    data: koreanData,
    isPending: koreanPending,
    error: koreanError
  } = useBibleTranslation('kor')
  const {
    data: englishData,
    isPending: englishPending,
    error: englishError
  } = useBibleTranslation('kjv')

  const isPending = koreanPending || (showEnglish && englishPending)
  const loadError = koreanError
    ? '성경 데이터를 불러오지 못했습니다. 오프라인 상태인지 확인해주세요.'
    : null
  const englishLoadError = !showEnglish || koreanError
    ? null
    : englishError
    ? 'KJV 데이터를 불러오지 못했습니다.'
    : null

  useEffect(() => {
    if (!koreanData || !savedSelection) {
      return
    }
    const bookIdx = koreanData.books.findIndex((book) => book.number === savedSelection.book)
    if (bookIdx >= 0) {
      setBookIndex(bookIdx)
      const chapterIdx = koreanData.books[bookIdx].chapters.findIndex(
        (chapter) => chapter.number === savedSelection.chapter
      )
      if (chapterIdx >= 0) {
        setChapterIndex(chapterIdx)
      }
    }
  }, [koreanData, savedSelection])

  useEffect(() => {
    if (!koreanData) {
      return
    }
    const book = koreanData.books[bookIndex]
    if (!book) {
      return
    }
    const chapter = book.chapters[chapterIndex]
    if (!chapter) {
      return
    }
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ book: book.number, chapter: chapter.number })
    )
  }, [koreanData, bookIndex, chapterIndex])

  useEffect(() => {
    if (!focusTarget || !koreanData) {
      return
    }
    const book = koreanData.books[bookIndex]
    if (!book || book.number !== focusTarget.book) {
      return
    }
    const chapter = book.chapters[chapterIndex]
    if (!chapter || chapter.number !== focusTarget.chapter) {
      return
    }
    const id = `verse-${focusTarget.book}-${focusTarget.chapter}-${focusTarget.verse}`
    let timeoutId: number | undefined
    const frame = window.requestAnimationFrame(() => {
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.classList.add('highlight')
        timeoutId = window.setTimeout(() => {
          element.classList.remove('highlight')
        }, 1600)
      }
    })
    return () => {
      window.cancelAnimationFrame(frame)
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [focusTarget, koreanData, bookIndex, chapterIndex])

  useEffect(() => {
    if (!focusTarget) {
      return
    }
    const cleanup = window.setTimeout(() => {
      setFocusTarget(null)
    }, 2000)
    return () => window.clearTimeout(cleanup)
  }, [focusTarget])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const root = window.document.documentElement
    root.dataset.theme = theme
    root.style.colorScheme = theme
  }, [theme])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.document.documentElement.style.setProperty('--reader-font-scale', fontScale.toString())
  }, [fontScale])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(FONT_SCALE_KEY, fontScale.toString())
  }, [fontScale])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(SHOW_ENGLISH_KEY, String(showEnglish))
  }, [showEnglish])

  useEffect(() => {
    if (manualTheme && typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_KEY, theme)
    }
  }, [theme, manualTheme])

  useEffect(() => {
    if (manualTheme || typeof window === 'undefined') {
      return
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? 'dark' : 'light')
    }
    media.addEventListener('change', listener)
    return () => {
      media.removeEventListener('change', listener)
    }
  }, [manualTheme])

  useEffect(() => {
    if (!showSearch) {
      return
    }
    const frame = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [showSearch])

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current !== null) {
        window.clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const currentBook = useMemo(() => {
    if (!koreanData) {
      return null
    }
    return koreanData.books[bookIndex] ?? null
  }, [koreanData, bookIndex])

  const currentChapter = useMemo(() => {
    if (!currentBook) {
      return null
    }
    return currentBook.chapters[chapterIndex] ?? null
  }, [currentBook, chapterIndex])

  const englishBook = useMemo(() => {
    if (!showEnglish || !englishData) {
      return null
    }
    return englishData.books[bookIndex] ?? null
  }, [englishData, bookIndex, showEnglish])

  const englishChapter = useMemo(() => {
    if (!showEnglish || !englishBook) {
      return null
    }
    return englishBook.chapters[chapterIndex] ?? null
  }, [englishBook, chapterIndex, showEnglish])

  const showEnglishColumn = Boolean(englishChapter)

  const combinedVerses = useMemo(() => {
    if (!currentChapter) {
      return []
    }
    const englishMap = new Map<number, string>()
    if (englishChapter) {
      englishChapter.verses.forEach((verse) => {
        englishMap.set(verse.number, verse.text)
      })
    }
    return currentChapter.verses.map((verse) => ({
      number: verse.number,
      korean: verse.text,
      english: englishMap.get(verse.number) ?? ''
    }))
  }, [currentChapter, englishChapter])

  const adjustFontScale = (delta: number) => {
    setFontScale((prev) => {
      const next = Math.min(
        MAX_FONT_SCALE,
        Math.max(MIN_FONT_SCALE, Number((prev + delta).toFixed(2)))
      )
      return next
    })
  }

  const increaseFont = () => adjustFontScale(FONT_STEP)
  const decreaseFont = () => adjustFontScale(-FONT_STEP)
  const toggleEnglish = () => setShowEnglish((prev) => !prev)

  const toggleSearch = () => {
    setShowSearch((prev) => {
      const next = !prev
      if (!next) {
        if (searchTimeoutRef.current !== null) {
          window.clearTimeout(searchTimeoutRef.current)
          searchTimeoutRef.current = null
        }
        setSearching(false)
        setSearchResults([])
        setQuery('')
        searchInputRef.current?.blur()
      }
      return next
    })
  }

  const toggleTheme = () => {
    setManualTheme(true)
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const runSearch = (term: string) => {
    if (!koreanData) {
      return
    }
    if (searchTimeoutRef.current !== null) {
      window.clearTimeout(searchTimeoutRef.current)
      searchTimeoutRef.current = null
    }
    if (!term) {
      setSearchResults([])
      setSearching(false)
      return
    }
    setSearching(true)
    const timeoutId = window.setTimeout(() => {
      const results: SearchResult[] = []
      for (const book of koreanData.books) {
        for (const chapter of book.chapters) {
          for (const verse of chapter.verses) {
            if (verse.text.includes(term)) {
              results.push({
                bookNumber: book.number,
                bookTitle: book.title,
                chapter: chapter.number,
                verse: verse.number,
                text: verse.text
              })
              if (results.length >= SEARCH_LIMIT) {
                break
              }
            }
          }
          if (results.length >= SEARCH_LIMIT) {
            break
          }
        }
        if (results.length >= SEARCH_LIMIT) {
          break
        }
      }
      setSearchResults(results)
      setSearching(false)
      searchTimeoutRef.current = null
    }, 0)
    searchTimeoutRef.current = timeoutId
  }

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const term = query.trim()
    runSearch(term)
  }

  const handleResultClick = (result: SearchResult) => {
    if (!koreanData) {
      return
    }
    const bookIdx = koreanData.books.findIndex((book) => book.number === result.bookNumber)
    if (bookIdx === -1) {
      return
    }
    const chapterIdx = koreanData.books[bookIdx].chapters.findIndex(
      (chapter) => chapter.number === result.chapter
    )
    if (chapterIdx === -1) {
      return
    }
    setBookIndex(bookIdx)
    setChapterIndex(chapterIdx)
    setFocusTarget({ book: result.bookNumber, chapter: result.chapter, verse: result.verse })
  }

  const handleBookChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const index = Number(event.target.value)
    setBookIndex(index)
    setChapterIndex(0)
  }

  const handleChapterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const index = Number(event.target.value)
    setChapterIndex(index)
  }

  const offlineReady =
    !isPending &&
    !loadError &&
    !!koreanData &&
    (!showEnglish || (!englishLoadError && !!englishData))

  const themeIsDark = theme === 'dark'

  return (
    <div className={`app-shell${showSearch ? ' app-shell--search-open' : ''}`}>
      <header className="app-header">
        <div>
          <h1>오프라인 성경</h1>
          <p className="translation">
            {koreanData
              ? `${koreanData.translation} • ${currentBook?.title ?? ''}`
              : '데이터 불러오는 중'}
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className={`header-button search-toggle${showSearch ? ' header-button--active' : ''}`}
            onClick={toggleSearch}
            aria-pressed={showSearch}
            aria-expanded={showSearch}
            aria-controls="search-input"
            title={showSearch ? '검색 닫기' : '검색 열기'}
          >
            <span className="header-button__icon" aria-hidden="true">
              {showSearch ? '✕' : '🔍'}
            </span>
            <span>{showSearch ? '검색 닫기' : '검색'}</span>
          </button>
          <button
            type="button"
            className={`header-button theme-toggle${themeIsDark ? ' header-button--active' : ''}`}
            onClick={toggleTheme}
            aria-pressed={themeIsDark}
            title={themeIsDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            <span className="header-button__icon" aria-hidden="true">
              {themeIsDark ? '☀️' : '🌙'}
            </span>
            <span>{themeIsDark ? '라이트 모드' : '다크 모드'}</span>
          </button>
          <div className="font-controls" role="group" aria-label="글꼴 크기 조절">
            <button
              type="button"
              onClick={decreaseFont}
              disabled={fontScale <= MIN_FONT_SCALE + 0.01}
              className="font-controls__button"
            >
              Aa-
            </button>
            <span className="font-controls__value">{Math.round(fontScale * 100)}%</span>
            <button
              type="button"
              onClick={increaseFont}
              disabled={fontScale >= MAX_FONT_SCALE - 0.01}
              className="font-controls__button"
            >
              Aa+
            </button>
          </div>
          <label className="toggle" aria-label="KJV 번역 표시">
            <span className="toggle__switch">
              <input type="checkbox" checked={showEnglish} onChange={toggleEnglish} />
              <span className="toggle__indicator" />
            </span>
            <span className="toggle__label">KJV 보기</span>
          </label>
          <div className="status">
            {isPending && <span className="badge">불러오는 중…</span>}
            {!isPending && loadError && <span className="badge error">한글 데이터 오류</span>}
            {!isPending && !loadError && englishLoadError && showEnglish && (
              <span className="badge warn">KJV 오류</span>
            )}
            {offlineReady && <span className="badge ok">오프라인 준비 완료</span>}
          </div>
        </div>
      </header>

      <main className={`app-main${showSearch ? ' app-main--with-search' : ''}`}>
        <section className="controls">
          <div className="select-group">
            <label htmlFor="book-select">성경</label>
            <select
              id="book-select"
              value={bookIndex}
              onChange={handleBookChange}
              disabled={!koreanData}
            >
              {koreanData?.books.map((book, index) => (
                <option key={book.number} value={index}>
                  {book.title}
                </option>
              ))}
            </select>
          </div>
          <div className="select-group">
            <label htmlFor="chapter-select">장</label>
            <select
              id="chapter-select"
              value={chapterIndex}
              onChange={handleChapterChange}
              disabled={!currentBook}
            >
              {currentBook?.chapters.map((chapter, index) => (
                <option key={chapter.number} value={index}>
                  {chapter.number}
                </option>
              ))}
            </select>
          </div>
          {showSearch && (
            <form className="search" onSubmit={handleSearch}>
              <label htmlFor="search-input">검색</label>
              <div className="search-input">
                <input
                  ref={searchInputRef}
                  id="search-input"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="단어 또는 구절을 입력하세요"
                  disabled={!koreanData}
                />
                <button type="submit" disabled={!koreanData || searching} className="search-button">
                  찾기
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="chapter">
          {loadError && <p className="empty-state">{loadError}</p>}
          {!loadError && isPending && (
            <p className="empty-state">성경 데이터를 불러오는 중입니다…</p>
          )}
          {!loadError && !isPending && currentBook && currentChapter && (
            <>
              <header className="chapter-header">
                <h2>
                  {currentBook.title} {currentChapter.number}장
                </h2>
                <div className="chapter-header__translations">
                  <span>{koreanData?.translation}</span>
                  {showEnglishColumn && <span>{englishData?.translation ?? 'KJV'}</span>}
                </div>
              </header>
              {englishLoadError && showEnglish && (
                <p className="empty-state secondary">{englishLoadError}</p>
              )}
              <ol className={`verses${showEnglishColumn ? ' verses--dual' : ''}`}>
                {combinedVerses.map((verse) => (
                  <li
                    key={verse.number}
                    id={`verse-${currentBook.number}-${currentChapter.number}-${verse.number}`}
                    className="verse-row"
                  >
                    <div className="verse-column">
                      <span className="verse-number">{verse.number}</span>
                      <span className="verse-text">{verse.korean}</span>
                    </div>
                    {showEnglishColumn && (
                      <div className="verse-column verse-column--secondary">
                        <span className="verse-number">{verse.number}</span>
                        <span className="verse-text">{verse.english || '—'}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </>
          )}
        </section>

        {showSearch && (
          <aside className="search-results" id="search-results">
            <div className="search-results__header">
              <h3>검색 결과</h3>
              {searching && <span className="badge">검색 중…</span>}
              {!searching && query.trim() && (
                <span className="search-results__count">{searchResults.length}개</span>
              )}
            </div>
            {query.trim() && !searchResults.length && !searching && (
              <p className="empty-state">검색 결과가 없습니다.</p>
            )}
            <ul>
              {searchResults.map((result) => (
                <li key={`${result.bookNumber}-${result.chapter}-${result.verse}`}>
                  <button
                    type="button"
                    onClick={() => handleResultClick(result)}
                    className="result-button"
                  >
                    <span className="result-meta">
                      {result.bookTitle} {result.chapter}:{result.verse}
                    </span>
                    <span className="result-text">{result.text}</span>
                  </button>
                </li>
              ))}
              {searchResults.length >= SEARCH_LIMIT && (
                <li className="hint">검색 결과가 많아 {SEARCH_LIMIT}개만 표시합니다.</li>
              )}
            </ul>
          </aside>
        )}
      </main>

      <footer className="app-footer">
        <p>
          대한성서공회 개역한글 본문 (공개 저작권 안내 참고). 데이터는 최초 접속 시 한 번만
          내려받고, 이후 오프라인에서도 사용할 수 있습니다.
        </p>
      </footer>
    </div>
  )
}

export default App
