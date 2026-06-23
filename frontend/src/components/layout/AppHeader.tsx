"use client";

import { useRouter } from "next/navigation";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { LogoutIcon } from "@/components/icons";

export function AppHeader() {
  const router = useRouter();

  return (
    <header className="border-b-2 border-panel-border px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="font-arcade text-[14px] md:text-[16px] uppercase tracking-widest text-arcade-cyan">
            PIXEL DROP
          </h1>
          <p className="font-arcade text-[8px] text-text-muted uppercase tracking-widest mt-1">
            PILOTO DEMO
          </p>
        </div>
        <span
          className="inline-flex items-center px-2 py-1 font-arcade text-[8px] uppercase tracking-widest border-2 border-arcade-yellow text-arcade-yellow"
          style={{
            borderRadius: 0,
            backgroundColor: "color-mix(in srgb, var(--color-arcade-yellow) 10%, transparent)",
          }}
        >
          MODO DEMO
        </span>
      </div>

      <ArcadeButton
        variant="ghost"
        aria-label="Salir de la cabina"
        onClick={() => router.push("/login")}
      >
        <LogoutIcon aria-hidden="true" />
        SALIR
      </ArcadeButton>
    </header>
  );
}
