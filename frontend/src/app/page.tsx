import { StarField } from "@/components/StarField";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { ArcadeInput } from "@/components/ui/ArcadeInput";
import { ArcadePanel } from "@/components/ui/ArcadePanel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SegmentedProgress } from "@/components/ui/SegmentedProgress";
import { ModalDemoButton } from "@/components/demo/ModalDemoButton";
import {
  SignalIcon,
  DownloadIcon,
  AudioIcon,
  VideoIcon,
  AlertIcon,
  SuccessIcon,
} from "@/components/icons";

export default function Home() {
  return (
    <>
      <StarField />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b-2 border-panel-border px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-arcade text-[16px] md:text-[20px] uppercase tracking-widest text-arcade-cyan">
              PIXEL DROP
            </h1>
            <p className="font-arcade text-[9px] text-text-muted uppercase tracking-widest mt-1">
              SISTEMA DE RECUPERACIÓN MULTIMEDIA
            </p>
          </div>
          <ArcadeButton variant="ghost" aria-label="Salir">
            SALIR
          </ArcadeButton>
        </header>

        {/* Main */}
        <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full flex flex-col gap-8">

          {/* Panel de transmisión */}
          <ArcadePanel
            title="Señal de transmisión"
            subtitle="Pega una URL de YouTube para comenzar"
            variant="highlighted"
          >
            <div className="flex flex-col gap-4">
              <ArcadeInput
                label="URL de misión"
                id="url-input"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                prefix={<SignalIcon />}
              />
              <ArcadeButton variant="primary" className="w-full md:w-auto">
                <SignalIcon aria-hidden="true" />
                Escanear señal
              </ArcadeButton>
            </div>
          </ArcadePanel>

          {/* Panel de componentes */}
          <ArcadePanel title="Sistema de componentes">
            <div className="flex flex-col gap-8">

              {/* Botones */}
              <section>
                <h3 className="font-arcade text-[10px] uppercase tracking-widest text-text-muted mb-4">
                  Variantes de botón
                </h3>
                <div className="flex flex-wrap gap-3">
                  <ArcadeButton variant="primary">Primario</ArcadeButton>
                  <ArcadeButton variant="secondary">Secundario</ArcadeButton>
                  <ArcadeButton variant="danger">Peligro</ArcadeButton>
                  <ArcadeButton variant="ghost">Fantasma</ArcadeButton>
                  <ArcadeButton variant="primary" disabled>Deshabilitado</ArcadeButton>
                  <ArcadeButton variant="primary" loading>Cargando</ArcadeButton>
                </div>
              </section>

              {/* Badges */}
              <section>
                <h3 className="font-arcade text-[10px] uppercase tracking-widest text-text-muted mb-4">
                  Estados de badge
                </h3>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge state="neutral" />
                  <StatusBadge state="scanning" />
                  <StatusBadge state="downloading" />
                  <StatusBadge state="processing" />
                  <StatusBadge state="success" />
                  <StatusBadge state="error" />
                  <StatusBadge state="expired" />
                </div>
              </section>

              {/* Progreso */}
              <section>
                <h3 className="font-arcade text-[10px] uppercase tracking-widest text-text-muted mb-4">
                  Barra de progreso (67%)
                </h3>
                <SegmentedProgress value={67} />
              </section>

              {/* Input con error */}
              <section>
                <h3 className="font-arcade text-[10px] uppercase tracking-widest text-text-muted mb-4">
                  Input con alerta
                </h3>
                <ArcadeInput
                  label="Señal de transmisión"
                  id="url-error-demo"
                  type="url"
                  defaultValue="https://vimeo.com/123456"
                  error="Dominio no autorizado. Solo se aceptan URLs de YouTube."
                />
              </section>

              {/* Iconos y tipos */}
              <section>
                <h3 className="font-arcade text-[10px] uppercase tracking-widest text-text-muted mb-4">
                  Iconos y tipos de descarga
                </h3>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2 text-arcade-cyan">
                    <VideoIcon aria-hidden="true" className="w-5 h-5" />
                    <span className="font-arcade text-[10px]">Video</span>
                  </div>
                  <div className="flex items-center gap-2 text-arcade-violet">
                    <AudioIcon aria-hidden="true" className="w-5 h-5" />
                    <span className="font-arcade text-[10px]">Audio</span>
                  </div>
                  <div className="flex items-center gap-2 text-arcade-green">
                    <SuccessIcon aria-hidden="true" className="w-5 h-5" />
                    <span className="font-arcade text-[10px]">Completado</span>
                  </div>
                  <div className="flex items-center gap-2 text-arcade-red">
                    <AlertIcon aria-hidden="true" className="w-5 h-5" />
                    <span className="font-arcade text-[10px]">Error</span>
                  </div>
                  <div className="flex items-center gap-2 text-arcade-cyan">
                    <DownloadIcon aria-hidden="true" className="w-5 h-5" />
                    <span className="font-arcade text-[10px]">Descarga</span>
                  </div>
                </div>
              </section>

              {/* Modal */}
              <section>
                <h3 className="font-arcade text-[10px] uppercase tracking-widest text-text-muted mb-4">
                  Modal de confirmación
                </h3>
                <ModalDemoButton />
              </section>

            </div>
          </ArcadePanel>

          {/* Panel misión en espera */}
          <ArcadePanel title="Misión en espera" variant="default">
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="text-text-muted">
                <SignalIcon aria-hidden="true" className="w-8 h-8 mx-auto mb-3 animate-signal-blink" />
              </div>
              <p className="font-arcade text-[11px] text-text-muted uppercase tracking-widest">
                Motor de descarga no conectado
              </p>
              <p className="font-body text-sm text-text-muted max-w-xs">
                El backend de descarga aún no está disponible. Las misiones se habilitarán en una fase posterior.
              </p>
              <div className="flex items-center gap-2 font-mono text-[13px] text-text-muted">
                <span>BACKEND</span>
                <span className="text-arcade-red">■ OFFLINE</span>
              </div>
            </div>
          </ArcadePanel>

        </main>

        {/* Footer */}
        <footer className="border-t-2 border-panel-border px-4 py-3 text-center">
          <p className="font-mono text-[11px] text-text-disabled tracking-widest">
            PIXEL DROP v0.2.0 — USO PRIVADO Y FAMILIAR
          </p>
        </footer>
      </div>
    </>
  );
}
