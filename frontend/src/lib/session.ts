import { cookies } from "next/headers";
import { getAdminAuth } from "./firebase-admin";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "pixel_drop_session";

export type SessionUser = {
  uid: string;
  email: string;
  role: "owner" | "family";
};

export type SessionResult =
  | { ok: true; user: SessionUser }
  | { ok: false; reason: "absent" | "expired" | "invalid" };

export async function getSession(): Promise<SessionResult> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return { ok: false, reason: "absent" };
  }

  let auth;
  try {
    auth = getAdminAuth();
  } catch {
    return { ok: false, reason: "invalid" };
  }

  try {
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    const rawRole = decoded["role"];
    const role: "owner" | "family" = rawRole === "owner" ? "owner" : "family";
    return {
      ok: true,
      user: { uid: decoded.uid, email: decoded.email ?? "", role },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("expired") || message.includes("EXPIRED")) {
      return { ok: false, reason: "expired" };
    }
    return { ok: false, reason: "invalid" };
  }
}
