import { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "./Modal";
import type { Book, Chapter, Verse } from "../types/bible";

type Step = "book" | "chapter" | "verse";

type Props = {
  open: boolean;
  onClose: () => void;
  toggleButtonRef: React.RefObject<HTMLButtonElement | null>;
  books: Book[];
  onJump: (bookNumber: number, chapterNumber: number, verseNumber: number) => void;
  canJumpToCurrentStart: boolean;
  onJumpToCurrentStart: () => void;
};

export function JumpModal(props: Props) {
  const {
    open,
    onClose,
    toggleButtonRef,
    books,
    onJump,
    canJumpToCurrentStart,
    onJumpToCurrentStart,
  } = props;

  const [step, setStep] = useState<Step>("book");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const firstInteractiveRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep("book");
    setSelectedBook(null);
    setSelectedChapter(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const raf = window.requestAnimationFrame(() => {
      firstInteractiveRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [open, step]);

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setStep("chapter");
  };

  const handleSelectChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setStep("verse");
  };

  const handleSelectVerse = (verse: Verse) => {
    if (!selectedBook || !selectedChapter) return;
    onJump(selectedBook.number, selectedChapter.number, verse.number);
    onClose();
  };

  const handleBack = () => {
    if (step === "chapter") {
      setSelectedBook(null);
      setStep("book");
    } else if (step === "verse") {
      setSelectedChapter(null);
      setStep("chapter");
    }
  };

  const stepTitle = useMemo(() => {
    switch (step) {
      case "book":
        return "성경 선택";
      case "chapter":
        return selectedBook ? `${selectedBook.title} – 장 선택` : "장 선택";
      case "verse":
        return selectedBook && selectedChapter
          ? `${selectedBook.title} ${selectedChapter.number}장 – 절 선택`
          : "절 선택";
      default:
        return "";
    }
  }, [step, selectedBook, selectedChapter]);

  const bookGrid = useMemo(() => {
    return books.map((book, index) => (
      <button
        key={book.number}
        type="button"
        className="jump-card"
        onClick={() => handleSelectBook(book)}
        ref={index === 0 ? firstInteractiveRef : undefined}
      >
        <span className="jump-card__title">{book.title}</span>
        <span className="jump-card__meta">{book.chapters.length}장</span>
      </button>
    ));
  }, [books]);

  const chapterGrid = useMemo(() => {
    if (!selectedBook) return null;
    return selectedBook.chapters.map((chapter, index) => (
      <button
        key={chapter.number}
        type="button"
        className="jump-card jump-card--compact"
        onClick={() => handleSelectChapter(chapter)}
        ref={index === 0 ? firstInteractiveRef : undefined}
      >
        {chapter.number}장
      </button>
    ));
  }, [selectedBook]);

  const verseGrid = useMemo(() => {
    if (!selectedChapter) return null;
    return selectedChapter.verses.map((verse, index) => (
      <button
        key={verse.number}
        type="button"
        className="jump-card jump-card--compact"
        onClick={() => handleSelectVerse(verse)}
        ref={index === 0 ? firstInteractiveRef : undefined}
      >
        {verse.number}절
      </button>
    ));
  }, [selectedChapter]);

  const renderContent = () => {
    if (step === "book") {
      return (
        <div className="jump-grid jump-grid--books">
          {bookGrid}
        </div>
      );
    }
    if (step === "chapter") {
      return (
        <div className="jump-grid jump-grid--chapters">
          {chapterGrid}
        </div>
      );
    }
    return (
      <div className="jump-grid jump-grid--verses">
        {verseGrid}
      </div>
    );
  };

  return (
    <Modal
      open={open}
      titleId="jump-dialog-title"
      onClose={onClose}
      toggleButtonRef={toggleButtonRef}
    >
      <div className="modal__header">
        <h3 className="modal__title" id="jump-dialog-title">
          바로가기
        </h3>
        <button
          type="button"
          className="modal__close"
          onClick={onClose}
          aria-label="바로가기 닫기"
        >
          ✕
        </button>
      </div>
      <div className="modal__body jump-modal">
        <div className="jump-actions">
          <div className="jump-actions__left">
            {step !== "book" && (
              <button type="button" className="jump-secondary" onClick={handleBack}>
                ← 뒤로가기
              </button>
            )}
          </div>
          <div className="jump-actions__right">
            <button
              type="button"
              className="jump-secondary"
              onClick={() => {
                onJumpToCurrentStart();
                onClose();
              }}
              disabled={!canJumpToCurrentStart}
            >
              현재 장 1절로 이동
            </button>
          </div>
        </div>
        <div className="jump-step-header">
          <p className="jump-step-title">{stepTitle}</p>
          {step === "verse" && selectedChapter && (
            <p className="jump-step-hint">
              총 {selectedChapter.verses.length}절
            </p>
          )}
          {step === "chapter" && selectedBook && (
            <p className="jump-step-hint">
              총 {selectedBook.chapters.length}장
            </p>
          )}
        </div>
        {renderContent()}
      </div>
    </Modal>
  );
}
