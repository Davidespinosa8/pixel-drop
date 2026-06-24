import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { StarField } from "@/components/StarField";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata = {
  title: "Acceso — Pixel Drop",
};

export default async function LoginPage() {
  const session = await getSession();
  if (session.ok) {
    redirect("/");
  }

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

          <LoginForm />
        </div>
      </div>
    </>
  );
}
