import { Modal } from './Modal'
import type { Theme } from '../types/bible'

type Props = {
  open: boolean
  onClose: () => void
  toggleButtonRef: React.RefObject<HTMLButtonElement | null>
  theme: Theme
  manualTheme: boolean
  setTheme: (t: Theme) => void
  setManualTheme: (v: boolean) => void
  fontScale: number
  increaseFont: () => void
  decreaseFont: () => void
  minFont: number
  maxFont: number
  wakeLockEnabled: boolean
  setWakeLockEnabled: (v: boolean) => void
  wakeLockSupported: boolean
  showKorean: boolean
  toggleKorean: () => void
  showEnglish: boolean
  toggleEnglish: () => void
  showJapanese: boolean
  toggleJapanese: () => void
  showFurigana: boolean
  toggleFurigana: () => void
  offlineReady: boolean
  isPending: boolean
  loadError: string | null
  englishLoadError: string | null
  japaneseLoadError: string | null
}

export function SettingsModal(props: Props) {
  const {
    open, onClose, toggleButtonRef, theme, manualTheme, setTheme, setManualTheme,
    fontScale, increaseFont, decreaseFont, minFont, maxFont,
    wakeLockEnabled, setWakeLockEnabled, wakeLockSupported,
    showKorean, toggleKorean,
    showEnglish, toggleEnglish,
    showJapanese, toggleJapanese,
    showFurigana, toggleFurigana,
    offlineReady, isPending, loadError, englishLoadError, japaneseLoadError
  } = props

  return (
    <Modal open={open} titleId="settings-dialog-title" onClose={onClose} toggleButtonRef={toggleButtonRef}>
      <div className="modal__header">
        <h3 className="modal__title" id="settings-dialog-title">설정</h3>
        <button type="button" className="modal__close" onClick={onClose} aria-label="설정 닫기">✕</button>
      </div>
      <div className="modal__body">
        <div className="settings">
          <div className="settings__row">
            <div className="settings__label">테마</div>
            <div className="settings__control">
              <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
                <legend className="sr-only">테마 선택</legend>
                <div role="radiogroup" aria-label="테마 선택" style={{ display: 'grid', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      name="theme-option"
                      checked={!manualTheme}
                      onChange={() => {
                        const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
                        setManualTheme(false)
                        setTheme(prefersDark ? 'dark' as Theme : 'light' as Theme)
                      }}
                    />
                    <span>시스템 기본</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      name="theme-option"
                      checked={manualTheme && theme === 'light'}
                      onChange={() => { setManualTheme(true); setTheme('light') }}
                    />
                    <span>라이트</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      name="theme-option"
                      checked={manualTheme && theme === 'dark'}
                      onChange={() => { setManualTheme(true); setTheme('dark') }}
                    />
                    <span>다크</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      name="theme-option"
                      checked={manualTheme && theme === 'amoled'}
                      onChange={() => { setManualTheme(true); setTheme('amoled') }}
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
              <div className="font-controls" role="group" aria-label="글꼴 크기 조절">
                <button type="button" onClick={decreaseFont} disabled={fontScale <= minFont + 0.01} className="font-controls__button">Aa-</button>
                <span className="font-controls__value">{Math.round(fontScale * 100)}%</span>
                <button type="button" onClick={increaseFont} disabled={fontScale >= maxFont - 0.01} className="font-controls__button">Aa+</button>
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
                  <input type="checkbox" checked={showKorean} onChange={toggleKorean} />
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
                  <input type="checkbox" checked={showEnglish} onChange={toggleEnglish} />
                  <span className="toggle__indicator" />
                </span>
                <span className="toggle__label">표시</span>
              </label>
            </div>
          </div>

          <div className="settings__row">
            <div className="settings__label">일본어 보기</div>
            <div className="settings__control">
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <label className="toggle" aria-label="일본어 성경 번역 표시">
                  <span className="toggle__switch">
                    <input type="checkbox" checked={showJapanese} onChange={toggleJapanese} />
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
                      disabled={!showJapanese}
                    />
                    <span className="toggle__indicator" />
                  </span>
                  <span className="toggle__label">후리가나</span>
                </label>
              </div>
            </div>
          </div>

          <div className="settings__row">
            <div className="settings__label">오프라인</div>
            <div className="settings__control">
              {offlineReady ? (
                <span className="badge ok">오프라인 준비 완료</span>
              ) : isPending ? (
                <span className="badge">준비 중…</span>
              ) : loadError ? (
                <span className="badge error">한글 데이터 오류</span>
              ) : englishLoadError ? (
                <span className="badge warn">KJV 오류</span>
              ) : japaneseLoadError ? (
                <span className="badge warn">일본어 성경 오류</span>
              ) : (
                <span className="badge">온라인</span>
              )}
            </div>
          </div>
        </div>
        <div className="settings__row" id="license-info">
          <div className="settings__label">정보</div>
          <div className="settings__control">
            <div className="settings__info">
              <p style={{ margin: 0 }}>
                저작권 안내: 개역한글(대한성서공회) 본문은 대한성서공회가 제공한 공개 사용 안내 범위
                내에서 자유롭게 이용할 수 있습니다(자세한 조건은 저작권 안내 참고). King James
                Version(KJV)은 퍼블릭 도메인으로 자유롭게 사용 및 배포할 수 있습니다. 口語訳聖書
                (1955年版ルビ付き) 역시 퍼블릭 도메인 자료입니다.
              </p>
              <p style={{ margin: '0.35rem 0 0' }}>
                데이터는 최초 접속 시 한 번 내려받아 이후 오프라인에서도 사용할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
