"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArcadeButton } from "@/components/ui/ArcadeButton";
import { ArcadeInput } from "@/components/ui/ArcadeInput";

export function LoginDemoForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    let valid = true;

    if (!email.trim()) {
      setEmailError("El correo es obligatorio.");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Ingresa un correo con formato válido.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!code) {
      setCodeError("El código familiar es obligatorio.");
      valid = false;
    } else if (code.length < 4) {
      setCodeError("El código debe tener al menos 4 caracteres.");
      valid = false;
    } else {
      setCodeError("");
    }

    return valid;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 700));
    setLoading(false);
    router.push("/");
  }

  const canSubmit = email.trim().length > 0 && code.length >= 4 && !loading;

  return (
    <div className="flex flex-col gap-6">
      <div
        className="border-2 border-arcade-yellow p-3 text-center"
        style={{
          borderRadius: 0,
          backgroundColor: "color-mix(in srgb, var(--color-arcade-yellow) 8%, transparent)",
        }}
        role="status"
        aria-label="Aviso modo demo"
      >
        <p className="font-arcade text-[9px] uppercase tracking-widest text-arcade-yellow">
          MODO DEMO
        </p>
        <p className="font-body text-sm text-text-muted mt-1">
          La autenticación real todavía no está conectada.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <ArcadeInput
          label="Correo electrónico"
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError || undefined}
          placeholder="correo@ejemplo.com"
        />

        <div className="flex flex-col gap-2">
          <label
            htmlFor="login-code"
            className="font-arcade text-[11px] uppercase tracking-widest text-text-muted"
          >
            Código familiar
            <span className="text-arcade-magenta ml-1" aria-label="requerido">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              id="login-code"
              type={showCode ? "text" : "password"}
              autoComplete="current-password"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              aria-describedby={codeError ? "login-code-error" : undefined}
              aria-invalid={codeError ? true : undefined}
              className={[
                "w-full px-3 py-3 pr-12 font-body text-base",
                "bg-panel border-2",
                "text-text-primary placeholder:text-text-muted",
                "outline-none",
                "focus:border-arcade-cyan focus:shadow-glow-cyan",
                codeError ? "border-arcade-red" : "border-panel-border",
              ].join(" ")}
              style={{ borderRadius: 0 }}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowCode((v) => !v)}
              aria-label={showCode ? "Ocultar código" : "Mostrar código"}
              className="absolute right-3 text-text-muted hover:text-text-primary focus-visible:outline-2 focus-visible:outline-arcade-cyan"
            >
              {showCode ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {codeError && (
            <p
              id="login-code-error"
              className="font-body text-sm text-arcade-red"
              role="alert"
            >
              {codeError}
            </p>
          )}
        </div>

        <ArcadeButton
          type="submit"
          variant="primary"
          loading={loading}
          disabled={!canSubmit}
          className="w-full mt-2"
        >
          {loading ? "VERIFICANDO..." : "INSERTAR CREDENCIAL"}
        </ArcadeButton>
      </form>

      <p className="font-body text-sm text-text-muted text-center">
        Uso privado y familiar
      </p>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
      <rect x="0"  y="7"  width="2" height="2" />
      <rect x="2"  y="5"  width="2" height="2" />
      <rect x="4"  y="4"  width="2" height="2" />
      <rect x="6"  y="3"  width="4" height="2" />
      <rect x="10" y="4"  width="2" height="2" />
      <rect x="12" y="5"  width="2" height="2" />
      <rect x="14" y="7"  width="2" height="2" />
      <rect x="12" y="9"  width="2" height="2" />
      <rect x="10" y="10" width="2" height="2" />
      <rect x="6"  y="11" width="4" height="2" />
      <rect x="4"  y="10" width="2" height="2" />
      <rect x="2"  y="9"  width="2" height="2" />
      <rect x="6"  y="6"  width="4" height="4" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
      <rect x="0"  y="14" width="2" height="2" />
      <rect x="2"  y="12" width="2" height="2" />
      <rect x="4"  y="10" width="2" height="2" />
      <rect x="5"  y="8"  width="3" height="2" />
      <rect x="8"  y="7"  width="2" height="2" />
      <rect x="10" y="8"  width="3" height="2" />
      <rect x="11" y="10" width="2" height="2" />
      <rect x="13" y="12" width="2" height="2" />
      <rect x="14" y="13" width="2" height="2" />
    </svg>
  );
}
