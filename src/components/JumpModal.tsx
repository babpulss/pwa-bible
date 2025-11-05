import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "./Modal";
import type { Book, Chapter, Verse } from "../types/bible";

type Step = "book" | "chapter" | "verse";

type Props = {
  open: boolean;
  onClose: () => void;
  toggleButtonRef: React.RefObject<HTMLButtonElement | null>;
  books: Book[];
  onJump: (bookNumber: number, chapterNumber: number, verseNumber: number) => void;
};

export function JumpModal(props: Props) {
  const { open, onClose, toggleButtonRef, books, onJump } = props;

  const [step, setStep] = useState<Step>("book");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const firstInteractiveRef = useRef<HTMLButtonElement | null>(null);
  const booksByTestament = useMemo(() => {
    const ot = books.filter((book) => book.number <= 39);
    const nt = books.filter((book) => book.number > 39);
    return { ot, nt };
  }, [books]);

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

  const handleSelectBook = useCallback((book: Book) => {
    setSelectedBook(book);
    setStep("chapter");
  }, []);

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
    const renderSection = (
      title: string,
      groupBooks: Book[],
      offset: number
    ) => {
      if (groupBooks.length === 0) return null;
      return (
        <div className="jump-book-section" key={title}>
          <p className="jump-book-section__title">{title}</p>
          <div className="jump-book-row">
            {groupBooks.map((book, index) => (
              <button
                key={book.number}
                type="button"
                className="jump-card jump-card--book"
                onClick={() => handleSelectBook(book)}
                ref={index + offset === 0 ? firstInteractiveRef : undefined}
              >
                <span className="jump-card__title">{book.title}</span>
                <span className="jump-card__meta">{book.chapters.length}장</span>
              </button>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div className="jump-book-groups">
        {renderSection("구약", booksByTestament.ot, 0)}
        {renderSection("신약", booksByTestament.nt, booksByTestament.ot.length)}
      </div>
    );
  }, [booksByTestament, handleSelectBook]);

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
      return <div className="jump-book-wrapper">{bookGrid}</div>;
    }
    if (step === "chapter") {
      return <div className="jump-grid jump-grid--chapters">{chapterGrid}</div>;
    }
    return <div className="jump-grid jump-grid--verses">{verseGrid}</div>;
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
          {step !== "book" && (
            <button type="button" className="jump-secondary" onClick={handleBack}>
              ← 뒤로가기
            </button>
          )}
        </div>
        <div className="jump-step-header">
          <p className="jump-step-title">
            {stepTitle}
            {step === "chapter" && selectedBook && (
              <span className="jump-step-hint">총 {selectedBook.chapters.length}장</span>
            )}
            {step === "verse" && selectedChapter && (
              <span className="jump-step-hint">총 {selectedChapter.verses.length}절</span>
            )}
          </p>
        </div>
        {renderContent()}
      </div>
    </Modal>
  );
}
