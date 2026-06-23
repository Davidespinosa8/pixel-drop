import { StarField } from "@/components/StarField";
import { LoginDemoForm } from "@/features/auth/components/LoginDemoForm";

export const metadata = {
  title: "Acceso — Pixel Drop",
};

export default function LoginPage() {
  return (
    <>
      <StarField />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm flex flex-col gap-6">
          <div className="text-center">
            <div
              className="inline-block border-2 border-arcade-cyan px-6 py-3 mb-4 shadow-hard-cyan"
              style={{ borderRadius: 0 }}
            >
              <span className="font-arcade text-[16px] md:text-[20px] uppercase tracking-widest text-arcade-cyan">
                PIXEL DROP
              </span>
            </div>
            <p className="font-arcade text-[10px] uppercase tracking-widest text-text-muted">
              IDENTIFÍCATE, AGENTE
            </p>
          </div>

          <LoginDemoForm />
        </div>
      </div>
    </>
  );
}
