export const STORAGE_KEY = "simple-bible:last-selection";
export const THEME_KEY = "simple-bible:theme";
export const FONT_SCALE_KEY = "simple-bible:font-scale";
export const SHOW_KOREAN_KEY = "simple-bible:show-korean";
export const SHOW_ENGLISH_KEY = "simple-bible:show-english";
export const SHOW_JAPANESE_KEY = "simple-bible:show-japanese";
export const SHOW_FURIGANA_KEY = "simple-bible:show-furigana";

export const SEARCH_LIMIT = 120;

export const BASE_FONT_SCALE = 1.1;
export const MIN_FONT_SCALE = Number((BASE_FONT_SCALE * 0.8).toFixed(3));
export const MAX_FONT_SCALE = Number((BASE_FONT_SCALE * 1.4).toFixed(3));
export const FONT_STEP = Number((BASE_FONT_SCALE * 0.05).toFixed(3));

export const THEME_COLORS = {
  light: "#f4f5f7",
  dark: "#0f1118",
  highContrast: "#000000",
} as const;

export const JAPANESE_DATA_SIZE_LABEL = "약 21MB";
export const ITALIAN_DATA_SIZE_LABEL = "약 4.7MB";
