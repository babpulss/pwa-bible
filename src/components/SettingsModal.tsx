import { Modal } from "./Modal";
import type { Theme } from "../types/bible";
import {
  BASE_FONT_SCALE,
  FONT_STEP,
  ITALIAN_DATA_SIZE_LABEL,
  JAPANESE_DATA_SIZE_LABEL,
  MAX_FONT_SCALE,
  MIN_FONT_SCALE,
} from "../config/appConstants";

type Props = {
  open: boolean;
  onClose: () => void;
  toggleButtonRef: React.RefObject<HTMLButtonElement | null>;
  theme: Theme;
  manualTheme: boolean;
  setTheme: (t: Theme) => void;
  setManualTheme: (v: boolean) => void;
  fontScale: number;
  increaseFont: () => void;
  decreaseFont: () => void;
  wakeLockEnabled: boolean;
  setWakeLockEnabled: (v: boolean) => void;
  wakeLockSupported: boolean;
  showKorean: boolean;
  toggleKorean: () => void;
  showEnglish: boolean;
  toggleEnglish: () => void;
  showJapanese: boolean;
  toggleJapanese: () => void;
  showItalian: boolean;
  toggleItalian: () => void;
  showFurigana: boolean;
  toggleFurigana: () => void;
  japaneseDataReady: boolean;
  japaneseDownloadInProgress: boolean;
  japaneseDownloadError: string | null;
  onDownloadJapanese: () => void;
  italianDataReady: boolean;
  italianDownloadInProgress: boolean;
  italianDownloadError: string | null;
  onDownloadItalian: () => void;
  canInstallPwa: boolean;
  installingPwa: boolean;
  onInstallPwa: () => void;
};

export function SettingsModal(props: Props) {
  const {
    open,
    onClose,
    toggleButtonRef,
    theme,
    manualTheme,
    setTheme,
    setManualTheme,
    fontScale,
    increaseFont,
    decreaseFont,
    wakeLockEnabled,
    setWakeLockEnabled,
    wakeLockSupported,
    showKorean,
    toggleKorean,
    showEnglish,
    toggleEnglish,
    showJapanese,
    toggleJapanese,
    showItalian,
    toggleItalian,
    showFurigana,
    toggleFurigana,
    japaneseDataReady,
    japaneseDownloadInProgress,
    japaneseDownloadError,
    onDownloadJapanese,
    italianDataReady,
    italianDownloadInProgress,
    italianDownloadError,
    onDownloadItalian,
    canInstallPwa,
    installingPwa,
    onInstallPwa,
  } = props;

  const displayPercent =
    Math.round((fontScale / BASE_FONT_SCALE) * 20 + 1e-6) * 5;

  return (
    <Modal
      open={open}
      titleId="settings-dialog-title"
      onClose={onClose}
      toggleButtonRef={toggleButtonRef}
    >
      <div className="modal__header">
        <h3 className="modal__title" id="settings-dialog-title">
          설정
        </h3>
        <button
          type="button"
          className="modal__close"
          onClick={onClose}
          aria-label="설정"
        >
          ✕
        </button>
      </div>
      <div className="modal__body">
        <div className="settings">
          <div className="settings__row">
            <div className="settings__label">테마</div>
            <div className="settings__control">
              <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
                <legend className="sr-only">테마 선택</legend>
                <div
                  role="radiogroup"
                  aria-label="테마 선택"
                  style={{ display: "grid", gap: "0.5rem" }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <input
                      type="radio"
                      name="theme-option"
                      checked={!manualTheme}
                      onChange={() => {
                        const prefersDark =
                          typeof window !== "undefined" &&
                          window.matchMedia &&
                          window.matchMedia("(prefers-color-scheme: dark)")
                            .matches;
                        setManualTheme(false);
                        setTheme(
                          prefersDark ? ("dark" as Theme) : ("light" as Theme)
                        );
                      }}
                    />
                    <span>시스템 기본</span>
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <input
                      type="radio"
                      name="theme-option"
                      checked={manualTheme && theme === "light"}
                      onChange={() => {
                        setManualTheme(true);
                        setTheme("light");
                      }}
                    />
                    <span>라이트</span>
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <input
                      type="radio"
                      name="theme-option"
                      checked={manualTheme && theme === "dark"}
                      onChange={() => {
                        setManualTheme(true);
                        setTheme("dark");
                      }}
                    />
                    <span>다크</span>
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <input
                      type="radio"
                      name="theme-option"
                      checked={manualTheme && theme === "highContrast"}
                      onChange={() => {
                        setManualTheme(true);
                        setTheme("highContrast");
                      }}
                    />
                    <span>고대비</span>
                  </label>
                </div>
              </fieldset>
            </div>
          </div>

          <div className="settings__row">
            <div className="settings__label">글꼴 크기</div>
            <div className="settings__control">
              <div
                className="font-controls"
                role="group"
                aria-label="글꼴 크기 조절"
              >
                <button
                  type="button"
                  onClick={decreaseFont}
                  disabled={fontScale <= MIN_FONT_SCALE + FONT_STEP / 2}
                  className="font-controls__button"
                >
                  Aa-
                </button>
                <span className="font-controls__value">{displayPercent}%</span>
                <button
                  type="button"
                  onClick={increaseFont}
                  disabled={fontScale >= MAX_FONT_SCALE - FONT_STEP / 2}
                  className="font-controls__button"
                >
                  Aa+
                </button>
              </div>
            </div>
          </div>

          {wakeLockSupported && (
            <div className="settings__row">
              <div className="settings__label">화면 항상 켜기</div>
              <div className="settings__control">
                <label className="toggle" aria-label="화면 항상 켜기">
                  <span className="toggle__switch">
                    <input
                      type="checkbox"
                      checked={wakeLockEnabled}
                      onChange={(e) => setWakeLockEnabled(e.target.checked)}
                    />
                    <span className="toggle__indicator" />
                  </span>
                  <span className="toggle__label">켜짐</span>
                </label>
              </div>
            </div>
          )}

          <div className="settings__row">
            <div className="settings__label">개역한글 보기</div>
            <div className="settings__control">
              <label className="toggle" aria-label="개역한글 번역 표시">
                <span className="toggle__switch">
                  <input
                    type="checkbox"
                    checked={showKorean}
                    onChange={toggleKorean}
                  />
                  <span className="toggle__indicator" />
                </span>
                <span className="toggle__label">표시</span>
              </label>
            </div>
          </div>

          <div className="settings__row">
            <div className="settings__label">KJV 보기</div>
            <div className="settings__control">
              <label className="toggle" aria-label="KJV 번역 표시">
                <span className="toggle__switch">
                  <input
                    type="checkbox"
                    checked={showEnglish}
                    onChange={toggleEnglish}
                  />
                  <span className="toggle__indicator" />
                </span>
                <span className="toggle__label">표시</span>
              </label>
            </div>
          </div>

          <div className="settings__row">
            <div className="settings__label">일본어 보기</div>
            <div className="settings__control settings__control--column">
              <div
                style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
              >
                <label className="toggle" aria-label="일본어 성경 번역 표시">
                  <span className="toggle__switch">
                    <input
                      type="checkbox"
                      checked={showJapanese}
                      onChange={toggleJapanese}
                      disabled={!japaneseDataReady}
                    />
                    <span className="toggle__indicator" />
                  </span>
                  <span className="toggle__label">표시</span>
                </label>
                <label className="toggle" aria-label="후리가나 표시">
                  <span className="toggle__switch">
                    <input
                      type="checkbox"
                      checked={showFurigana}
                      onChange={toggleFurigana}
                      disabled={!japaneseDataReady}
                    />
                    <span className="toggle__indicator" />
                  </span>
                  <span className="toggle__label">후리가나</span>
                </label>
              </div>
              {!japaneseDataReady && (
                <>
                  <div className="settings__action-row">
                    <p className="settings__hint">
                      일본어 성경 데이터({JAPANESE_DATA_SIZE_LABEL})는 직접
                      다운로드 후 사용할 수 있습니다.
                    </p>
                    <button
                      type="button"
                      className="settings__action-button"
                      onClick={onDownloadJapanese}
                      disabled={japaneseDownloadInProgress}
                    >
                      {japaneseDownloadInProgress ? "다운로드 중…" : "다운로드"}
                    </button>
                  </div>
                  {japaneseDownloadError && (
                    <p className="settings__hint settings__hint--error">
                      {japaneseDownloadError}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="settings__row">
            <div className="settings__label">이탈리아어 보기</div>
            <div className="settings__control settings__control--column">
              <div
                style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
              >
                <label
                  className="toggle"
                  aria-label="이탈리아어 성경 번역 표시"
                >
                  <span className="toggle__switch">
                    <input
                      type="checkbox"
                      checked={showItalian}
                      onChange={toggleItalian}
                      disabled={!italianDataReady}
                    />
                    <span className="toggle__indicator" />
                  </span>
                  <span className="toggle__label">표시</span>
                </label>
              </div>
              {!italianDataReady && (
                <>
                  <div className="settings__action-row">
                    <p className="settings__hint">
                      이탈리아어 성경 데이터({ITALIAN_DATA_SIZE_LABEL})는 직접
                      다운로드 후 사용할 수 있습니다.
                    </p>
                    <button
                      type="button"
                      className="settings__action-button"
                      onClick={onDownloadItalian}
                      disabled={italianDownloadInProgress}
                    >
                      {italianDownloadInProgress ? "다운로드 중…" : "다운로드"}
                    </button>
                  </div>
                  {italianDownloadError && (
                    <p className="settings__hint settings__hint--error">
                      {italianDownloadError}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {canInstallPwa && (
            <div className="settings__row">
              <div className="settings__label">앱 설치</div>
              <div className="settings__control settings__control--column">
                <button
                  type="button"
                  className="settings__action-button"
                  onClick={onInstallPwa}
                  disabled={installingPwa}
                >
                  {installingPwa ? "설치 요청 중…" : "PWA 설치하기"}
                </button>
                <p className="settings__hint">
                  PWA앱으로 설치하면 오프라인으로 사용할 수 있습니다.
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="settings__row settings__row--info" id="license-info">
          <div className="settings__label settings__label--top">정보</div>
          <div className="settings__control settings__control--info">
            <div className="settings__info">
              <p style={{ margin: 0 }}>
                <strong>개역한글(대한성서공회)</strong> 본문은 대한성서공회의
                공개 사용 안내에 따라 예배·연구 목적으로 제공합니다. 자세한
                조건과 허용 범위는 대한성서공회 저작권 안내를 참고해 주세요.
              </p>
              <p style={{ margin: "0.5rem 0 0" }}>
                <strong>King James Version</strong>은 퍼블릭 도메인으로 누구나
                자유롭게 이용하고 재배포할 수 있는 번역입니다.
              </p>
              <p style={{ margin: "0.5rem 0 0" }}>
                <strong>口語訳聖書 (1955年版ルビ付き)</strong>는 1955년판 일본
                구어역 성경의 루비(후리가나) 포함 전자본으로, 퍼블릭 도메인으로
                공개되어 있습니다. 원 출판사인 일본성서협회(Japan Bible
                Society)의 저작권 고지를 존중하며 안내용으로 제공합니다.
              </p>
              <p style={{ margin: "0.5rem 0 0" }}>
                <strong>La Sacra Bibbia Riveduta 1927 (Italiano)</strong>은
                Società Biblica di Ginevra가 배포한 Riveduta 1927 판본으로,
                퍼블릭 도메인에 해당합니다.
              </p>
              <p style={{ margin: "0.5rem 0 0" }}>
                데이터는 최초 접속 시 내려받아 기기에 저장되며, 이후에는
                오프라인 환경에서도 동일하게 사용할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
