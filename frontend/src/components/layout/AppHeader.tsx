"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase-client";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { LogoutIcon } from "@/components/icons";

interface AppHeaderProps {
  email: string;
  role: "owner" | "family";
}

export function AppHeader({ email, role }: AppHeaderProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await signOut(getFirebaseAuth());
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Proceed to /login regardless of errors
    } finally {
      router.push("/login");
    }
  }

  return (
    <header className="border-b-2 border-panel-border px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="shrink-0">
          <h1 className="font-arcade text-[14px] md:text-[16px] uppercase tracking-widest text-arcade-cyan">
            PIXEL DROP
          </h1>
          <p className="font-mono text-[11px] text-text-muted mt-0.5 truncate max-w-[180px] md:max-w-none">
            {email}
          </p>
        </div>
        <span
          className="shrink-0 inline-flex items-center px-2 py-1 font-arcade text-[8px] uppercase tracking-widest border-2"
          style={{
            borderRadius: 0,
            borderColor: role === "owner" ? "var(--color-arcade-cyan)" : "var(--color-arcade-violet)",
            color: role === "owner" ? "var(--color-arcade-cyan)" : "var(--color-arcade-violet)",
            backgroundColor:
              role === "owner"
                ? "color-mix(in srgb, var(--color-arcade-cyan) 10%, transparent)"
                : "color-mix(in srgb, var(--color-arcade-violet) 10%, transparent)",
          }}
        >
          {role.toUpperCase()}
        </span>
      </div>

      <ArcadeButton
        variant="ghost"
        aria-label="Salir de la cabina"
        loading={loggingOut}
        onClick={handleLogout}
        className="shrink-0"
      >
        <LogoutIcon aria-hidden="true" />
        SALIR
      </ArcadeButton>
    </header>
  );
}
