import { StarField } from "@/components/StarField";
import { AppHeader } from "@/components/layout/AppHeader";
import { DownloadWorkspace } from "@/features/download/components/DownloadWorkspace";

export default function HomePage() {
  return (
    <>
      <StarField />
      <div className="relative z-10 min-h-screen flex flex-col">
        <AppHeader />
        <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
          <DownloadWorkspace />
        </main>
        <footer className="border-t-2 border-panel-border px-4 py-3 text-center">
          <p className="font-mono text-[11px] text-text-disabled tracking-widest">
            PIXEL DROP v0.3.0 — USO PRIVADO Y FAMILIAR
          </p>
        </footer>
      </div>
    </>
  );
}
