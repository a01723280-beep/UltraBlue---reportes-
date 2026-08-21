import { NextRequest, NextResponse } from "next/server";
import {
  Nivel,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  isConfigured,
  passwordMatches,
} from "@/lib/auth";

/** Las dos puertas se autentican igual; solo cambia la contraseña contra la
 * que comparan y la cookie que emiten. */
export async function handleLogin(req: NextRequest, nivel: Nivel) {
  // Sin la variable nadie podría entrar jamás: eso es un error de despliegue,
  // no un intento fallido, y conviene decirlo en vez de lanzar un 500 mudo.
  if (!isConfigured(nivel)) {
    const variable = nivel === "admin" ? "ADMIN_PASSWORD" : "APP_PASSWORD";
    return NextResponse.json(
      { error: `El sitio no tiene configurada la variable ${variable}.` },
      { status: 503 }
    );
  }

  const { password } = (await req.json()) as { password?: string };

  if (!password || !passwordMatches(nivel, password)) {
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE[nivel], await createSessionToken(nivel), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE[nivel],
  });
  return res;
}
