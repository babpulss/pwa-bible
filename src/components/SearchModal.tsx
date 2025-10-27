import { Modal } from './Modal'
import type { SearchResult } from '../types/bible'
import { useRef } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  query: string
  setQuery: (v: string) => void
  searchScope: 'all' | 'ot' | 'nt'
  setSearchScope: (v: 'all' | 'ot' | 'nt') => void
  searching: boolean
  searchResults: SearchResult[]
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onClickResult: (r: SearchResult) => void
  toggleButtonRef: React.RefObject<HTMLButtonElement | null>
  searchLimit: number
  koreanDataReady: boolean
  lastSearchedQuery: string
}

export function SearchModal(props: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const {
    open, onClose, query, setQuery, searchScope, setSearchScope, searching, searchResults,
    onSubmit, onClickResult, toggleButtonRef, searchLimit, koreanDataReady, lastSearchedQuery
  } = props
  return (
    <Modal open={open} titleId="search-dialog-title" onClose={onClose} initialFocusRef={inputRef} toggleButtonRef={toggleButtonRef}>
      <div className="modal__header">
        <h3 className="modal__title" id="search-dialog-title">검색</h3>
        <button type="button" className="modal__close" onClick={onClose} aria-label="검색 닫기">✕</button>
      </div>
      <div className="modal__body">
        <form className="search" onSubmit={onSubmit}>
          <label htmlFor="search-input">검색</label>
          <div className="search-input">
            <input
              ref={inputRef}
              id="search-input"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="단어 또는 구절을 입력하세요"
              disabled={!koreanDataReady}
            />
            <button type="submit" disabled={!koreanDataReady || searching} className="search-button">
              찾기
            </button>
          </div>
          <fieldset className="search-scope" aria-label="검색 범위">
            <legend className="sr-only">검색 범위</legend>
            <label className="radio">
              <input
                type="radio"
                name="scope"
                value="all"
                checked={searchScope === 'all'}
                onChange={() => setSearchScope('all')}
              /> 전체
            </label>
            <label className="radio">
              <input
                type="radio"
                name="scope"
                value="ot"
                checked={searchScope === 'ot'}
                onChange={() => setSearchScope('ot')}
              /> 구약
            </label>
            <label className="radio">
              <input
                type="radio"
                name="scope"
                value="nt"
                checked={searchScope === 'nt'}
                onChange={() => setSearchScope('nt')}
              /> 신약
            </label>
          </fieldset>
        </form>
        <div className="modal__content">
          <div className="search-results__header">
            <h3>검색 결과</h3>
            {searching && <span className="badge">검색 중…</span>}
            {!searching && lastSearchedQuery.trim() && (
              <span className="search-results__count">{searchResults.length}개</span>
            )}
          </div>
          {lastSearchedQuery.trim() && !searchResults.length && !searching && (
            <p className="empty-state">검색 결과가 없습니다.</p>
          )}
          <ul className="search-results__list">
            {searchResults.map((result) => (
              <li key={`${result.bookNumber}-${result.chapter}-${result.verse}`}>
                <button type="button" onClick={() => onClickResult(result)} className="result-button">
                  <span className="result-meta">
                    {result.bookTitle} {result.chapter}:{result.verse}
                  </span>
                  <span className="result-text">{result.text}</span>
                </button>
              </li>
            ))}
            {searchResults.length >= searchLimit && (
              <li className="hint">검색 결과가 많아 {searchLimit}개만 표시합니다.</li>
            )}
          </ul>
        </div>
      </div>
    </Modal>
  )
}
