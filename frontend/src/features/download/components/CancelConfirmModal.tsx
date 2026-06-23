"use client";

import { ArcadeModal } from "@/components/ui/ArcadeModal";
import { ArcadeButton } from "@/components/ui/ArcadeButton";

interface CancelConfirmModalProps {
  open: boolean;
  onContinue: () => void;
  onAbort: () => void;
}

export function CancelConfirmModal({ open, onContinue, onAbort }: CancelConfirmModalProps) {
  return (
    <ArcadeModal
      open={open}
      onClose={onContinue}
      title="ABORTAR MISIÓN"
      description="¿Deseas cancelar la descarga? Los archivos temporales serán eliminados."
      actions={
        <>
          <ArcadeButton variant="ghost" onClick={onContinue}>
            CONTINUAR MISIÓN
          </ArcadeButton>
          <ArcadeButton variant="danger" onClick={onAbort}>
            ABORTAR
          </ArcadeButton>
        </>
      }
    />
  );
}
