export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAuth } from "@/lib/firebase-admin";

const BodySchema = z.object({
  idToken: z.string().min(1),
});

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "pixel_drop_session";
const EXPIRES_IN_MS = Number(process.env.SESSION_EXPIRES_IN_MS ?? 432_000_000);

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  try {
    const auth = getAdminAuth();
    const sessionCookie = await auth.createSessionCookie(parsed.data.idToken, {
      expiresIn: EXPIRES_IN_MS,
    });

    const isProduction = process.env.NODE_ENV === "production";
    const maxAge = Math.floor(EXPIRES_IN_MS / 1000);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      path: "/",
      maxAge,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Authentication failed." }, { status: 401 });
  }
}
