import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  isConfigured,
  passwordMatches,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  // Without APP_PASSWORD nobody can ever sign in, and that is a deployment
  // mistake rather than a bad attempt: say so instead of throwing a bare 500.
  if (!isConfigured()) {
    return NextResponse.json(
      { error: "El sitio no tiene configurada la variable APP_PASSWORD." },
      { status: 503 }
    );
  }

  const { password } = (await req.json()) as { password?: string };

  if (!password || !passwordMatches(password)) {
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
