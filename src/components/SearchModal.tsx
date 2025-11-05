import { Modal } from './Modal'
import { useRef } from 'react'
import type { Book, SearchResult } from '../types/bible'
import { SEARCH_LIMIT } from '../config/appConstants'

type Props = {
  open: boolean
  onClose: () => void
  query: string
  setQuery: (v: string) => void
  searchScope: 'all' | 'ot' | 'nt'
  setSearchScope: (v: 'all' | 'ot' | 'nt') => void
  // 특정 책 선택: 번호(1..66) 또는 null
  searchBookNumber: number | null
  setSearchBookNumber: (n: number | null) => void
  // 책 목록(셀렉트 렌더링용)
  books: Book[]
  searching: boolean
  searchResults: SearchResult[]
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onClickResult: (r: SearchResult) => void
  toggleButtonRef: React.RefObject<HTMLButtonElement | null>
  searchReady: boolean
  lastSearchedQuery: string
}

export function SearchModal(props: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const {
    open, onClose, query, setQuery,
    searchScope, setSearchScope,
    searchBookNumber, setSearchBookNumber,
    books,
    searching, searchResults,
    onSubmit, onClickResult, toggleButtonRef, searchReady, lastSearchedQuery
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
              disabled={!searchReady}
            />
            <button type="submit" disabled={!searchReady || searching} className="search-button">
              찾기
            </button>
          </div>
          {!searchReady && (
            <p className="search-hint">
              검색 가능한 번역이 없습니다. 설정에서 언어 데이터를 내려받아 주세요.
            </p>
          )}
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
            <select
              aria-label="특정 책"
              className="book-filter"
              value={searchBookNumber ?? ''}
              onChange={(e) => {
                const v = e.target.value
                setSearchBookNumber(v ? Number(v) : null)
              }}
              disabled={!searchReady}
            >
              <option value="">전체 책</option>
              {books.map((b) => (
                <option key={b.number} value={b.number}>{b.title}</option>
              ))}
            </select>
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
              <li key={`${result.translationId}-${result.bookNumber}-${result.chapter}-${result.verse}`}>
                <button type="button" onClick={() => onClickResult(result)} className="result-button">
                  <span className="result-meta">
                    {result.bookTitle} {result.chapter}:{result.verse}
                    <span className="result-meta__translation">{result.translation}</span>
                  </span>
                  <span className="result-text">{result.text}</span>
                </button>
              </li>
            ))}
            {searchResults.length >= SEARCH_LIMIT && (
              <li className="hint">검색 결과가 많아 {SEARCH_LIMIT}개만 표시합니다.</li>
            )}
          </ul>
        </div>
      </div>
    </Modal>
  )
}
