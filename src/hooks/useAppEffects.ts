import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { useEffect, useRef } from "react";
import {
  FONT_SCALE_KEY,
  SHOW_ENGLISH_KEY,
  SHOW_FURIGANA_KEY,
  SHOW_JAPANESE_KEY,
  SHOW_KOREAN_KEY,
  STORAGE_KEY,
  THEME_COLORS,
  THEME_KEY,
} from "../config/appConstants";
import type { FocusTarget } from "../store/appStore";
import type { BibleData, SearchResult, Selection } from "../types/bible";

type SelectionParams = {
  koreanData: BibleData | undefined;
  savedSelection: Selection | null;
  bookIndex: number;
  chapterIndex: number;
  setBookIndex: (index: number) => void;
  setChapterIndex: (index: number) => void;
};

type FontScaleParams = {
  fontScale: number;
  setFontScale: (value: number) => void;
  baseFontScale: number;
};

type ThemeParams = {
  theme: "light" | "dark" | "highContrast";
  manualTheme: boolean;
  setTheme: (value: "light" | "dark" | "highContrast") => void;
};

type FocusParams = {
  focusTarget: FocusTarget;
  setFocusTarget: (target: FocusTarget) => void;
  koreanData: BibleData | undefined;
  bookIndex: number;
  chapterIndex: number;
};

type SelectedVerseParams = {
  currentChapter: BibleData["books"][number]["chapters"][number] | null;
  setSelectedVerse: Dispatch<SetStateAction<number | null>>;
  focusTarget: FocusTarget;
  currentBook: BibleData["books"][number] | null;
};

type TranslationPreferencesParams = {
  showKorean: boolean;
  showEnglish: boolean;
  showJapanese: boolean;
  showItalian: boolean;
  showFurigana: boolean;
  setShowJapanese: (value: boolean) => void;
  setShowItalian: (value: boolean) => void;
  japaneseDataAllowed: boolean;
  italianDataAllowed: boolean;
  japaneseDataReady: boolean;
  italianDataReady: boolean;
};

type SearchEffectsParams = {
  searchReady: boolean;
  setSearching: (value: boolean) => void;
  setSearchResults: (results: SearchResult[]) => void;
  showSearch: boolean;
  lastSearchedQuery: string;
  runSearch: (term: string) => void;
};

export const useSelectionEffects = ({
  koreanData,
  savedSelection,
  setBookIndex,
  setChapterIndex,
  bookIndex,
  chapterIndex,
}: SelectionParams) => {
  useEffect(() => {
    if (!koreanData || !savedSelection) {
      return;
    }
    const bookIdx = koreanData.books.findIndex(
      (book) => book.number === savedSelection.book
    );
    if (bookIdx >= 0) {
      setBookIndex(bookIdx);
      const chapterIdx = koreanData.books[bookIdx].chapters.findIndex(
        (chapter) => chapter.number === savedSelection.chapter
      );
      if (chapterIdx >= 0) {
        setChapterIndex(chapterIdx);
      }
    }
  }, [koreanData, savedSelection, setBookIndex, setChapterIndex]);

  useEffect(() => {
    if (!koreanData) {
      return;
    }
    const book = koreanData.books[bookIndex];
    if (!book) {
      return;
    }
    const chapter = book.chapters[chapterIndex];
    if (!chapter) {
      return;
    }
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ book: book.number, chapter: chapter.number })
    );
  }, [koreanData, bookIndex, chapterIndex]);
};

export const useFontScaleEffects = ({
  fontScale,
  setFontScale,
  baseFontScale,
}: FontScaleParams) => {
  const normalizedRef = useRef(false);

  useEffect(() => {
    if (!normalizedRef.current) {
      normalizedRef.current = true;
      if (Math.abs(fontScale - 1) < 0.0005) {
        setFontScale(baseFontScale);
      }
    }
  }, [fontScale, setFontScale, baseFontScale]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.document.documentElement.style.setProperty(
      "--reader-font-scale",
      fontScale.toString()
    );
  }, [fontScale]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(FONT_SCALE_KEY, fontScale.toString());
  }, [fontScale]);
};

export const useThemeEffects = ({
  theme,
  manualTheme,
  setTheme,
}: ThemeParams) => {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const root = window.document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme === "light" ? "light" : "dark";
    const metaTheme = window.document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", THEME_COLORS[theme]);
    }
  }, [theme]);

  useEffect(() => {
    if (manualTheme && typeof window !== "undefined") {
      window.localStorage.setItem(THEME_KEY, theme);
    }
  }, [theme, manualTheme]);

  useEffect(() => {
    if (manualTheme || typeof window === "undefined") {
      return;
    }
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? "dark" : "light");
    };
    media.addEventListener("change", listener);
    return () => {
      media.removeEventListener("change", listener);
    };
  }, [manualTheme, setTheme]);
};

export const useFocusEffects = ({
  focusTarget,
  setFocusTarget,
  koreanData,
  bookIndex,
  chapterIndex,
}: FocusParams) => {
  useEffect(() => {
    if (!focusTarget || !koreanData) {
      return;
    }
    const book = koreanData.books[bookIndex];
    if (!book || book.number !== focusTarget.book) {
      return;
    }
    const chapter = book.chapters[chapterIndex];
    if (!chapter || chapter.number !== focusTarget.chapter) {
      return;
    }
    const id = `verse-${focusTarget.book}-${focusTarget.chapter}-${focusTarget.verse}`;
    let timeoutId: number | undefined;
    const frame = window.requestAnimationFrame(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("verse-highlight");
        timeoutId = window.setTimeout(() => {
          element.classList.remove("verse-highlight");
        }, 1600);
      }
    });
    return () => {
      window.cancelAnimationFrame(frame);
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [focusTarget, koreanData, bookIndex, chapterIndex]);

  useEffect(() => {
    if (!focusTarget) {
      return;
    }
    const cleanup = window.setTimeout(() => {
      setFocusTarget(null);
    }, 2000);
    return () => window.clearTimeout(cleanup);
  }, [focusTarget, setFocusTarget]);
};

export const useSelectedVerseEffects = ({
  currentChapter,
  setSelectedVerse,
  focusTarget,
  currentBook,
}: SelectedVerseParams) => {
  useEffect(() => {
    if (!currentChapter) {
      setSelectedVerse(null);
      return;
    }
    const firstVerse = currentChapter.verses[0]?.number ?? null;
    setSelectedVerse((prev) => {
      if (prev === null) {
        return firstVerse;
      }
      const stillExists = currentChapter.verses.some(
        (verse) => verse.number === prev
      );
      return stillExists ? prev : firstVerse;
    });
  }, [currentChapter, setSelectedVerse]);

  useEffect(() => {
    if (!focusTarget || !currentBook || !currentChapter) {
      return;
    }
    if (
      focusTarget.book === currentBook.number &&
      focusTarget.chapter === currentChapter.number
    ) {
      setSelectedVerse(focusTarget.verse);
    }
  }, [focusTarget, currentBook, currentChapter, setSelectedVerse]);
};

export const useWakeLockEffect = (
  wakeLockEnabled: boolean,
  wakeLockRef: MutableRefObject<WakeLockSentinel | null>
) => {
  useEffect(() => {
    let cancelled = false;
    const supported = typeof navigator !== "undefined" && !!navigator.wakeLock;
    if (!supported) return;

    const acquire = async () => {
      if (!wakeLockEnabled || document.visibilityState !== "visible") return;
      try {
        const sentinel = await navigator.wakeLock!.request("screen");
        if (cancelled) {
          try {
            await sentinel.release();
          } catch {
            /* ignore */
          }
          return;
        }
        wakeLockRef.current = sentinel;
        sentinel.onrelease = () => {
          wakeLockRef.current = null;
          if (wakeLockEnabled && document.visibilityState === "visible") {
            acquire();
          }
        };
      } catch {
        /* ignore */
      }
    };

    const release = async () => {
      const sentinel = wakeLockRef.current;
      if (sentinel) {
        wakeLockRef.current = null;
        try {
          await sentinel.release();
        } catch {
          /* ignore */
        }
      }
    };

    if (wakeLockEnabled) {
      void acquire();
    } else {
      void release();
    }

    const onVisibility = () => {
      if (!wakeLockEnabled) return;
      if (document.visibilityState === "visible" && !wakeLockRef.current) {
        void acquire();
      } else if (document.visibilityState !== "visible") {
        wakeLockRef.current = null;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      void release();
    };
  }, [wakeLockEnabled, wakeLockRef]);
};

export const useTranslationPreferences = ({
  showKorean,
  showEnglish,
  showJapanese,
  showItalian,
  showFurigana,
  setShowJapanese,
  setShowItalian,
  japaneseDataAllowed,
  italianDataAllowed,
  japaneseDataReady,
  italianDataReady,
}: TranslationPreferencesParams) => {
  const japaneseAllowedPrevRef = useRef(japaneseDataAllowed);
  const italianAllowedPrevRef = useRef(italianDataAllowed);
  const japaneseAutoEnablePendingRef = useRef(false);
  const italianAutoEnablePendingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(SHOW_KOREAN_KEY, String(showKorean));
  }, [showKorean]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(SHOW_ENGLISH_KEY, String(showEnglish));
  }, [showEnglish]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(SHOW_JAPANESE_KEY, String(showJapanese));
  }, [showJapanese]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(SHOW_FURIGANA_KEY, String(showFurigana));
  }, [showFurigana]);

  useEffect(() => {
    if (!japaneseDataAllowed && showJapanese) {
      setShowJapanese(false);
    }
  }, [japaneseDataAllowed, showJapanese, setShowJapanese]);

  useEffect(() => {
    if (!italianDataAllowed && showItalian) {
      setShowItalian(false);
    }
  }, [italianDataAllowed, showItalian, setShowItalian]);

  useEffect(() => {
    const prev = japaneseAllowedPrevRef.current;
    if (!prev && japaneseDataAllowed) {
      japaneseAutoEnablePendingRef.current = true;
    } else if (prev && !japaneseDataAllowed) {
      japaneseAutoEnablePendingRef.current = false;
    }
    japaneseAllowedPrevRef.current = japaneseDataAllowed;
  }, [japaneseDataAllowed]);

  useEffect(() => {
    const prev = italianAllowedPrevRef.current;
    if (!prev && italianDataAllowed) {
      italianAutoEnablePendingRef.current = true;
    } else if (prev && !italianDataAllowed) {
      italianAutoEnablePendingRef.current = false;
    }
    italianAllowedPrevRef.current = italianDataAllowed;
  }, [italianDataAllowed]);

  useEffect(() => {
    if (
      japaneseAutoEnablePendingRef.current &&
      japaneseDataAllowed &&
      japaneseDataReady &&
      !showJapanese
    ) {
      japaneseAutoEnablePendingRef.current = false;
      setShowJapanese(true);
    }
  }, [
    japaneseDataAllowed,
    japaneseDataReady,
    setShowJapanese,
    showJapanese,
  ]);

  useEffect(() => {
    if (
      italianAutoEnablePendingRef.current &&
      italianDataAllowed &&
      italianDataReady &&
      !showItalian
    ) {
      italianAutoEnablePendingRef.current = false;
      setShowItalian(true);
    }
  }, [
    italianDataAllowed,
    italianDataReady,
    setShowItalian,
    showItalian,
  ]);
};

export const useModalAccessibility = (
  showSearch: boolean,
  showSettings: boolean,
  showJump: boolean
) => {
  useEffect(() => {
    const main = document.querySelector("main.app-main");
    const header = document.querySelector("header.app-header");
    const footer = document.querySelector("footer.app-footer");
    if (showSearch || showSettings || showJump) {
      main?.setAttribute("aria-hidden", "true");
      header?.setAttribute("aria-hidden", "true");
      footer?.setAttribute("aria-hidden", "true");
    }
    return () => {
      main?.removeAttribute("aria-hidden");
      header?.removeAttribute("aria-hidden");
      footer?.removeAttribute("aria-hidden");
    };
  }, [showSearch, showSettings, showJump]);
};

export const useSearchTimeoutCleanup = (
  ref: MutableRefObject<number | null>
) => {
  useEffect(
    () => () => {
      if (ref.current !== null) {
        window.clearTimeout(ref.current);
      }
    },
    [ref]
  );
};

export const useSearchEffects = ({
  searchReady,
  setSearching,
  setSearchResults,
  showSearch,
  lastSearchedQuery,
  runSearch,
}: SearchEffectsParams) => {
  useEffect(() => {
    if (searchReady) {
      return;
    }
    setSearching(false);
    setSearchResults([]);
  }, [searchReady, setSearchResults, setSearching]);

  useEffect(() => {
    if (!showSearch) return;
    if (!searchReady) return;
    const term = lastSearchedQuery.trim();
    if (!term) return;
    runSearch(term);
  }, [showSearch, searchReady, lastSearchedQuery, runSearch]);
};
