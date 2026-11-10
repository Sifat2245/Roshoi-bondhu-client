import React, { useEffect, useRef, useId } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const activeDialogs: HTMLDivElement[] = [];
let bodyOverflow = "";
let htmlOverflow = "";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
  showClose?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-xl",
  showClose = true,
  className = "",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const dialog = modalRef.current;
    const underneath = activeDialogs[activeDialogs.length - 1];
    if (underneath) {
      underneath.inert = true;
      underneath.setAttribute("aria-hidden", "true");
    }
    if (activeDialogs.length === 0) {
      bodyOverflow = document.body.style.overflow;
      htmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }
    activeDialogs.push(dialog);
    const previousFocus = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => {
      if (!dialog?.contains(document.activeElement)) dialog?.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeDialogs[activeDialogs.length - 1] !== dialog) return;
      if (e.key === "Escape") {
        closeRef.current?.();
      }
      if (e.key === "Tab") {
        const elements = [
          ...(modalRef.current?.querySelectorAll<HTMLElement>(
            'button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]',
          ) || []),
        ].filter((element) => element.getClientRects().length > 0);
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (!first) {
          e.preventDefault();
          return;
        }
        if (!modalRef.current?.contains(document.activeElement)) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
          return;
        }
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === modalRef.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === last ||
            document.activeElement === modalRef.current)
        ) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      const index = activeDialogs.indexOf(dialog);
      if (index >= 0) activeDialogs.splice(index, 1);
      const top = activeDialogs[activeDialogs.length - 1];
      if (top) {
        top.inert = false;
        top.removeAttribute("aria-hidden");
      }
      if (activeDialogs.length === 0) {
        document.body.style.overflow = bodyOverflow;
        document.documentElement.style.overflow = htmlOverflow;
      }
      cancelAnimationFrame(frame);
      if (previousFocus?.isConnected) previousFocus.focus();
      else top?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => {
      const dialog = modalRef.current;
      if (
        activeDialogs[activeDialogs.length - 1] === dialog &&
        !dialog?.contains(document.activeElement)
      )
        dialog?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen, title]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop overlay (clicking closes modal) */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Dialog Window */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : "Dialog"}
        tabIndex={-1}
        className={`relative w-full ${maxWidth} bg-white dark:bg-[#242526] text-gray-900 dark:text-gray-100 rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[92dvh] z-10 animate-in zoom-in-95 duration-200 outline-none ${className}`}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4 shrink-0">
            <div className="min-w-0 flex-1">
              {title && (
                <h3
                  id={titleId}
                  className="font-bold text-lg sm:text-xl leading-snug break-words text-gray-900 dark:text-white"
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>

            {showClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center transition cursor-pointer shrink-0 ml-auto"
                title="Close"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
