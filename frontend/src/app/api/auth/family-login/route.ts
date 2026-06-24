export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { z } from "zod";
import { getAdminAuth } from "@/lib/firebase-admin";

const BodySchema = z.object({
  email: z.string().email(),
  familyCode: z.string().min(1),
});

const GENERIC_ERROR = "Credenciales inválidas.";

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
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 403 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const { familyCode } = parsed.data;
  const email = parsed.data.email.trim().toLowerCase();

  // Verify family code via SHA-256 timing-safe comparison
  const storedHash = (process.env.FAMILY_ACCESS_CODE_SHA256 ?? "").toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(storedHash)) {
    return NextResponse.json({ error: "Servicio no disponible." }, { status: 503 });
  }

  const inputHash = createHash("sha256").update(familyCode).digest("hex");
  const codeMatch = timingSafeEqual(
    Buffer.from(inputHash, "hex"),
    Buffer.from(storedHash, "hex"),
  );

  if (!codeMatch) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  try {
    const auth = getAdminAuth();

    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch {
      userRecord = await auth.createUser({ email, emailVerified: false });
    }

    if (userRecord.disabled) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    // Preserve owner role; default to family
    const currentRole = userRecord.customClaims?.["role"];
    const role: "owner" | "family" = currentRole === "owner" ? "owner" : "family";

    if (currentRole !== role) {
      await auth.setCustomUserClaims(userRecord.uid, { role });
    }

    const customToken = await auth.createCustomToken(userRecord.uid, { role });
    return NextResponse.json({ customToken, role });
  } catch {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
