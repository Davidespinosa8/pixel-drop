"use client";

import { useState } from "react";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { ArcadeModal } from "@/components/ui/ArcadeModal";

export function ModalDemoButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ArcadeButton variant="danger" onClick={() => setOpen(true)}>
        Abrir modal de ejemplo
      </ArcadeButton>
      <ArcadeModal
        open={open}
        onClose={() => setOpen(false)}
        title="Abortar misión"
        description="¿Deseas cancelar la descarga? Los archivos temporales serán eliminados."
        actions={
          <>
            <ArcadeButton variant="primary" onClick={() => setOpen(false)}>
              Continuar misión
            </ArcadeButton>
            <ArcadeButton variant="danger" onClick={() => setOpen(false)}>
              Abortar
            </ArcadeButton>
          </>
        }
      />
    </>
  );
}
