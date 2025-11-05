import { useEffect, useRef } from "react";

type ModalProps = {
  open: boolean;
  titleId: string;
  onClose: () => void;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  toggleButtonRef?: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
};

export function Modal({
  open,
  titleId,
  onClose,
  initialFocusRef,
  toggleButtonRef,
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  // keep latest onClose without retriggering effects
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // focus initial input
  useEffect(() => {
    if (!open) return;
    const raf = window.requestAnimationFrame(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else {
        panelRef.current?.focus();
      }
    });
    return () => window.cancelAnimationFrame(raf);
  }, [open, initialFocusRef]);

  // ESC close, scroll lock (no focus return here)
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // When modal closes, return focus to toggle button (or previously focused)
  useEffect(() => {
    if (open) return;
    const toggleEl = toggleButtonRef?.current ?? null;
    const prev = previouslyFocusedRef.current;
    const id = window.setTimeout(() => {
      if (toggleEl) toggleEl.focus();
      else prev?.focus();
    }, 0);
    return () => window.clearTimeout(id);
  }, [open, toggleButtonRef]);

  // focus trap
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const selector =
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const getFocusable = (): HTMLElement[] =>
      Array.from(panel.querySelectorAll<HTMLElement>(selector)).filter(
        (el) =>
          !el.hasAttribute("disabled") &&
          el.getAttribute("aria-hidden") !== "true"
      );
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusables = getFocusable();
      if (focusables.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = (document.activeElement as HTMLElement) || panel;
      const isInside = panel.contains(active);
      if (e.shiftKey) {
        if (!isInside || active === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (!isInside || active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="modal__overlay" onClick={onClose} />
      <div
        className="modal__panel"
        role="document"
        ref={panelRef}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );
}
