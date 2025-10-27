import { Modal } from './Modal'

type Props = {
  open: boolean
  onClose: () => void
  toggleButtonRef: React.RefObject<HTMLButtonElement | null>
  theme: 'light' | 'dark'
  setTheme: (t: 'light' | 'dark') => void
  setManualTheme: (v: boolean) => void
  fontScale: number
  increaseFont: () => void
  decreaseFont: () => void
  minFont: number
  maxFont: number
  wakeLockEnabled: boolean
  setWakeLockEnabled: (v: boolean) => void
  wakeLockSupported: boolean
  showEnglish: boolean
  toggleEnglish: () => void
  offlineReady: boolean
  isPending: boolean
  loadError: string | null
  englishLoadError: string | null
}

export function SettingsModal(props: Props) {
  const {
    open, onClose, toggleButtonRef, theme, setTheme, setManualTheme,
    fontScale, increaseFont, decreaseFont, minFont, maxFont,
    wakeLockEnabled, setWakeLockEnabled, wakeLockSupported,
    showEnglish, toggleEnglish,
    offlineReady, isPending, loadError, englishLoadError
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
              <label className="toggle" aria-label="다크 모드">
                <span className="toggle__switch">
                  <input
                    type="checkbox"
                    checked={theme === 'dark'}
                    onChange={(e) => { setManualTheme(true); setTheme(e.target.checked ? 'dark' : 'light') }}
                  />
                  <span className="toggle__indicator" />
                </span>
                <span className="toggle__label">다크 모드</span>
              </label>
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
              ) : (
                <span className="badge">온라인</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
