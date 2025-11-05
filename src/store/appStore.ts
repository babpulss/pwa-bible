import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Selection, Theme, SearchResult } from "../types/bible";

const MIN_FONT_SCALE = 0.85;
const MAX_FONT_SCALE = 1.4;
const FONT_STEP = 0.1;

export type FocusTarget = (Selection & { verse: number }) | null;

type AppState = {
  bookIndex: number;
  chapterIndex: number;

  theme: Theme;
  manualTheme: boolean;
  fontScale: number;
  showKorean: boolean;
  showEnglish: boolean;
  showJapanese: boolean;
  showItalian: boolean;
  showFurigana: boolean;
  japaneseDataAllowed: boolean;
  italianDataAllowed: boolean;

  wakeLockEnabled: boolean;

  showSearch: boolean;
  showSettings: boolean;
  query: string;
  searchScope: "all" | "ot" | "nt";
  // 선택 시 이 책(번호 1..66)에서만 검색. null이면 범위(전체/구약/신약) 규칙 사용
  searchBookNumber: number | null;
  searchResults: SearchResult[];
  searching: boolean;
  lastSearchedQuery: string;

  focusTarget: FocusTarget;

  // setters/actions
  setBookIndex: (i: number) => void;
  setChapterIndex: (i: number) => void;

  setTheme: (t: Theme) => void;
  setManualTheme: (v: boolean) => void;
  toggleTheme: () => void;

  setFontScale: (v: number) => void;
  increaseFont: () => void;
  decreaseFont: () => void;

  setShowKorean: (v: boolean) => void;
  toggleKorean: () => void;
  setShowEnglish: (v: boolean) => void;
  toggleEnglish: () => void;
  setShowJapanese: (v: boolean) => void;
  toggleJapanese: () => void;
  setShowItalian: (v: boolean) => void;
  toggleItalian: () => void;
  setShowFurigana: (v: boolean) => void;
  toggleFurigana: () => void;
  setJapaneseDataAllowed: (v: boolean) => void;
  setItalianDataAllowed: (v: boolean) => void;

  setShowSearch: (v: boolean) => void;
  toggleSearch: () => void;
  setShowSettings: (v: boolean) => void;
  toggleSettings: () => void;

  setQuery: (q: string) => void;
  setSearchScope: (v: "all" | "ot" | "nt") => void;
  setSearchBookNumber: (n: number | null) => void;
  setSearchResults: (r: SearchResult[]) => void;
  setSearching: (v: boolean) => void;
  setLastSearchedQuery: (q: string) => void;

  setFocusTarget: (t: FocusTarget) => void;

  setWakeLockEnabled: (v: boolean) => void;
};

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      bookIndex: 0,
      chapterIndex: 0,

      theme: getInitialTheme(),
      manualTheme: false,
      fontScale: 1.1,
      showKorean: true,
      showEnglish: true,
      showJapanese: false,
      showItalian: false,
      showFurigana: true,
      japaneseDataAllowed: false,
      italianDataAllowed: false,
      wakeLockEnabled: false,

      showSearch: false,
      showSettings: false,
      query: "",
      searchScope: "all",
  searchBookNumber: null,
      searchResults: [],
      searching: false,
      lastSearchedQuery: "",

      focusTarget: null,

      setBookIndex: (i: number) => set({ bookIndex: i }),
      setChapterIndex: (i: number) => set({ chapterIndex: i }),

      setTheme: (t: Theme) => set({ theme: t }),
      setManualTheme: (v: boolean) => set({ manualTheme: v }),
      toggleTheme: () =>
        set((s: AppState) => ({
          theme: s.theme === "light" ? "dark" : "light",
          manualTheme: true,
        })),

      setFontScale: (v: number) =>
        set({
          fontScale: Math.min(
            MAX_FONT_SCALE,
            Math.max(MIN_FONT_SCALE, Number(v.toFixed(2)))
          ),
        }),
      increaseFont: () =>
        set((s: AppState) => ({
          fontScale: Math.min(
            MAX_FONT_SCALE,
            Number((s.fontScale + FONT_STEP).toFixed(2))
          ),
        })),
      decreaseFont: () =>
        set((s: AppState) => ({
          fontScale: Math.max(
            MIN_FONT_SCALE,
            Number((s.fontScale - FONT_STEP).toFixed(2))
          ),
        })),

      setShowKorean: (v: boolean) => set({ showKorean: v }),
      toggleKorean: () =>
        set((s: AppState) => ({ showKorean: !s.showKorean })),
      setShowEnglish: (v: boolean) => set({ showEnglish: v }),
      toggleEnglish: () =>
        set((s: AppState) => ({ showEnglish: !s.showEnglish })),
      setShowJapanese: (v: boolean) => set({ showJapanese: v }),
      toggleJapanese: () =>
        set((s: AppState) => ({ showJapanese: !s.showJapanese })),
      setShowItalian: (v: boolean) => set({ showItalian: v }),
      toggleItalian: () =>
        set((s: AppState) => ({ showItalian: !s.showItalian })),
      setShowFurigana: (v: boolean) => set({ showFurigana: v }),
      toggleFurigana: () =>
        set((s: AppState) => ({ showFurigana: !s.showFurigana })),
      setJapaneseDataAllowed: (v: boolean) => set({ japaneseDataAllowed: v }),
      setItalianDataAllowed: (v: boolean) => set({ italianDataAllowed: v }),

      setShowSearch: (v: boolean) => set({ showSearch: v }),
      toggleSearch: () => set((s: AppState) => ({ showSearch: !s.showSearch })),
      setShowSettings: (v: boolean) => set({ showSettings: v }),
      toggleSettings: () =>
        set((s: AppState) => ({ showSettings: !s.showSettings })),

      setQuery: (q: string) => set({ query: q }),
      setSearchScope: (v: "all" | "ot" | "nt") => set({ searchScope: v }),
  setSearchBookNumber: (n: number | null) => set({ searchBookNumber: n }),
      setSearchResults: (r: SearchResult[]) => set({ searchResults: r }),
      setSearching: (v: boolean) => set({ searching: v }),
      setLastSearchedQuery: (q: string) => set({ lastSearchedQuery: q }),

      setFocusTarget: (t: FocusTarget) => set({ focusTarget: t }),
      setWakeLockEnabled: (v: boolean) => set({ wakeLockEnabled: v }),
    }),
    {
      name: "simple-bible:app",
      storage: createJSONStorage(() => localStorage),
      partialize: (state: AppState) => ({
        // Persist core user prefs + position
        bookIndex: state.bookIndex,
        chapterIndex: state.chapterIndex,
        theme: state.theme,
        manualTheme: state.manualTheme,
        fontScale: state.fontScale,
        showKorean: state.showKorean,
        showEnglish: state.showEnglish,
        showJapanese: state.showJapanese,
        showItalian: state.showItalian,
        showFurigana: state.showFurigana,
        japaneseDataAllowed: state.japaneseDataAllowed,
        italianDataAllowed: state.italianDataAllowed,
        searchScope: state.searchScope,
        searchBookNumber: state.searchBookNumber,
        wakeLockEnabled: state.wakeLockEnabled,
      }),
    }
  )
);
