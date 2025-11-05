import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import type { Selection, SearchResult, Theme, TranslationId, BibleData } from './types/bible'
import { useBibleTranslation } from './hooks/useBibleTranslation'
import './App.css'
import { useAppStore } from './store/appStore'
import { SearchModal } from './components/SearchModal'
import { SettingsModal } from './components/SettingsModal'

const STORAGE_KEY = 'simple-bible:last-selection'
const THEME_KEY = 'simple-bible:theme'
const FONT_SCALE_KEY = 'simple-bible:font-scale'
const SHOW_KOREAN_KEY = 'simple-bible:show-korean'
const SHOW_ENGLISH_KEY = 'simple-bible:show-english'
const SHOW_JAPANESE_KEY = 'simple-bible:show-japanese'
const SHOW_FURIGANA_KEY = 'simple-bible:show-furigana'
const SEARCH_LIMIT = 120
const BASE_FONT_SCALE = 1.1
const MIN_FONT_SCALE = Number((BASE_FONT_SCALE * 0.8).toFixed(3))
const MAX_FONT_SCALE = Number((BASE_FONT_SCALE * 1.4).toFixed(3))
const FONT_STEP = Number((BASE_FONT_SCALE * 0.05).toFixed(3))
const THEME_COLORS: Record<Theme, string> = {
  light: '#f4f5f7',
  dark: '#0f1118',
  amoled: '#000000'
}
const JAPANESE_DATA_SIZE_LABEL = '약 21MB'
const ITALIAN_DATA_SIZE_LABEL = '약 4.7MB'

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

// getInitialTheme/getInitialFontScale are now managed via store persistence and
// explicit effects below to keep legacy localStorage keys in sync.

function App() {
  const bookIndex = useAppStore((s) => s.bookIndex)
  const setBookIndex = useAppStore((s) => s.setBookIndex)
  const chapterIndex = useAppStore((s) => s.chapterIndex)
  const setChapterIndex = useAppStore((s) => s.setChapterIndex)
  const [savedSelection] = useState<Selection | null>(() =>
    typeof window !== 'undefined' ? loadSelection() : null
  )
  const query = useAppStore((s) => s.query)
  const setQuery = useAppStore((s) => s.setQuery)
  const searchResults = useAppStore((s) => s.searchResults)
  const setSearchResults = useAppStore((s) => s.setSearchResults)
  const searching = useAppStore((s) => s.searching)
  const setSearching = useAppStore((s) => s.setSearching)
  const lastSearchedQuery = useAppStore((s) => s.lastSearchedQuery)
  const setLastSearchedQuery = useAppStore((s) => s.setLastSearchedQuery)
  const searchScope = useAppStore((s) => s.searchScope)
  const setSearchScope = useAppStore((s) => s.setSearchScope)
  const searchBookNumber = useAppStore((s) => s.searchBookNumber)
  const setSearchBookNumber = useAppStore((s) => s.setSearchBookNumber)
  const focusTarget = useAppStore((s) => s.focusTarget)
  const setFocusTarget = useAppStore((s) => s.setFocusTarget)
  const showSearch = useAppStore((s) => s.showSearch)
  const setShowSearch = useAppStore((s) => s.setShowSearch)
  const showSettings = useAppStore((s) => s.showSettings)
  const setShowSettings = useAppStore((s) => s.setShowSettings)
  const toggleSettings = useAppStore((s) => s.toggleSettings)
  const manualTheme = useAppStore((s) => s.manualTheme)
  const setManualTheme = useAppStore((s) => s.setManualTheme)
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)
  const fontScale = useAppStore((s) => s.fontScale)
  const setFontScale = useAppStore((s) => s.setFontScale)
  const showKorean = useAppStore((s) => s.showKorean)
  const setShowKorean = useAppStore((s) => s.setShowKorean)
  const showEnglish = useAppStore((s) => s.showEnglish)
  const setShowEnglish = useAppStore((s) => s.setShowEnglish)
  const showJapanese = useAppStore((s) => s.showJapanese)
  const setShowJapanese = useAppStore((s) => s.setShowJapanese)
  const showItalian = useAppStore((s) => s.showItalian)
  const setShowItalian = useAppStore((s) => s.setShowItalian)
  const showFurigana = useAppStore((s) => s.showFurigana)
  const setShowFurigana = useAppStore((s) => s.setShowFurigana)
  const japaneseDataAllowed = useAppStore((s) => s.japaneseDataAllowed)
  const setJapaneseDataAllowed = useAppStore((s) => s.setJapaneseDataAllowed)
  const italianDataAllowed = useAppStore((s) => s.italianDataAllowed)
  const setItalianDataAllowed = useAppStore((s) => s.setItalianDataAllowed)
  const wakeLockEnabled = useAppStore((s) => s.wakeLockEnabled)
  const setWakeLockEnabled = useAppStore((s) => s.setWakeLockEnabled)
  const searchToggleRef = useRef<HTMLButtonElement | null>(null)
  const settingsToggleRef = useRef<HTMLButtonElement | null>(null)
  const searchTimeoutRef = useRef<number | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const normalizedFontScaleRef = useRef(false)
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null)

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
  const {
    data: japaneseData,
    isPending: japanesePending,
    isFetching: japaneseFetching,
    error: japaneseError,
    refetch: refetchJapanese
  } = useBibleTranslation('ja', { enabled: japaneseDataAllowed })

  const {
    data: italianData,
    isPending: italianPending,
    isFetching: italianFetching,
    error: italianError,
    refetch: refetchItalian
  } = useBibleTranslation('ita', { enabled: italianDataAllowed })

  const hasJapaneseData = Boolean(japaneseData)
  const japaneseDownloadInProgress =
    japaneseDataAllowed && ((japanesePending && !hasJapaneseData) || (japaneseFetching && !hasJapaneseData))
  const japaneseDataReady = japaneseDataAllowed && hasJapaneseData
  const japaneseDownloadError =
    japaneseDataAllowed && japaneseError
      ? '일본어 성경 데이터를 내려받는 중 오류가 발생했습니다. 설정에서 다시 시도해 주세요.'
      : null
  const hasItalianData = Boolean(italianData)
  const italianDownloadInProgress =
    italianDataAllowed && ((italianPending && !hasItalianData) || (italianFetching && !hasItalianData))
  const italianDataReady = italianDataAllowed && hasItalianData
  const italianDownloadError =
    italianDataAllowed && italianError
      ? '이탈리아어 성경 데이터를 내려받는 중 오류가 발생했습니다. 설정에서 다시 시도해 주세요.'
      : null

  const isPending =
    koreanPending ||
    (showEnglish && englishPending) ||
    japaneseDownloadInProgress ||
    italianDownloadInProgress
  const loadError = koreanError
    ? '성경 데이터를 불러오지 못했습니다. 오프라인 상태인지 확인해주세요.'
    : null
  const englishLoadError = !showEnglish || koreanError
    ? null
    : englishError
    ? 'KJV 데이터를 불러오지 못했습니다.'
    : null
  const japaneseLoadError = !japaneseDataAllowed || koreanError ? null : japaneseDownloadError
  const italianLoadError = !italianDataAllowed || koreanError ? null : italianDownloadError

  const hasJapaneseAutoEnabledRef = useRef<boolean>(japaneseDataReady)
  const hasItalianAutoEnabledRef = useRef<boolean>(italianDataReady)

  const activeTranslationNames = useMemo(() => {
    const names: string[] = []
    if (showKorean && koreanData) {
      names.push(koreanData.translation)
    }
    if (showEnglish && englishData) {
      names.push(englishData.translation ?? 'KJV')
    }
    if (showJapanese && japaneseDataReady && japaneseData) {
      names.push(japaneseData.translation ?? '日本語聖書')
    }
    if (showItalian && italianDataReady && italianData) {
      names.push(italianData.translation ?? 'Italiano 1927')
    }
    return names
  }, [
    showKorean,
    koreanData,
    showEnglish,
    englishData,
    showJapanese,
    japaneseDataReady,
    japaneseData,
    showItalian,
    italianDataReady,
    italianData
  ])

  const searchSources = useMemo(() => {
    const sources: Array<{ id: TranslationId; label: string; data: BibleData }> = []
    if (koreanData) {
      sources.push({
        id: 'kor',
        label: koreanData.translation ?? '한국어',
        data: koreanData
      })
    }
    if (englishData) {
      sources.push({
        id: 'kjv',
        label: englishData.translation ?? 'KJV',
        data: englishData
      })
    }
    if (japaneseDataReady && japaneseData) {
      sources.push({
        id: 'ja',
        label: japaneseData.translation ?? '日本語聖書',
        data: japaneseData
      })
    }
    if (italianDataReady && italianData) {
      sources.push({
        id: 'ita',
        label: italianData.translation ?? 'Italiano 1927',
        data: italianData
      })
    }
    return sources
  }, [koreanData, englishData, japaneseDataReady, japaneseData, italianDataReady, italianData])

  const searchReady = searchSources.length > 0

  const searchBooks = useMemo(() => {
    if (koreanData) {
      return koreanData.books
    }
    return searchSources[0]?.data.books ?? []
  }, [koreanData, searchSources])

  useEffect(() => {
    if (!normalizedFontScaleRef.current) {
      normalizedFontScaleRef.current = true
      if (Math.abs(fontScale - 1) < 0.0005) {
        setFontScale(BASE_FONT_SCALE)
      }
    }
  }, [fontScale, setFontScale])

  const wakeLockSupported = typeof navigator !== 'undefined' && !!navigator.wakeLock

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
  }, [koreanData, savedSelection, setBookIndex, setChapterIndex])

  useEffect(() => {
    if (!koreanData) {
      return
    }
    const book = koreanData.books[bookIndex]
  
    // Settings Modal: ESC close, scroll lock, and focus return
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
        element.classList.add('verse-highlight')
        timeoutId = window.setTimeout(() => {
          element.classList.remove('verse-highlight')
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
  }, [focusTarget, setFocusTarget])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const root = window.document.documentElement
    root.dataset.theme = theme
    // Map custom themes to a valid color-scheme keyword for UA default styling
    root.style.colorScheme = theme === 'light' ? 'light' : 'dark'
    const metaTheme = window.document.querySelector('meta[name="theme-color"]')
    if (metaTheme) {
      metaTheme.setAttribute('content', THEME_COLORS[theme])
    }
  }, [theme])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.document.documentElement.style.setProperty('--reader-font-scale', fontScale.toString())
  }, [fontScale])

  // Wake Lock effect: request/release based on toggle and page visibility
  useEffect(() => {
    let cancelled = false
    const supported = typeof navigator !== 'undefined' && !!navigator.wakeLock
    if (!supported) return

    const acquire = async () => {
      if (!wakeLockEnabled || document.visibilityState !== 'visible') return
      try {
        const sentinel = await navigator.wakeLock!.request('screen')
        if (cancelled) {
          // If unmounted meanwhile, release immediately
          try { await sentinel.release() } catch { /* ignore release errors */ }
          return
        }
        wakeLockRef.current = sentinel
        sentinel.onrelease = () => {
          wakeLockRef.current = null
          // If still enabled and visible, try re-acquire
          if (wakeLockEnabled && document.visibilityState === 'visible') {
            // Fire and forget (no await to avoid blocking handler)
            acquire()
          }
        }
      } catch {
        // Permission denied or unsupported state; just ignore
        // Optionally, we could surface a toast.
      }
    }

    const release = async () => {
      const s = wakeLockRef.current
      if (s) {
        wakeLockRef.current = null
        try { await s.release() } catch { /* ignore release errors */ }
      }
    }

    if (wakeLockEnabled) {
      void acquire()
    } else {
      void release()
    }

    const onVisibility = () => {
      if (!wakeLockEnabled) return
      if (document.visibilityState === 'visible' && !wakeLockRef.current) {
        void acquire()
      } else if (document.visibilityState !== 'visible') {
        // When hidden, it's generally released automatically; keep ref clean
        wakeLockRef.current = null
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      void release()
    }
  }, [wakeLockEnabled])

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
    window.localStorage.setItem(SHOW_KOREAN_KEY, String(showKorean))
  }, [showKorean])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(SHOW_ENGLISH_KEY, String(showEnglish))
  }, [showEnglish])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(SHOW_JAPANESE_KEY, String(showJapanese))
  }, [showJapanese])

  useEffect(() => {
    if (!japaneseDataAllowed && showJapanese) {
      setShowJapanese(false)
    }
  }, [japaneseDataAllowed, showJapanese, setShowJapanese])

  useEffect(() => {
    if (!italianDataAllowed && showItalian) {
      setShowItalian(false)
    }
  }, [italianDataAllowed, showItalian, setShowItalian])

  useEffect(() => {
    if (japaneseDataReady && !hasJapaneseAutoEnabledRef.current) {
      hasJapaneseAutoEnabledRef.current = true
      setShowJapanese(true)
    } else if (!japaneseDataReady) {
      hasJapaneseAutoEnabledRef.current = false
    }
  }, [japaneseDataReady, setShowJapanese])

  useEffect(() => {
    if (italianDataReady && !hasItalianAutoEnabledRef.current) {
      hasItalianAutoEnabledRef.current = true
      setShowItalian(true)
    } else if (!italianDataReady) {
      hasItalianAutoEnabledRef.current = false
    }
  }, [italianDataReady, setShowItalian])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(SHOW_FURIGANA_KEY, String(showFurigana))
  }, [showFurigana])

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
  }, [manualTheme, setTheme])

  // Search modal behaviors are encapsulated in SearchModal

  // 모달 열릴 때 배경 영역을 스크린리더에서 숨김 (검색/설정 모두 고려)
  useEffect(() => {
    const main = document.querySelector('main.app-main')
    const header = document.querySelector('header.app-header')
    const footer = document.querySelector('footer.app-footer')
    if (showSearch || showSettings) {
      main?.setAttribute('aria-hidden', 'true')
      header?.setAttribute('aria-hidden', 'true')
      footer?.setAttribute('aria-hidden', 'true')
    }
    return () => {
      main?.removeAttribute('aria-hidden')
      header?.removeAttribute('aria-hidden')
      footer?.removeAttribute('aria-hidden')
    }
  }, [showSearch, showSettings])

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

  const japaneseBook = useMemo(() => {
    if (!showJapanese || !japaneseData) {
      return null
    }
    return japaneseData.books[bookIndex] ?? null
  }, [japaneseData, bookIndex, showJapanese])

  const japaneseChapter = useMemo(() => {
    if (!showJapanese || !japaneseBook) {
      return null
    }
    return japaneseBook.chapters[chapterIndex] ?? null
  }, [japaneseBook, chapterIndex, showJapanese])

  const italianBook = useMemo(() => {
    if (!showItalian || !italianData) {
      return null
    }
    return italianData.books[bookIndex] ?? null
  }, [italianData, bookIndex, showItalian])

  const italianChapter = useMemo(() => {
    if (!showItalian || !italianBook) {
      return null
    }
    return italianBook.chapters[chapterIndex] ?? null
  }, [italianBook, chapterIndex, showItalian])

  const currentBookTitle = currentBook?.title ?? ''
  const headerTranslationSegments = useMemo(() => {
    const segments = [...activeTranslationNames]
    if (currentBookTitle) {
      segments.push(currentBookTitle)
    }
    return segments
  }, [activeTranslationNames, currentBookTitle])

  useEffect(() => {
    if (!currentChapter) {
      setSelectedVerse(null)
      return
    }
    const firstVerse = currentChapter.verses[0]?.number ?? null
    setSelectedVerse((prev) => {
      if (prev === null) {
        return firstVerse
      }
      const stillExists = currentChapter.verses.some((verse) => verse.number === prev)
      return stillExists ? prev : firstVerse
    })
  }, [currentChapter])

  useEffect(() => {
    if (!focusTarget || !currentBook || !currentChapter) {
      return
    }
    if (focusTarget.book === currentBook.number && focusTarget.chapter === currentChapter.number) {
      setSelectedVerse(focusTarget.verse)
    }
  }, [focusTarget, currentBook, currentChapter])

  const showKoreanColumn = Boolean(showKorean && currentChapter)
  const showEnglishColumn = Boolean(showEnglish && englishChapter)
  const showJapaneseColumn = Boolean(showJapanese && japaneseChapter)
  const showItalianColumn = Boolean(showItalian && italianChapter)

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
    const japaneseMap = new Map<number, string>()
    if (japaneseChapter) {
      japaneseChapter.verses.forEach((verse) => {
        japaneseMap.set(verse.number, verse.text)
      })
    }
    const italianMap = new Map<number, string>()
    if (italianChapter) {
      italianChapter.verses.forEach((verse) => {
        italianMap.set(verse.number, verse.text)
      })
    }
    return currentChapter.verses.map((verse) => ({
      number: verse.number,
      korean: verse.text,
      english: englishMap.get(verse.number) ?? '',
      japanese: japaneseMap.get(verse.number) ?? '',
      italian: italianMap.get(verse.number) ?? ''
    }))
  }, [currentChapter, englishChapter, japaneseChapter, italianChapter])

  const activeColumns =
    Number(showKoreanColumn) + Number(showEnglishColumn) + Number(showJapaneseColumn) + Number(showItalianColumn)

  const verseListClass = useMemo(() => {
    if (activeColumns >= 4) {
      return 'verses verses--quad'
    }
    if (activeColumns === 3) {
      return 'verses verses--triple'
    }
    if (activeColumns === 2) {
      return 'verses verses--dual'
    }
    return 'verses'
  }, [activeColumns])

  const adjustFontScale = (delta: number) => {
    const next = Number((fontScale + delta).toFixed(3))
    setFontScale(next)
  }

  const increaseFont = () => adjustFontScale(FONT_STEP)
  const decreaseFont = () => adjustFontScale(-FONT_STEP)
  const toggleKorean = () => setShowKorean(!showKorean)
  const toggleEnglish = () => setShowEnglish(!showEnglish)
  const toggleJapanese = () => setShowJapanese(!showJapanese)
  const toggleItalian = () => setShowItalian(!showItalian)
  const toggleFurigana = () => setShowFurigana(!showFurigana)
  const requestJapaneseData = useCallback(() => {
    if (!japaneseDataAllowed) {
      setJapaneseDataAllowed(true)
      return
    }
    if (japaneseDownloadError) {
      void refetchJapanese()
    }
  }, [japaneseDataAllowed, japaneseDownloadError, refetchJapanese, setJapaneseDataAllowed])

  const requestItalianData = useCallback(() => {
    if (!italianDataAllowed) {
      setItalianDataAllowed(true)
      return
    }
    if (italianDownloadError) {
      void refetchItalian()
    }
  }, [italianDataAllowed, italianDownloadError, refetchItalian, setItalianDataAllowed])

  // Chapter navigation helpers
  const canGoPrev = useMemo(() => {
    if (!koreanData || !currentBook) return false
    return chapterIndex > 0 || bookIndex > 0
  }, [koreanData, currentBook, chapterIndex, bookIndex])

  const canGoNext = useMemo(() => {
    if (!koreanData || !currentBook) return false
    const lastChapterIndex = (currentBook?.chapters.length ?? 1) - 1
    const lastBookIndex = (koreanData?.books.length ?? 1) - 1
    return chapterIndex < lastChapterIndex || bookIndex < lastBookIndex
  }, [koreanData, currentBook, chapterIndex, bookIndex])

  const scrollChapterToTop = () => {
    const el = document.querySelector('.chapter') as HTMLElement | null
    if (el) {
      el.scrollIntoView({ behavior: 'auto', block: 'start' })
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }

  const goPrevChapter = () => {
    if (!koreanData || !currentBook) return
    if (chapterIndex > 0) {
      setChapterIndex(Math.max(0, chapterIndex - 1))
    } else if (bookIndex > 0) {
      const prevBookIndex = bookIndex - 1
      const prevBook = koreanData.books[prevBookIndex]
      const lastChapterOfPrev = prevBook.chapters.length - 1
      setBookIndex(prevBookIndex)
      setChapterIndex(lastChapterOfPrev)
    }
    scrollChapterToTop()
  }

  const goNextChapter = () => {
    if (!koreanData || !currentBook) return
    const lastChapterIndex = currentBook.chapters.length - 1
    const lastBookIndex = koreanData.books.length - 1
    if (chapterIndex < lastChapterIndex) {
      setChapterIndex(Math.min(lastChapterIndex, chapterIndex + 1))
    } else if (bookIndex < lastBookIndex) {
      const nextBookIndex = bookIndex + 1
      setBookIndex(nextBookIndex)
      setChapterIndex(0)
    }
    scrollChapterToTop()
  }

  const toggleSearch = () => {
    const next = !showSearch
    if (!next) {
      if (searchTimeoutRef.current !== null) {
        window.clearTimeout(searchTimeoutRef.current)
        searchTimeoutRef.current = null
      }
      setSearching(false)
      setSearchResults([])
      setQuery('')
      setLastSearchedQuery('')
    } else {
      setShowSettings(false)
    }
    setShowSearch(next)
  }

  // Theme toggling is handled in SettingsModal

  const runSearch = useCallback((term: string) => {
    if (searchSources.length === 0) {
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
      let reachedLimit = false
      for (const source of searchSources) {
        for (const book of source.data.books) {
          // Book filter has highest priority
          if (searchBookNumber && book.number !== searchBookNumber) continue
          // scope filter: ot(<=39), nt(>=40)
          if (searchScope === 'ot' && book.number > 39) continue
          if (searchScope === 'nt' && book.number <= 39) continue
          for (const chapter of book.chapters) {
            for (const verse of chapter.verses) {
              if (verse.text.includes(term)) {
                const koreanBookTitle =
                  koreanData?.books.find((b) => b.number === book.number)?.title
                results.push({
                  bookNumber: book.number,
                  bookTitle: koreanBookTitle ?? book.title,
                  chapter: chapter.number,
                  verse: verse.number,
                  text: verse.text,
                  translation: source.label,
                  translationId: source.id
                })
                if (results.length >= SEARCH_LIMIT) {
                  reachedLimit = true
                  break
                }
              }
            }
            if (reachedLimit) {
              break
            }
          }
          if (reachedLimit) {
            break
          }
        }
        if (reachedLimit) {
          break
        }
      }
      setSearchResults(results)
      setLastSearchedQuery(term)
      setSearching(false)
      searchTimeoutRef.current = null
    }, 0)
    searchTimeoutRef.current = timeoutId
  }, [
    searchSources,
    searchScope,
    searchBookNumber,
    setSearchResults,
    setSearching,
    setLastSearchedQuery,
    koreanData
  ])

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const term = query.trim()
    runSearch(term)
  }

  useEffect(() => {
    if (searchReady) {
      return
    }
    setSearching(false)
    setSearchResults([])
  }, [searchReady, setSearchResults, setSearching])

  // 범위/책 변경 시에는 마지막 검색어 기준으로 즉시 재검색
  useEffect(() => {
    if (!showSearch) return
    if (!searchReady) return
    const term = lastSearchedQuery.trim()
    if (!term) return
    runSearch(term)
  }, [
    searchScope,
    searchBookNumber,
    lastSearchedQuery,
    showSearch,
    searchReady,
    runSearch
  ])

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
    setShowSearch(false)
  }

  const handleBookChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const index = Number(event.target.value)
    setBookIndex(index)
    setChapterIndex(0)
    const nextBook = koreanData?.books[index]
    const firstVerse = nextBook?.chapters[0]?.verses[0]?.number ?? null
    setSelectedVerse(firstVerse)
  }

  const handleChapterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const index = Number(event.target.value)
    setChapterIndex(index)
    const nextChapter = currentBook?.chapters[index]
    const firstVerse = nextChapter?.verses[0]?.number ?? null
    setSelectedVerse(firstVerse)
  }

  const handleVerseChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const verseNumber = Number(event.target.value)
    if (!currentBook || !currentChapter || Number.isNaN(verseNumber)) {
      return
    }
    setSelectedVerse(verseNumber)
    setFocusTarget({ book: currentBook.number, chapter: currentChapter.number, verse: verseNumber })
  }

  const offlineReady =
    !isPending &&
    !loadError &&
    !!koreanData &&
    (!showEnglish || (!englishLoadError && !!englishData)) &&
    (!japaneseDataAllowed || (!!japaneseData && !japaneseLoadError)) &&
    (!italianDataAllowed || (!!italianData && !italianLoadError))


  return (
    <div className={`app-shell${showSearch ? ' app-shell--search-open' : ''}`}>
      <header className="app-header">
        <div>
          <h1>오프라인 성경</h1>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className={`header-button search-toggle${showSearch ? ' header-button--active' : ''}`}
            ref={searchToggleRef}
            onClick={toggleSearch}
            aria-pressed={showSearch}
            aria-expanded={showSearch}
            aria-controls="search-input"
            title={showSearch ? '검색 닫기' : '검색 열기'}
          >
            <span className="header-button__icon" aria-hidden="true">
              {showSearch ? '✕' : '🔍'}
            </span>
            <span>검색</span>
          </button>
          <div className="status">
            {isPending && <span className="badge">불러오는 중…</span>}
            {!isPending && loadError && <span className="badge error">한글 데이터 오류</span>}
            {!isPending && !loadError && englishLoadError && showEnglish && (
              <span className="badge warn">KJV 오류</span>
            )}
            {!isPending && !loadError && japaneseLoadError && japaneseDataAllowed && (
              <span className="badge warn">일본어 데이터 오류</span>
            )}
            {!isPending && !loadError && italianLoadError && italianDataAllowed && (
              <span className="badge warn">이탈리아어 데이터 오류</span>
            )}
          </div>
          <button
            type="button"
            className={`header-button settings-toggle${showSettings ? ' header-button--active' : ''}`}
            ref={settingsToggleRef}
            onClick={() => {
              if (!showSettings) setShowSearch(false)
              toggleSettings()
            }}
            aria-pressed={showSettings}
            aria-expanded={showSettings}
            title='설정'
          >
            <span className="header-button__icon" aria-hidden="true">⚙️</span>
            <span>설정</span>
          </button>
        </div>
      </header>

      <main className="app-main">
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
          <div className="select-group">
            <label htmlFor="verse-select">절</label>
            <select
              id="verse-select"
              value={selectedVerse ?? ''}
              onChange={handleVerseChange}
              disabled={!currentChapter || currentChapter.verses.length === 0}
            >
              {currentChapter?.verses.map((verse) => (
                <option key={verse.number} value={verse.number}>
                  {verse.number}
                </option>
              ))}
            </select>
          </div>
          {/* 검색 폼은 모달에서 렌더링 */}
        </section>

        <section className="chapter">
          {loadError && <p className="empty-state">{loadError}</p>}
          {!loadError && isPending && (
            <p className="empty-state">성경 데이터를 불러오는 중입니다…</p>
          )}
          {!loadError && !isPending && currentBook && currentChapter && (
            <>
              <header className="chapter-header">
                <div className="chapter-header__top">
                  <h2 className="chapter-header__title">
                    {currentBook.title} {currentChapter.number}장
                  </h2>
                  <div className="chapter-header__nav" aria-label="장 이동">
                    <button
                      type="button"
                      className="nav-btn nav-btn--prev nav-btn--small"
                      onClick={goPrevChapter}
                      disabled={!canGoPrev}
                      title="이전 장"
                    >
                      <span className="nav-btn__icon" aria-hidden="true">‹</span>
                      <span className="nav-btn__label">이전</span>
                    </button>
                    <button
                      type="button"
                      className="nav-btn nav-btn--next nav-btn--small"
                      onClick={goNextChapter}
                      disabled={!canGoNext}
                      title="다음 장"
                    >
                      <span className="nav-btn__label">다음</span>
                      <span className="nav-btn__icon" aria-hidden="true">›</span>
                    </button>
                  </div>
                </div>
                <div className="chapter-header__translations">
                  {showKoreanColumn && <span>{koreanData?.translation}</span>}
                  {showEnglishColumn && <span>{englishData?.translation ?? 'KJV'}</span>}
                  {showJapaneseColumn && (
                    <span>{japaneseData?.translation ?? '日本語聖書'}</span>
                  )}
                  {showItalianColumn && <span>{italianData?.translation ?? 'Italiano 1927'}</span>}
                </div>
              </header>
              {englishLoadError && showEnglish && (
                <p className="empty-state secondary">{englishLoadError}</p>
              )}
              {japaneseLoadError && showJapanese && (
                <p className="empty-state secondary">{japaneseLoadError}</p>
              )}
              {activeColumns === 0 ? (
                <p className="empty-state secondary">표시할 번역을 설정에서 선택하세요.</p>
              ) : (
                <ol className={verseListClass}>
                  {combinedVerses.map((verse) => (
                    <li
                      key={verse.number}
                      id={`verse-${currentBook.number}-${currentChapter.number}-${verse.number}`}
                      className="verse-row"
                    >
                      {showKoreanColumn && (
                        <div className="verse-column">
                          <span className="verse-number">{verse.number}</span>
                          <span className="verse-text">{verse.korean}</span>
                        </div>
                      )}
                      {showEnglishColumn && (
                        <div className="verse-column verse-column--secondary">
                          <span className="verse-number">{verse.number}</span>
                          <span className="verse-text">{verse.english || '—'}</span>
                        </div>
                      )}
                      {showJapaneseColumn && (
                        <div className="verse-column verse-column--secondary verse-column--ruby">
                          <span className="verse-number">{verse.number}</span>
                          {verse.japanese ? (
                            <span
                              className="verse-text verse-text--ruby"
                              data-show-furigana={showFurigana ? 'true' : 'false'}
                              dangerouslySetInnerHTML={{ __html: verse.japanese }}
                            />
                          ) : (
                            <span className="verse-text">—</span>
                          )}
                        </div>
                      )}
                      {showItalianColumn && (
                        <div className="verse-column verse-column--secondary">
                          <span className="verse-number">{verse.number}</span>
                          <span className="verse-text">{verse.italian || '—'}</span>
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              )}
              <nav className="chapter-nav" aria-label="장 이동">
                <button
                  type="button"
                  className="nav-btn nav-btn--prev"
                  onClick={goPrevChapter}
                  disabled={!canGoPrev}
                  title="이전 장"
                >
                  <span className="nav-btn__icon" aria-hidden="true">‹</span>
                  <span className="nav-btn__label">이전 장</span>
                </button>
                <button
                  type="button"
                  className="nav-btn nav-btn--top"
                  onClick={scrollChapterToTop}
                  title="맨 위로"
                >
                  <span className="nav-btn__label">맨 위로</span>
                </button>
                <button
                  type="button"
                  className="nav-btn nav-btn--next"
                  onClick={goNextChapter}
                  disabled={!canGoNext}
                  title="다음 장"
                >
                  <span className="nav-btn__label">다음 장</span>
                  <span className="nav-btn__icon" aria-hidden="true">›</span>
                </button>
              </nav>
            </>
          )}
        </section>
      </main>

      <SearchModal
        open={showSearch}
        onClose={toggleSearch}
        query={query}
        setQuery={setQuery}
        searchScope={searchScope}
        setSearchScope={setSearchScope}
        searchBookNumber={searchBookNumber}
        setSearchBookNumber={setSearchBookNumber}
        books={searchBooks}
        searching={searching}
        searchResults={searchResults}
        onSubmit={handleSearch}
        onClickResult={handleResultClick}
        toggleButtonRef={searchToggleRef}
        searchLimit={SEARCH_LIMIT}
        searchReady={searchReady}
        lastSearchedQuery={lastSearchedQuery}
      />

      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        toggleButtonRef={settingsToggleRef}
        theme={theme}
        manualTheme={manualTheme}
        setTheme={setTheme}
        setManualTheme={setManualTheme}
        fontScale={fontScale}
        increaseFont={increaseFont}
        decreaseFont={decreaseFont}
        minFont={MIN_FONT_SCALE}
        maxFont={MAX_FONT_SCALE}
        baseFont={BASE_FONT_SCALE}
        fontStep={FONT_STEP}
        wakeLockEnabled={wakeLockEnabled}
        setWakeLockEnabled={setWakeLockEnabled}
        wakeLockSupported={wakeLockSupported}
        showKorean={showKorean}
        toggleKorean={toggleKorean}
        showEnglish={showEnglish}
        toggleEnglish={toggleEnglish}
        showJapanese={showJapanese}
        toggleJapanese={toggleJapanese}
        showItalian={showItalian}
        toggleItalian={toggleItalian}
        showFurigana={showFurigana}
        toggleFurigana={toggleFurigana}
        japaneseDataReady={japaneseDataReady}
        japaneseDownloadInProgress={japaneseDownloadInProgress}
        japaneseDownloadError={japaneseDownloadError}
        onDownloadJapanese={requestJapaneseData}
        japaneseDataSizeLabel={JAPANESE_DATA_SIZE_LABEL}
        italianDataReady={italianDataReady}
        italianDownloadInProgress={italianDownloadInProgress}
        italianDownloadError={italianDownloadError}
        onDownloadItalian={requestItalianData}
        italianDataSizeLabel={ITALIAN_DATA_SIZE_LABEL}
        offlineReady={offlineReady}
        isPending={isPending}
        loadError={loadError}
        englishLoadError={englishLoadError}
        japaneseLoadError={japaneseLoadError}
      />

      <footer className="app-footer">
        <button
          type="button"
          className="header-button settings-toggle"
          onClick={() => {
            if (!showSettings) setShowSearch(false)
            setShowSettings(true)
            // 약간의 지연 후 정보 섹션으로 스크롤
            setTimeout(() => {
              const el = document.getElementById('license-info')
              el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 50)
          }}
          title="설정에서 저작권/오프라인 안내 보기"
        >
          저작권/오프라인 안내 보기
        </button>
      </footer>
    </div>
  )
}

export default App
