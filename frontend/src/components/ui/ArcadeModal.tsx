"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { CloseIcon } from "@/components/icons";

export interface ArcadeModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
}

export function ArcadeModal({
  open,
  onClose,
  title,
  description,
  children,
  actions,
}: ArcadeModalProps) {
  const titleId = "arcade-modal-title";
  const descId = "arcade-modal-desc";
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(7, 8, 23, 0.85)" }}
      onClick={onClose}
    >
      {/* Nota: focus trap completo (ciclo de Tab entre elementos) no implementado en esta fase. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className="relative bg-panel border-2 border-arcade-magenta shadow-hard-magenta p-6 w-full max-w-[400px] animate-panel-enter"
        style={{ borderRadius: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-3 text-text-muted hover:text-text-primary p-1 focus:outline-none focus-visible:outline-2 focus-visible:outline-arcade-cyan"
        >
          <CloseIcon className="w-4 h-4" />
        </button>

        <h2
          id={titleId}
          className="font-arcade text-[12px] uppercase tracking-widest text-text-primary mb-4 pr-8"
        >
          {title}
        </h2>

        {description && (
          <p id={descId} className="font-body text-sm text-text-muted mb-4">
            {description}
          </p>
        )}

        {children && <div className="mb-4">{children}</div>}

        {actions && (
          <div className="flex flex-wrap gap-3 mt-4">{actions}</div>
        )}
      </div>
    </div>
  );
}
